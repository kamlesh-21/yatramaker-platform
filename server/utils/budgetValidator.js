// server/utils/budgetValidator.js - NEW FILE
/**
 * Validates if a trip is feasible within user's budget
 * Provides detailed breakdown of what's missing if not feasible
 */

const { getFixedPrice } = require('./pricingManager');

/**
 * Main validation function
 * Returns: { feasible: boolean, reason?: string, breakdown: {...}, suggestions: [...] }
 */
function validateBudget(tripCost, userBudget, tripDetails) {
    const { 
        travelCost = 0, 
        accommodationCost = 0, 
        localExpensesCost = 0, 
        activitiesCost = 0 
    } = tripCost;

    const totalRequired = travelCost + accommodationCost + localExpensesCost;
    const totalWithActivities = totalRequired + activitiesCost;

    // ✅ Case 1: Comfortably within budget (< 90%)
    if (totalRequired <= userBudget * 0.9) {
        return {
            feasible: true,
            status: 'excellent',
            utilizationPercent: Math.round((totalRequired / userBudget) * 100),
            remainingBudget: userBudget - totalRequired,
            breakdown: {
                travel: travelCost,
                accommodation: accommodationCost,
                localExpenses: localExpensesCost,
                activities: activitiesCost,
                total: totalRequired
            },
            message: `Great fit! You have ₹${(userBudget - totalRequired).toLocaleString()} buffer for spontaneous experiences.`
        };
    }

    // ✅ Case 2: Tight but feasible (90-100%)
    if (totalRequired <= userBudget) {
        return {
            feasible: true,
            status: 'tight',
            utilizationPercent: Math.round((totalRequired / userBudget) * 100),
            remainingBudget: userBudget - totalRequired,
            breakdown: {
                travel: travelCost,
                accommodation: accommodationCost,
                localExpenses: localExpensesCost,
                activities: activitiesCost,
                total: totalRequired
            },
            message: `This trip uses most of your budget. Consider adding ₹${Math.ceil((totalRequired * 0.15) / 1000) * 1000} buffer.`,
            warnings: [
                'Limited flexibility for extras',
                'Consider cheaper accommodation if possible',
                'Activities not included in base cost'
            ]
        };
    }

    // ✅ Case 3: Over budget - provide detailed analysis
    const shortfall = totalRequired - userBudget;
    const shortfallPercent = Math.round((shortfall / userBudget) * 100);

    // Identify what's affordable and what's not
    const affordabilityAnalysis = analyzeAffordability({
        travelCost,
        accommodationCost,
        localExpensesCost,
        activitiesCost
    }, userBudget);

    // Generate cost-cutting suggestions
    const suggestions = generateCostCuttingSuggestions(
        tripDetails,
        {
            travelCost,
            accommodationCost,
            localExpensesCost
        },
        shortfall
    );

    return {
        feasible: false,
        status: 'over-budget',
        shortfall: shortfall,
        shortfallPercent: shortfallPercent,
        breakdown: {
            travel: travelCost,
            accommodation: accommodationCost,
            localExpenses: localExpensesCost,
            activities: activitiesCost,
            total: totalRequired,
            userBudget: userBudget
        },
        affordabilityAnalysis,
        suggestions,
        message: `This trip needs ₹${shortfall.toLocaleString()} more (${shortfallPercent}% over budget).`
    };
}

/**
 * Analyzes which components are affordable
 */
function analyzeAffordability(costs, budget) {
    const analysis = {};
    let cumulative = 0;

    // Check each component sequentially
    const components = [
        { name: 'travel', cost: costs.travelCost },
        { name: 'accommodation', cost: costs.accommodationCost },
        { name: 'localExpenses', cost: costs.localExpensesCost },
        { name: 'activities', cost: costs.activitiesCost }
    ];

    for (const component of components) {
        cumulative += component.cost;
        analysis[component.name] = {
            cost: component.cost,
            affordable: cumulative <= budget,
            cumulativeCost: cumulative
        };
    }

    return analysis;
}

/**
 * Generates actionable cost-cutting suggestions
 */
