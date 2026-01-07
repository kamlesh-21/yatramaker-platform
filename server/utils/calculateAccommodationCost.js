// // server/utils/calculateAccommodationCost.js
const HotelCollection = require('../models/HotelCollection');
const { getFixedPrice, applyPriceAdjustment } = require('./pricingManager');

/**
 * FIXED: Correctly calculates optimal room allocation for families/groups
 * Rules:
 * - Standard room: 2 adults OR 1 adult + 2 children OR 2 children
 * - Extra bed option: 2 adults + 1 child (small charge)
 * - Infants (<2 years): Free, don't count toward occupancy
 */
async function calculateAccommodationCost(destination, accommodationPreference, tripDuration, travellers) {
    const hotelCollection = await HotelCollection.findOne({ 
        destination_id: destination.destination_id 
    });
  
    if (!hotelCollection) {
        console.warn(`⚠️ No hotels found for destination ${destination.destination_id}`);
        return createEstimatedAccommodation(destination, accommodationPreference, tripDuration, travellers);
    }
  
    const hotels = hotelCollection.hotels.filter(h => h.category === accommodationPreference);

    if (hotels.length === 0) {
        return createEstimatedAccommodation(destination, accommodationPreference, tripDuration, travellers);
    }

    const totalNights = Math.max(1, tripDuration - 1);
    const baseRate = hotels.reduce((sum, h) => sum + h.rate, 0) / hotels.length;
    
    const childRateMultiplier = getFixedPrice('childMealMultiplier') || 0.5;
    const extraBedCost = baseRate * 0.3; // 30% of base rate for extra bed

    const { adults = 1, children = 0, infants = 0 } = travellers;

    // Optimal room allocation using corrected logic
    const allocation = optimizeRoomAllocation(adults, children, baseRate, extraBedCost, childRateMultiplier);

    const totalCost = allocation.totalCost * totalNights;
    const adjustedCost = applyPriceAdjustment(totalCost, 'accommodation');

    return {
        cost: Math.round(adjustedCost),
        numberOfNights: totalNights,
        accommodationType: accommodationPreference,
        averageRate: Math.round(baseRate),
        numberOfRooms: allocation.rooms,
        roomBreakdown: allocation.breakdown,
        adults,
        childrens: children,
        infants,
        destination_id: destination.destination_id,
        hotelName: hotels[0]?.name || 'Selected Hotel',
        starRating: getRatingFromCategory(accommodationPreference),
        isEstimated: false
    };
}

/**
 * CORRECTED ROOM OPTIMIZATION ALGORITHM
 * Uses greedy approach with real-world hotel rules
 */
function optimizeRoomAllocation(adults, children, baseRate, extraBedCost, childRate) {
    let remainingAdults = adults;
    let remainingChildren = children;
    let totalCost = 0;
    let rooms = 0;
    const breakdown = [];

    // Strategy 1: Fill rooms with 2 adults first (most common scenario)
    while (remainingAdults >= 2) {
        totalCost += baseRate;
        rooms++;
        remainingAdults -= 2;
        breakdown.push({ type: '2 Adults', cost: baseRate });
    }

    // Strategy 2: If 1 adult left and children available, pair them
    if (remainingAdults === 1 && remainingChildren >= 2) {
        totalCost += baseRate;
        rooms++;
        remainingAdults -= 1;
        remainingChildren -= 2;
        breakdown.push({ type: '1 Adult + 2 Children', cost: baseRate });
    } else if (remainingAdults === 1 && remainingChildren === 1) {
        totalCost += baseRate;
        rooms++;
        remainingAdults -= 1;
        remainingChildren -= 1;
        breakdown.push({ type: '1 Adult + 1 Child', cost: baseRate });
    } else if (remainingAdults === 1) {
        // Single adult in a room (unavoidable)
        totalCost += baseRate;
        rooms++;
        remainingAdults -= 1;
        breakdown.push({ type: '1 Adult (single occupancy)', cost: baseRate });
    }

    // Strategy 3: Remaining children get paired into rooms (2 per room)
    while (remainingChildren >= 2) {
        const childRoomCost = baseRate * childRate;
        totalCost += childRoomCost;
        rooms++;
        remainingChildren -= 2;
        breakdown.push({ type: '2 Children', cost: childRoomCost });
    }

    // Strategy 4: Last child—try to add as extra bed to existing room
    if (remainingChildren === 1) {
        if (rooms > 0) {
            totalCost += extraBedCost;
            breakdown[breakdown.length - 1].extraBed = true;
            breakdown[breakdown.length - 1].cost += extraBedCost;
        } else {
            // No rooms yet—child needs their own room (rare edge case)
            const childRoomCost = baseRate * childRate;
            totalCost += childRoomCost;
            rooms++;
            breakdown.push({ type: '1 Child (single)', cost: childRoomCost });
        }
        remainingChildren -= 1;
    }

    return {
        rooms,
        totalCost: Math.round(totalCost),
        breakdown
    };
}

