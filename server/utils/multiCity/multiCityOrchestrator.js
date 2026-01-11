/**
 * MULTI-CITY ORCHESTRATOR
 * Main coordinator that brings all modules together
 * Entry point for multi-city trip planning
 * 
 * @file server/utils/multiCity/multiCityOrchestrator.js
 */

const preferenceExpander = require('./preferenceExpander');
const clusterBuilder = require('./clusterBuilder');
const routeGenerator = require('./routeGenerator');
const diversifier = require('./diversifier');
const dailyScheduleBuilder = require('./dailyScheduleBuilder');
const explanationGenerator = require('./explanationGenerator');
const helperFunctions = require('./helperFunctions');

/**
 * Main function: Generate multi-city recommendations
 */
async function generateMultiCityRecommendations(userQuery) {
    const startTime = Date.now();
    
    try {
      
        // Validate input
        const validation = helperFunctions.validateUserQuery(userQuery);
        if (!validation.isValid) {
            throw new Error(`VALIDATION_ERROR: ${validation.errors.join(', ')}`);
        }
        
        // PHASE 1: Expand preferences to destinations
        const preferenceMap = await preferenceExpander.expandAllPreferences(
            userQuery.preferences,
            userQuery.userLocation,
            userQuery
        );
        
        // Flatten and deduplicate
        const allDestinations = [];
        const seenIds = new Set();
        
        Object.entries(preferenceMap).forEach(([pref, dests]) => {
            dests.forEach(d => {
                if (!seenIds.has(d.destination_id)) {
                    seenIds.add(d.destination_id);
                    allDestinations.push(d);
                }
            });
        });
        
   
        if (allDestinations.length < 3) {
            throw new Error('INSUFFICIENT_DESTINATIONS: Less than 3 destinations match your criteria within budget and distance constraints. Try broadening your preferences or increasing your budget.');
        }
        
        // PHASE 2: Build geographic clusters
        const clusters = await clusterBuilder.buildClusters(
            allDestinations,
            userQuery.userLocation,
            userQuery
        );

        
        if (clusters.length === 0) {
            throw new Error('NO_CLUSTERS: Could not form any valid routes from available destinations. Try selecting closer destinations or increasing trip duration.');
        }
        
        // PHASE 3: Generate routes from clusters
        const allRoutes = [];
        
        for (const cluster of clusters) {
            try {
                const variants = await routeGenerator.generateRouteVariants(cluster, userQuery);
                allRoutes.push(...variants);
            } catch (err) {
                console.warn(`   ⚠️  Skipping cluster: ${err.message}`);
                continue;
            }
        }
        
       
        if (allRoutes.length === 0) {
            const minBudget = helperFunctions.estimateMinimumBudget(userQuery);
            throw new Error(`NO_ROUTES: Could not generate any routes within budget ₹${userQuery.budget.toLocaleString()}. Minimum required: ₹${minBudget.toLocaleString()}. Try reducing trip duration, choosing closer destinations, or selecting budget accommodation.`);
        }
        
        // PHASE 4: Diversify to 12-14 routes
        const targetCount = Math.min(14, Math.max(12, allRoutes.length));
        let diverseRoutes = diversifier.diversifyRoutes(allRoutes, targetCount);
        
        // Ensure preference balance
        diverseRoutes = diversifier.ensurePreferenceBalance(
            diverseRoutes,
            userQuery.preferences,
            targetCount
        );
        
        // PHASE 5: Build daily schedules
        for (const route of diverseRoutes) {
            try {
                route.dailySchedule = await dailyScheduleBuilder.buildDailySchedule(route);
            } catch (err) {
                console.error(
                    `Schedule build failed for ${route.name}:`,
                    err.message
                );
                route.dailySchedule = [];
            }
        }
        
        // PHASE 6: Add explanations

        const enrichedRoutes = diverseRoutes.map((route, index) => {
            try {
                const explanations = explanationGenerator.generateExplanations(
                    route,
                    userQuery,
                    diverseRoutes
                );
                
                return {
                    ...route,
                    rank: index + 1,
                    explanations: explanations,
                    dynamicPricing: generateDynamicPricingOptions(route, userQuery)
                };
            } catch (err) {
                console.warn(`   ⚠️  Explanation failed for ${route.name}: ${err.message}`);
                return {
                    ...route,
                    rank: index + 1,
                    explanations: {},
                    dynamicPricing: {}
                };
            }
        });

        enrichedRoutes.sort((a, b) => b.scores.overallScore - a.scores.overallScore);
        
        // Re-assign ranks after sorting
        enrichedRoutes.forEach((route, idx) => {
            route.rank = idx + 1;
        });
        
        const computationTime = ((Date.now() - startTime) / 1000).toFixed(1);

        return {
            success: true,
            tripType: 'multi-city',
            routes: enrichedRoutes,  // ✅ This is where routes are stored
            metadata: {
                generatedAt: new Date().toISOString(),
                computationTime: `${computationTime}s`,
                destinationsEvaluated: allDestinations.length,
                clustersFormed: clusters.length,
                routesGenerated: allRoutes.length,
                routesReturned: enrichedRoutes.length,
                userQuery: {
                    location: userQuery.userLocation.name,
                    budget: userQuery.budget,
                    tripDuration: userQuery.tripDuration,
                    preferences: userQuery.preferences
                }
            }
        };

        
    } catch (error) {
        console.error('\n❌ Multi-city planning failed:', error.message);
        
        return {
            success: false,
            error: {
                code: error.message.split(':')[0] || 'INTERNAL_ERROR',
                message: error.message.split(':').slice(1).join(':').trim() || error.message,
                suggestions: generateErrorSuggestions(error, userQuery)
            }
        };
    }
}

