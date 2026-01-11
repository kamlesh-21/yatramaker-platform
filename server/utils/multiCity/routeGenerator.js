/**
 * ROUTE GENERATOR
 * Converts a cluster into a complete, costed multi-city route
 * Uses existing utility functions for travel, accommodation, and local expenses
 * 
 * @file server/utils/multiCity/routeGenerator.js
 */

const calculateTravelCost = require('../calculateTravelCost');
const calculateAccommodationCost = require('../calculateAccommodationCost');
const calculateLocalExpenses = require('../calculateLocalExpenses');
const ActivityCollection = require('../../models/ActivityCollection');

/**
 * Main function: Generate complete route from cluster
 */
async function generateRoute(cluster, userQuery) {
    try {
        const {
            userLocation,
            tripDuration,
            budget,
            travellers,
            accommodationPreference,
            optimizationGoal = 'budget'
        } = userQuery;
        
        const destinations = cluster.destinations;
        
        // Step 1: Allocate nights across destinations
        const nightsAllocation = allocateNights(destinations, tripDuration);
        
        // Step 2: Calculate travel legs
        const legs = await calculateAllLegs(
            destinations,
            userLocation,
            travellers,
            optimizationGoal
        );
        
        if (!legs || legs.some(leg => !leg)) {
            console.warn('Failed to calculate some travel legs');
            return null;
        }
        
        const totalTravelCost = legs.reduce((sum, leg) => sum + (leg.cost || 0), 0);
        
        // Step 3: Calculate accommodation for each destination
        const accommodations = await calculateAllAccommodation(
            destinations,
            nightsAllocation,
            accommodationPreference,
            travellers
        );
        
        if (!accommodations || accommodations.some(acc => !acc)) {
            console.warn('Failed to calculate some accommodations');
            return null;
        }
        
        const totalAccommodationCost = accommodations.reduce((sum, acc) => sum + (acc.cost || 0), 0);
        
        // Step 4: Calculate local expenses
        const localExpenses = await calculateAllLocalExpenses(
            destinations,
            nightsAllocation,
            accommodationPreference,
            travellers
        );
        
        if (!localExpenses || localExpenses.some(exp => !exp)) {
            console.warn('Failed to calculate some local expenses');
            return null;
        }
        
        const totalLocalExpensesCost = localExpenses.reduce(
            (sum, exp) => sum + (exp.localExpensesCost || 0), 0
        );
        const totalActivitiesCost = localExpenses.reduce(
            (sum, exp) => sum + (exp.activitiesCost || 0), 0
        );
        
        // Step 5: Calculate total cost
        const baseCost = totalTravelCost + totalAccommodationCost + totalLocalExpensesCost;
        const withActivitiesCost = baseCost + totalActivitiesCost;
        
        // Budget check
        if (baseCost > budget) {
            console.warn(`Route exceeds budget: ₹${baseCost} > ₹${budget}`);
            return null;
        }
        
        // Step 6: Calculate metrics
        const totalDistance = legs.reduce((sum, leg) => sum + (leg.distance || 0), 0);

        const totalTravelTime = legs.reduce((sum, leg) => {
            // Use whichever exists
            const time = leg.duration || leg.estimatedTimeHours || 0;

            return sum + time;
        }, 0);

        // const totalTravelTime = legs.reduce((sum, leg) => sum + (leg.duration || 0), 0);
        
        const routeEfficiency = calculateRouteEfficiency(destinations, userLocation, totalDistance);
        const preferenceFit = calculatePreferenceFit(destinations);
        
        // Step 7: Build route object
        const route = {
            routeId: generateRouteId(destinations, optimizationGoal),
            name: generateRouteName(destinations),
            tagline: generateTagline(destinations, tripDuration),
            coverImage: destinations[0].images?.[0]?.url || null,
            
            summary: {
                destinations: destinations.map(d => Array.isArray(d.name) ? d.name[0] : d.name),
                preferences: extractPreferences(destinations),
                totalDays: tripDuration,
                totalNights: nightsAllocation.reduce((sum, n) => sum + n, 0),
                totalDistance: Math.round(totalDistance),
                totalTravelTime: parseFloat(totalTravelTime.toFixed(1))
            },
            
            totalCost: {
                base: Math.round(baseCost),
                withActivities: Math.round(withActivitiesCost),
                breakdown: {
                    travel: Math.round(totalTravelCost),
                    accommodation: Math.round(totalAccommodationCost),
                    localExpenses: Math.round(totalLocalExpensesCost),
                    activities: Math.round(totalActivitiesCost),
                    transportation: Math.round(
                        localExpenses.reduce((sum, e) => sum + (e.transportationCost || 0), 0)
                    ),
                    meals: Math.round(
                        localExpenses.reduce((sum, e) => sum + (e.mealsCost || 0), 0)
                    ),
                    attractions: Math.round(
                        localExpenses.reduce((sum, e) => sum + (e.attractionsCost || 0), 0)
                    )
                }
            },
            
            destinations: destinations.map((dest, i) => ({
                destination: {
                    id: dest.destination_id,
                    name: Array.isArray(dest.name) ? dest.name : [dest.name],
                    type: dest.type || [],
                    location: {
                        latitude: dest.latitude,
                        longitude: dest.longitude,
                        state: dest.state,
                        region: dest.region
                    },
                    description: dest.description || '',
                    images: (dest.images || []).slice(0, 3),
                    seasonality: dest.seasonality || {},
                    additionalLocalInfo: dest.additionalLocalInfo || {}
                },
                nights: nightsAllocation[i],
                recommendedDays: dest.visitMetrics?.recommendedDays || nightsAllocation[i],
                arrivalDay: calculateArrivalDay(nightsAllocation, i),
                departureDay: calculateDepartureDay(nightsAllocation, i),
                arrivalMode: i === 0 ? legs[0].mode : legs[i].mode,
                departureMode: i === destinations.length - 1 
                    ? legs[legs.length - 1].mode 
                    : legs[i + 1].mode,
                accommodation: accommodations[i],
                localExpenses: localExpenses[i],
                activities: localExpenses[i].activities || []
            })),
            
            legs: legs,
            
            scores: {
                preferenceFit: parseFloat(preferenceFit.toFixed(2)),
                budgetUtilization: parseFloat((baseCost / budget).toFixed(2)),
                routeEfficiency: parseFloat(routeEfficiency.toFixed(2)),
                comfortScore: parseFloat(calculateComfortScore(legs).toFixed(2)),
                uniquenessScore: parseFloat(calculateUniquenessScore(destinations).toFixed(2)),
                overallScore: 0 // Will be calculated later
            },
            
            metadata: {
                totalDestinations: destinations.length,
                destinationNames: destinations.map(d => Array.isArray(d.name) ? d.name[0] : d.name),
                states: [...new Set(destinations.map(d => d.state))],
                regions: [...new Set(destinations.map(d => d.region))],
                preferenceTags: extractPreferences(destinations),
                routeType: determineRouteType(destinations, userLocation),
                optimizationGoal: optimizationGoal,
                pacing: determinePacing(destinations, nightsAllocation, tripDuration)
            }
        };
        
        // Calculate overall score
        route.scores.overallScore = calculateOverallScore(route.scores);
        
        return route;
        
    } catch (error) {
        console.error('Error generating route:', error);
        return null;
    }
}

