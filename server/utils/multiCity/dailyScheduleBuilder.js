/**
 * DAILY SCHEDULE BUILDER
 * Generates detailed day-by-day itinerary with activities, meals, and timings
 * Like a real travel agent would create
 * 
 * @file server/utils/multiCity/dailyScheduleBuilder.js
 */

const ActivityCollection = require('../../models/ActivityCollection');

/**
 * Main function: Build complete daily schedule
 */
async function buildDailySchedule(route) {
    try {
        const { destinations, legs } = route;
        const schedule = [];
        
        let currentDay = 1;
        
        // Day 1: Travel to first destination
        schedule.push(await buildTravelDay(
            currentDay,
            legs[0],
            null,
            destinations[0],
            'first'
        ));
        currentDay++;
        
        // Full days at each destination
        for (let i = 0; i < destinations.length; i++) {
            const dest = destinations[i];
            const nights = dest.nights;
            const nextLeg = i < legs.length - 1 ? legs[i + 1] : null;
            
            // Get activities for this destination
            const activityCollection = await ActivityCollection.findOne({
                destination_id: dest.destination.id
            }).lean();
            
            // Generate days for this destination
            for (let dayInDest = 0; dayInDest < nights; dayInDest++) {
                const isLastDay = (dayInDest === nights - 1);
                
                if (isLastDay && nextLeg) {
                    // Last day: partial day + travel to next
                    schedule.push(await buildPartialDayWithTravel(
                        currentDay,
                        dest,
                        nextLeg,
                        dayInDest,
                        activityCollection
                    ));
                } else {
                    // Full exploration day
                    schedule.push(await buildFullExplorationDay(
                        currentDay,
                        dest,
                        dayInDest,
                        nights,
                        activityCollection
                    ));
                }
                
                currentDay++;
            }
        }
        
        // Final day: Return journey
        const lastLeg = legs[legs.length - 1];
        schedule.push(await buildTravelDay(
            currentDay,
            lastLeg,
            destinations[destinations.length - 1],
            null,
            'last'
        ));
        
        return schedule;
        
    } catch (error) {
        console.error('Error building daily schedule:', error);
        return [];
    }
}

/**
 * Build travel day (Day 1 or last day)
 */
async function buildTravelDay(day, leg, fromDest, toDest, type) {
    const timeline = [];
    
    if (type === 'first') {
        // Departure day
        timeline.push({
            time: '08:00',
            type: 'travel',
            description: `Depart ${leg.from} by ${leg.mode}`,
            details: buildTravelDetails(leg),
            cost: 0, // Included in leg cost
            duration: leg.duration || estimateDuration(leg)
        });
        
        const arrivalTime = addHours('08:00', leg.duration || estimateDuration(leg));
        
        if (leg.duration > 4) {
            const lunchTime = addHours('08:00', 4);
            timeline.push({
                time: lunchTime,
                type: 'meal',
                description: leg.mode === 'flight' ? 'Lunch (in-flight/airport)' : 'Lunch during travel',
                cost: 600,
                duration: 1
            });
        }
        
        timeline.push({
            time: arrivalTime,
            type: 'arrival',
            description: `Arrive ${leg.to}`,
            details: 'Transfer to hotel, check-in, freshen up',
            cost: 0,
            duration: 1.5
        });
        
        const checkInTime = addHours(arrivalTime, 1.5);
        
        timeline.push({
            time: checkInTime,
            type: 'accommodation',
            description: `Check-in at ${toDest.accommodation.hotelName || 'hotel'}`,
            cost: toDest.accommodation.averageRate || 0,
            duration: 0
        });
        
        const dinnerTime = '20:00';
        timeline.push({
            time: dinnerTime,
            type: 'meal',
            description: 'Dinner at hotel or nearby',
            details: 'Rest early for tomorrow\'s exploration',
            cost: 800,
            duration: 1.5
        });
        
        return {
            day: day,
            date: `Day ${day}`,
            title: `Journey to ${leg.to}`,
            location: `${leg.from} → ${leg.to}`,
            overnight: leg.to,
            timeline: timeline,
            daySummary: {
                totalCost: leg.cost + (toDest.accommodation.averageRate || 0) + 1400,
                travelTime: leg.duration || estimateDuration(leg),
                activityTime: 0,
                restTime: 3,
                highlight: `First glimpse of ${leg.to}`
            }
        };
    } else {
        // Return day
        timeline.push({
            time: '08:00',
            type: 'checkout',
            description: `Check-out from hotel in ${leg.from}`,
            cost: 0,
            duration: 1
        });
        
        timeline.push({
            time: '09:00',
            type: 'travel',
            description: `Depart ${leg.from} by ${leg.mode}`,
            details: buildTravelDetails(leg),
            cost: leg.cost,
            duration: leg.duration || estimateDuration(leg)
        });
        
        const arrivalTime = addHours('09:00', leg.duration || estimateDuration(leg));
        
        timeline.push({
            time: arrivalTime,
            type: 'arrival',
            description: `Arrive ${leg.to}`,
            details: 'Trip ends. Welcome home!',
            cost: 0,
            duration: 0
        });
        
        return {
            day: day,
            date: `Day ${day}`,
            title: `Return to ${leg.to}`,
            location: `${leg.from} → ${leg.to}`,
            overnight: leg.to,
            timeline: timeline,
            daySummary: {
                totalCost: leg.cost,
                travelTime: leg.duration || estimateDuration(leg),
                activityTime: 0,
                restTime: 0,
                highlight: 'Journey home with wonderful memories'
            }
        };
    }
}