/**
 * Creates estimated accommodation when hotel data is missing
 */
function createEstimatedAccommodation(destination, accommodationPreference, tripDuration, travellers) {
    // ✅ UPDATED: More realistic 2025 rates
    const estimatedRates = {
        'Luxury': 3800,
        'Comfort': 2200,
        'Cheap': 1400,  // Raised from 1200
        'Midrange': 2200
    };
    
    const baseRate = estimatedRates[accommodationPreference] || estimatedRates['Comfort'];
    
    // ✅ UPDATED: More granular regional multipliers for 2025
    let regionalMultiplier = 1.0;
    const destTypes = destination.type || [];
    
    if (destTypes.includes('beach') || destTypes.includes('coastal')) {
        regionalMultiplier = 1.3; // Beach tourism premium
    } else if (destTypes.includes('hill-station') || destTypes.includes('mountains')) {
        regionalMultiplier = 1.35; // Hill station premium
    } else if (destTypes.includes('pilgrimage') || destTypes.includes('spiritual')) {
        regionalMultiplier = 1.15; // Moderate pilgrimage premium
    } else if (destTypes.includes('metropolitan') || destTypes.includes('cities')) {
        regionalMultiplier = 1.25; // City premium
    } else if (destTypes.includes('mining') || destTypes.includes('industrial')) {
        regionalMultiplier = 0.85; // Industrial areas cheaper
    } else if (destTypes.includes('rural') || destTypes.includes('countryside')) {
        regionalMultiplier = 0.75; // Rural areas cheapest
    }
    
    const adjustedRate = Math.round(baseRate * regionalMultiplier);
    const totalNights = Math.max(1, tripDuration - 1);
    
    const childRateMultiplier = getFixedPrice('childMealMultiplier') || 0.5;
    const extraBedCost = adjustedRate * 0.3;
    
    const { adults = 1, children = 0, infants = 0 } = travellers;
    
    const allocation = optimizeRoomAllocation(adults, children, adjustedRate, extraBedCost, childRateMultiplier);
    const totalCost = allocation.totalCost * totalNights;
    
    return {
        cost: Math.round(totalCost),
        accommodationType: accommodationPreference,
        numberOfRooms: allocation.rooms,
        numberOfNights: totalNights,
        averageRate: adjustedRate,
        roomBreakdown: allocation.breakdown,
        adults,
        childrens: children,
        infants,
        hotelName: 'Estimated Accommodation',
        starRating: getRatingFromCategory(accommodationPreference),
        isEstimated: true,
        estimationReason: 'No hotel data available for this destination',
        destination_id: destination.destination_id
    };
}

function getRatingFromCategory(category) {
    const ratings = {
        'Luxury': 5,
        'Comfort': 3,
        'Cheap': 2,
        'Midrange': 3
    };
    return ratings[category] || 3;
}

module.exports = calculateAccommodationCost;