/**
 * Allocate nights proportionally based on recommendedDays
 */
function allocateNights(destinations, totalDuration) {
    // Reserve days for travel (1 day at start, 0.5 day per inter-city leg, 1 day at end)
    const numLegs = destinations.length + 1; // Including return
    const estimatedTravelDays = 1 + (destinations.length - 1) * 0.5 + 1;
    const availableNights = Math.floor(totalDuration - estimatedTravelDays);
    
    if (availableNights < destinations.length) {
        // Minimum 1 night per destination
        return destinations.map(() => 1);
    }
    
    // Get recommended nights
    const recommended = destinations.map(d => d.visitMetrics?.recommendedDays || 2);
    const totalRecommended = recommended.reduce((sum, r) => sum + r, 0);
    
    // Allocate proportionally
    const allocated = recommended.map(rec => 
        Math.max(1, Math.floor((rec / totalRecommended) * availableNights))
    );
    
    // Adjust for rounding errors
    let currentTotal = allocated.reduce((sum, n) => sum + n, 0);
    let attempts = 0;
    
    while (currentTotal < availableNights && attempts < 100) {
        // Add night to destination with highest recommendedDays that's under-allocated
        let bestIdx = 0;
        let bestRatio = 0;
        
        for (let i = 0; i < destinations.length; i++) {
            const ratio = recommended[i] / (allocated[i] + 1);
            if (ratio > bestRatio) {
                bestRatio = ratio;
                bestIdx = i;
            }
        }
        
        allocated[bestIdx]++;
        currentTotal++;
        attempts++;
    }
    
    // If still over (shouldn't happen), trim from least important
    while (currentTotal > availableNights && attempts < 200) {
        let worstIdx = 0;
        let worstRatio = Infinity;
        
        for (let i = 0; i < destinations.length; i++) {
            if (allocated[i] > 1) { // Don't go below 1 night
                const ratio = recommended[i] / allocated[i];
                if (ratio < worstRatio) {
                    worstRatio = ratio;
                    worstIdx = i;
                }
            }
        }
        
        allocated[worstIdx]--;
        currentTotal--;
        attempts++;
    }
    
    return allocated;
}