/**
 * Build full exploration day
 */
async function buildFullExplorationDay(day, dest, dayInDest, totalNights, activityCollection) {
    const timeline = [];
    
    // Breakfast
    timeline.push({
        time: '08:00',
        type: 'meal',
        description: 'Breakfast at hotel',
        details: 'Complimentary breakfast included',
        cost: 0,
        duration: 1
    });
    
    // Morning activity
    const morningActivity = pickActivity(dest, activityCollection, 'morning', dayInDest);
    timeline.push({
        time: '09:30',
        type: 'activity',
        description: morningActivity.name,
        details: morningActivity.details || morningActivity.description,
        cost: morningActivity.cost,
        duration: morningActivity.duration || 2.5,
        optional: morningActivity.optional || false,
        alternatives: morningActivity.alternatives || []
    });
    
    // Lunch
    const lunchSpot = pickRestaurant(dest.destination, 'lunch');
    timeline.push({
        time: '12:30',
        type: 'meal',
        description: `Lunch at ${lunchSpot}`,
        details: `Try ${pickLocalDish(dest.destination)}`,
        cost: dest.localExpenses.mealsCost / dest.localExpenses.days / 3,
        duration: 1.5
    });
    
    // Afternoon activity
    const afternoonActivity = pickActivity(dest, activityCollection, 'afternoon', dayInDest);
    timeline.push({
        time: '14:30',
        type: 'activity',
        description: afternoonActivity.name,
        details: afternoonActivity.details || afternoonActivity.description,
        cost: afternoonActivity.cost,
        duration: afternoonActivity.duration || 3,
        optional: afternoonActivity.optional || false,
        alternatives: afternoonActivity.alternatives || []
    });
    
    // Evening (free time or activity)
    if (dayInDest === 0) {
        // First day: lighter schedule
        timeline.push({
            time: '18:00',
            type: 'free',
            description: 'Evening stroll and local market visit',
            details: dest.destination.additionalLocalInfo?.localAuthenticShopping?.[0] || 'Explore local area',
            cost: 0,
            duration: 2
        });
    } else {
        const eveningActivity = pickActivity(dest, activityCollection, 'evening', dayInDest);
        timeline.push({
            time: '18:00',
            type: 'activity',
            description: eveningActivity.name,
            details: eveningActivity.details || eveningActivity.description,
            cost: eveningActivity.cost,
            duration: eveningActivity.duration || 2,
            optional: true,
            alternatives: eveningActivity.alternatives || []
        });
    }
    
    // Dinner
    const dinnerSpot = pickRestaurant(dest.destination, 'dinner');
    timeline.push({
        time: '20:00',
        type: 'meal',
        description: `Dinner at ${dinnerSpot}`,
        details: 'Enjoy local cuisine',
        cost: dest.localExpenses.mealsCost / dest.localExpenses.days / 3,
        duration: 1.5
    });
    
    const totalDayCost = timeline.reduce((sum, item) => sum + (item.cost || 0), 0);
    
    return {
        day: day,
        date: `Day ${day}`,
        title: `Explore ${dest.destination.name[0] || dest.destination.name}`,
        location: dest.destination.name[0] || dest.destination.name,
        overnight: dest.destination.name[0] || dest.destination.name,
        timeline: timeline,
        daySummary: {
            totalCost: Math.round(totalDayCost),
            travelTime: 0,
            activityTime: 7.5,
            restTime: 2.5,
            highlight: pickHighlight(dest.destination, dayInDest)
        }
    };
}