function generateCostCuttingSuggestions(tripDetails, costs, shortfall) {
    const suggestions = [];

    // Suggestion 1: Reduce trip duration
    if (tripDetails.tripDuration > 3) {
        const perDayCost = (costs.accommodationCost + costs.localExpensesCost) / tripDetails.tripDuration;
        const daysToReduce = Math.ceil(shortfall / perDayCost);
        const newDuration = tripDetails.tripDuration - daysToReduce;
        
        if (newDuration >= 2) {
            suggestions.push({
                type: 'reduce_duration',
                priority: 'high',
                action: `Reduce trip from ${tripDetails.tripDuration} to ${newDuration} days`,
                savings: Math.round(daysToReduce * perDayCost),
                tradeoff: 'Less time to explore, but more affordable'
            });
        }
    }

    // Suggestion 2: Downgrade accommodation
    if (tripDetails.accommodationPreference !== 'Cheap') {
        const currentCategory = tripDetails.accommodationPreference;
        const downgrades = {
            'Luxury': { to: 'Comfort', savings: costs.accommodationCost * 0.4 },
            'Comfort': { to: 'Cheap', savings: costs.accommodationCost * 0.5 }
        };
        
        if (downgrades[currentCategory]) {
            suggestions.push({
                type: 'downgrade_accommodation',
                priority: 'medium',
                action: `Switch from ${currentCategory} to ${downgrades[currentCategory].to}`,
                savings: Math.round(downgrades[currentCategory].savings),
                tradeoff: 'Simpler hotels, but clean and safe'
            });
        }
    }

    // Suggestion 3: Choose cheaper travel mode
    if (costs.travelCost > (costs.accommodationCost + costs.localExpensesCost)) {
        suggestions.push({
            type: 'cheaper_travel',
            priority: 'high',
            action: 'Consider bus or train instead of flight',
            potentialSavings: 'Up to ₹3,000-₹8,000',
            tradeoff: 'Longer travel time, but significant savings'
        });
    }

    // Suggestion 4: Travel in off-peak season
    if (tripDetails.seasonality && tripDetails.seasonality.peakSeason) {
        suggestions.push({
            type: 'off_peak_travel',
            priority: 'low',
            action: 'Travel during off-peak season',
            potentialSavings: '15-30% on accommodation',
            tradeoff: 'Different weather, fewer crowds'
        });
    }

    // Suggestion 5: Increase budget (last resort)
    const recommendedIncrease = Math.ceil((shortfall * 1.1) / 1000) * 1000; // Round to nearest ₹1000
    suggestions.push({
        type: 'increase_budget',
        priority: 'low',
        action: `Increase budget by ₹${recommendedIncrease.toLocaleString()}`,
        savings: -recommendedIncrease,
        tradeoff: 'Keeps original plan intact'
    });

    return suggestions.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * Pre-filters destinations before detailed calculation
 * Saves computation time by eliminating obviously unaffordable options
 */
function quickBudgetCheck(destination, userBudget, userLocation, tripDuration, travellers) {
    // Estimate minimum cost using heuristics
    const directDistance = calculateDirectDistance(userLocation, destination);
    
    // Minimum travel cost (cheapest mode)
    const minTravelCost = estimateMinimumTravelCost(directDistance, travellers);
    
    // Minimum accommodation (assuming Cheap category)
    const minAccommodationCost = (tripDuration - 1) * 1200 * Math.ceil(travellers.adults / 2);
    
    // Minimum local expenses (conservative estimate)
    const minLocalExpenses = tripDuration * 800 * travellers.adults;
    
    const absoluteMinimum = minTravelCost + minAccommodationCost + minLocalExpenses;
    
    // If absolute minimum exceeds budget by 50%, skip detailed calculation
    return absoluteMinimum <= (userBudget * 1.5);
}

function calculateDirectDistance(userLocation, destination) {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(destination.latitude - userLocation.latitude);
    const dLon = deg2rad(destination.longitude - userLocation.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(userLocation.latitude)) * Math.cos(deg2rad(destination.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function estimateMinimumTravelCost(distanceKm, travellers) {
    const maxBusDistance = getFixedPrice('maxBusDistance') || 400;
    const maxDriveDistance = getFixedPrice('maxDrivingDistance') || 350;
    
    if (distanceKm <= maxDriveDistance) {
        return distanceKm * 5 * 2; // Driving
    } else if (distanceKm <= maxBusDistance) {
        return distanceKm * 3.25 * 2 * travellers.adults; // Bus
    } else {
        return (2400 + distanceKm * 2) * 2 * travellers.adults; // Train
    }
}

module.exports = {
    validateBudget,
    quickBudgetCheck,
    analyzeAffordability,
    generateCostCuttingSuggestions
};