/**
 * Calculate all travel legs (user → dest1 → dest2 → ... → user)
 */
/**
 * Calculate all travel legs (user → dest1 → dest2 → ... → user)
 * IMPROVED WITH BETTER ERROR HANDLING
 */
async function calculateAllLegs(destinations, userLocation, travellers, optimizationGoal) {
    const legs = [];
    
    try {       
        // Leg 0: User → First destination
        const leg0Options = calculateTravelCost(userLocation, destinations[0], travellers);
     
        if (!leg0Options || leg0Options.length === 0) {
            console.warn(`   ⚠️  No valid travel option for first leg (${userLocation.name} → ${destinations[0].name})`);
            return null;
        }       
        const selectedLeg0 = selectBestMode(leg0Options, optimizationGoal);
        
        if (!selectedLeg0.duration && !selectedLeg0.estimatedTimeHours) {
            selectedLeg0.duration = estimateTravelTime(selectedLeg0);
        }
        
        legs.push({
            from: userLocation.name || 'Your location',
            to: Array.isArray(destinations[0].name) ? destinations[0].name[0] : destinations[0].name,
            ...selectedLeg0,
            alternatives: leg0Options
        });
               
        // Inter-destination legs
        for (let i = 0; i < destinations.length - 1; i++) {
            const fromName = Array.isArray(destinations[i].name) ? destinations[i].name[0] : destinations[i].name;
            const toName = Array.isArray(destinations[i + 1].name) ? destinations[i + 1].name[0] : destinations[i + 1].name;
            
            const legOptions = calculateTravelCost(
                destinations[i],
                destinations[i + 1],
                travellers
            );

            
            if (!legOptions || legOptions.length === 0) {
                console.warn(`   ⚠️  No valid travel option between ${fromName} and ${toName}`);
                return null;
            }
            
            const selectedLeg = selectBestMode(legOptions, optimizationGoal);

        if (!selectedLeg.duration && !selectedLeg.estimatedTimeHours) {
            selectedLeg.duration = estimateTravelTime(selectedLeg);
        }
            
            if (!selectedLeg) {
                console.warn(`   ⚠️  Could not select mode for leg ${i + 1}`);
                return null;
            }
            
            legs.push({
                from: fromName,
                to: toName,
                ...selectedLeg,
                alternatives: legOptions
            });
        }
        
        // Final leg: Last destination → User
        const lastDest = destinations[destinations.length - 1];
        const lastDestName = Array.isArray(lastDest.name) ? lastDest.name[0] : lastDest.name;
        
        const finalLegOptions = calculateTravelCost(lastDest, userLocation, travellers);
            
        if (!finalLegOptions || finalLegOptions.length === 0) {
            console.warn(`   ⚠️  No valid travel option for return leg (${lastDestName} → ${userLocation.name})`);
            return null;
        }
        
        const selectedFinalLeg = selectBestMode(finalLegOptions, optimizationGoal);

        if (!selectedFinalLeg.duration && !selectedFinalLeg.estimatedTimeHours) {
            selectedFinalLeg.duration = estimateTravelTime(selectedFinalLeg);
        }
        
        if (!selectedFinalLeg) {
            console.warn(`   ⚠️  Could not select mode for return leg`);
            return null;
        }
        
        legs.push({
            from: lastDestName,
            to: userLocation.name || 'Your location',
            ...selectedFinalLeg,
            alternatives: finalLegOptions
        });
        
        return legs;
        
    } catch (error) {
        console.error('   ❌ Error calculating legs:', error.message);
        return null;
    }
}