/**
 * Build partial day with onward travel
 */
async function buildPartialDayWithTravel(day, dest, nextLeg, dayInDest, activityCollection) {
    const timeline = [];
    
    // Breakfast
    timeline.push({
        time: '07:00',
        type: 'meal',
        description: 'Early breakfast at hotel',
        cost: 0,
        duration: 0.5
    });
    
    // Quick morning activity if time permits
    if (nextLeg.duration <= 6) {
        const quickActivity = pickActivity(dest, activityCollection, 'morning', dayInDest, true);
        timeline.push({
            time: '07:30',
            type: 'activity',
            description: quickActivity.name,
            details: quickActivity.details || 'Quick visit before departure',
            cost: quickActivity.cost,
            duration: 2,
            optional: true
        });
    }
    
    // Check-out and departure
    const departureTime = nextLeg.duration > 6 ? '08:00' : '10:00';
    
    timeline.push({
        time: departureTime,
        type: 'checkout',
        description: 'Check-out and depart',
        details: `Travel to ${nextLeg.to}`,
        cost: 0,
        duration: 0.5
    });
    
    timeline.push({
        time: addHours(departureTime, 0.5),
        type: 'travel',
        description: `${nextLeg.mode} to ${nextLeg.to}`,
        details: buildTravelDetails(nextLeg),
        cost: nextLeg.cost,
        duration: nextLeg.duration || estimateDuration(nextLeg)
    });
    
    const arrivalTime = addHours(departureTime, 0.5 + (nextLeg.duration || estimateDuration(nextLeg)));
    
    timeline.push({
        time: arrivalTime,
        type: 'arrival',
        description: `Arrive ${nextLeg.to}`,
        details: 'Check-in to hotel, rest',
        cost: 0,
        duration: 1.5
    });
    
    return {
        day: day,
        date: `Day ${day}`,
        title: `${dest.destination.name[0]} → ${nextLeg.to}`,
        location: `${dest.destination.name[0]} → ${nextLeg.to}`,
        overnight: nextLeg.to,
        timeline: timeline,
        daySummary: {
            totalCost: nextLeg.cost,
            travelTime: nextLeg.duration || estimateDuration(nextLeg),
            activityTime: 2,
            restTime: 1,
            highlight: `Onward to ${nextLeg.to}`
        }
    };
}

/**
 * Pick activity based on time of day and day number
 */