/**
 * Generate dynamic pricing options (what-if scenarios)
 */
function generateDynamicPricingOptions(route, userQuery) {
    const options = {};
    
    // If add one day
    const longestStay = route.destinations.reduce((max, d) => 
        d.nights > max.nights ? d : max
    , route.destinations[0]);
    
    options.ifAddOneDay = {
        bestDestination: helperFunctions.formatDestinationName(longestStay.destination),
        costIncrease: Math.round(
            longestStay.accommodation.averageRate + 
            (longestStay.localExpenses.localExpensesCost / longestStay.localExpenses.days)
        ),
        reasoning: `${helperFunctions.formatDestinationName(longestStay.destination)} has most activities, worth extra night`
    };
    
    // If remove one destination
    const shortestStay = route.destinations.reduce((min, d) => 
        d.nights < min.nights ? d : min
    , route.destinations[0]);
    
    options.ifRemoveOneDestination = {
        recommend: helperFunctions.formatDestinationName(shortestStay.destination),
        costDecrease: Math.round(
            shortestStay.accommodation.cost + 
            shortestStay.localExpenses.localExpensesCost +
            (route.legs.find(l => l.to === helperFunctions.formatDestinationName(shortestStay.destination))?.cost || 0)
        ),
        reasoning: 'Shortest stay, least unique in route'
    };
    
    // If upgrade accommodation
    if (userQuery.accommodationPreference !== 'Luxury') {
        const avgNightlyRate = route.totalCost.breakdown.accommodation / route.summary.totalNights;
        const luxuryMultiplier = userQuery.accommodationPreference === 'Budget' ? 2.5 : 1.5;
        
        options.ifUpgradeAccommodation = {
            toLuxury: {
                costIncrease: Math.round(avgNightlyRate * (luxuryMultiplier - 1) * route.summary.totalNights),
                perks: '5-star resorts, spa facilities, better views, concierge service, premium dining'
            }
        };
    }
    
    // If change travel modes (flight vs train for long legs)
    const longLegs = route.legs.filter(leg => leg.distance > 500 && leg.mode !== 'flight');
    if (longLegs.length > 0) {
        const leg = longLegs[0];
        const flightOption = leg.alternatives?.find(alt => alt.mode === 'flight');
        
        if (flightOption) {
            options.ifChangeTravelMode = {
                [`${leg.from}_to_${leg.to}_to_flight`]: {
                    costIncrease: Math.round(flightOption.cost - leg.cost),
                    timeSaved: parseFloat(((leg.duration || 0) - (flightOption.duration || 0)).toFixed(1))
                }
            };
        }
    }
    
    return options;
}