/**
 * Select best travel mode based on optimization goal
 */
/**
 * Select best travel mode based on optimization goal
 * IMPROVED WITH BETTER VALIDATION
 */
function selectBestMode(travelOptions, goal) {
    if (!travelOptions || travelOptions.length === 0) {
        console.warn('   No travel options provided to selectBestMode');
        return null;
    }
    
    // Filter out invalid options - BE MORE LENIENT
    const validOptions = travelOptions.filter(opt => {
        const isValid = opt && 
                       typeof opt.cost === 'number' && 
                       opt.cost > 0 && 
                       typeof opt.distance === 'number' && 
                       opt.distance >= 0 &&
                       opt.mode;
        
        if (!isValid) {
            console.warn(`   Invalid option filtered out:`, {
                hasCost: typeof opt?.cost === 'number',
                cost: opt?.cost,
                hasDistance: typeof opt?.distance === 'number',
                distance: opt?.distance,
                mode: opt?.mode
            });
        }
        
        return isValid;
    });
    
    if (validOptions.length === 0) {
        console.warn('   No valid travel options after filtering');
        console.warn('   Original options:', travelOptions);
        return null;
    }
       
    if (goal === 'budget' || goal === 'cheapest') {
        const cheapest = validOptions.reduce((min, opt) => 
            opt.cost < min.cost ? opt : min
        );
        return cheapest;
    } else if (goal === 'fast' || goal === 'fastest') {
        const fastest = validOptions.reduce((min, opt) => {
            const timeA = min.duration || estimateTravelTime(min);
            const timeB = opt.duration || estimateTravelTime(opt);
            return timeB < timeA ? opt : min;
        });
        return fastest;
    } else if (goal === 'comfortable') {
        const scored = validOptions.map(opt => ({
            ...opt,
            comfortCostScore: (opt.comfortScore || 5) / (opt.cost / 1000)
        }));
        const best = scored.reduce((best, opt) => 
            opt.comfortCostScore > best.comfortCostScore ? opt : best
        );
        return best;
    } else if (goal === 'experiential') {
        const modePreference = { train: 3, driving: 2, bus: 1, flight: 0 };
        const scored = validOptions.map(opt => ({
            ...opt,
            expScore: (modePreference[opt.mode] || 0) + (opt.comfortScore || 5) / 2
        }));
        const best = scored.reduce((best, opt) => 
            opt.expScore > best.expScore ? opt : best
        );
        return best;
    }
    
    // Default: return cheapest
    const cheapest = validOptions.reduce((min, opt) => 
        opt.cost < min.cost ? opt : min
    );
     return cheapest;
}

/**
 * Estimate travel time in hours
 */
function estimateTravelTime(travelOption) {
    const distance = travelOption.distance || 0;
    const mode = (travelOption.mode || 'bus').toLowerCase();
    
    const speeds = {
        flight: 650,
        train: 55,
        bus: 45,
        driving: 50,
        car: 50,
        cab: 50
    };
    
    const overhead = {
        flight: 3,    // Airport check-in, boarding
        train: 1,     // Station time
        bus: 0.5,
        driving: 0,
        car: 0,
        cab: 0
    };
    
    const baseTime = distance / (speeds[mode] || 50);
    const totalTime = baseTime + (overhead[mode] || 0);
       
    return parseFloat(totalTime.toFixed(1));
}

/**
 * Calculate accommodation for all destinations
 */