function pickActivity(dest, activityCollection, timeOfDay, dayNumber, quickVisit = false) {
    const attractions = dest.destination.additionalLocalInfo?.touristPoints || [];
    const activities = activityCollection?.activities || [];
    
    // Build activity pool
    const allActivities = [
        ...attractions.slice(0, 5).map((name, idx) => ({
            name: name,
            cost: 200 + (idx * 100),
            duration: quickVisit ? 1.5 : 2.5,
            optional: idx > 2,
            details: `Visit ${name}`,
            priority: idx < 2 ? 'must-do' : 'recommended'
        })),
        ...activities.map(a => ({
            name: a.name,
            cost: a.cost || 500,
            duration: quickVisit ? 1.5 : (a.duration || 2.5),
            optional: a.period !== 'day',
            details: a.description || `Enjoy ${a.activity_type} activity`,
            priority: 'recommended',
            type: a.activity_type
        }))
    ];
    
    // Filter by time of day
    let filtered = allActivities;
    if (timeOfDay === 'evening') {
        filtered = allActivities.filter(a => 
            !a.type || a.type === 'cultural' || a.type === 'photography'
        );
    }
    
    // Pick based on day number (spread activities across days)
    const index = (dayNumber * 3 + (timeOfDay === 'morning' ? 0 : timeOfDay === 'afternoon' ? 1 : 2)) % filtered.length;
    
    return filtered[index] || {
        name: 'Free exploration',
        cost: 0,
        duration: 2,
        optional: true,
        details: 'Explore at your own pace'
    };
}

/**
 * Pick restaurant
 */
function pickRestaurant(destination, mealType) {
    const restaurants = destination.additionalLocalInfo?.bestPlacesToEat || [];
    
    if (restaurants.length === 0) {
        return mealType === 'lunch' ? 'local restaurant' : 'hotel restaurant';
    }
    
    const hash = (destination.name[0] || 'X').charCodeAt(0);
    const index = (hash + (mealType === 'dinner' ? 1 : 0)) % restaurants.length;
    
    return restaurants[index];
}

/**
 * Pick local dish
 */
function pickLocalDish(destination) {
    const dishes = destination.additionalLocalInfo?.mustTryDishes || [];
    
    if (dishes.length === 0) {
        return 'local specialty';
    }
    
    const hash = (destination.name[0] || 'X').charCodeAt(0);
    return dishes[hash % dishes.length];
}

/**
 * Pick highlight for the day
 */
function pickHighlight(destination, dayNumber) {
    const highlights = [
        ...(destination.additionalLocalInfo?.touristPoints || []).slice(0, 3),
        ...(destination.additionalLocalInfo?.hiddenGems || []).slice(0, 2)
    ];
    
    if (highlights.length === 0) {
        return `Exploring ${destination.name[0] || destination.name}`;
    }
    
    return highlights[dayNumber % highlights.length];
}

/**
 * Build travel details string
 */
function buildTravelDetails(leg) {
    if (!leg.breakdown) {
        return `${leg.mode} journey covering ${Math.round(leg.distance)}km`;
    }
    
    const breakdown = leg.breakdown;
    const parts = [];
    
    if (breakdown.userToUserHubKm > 0) {
        parts.push(`Cab to ${breakdown.userHubName} (${Math.round(breakdown.userToUserHubKm)}km)`);
    }
    
    if (breakdown.userHubToDestHubKm > 0) {
        parts.push(`${leg.mode} ${breakdown.userHubName} → ${breakdown.destHubName} (${Math.round(breakdown.userHubToDestHubKm)}km)`);
    }
    
    if (breakdown.destHubToDestKm > 0) {
        parts.push(`Cab to destination (${Math.round(breakdown.destHubToDestKm)}km)`);
    }
    
    if (parts.length === 0) {
        parts.push(`Direct ${leg.mode} (${Math.round(leg.distance)}km)`);
    }
    
    return parts.join(' → ');
}

/**
 * Add hours to time string
 */
function addHours(timeStr, hours) {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = h * 60 + m + hours * 60;
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = Math.floor(totalMinutes % 60);
    
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

/**
 * Estimate duration from travel option
 */
function estimateDuration(leg) {
    const distance = leg.distance || 0;
    const mode = (leg.mode || 'bus').toLowerCase();
    
    const speeds = {
        flight: 650,
        train: 55,
        bus: 45,
        driving: 50,
        car: 50,
        cab: 50
    };
    
    const overhead = {
        flight: 3,
        train: 1,
        bus: 0.5,
        driving: 0
    };
    
    return (distance / (speeds[mode] || 50)) + (overhead[mode] || 0);
}

module.exports = {
    buildDailySchedule,
    buildTravelDay,
    buildFullExplorationDay,
    buildPartialDayWithTravel
};