/**
 * Generate helpful error suggestions
 */
function generateErrorSuggestions(error, userQuery) {
    const suggestions = [];
    const errorMsg = error.message.toUpperCase();
    
    if (errorMsg.includes('INSUFFICIENT_DESTINATIONS')) {
        suggestions.push('✓ Try selecting fewer or different preferences (e.g., just Mountains + Temples instead of 4 preferences)');
        suggestions.push('✓ Increase your budget to unlock more destinations');
        suggestions.push('✓ Extend trip duration to allow farther destinations');
        suggestions.push('✓ Consider single-destination trip with in-depth exploration');
    }
    
    if (errorMsg.includes('NO_ROUTES') || errorMsg.includes('NO_CLUSTERS')) {
        const minBudget = helperFunctions.estimateMinimumBudget(userQuery);
        suggestions.push(`✓ Increase budget to at least ₹${minBudget.toLocaleString()}`);
        suggestions.push('✓ Reduce trip duration to fit budget (try 5-7 days instead of 10)');
        suggestions.push('✓ Choose Budget accommodation instead of Comfort/Luxury');
        suggestions.push('✓ Select destinations closer to your location');
        suggestions.push('✓ Try single-destination trip for deeper experience within budget');
    }
    
    if (errorMsg.includes('VALIDATION_ERROR')) {
        suggestions.push('✓ Ensure all required fields are filled (location, budget, duration, preferences)');
        suggestions.push('✓ Multi-city trips require at least 3 days and ₹5,000 budget');
        suggestions.push('✓ At least 1 adult traveller and 1 preference must be selected');
    }
    
    if (suggestions.length === 0) {
        suggestions.push('✓ Try adjusting your search criteria');
        suggestions.push('✓ Contact support if the problem persists');
    }
    
    return suggestions;
}

/**
 * Generate alternatives (destinations not included)
 */
async function generateAlternatives(routes, allDestinations, userQuery) {
    const includedDestIds = new Set();
    
    routes.forEach(route => {
        route.destinations.forEach(dest => {
            includedDestIds.add(dest.destination.id);
        });
    });
    
    const notIncluded = allDestinations.filter(dest => 
        !includedDestIds.has(dest.destination_id)
    ).slice(0, 5);
    
    const alternatives = notIncluded.map(dest => ({
        destination: helperFunctions.formatDestinationName(dest),
        reason: generateExclusionReason(dest, userQuery),
        howToInclude: generateInclusionSuggestion(dest, userQuery)
    }));
    
    return alternatives;
}

/**
 * Generate reason why destination was excluded
 */
function generateExclusionReason(destination, userQuery) {
    const distance = require('../distanceCalculator')(
        userQuery.userLocation.latitude,
        userQuery.userLocation.longitude,
        destination.latitude,
        destination.longitude
    );
    
    if (distance > 1500) {
        return `Too far (${Math.round(distance)}km) for ${userQuery.tripDuration}-day trip`;
    }
    
    if (destination.preferenceScore < 6) {
        return 'Lower preference match compared to included destinations';
    }
    
    if (!destination.infrastructure?.accommodationAvailable) {
        return 'Limited accommodation options';
    }
    
    return 'Did not fit optimally in route clusters';
}

/**
 * Generate suggestion for including destination
 */
function generateInclusionSuggestion(destination, userQuery) {
    const suggestions = [];
    
    const distance = require('../distanceCalculator')(
        userQuery.userLocation.latitude,
        userQuery.userLocation.longitude,
        destination.latitude,
        destination.longitude
    );
    
    if (distance > 1500) {
        const extraDays = Math.ceil(distance / 500);
        suggestions.push(`Extend trip by ${extraDays} days`);
    } else {
        suggestions.push(`Extend trip by 2-3 days`);
    }
    
    const estimatedCost = 8000; // Rough estimate per destination
    suggestions.push(`Increase budget by ₹${estimatedCost.toLocaleString()}`);
    
    return suggestions.join(' OR ');
}

module.exports = {
    generateMultiCityRecommendations,
    generateDynamicPricingOptions,
    generateErrorSuggestions,
    generateAlternatives
};
                    