async function calculateAllAccommodation(destinations, nightsAllocation, accommodationPreference, travellers) {
    const accommodations = [];
    
    for (let i = 0; i < destinations.length; i++) {
        const dest = destinations[i];
        const nights = nightsAllocation[i];
        const duration = nights + 1; // Duration includes arrival day
        
        try {
            const accCost = await calculateAccommodationCost(
                dest,
                accommodationPreference,
                duration,
                travellers
            );
            
            if (!accCost) {
                console.warn(`No accommodation found for ${dest.name}`);
                return null;
            }
            
            accommodations.push({
                destination: Array.isArray(dest.name) ? dest.name[0] : dest.name,
                nights: nights,
                ...accCost
            });
            
        } catch (error) {
            console.error(`Error calculating accommodation for ${dest.name}:`, error);
            return null;
        }
    }
    
    return accommodations;
}

/**
 * Calculate local expenses for all destinations
 */
async function calculateAllLocalExpenses(destinations, nightsAllocation, accommodationPreference, travellers) {
    const localExpenses = [];
    
    for (let i = 0; i < destinations.length; i++) {
        const dest = destinations[i];
        const days = nightsAllocation[i] + 1; // Days = nights + 1
        
        try {
            const expenses = await calculateLocalExpenses(
                dest,
                accommodationPreference,
                days,
                travellers
            );
            
            if (!expenses) {
                console.warn(`No local expenses calculated for ${dest.name}`);
                return null;
            }
            
            localExpenses.push({
                destination: Array.isArray(dest.name) ? dest.name[0] : dest.name,
                days: days,
                ...expenses
            });
            
        } catch (error) {
            console.error(`Error calculating local expenses for ${dest.name}:`, error);
            return null;
        }
    }
    
    return localExpenses;
}

/**
 * Calculate arrival day for destination
 */
function calculateArrivalDay(nightsAllocation, index) {
    if (index === 0) return 1;
    
    // Sum all previous nights + 1 for initial travel day + travel days between
    let day = 1; // Start day
    
    for (let i = 0; i < index; i++) {
        day += nightsAllocation[i];
        if (i < index - 1) {
            day += 1; // Travel day between destinations
        }
    }
    
    return day;
}

/**
 * Calculate departure day for destination
 */
function calculateDepartureDay(nightsAllocation, index) {
    const arrivalDay = calculateArrivalDay(nightsAllocation, index);
    return arrivalDay + nightsAllocation[index];
}

/**
 * Calculate route efficiency (0-1, higher is better)
 */
function calculateRouteEfficiency(destinations, userLocation, totalDistance) {
    if (destinations.length === 0) return 0;
    
    // Calculate direct distance from user to farthest destination
    const distances = destinations.map(dest => 
        Math.sqrt(
            Math.pow(dest.latitude - userLocation.latitude, 2) +
            Math.pow(dest.longitude - userLocation.longitude, 2)
        ) * 111 // Rough km conversion
    );
    
    const maxDirectDistance = Math.max(...distances);
    const theoreticalMinDistance = maxDirectDistance * 2; // Round trip
    
    // Efficiency = theoretical / actual (capped at 1)
    const efficiency = Math.min(1, theoreticalMinDistance / totalDistance);
    
    return efficiency;
}

/**
 * Calculate preference fit score (0-10)
 */
function calculatePreferenceFit(destinations) {
    if (destinations.length === 0) return 0;
    
    const scores = destinations.map(d => d.preferenceScore || 5);
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

/**
 * Calculate comfort score from legs (0-10)
 */
function calculateComfortScore(legs) {
    if (legs.length === 0) return 5;
    
    const scores = legs.map(leg => leg.comfortScore || 5);
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

/**
 * Calculate uniqueness score (0-10)
 */
function calculateUniquenessScore(destinations) {
    if (destinations.length === 0) return 5;
    
    const scores = destinations.map(d => 
        (d.visitMetrics?.uniquenessScore || 5)
    );
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

/**
 * Calculate overall route score (0-10)
 */
function calculateOverallScore(scores) {
    return (
        scores.preferenceFit * 0.35 +
        (1 - Math.abs(scores.budgetUtilization - 0.80)) * 10 * 0.25 + // Peak at 80%
        scores.routeEfficiency * 10 * 0.20 +
        scores.comfortScore * 0.10 +
        scores.uniquenessScore * 0.10
    );
}

/**
 * Extract unique preferences from destinations
 */
function extractPreferences(destinations) {
    const allTypes = destinations.flatMap(d => d.type || []);
    return [...new Set(allTypes)];
}

/**
 * Determine route type (linear, loop, hub-spoke)
 */
function determineRouteType(destinations, userLocation) {
    if (destinations.length < 2) return 'single';
    
    // Check if route returns to starting region
    const firstDest = destinations[0];
    const lastDest = destinations[destinations.length - 1];
    
    const distFirstToUser = Math.abs(firstDest.latitude - userLocation.latitude) +
                           Math.abs(firstDest.longitude - userLocation.longitude);
    const distLastToUser = Math.abs(lastDest.latitude - userLocation.latitude) +
                          Math.abs(lastDest.longitude - userLocation.longitude);
    
    if (distFirstToUser < 1 && distLastToUser < 1) {
        return 'loop'; // Starts and ends near user
    }
    
    // Check if destinations are in same region (hub-spoke)
    const states = [...new Set(destinations.map(d => d.state))];
    if (states.length === 1) {
        return 'hub-spoke';
    }
    
    return 'linear';
}

/**
 * Determine pacing (relaxed, moderate, intensive)
 */
function determinePacing(destinations, nightsAllocation, tripDuration) {
    const totalNights = nightsAllocation.reduce((sum, n) => sum + n, 0);
    const avgNightsPerDest = totalNights / destinations.length;
    
    if (avgNightsPerDest >= 3) return 'relaxed';
    if (avgNightsPerDest >= 2) return 'moderate';
    return 'intensive';
}

/**
 * Generate unique route ID
 */
function generateRouteId(destinations, optimizationGoal) {
    const destIds = destinations.map(d => d.destination_id).join('_');
    const goal = optimizationGoal.substring(0, 3);
    return `route_${destIds}_${goal}_${Date.now()}`;
}

/**
 * Generate route name
 */
function generateRouteName(destinations) {
    if (destinations.length === 0) return 'Multi-City Route';
    
    const destNames = destinations.map(d => 
        Array.isArray(d.name) ? d.name[0] : d.name
    );
    
    // Check if all in same state
    const states = [...new Set(destinations.map(d => d.state))];
    
    if (states.length === 1) {
        return `${states[0]} Explorer`;
    }
    
    // Check if all in same region
    const regions = [...new Set(destinations.map(d => d.region))];
    if (regions.length === 1) {
        return `${regions[0]} Circuit`;
    }
    
    // Use first and last destination
    if (destNames.length === 2) {
        return `${destNames[0]} & ${destNames[1]}`;
    } else if (destNames.length === 3) {
        return `${destNames[0]}, ${destNames[1]} & ${destNames[2]}`;
    } else {
        return `${destNames[0]} to ${destNames[destNames.length - 1]} via ${destNames.length - 2} cities`;
    }
}

/**
 * Generate route tagline
 */
function generateTagline(destinations, tripDuration) {
    const destNames = destinations.map(d => 
        Array.isArray(d.name) ? d.name[0] : d.name
    );
    
    if (destNames.length <= 3) {
        return `${destNames.join(', ')} in ${tripDuration} Days`;
    } else {
        return `${destNames.length} Destinations in ${tripDuration} Days`;
    }
}

/**
 * Generate multiple route variants from same cluster
 */
async function generateRouteVariants(cluster, userQuery) {
    const variants = [];
    
    // Budget variant
    const budgetRoute = await generateRoute(cluster, {
        ...userQuery,
        optimizationGoal: 'budget'
    });
    if (budgetRoute) variants.push(budgetRoute);
    
    // Comfortable variant (only if budget allows)
    if (userQuery.budget > 40000) {
        const comfortRoute = await generateRoute(cluster, {
            ...userQuery,
            optimizationGoal: 'comfortable'
        });
        if (comfortRoute && comfortRoute.totalCost.base <= userQuery.budget) {
            variants.push(comfortRoute);
        }
    }
    
    // Experiential variant (only for higher budgets)
    if (userQuery.budget > 60000) {
        const expRoute = await generateRoute(cluster, {
            ...userQuery,
            optimizationGoal: 'experiential'
        });
        if (expRoute && expRoute.totalCost.base <= userQuery.budget) {
            variants.push(expRoute);
        }
    }
    
    return variants;
}

module.exports = {
    generateRoute,
    generateRouteVariants,
    selectBestMode,
    allocateNights
};