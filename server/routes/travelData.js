// server/routes/travelData.js - PRODUCTION-READY VERSION
const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const { enhanceSingleDestination } = require('../utils/singleDestination/singleDestinationEnhancer');
const { buildEnhancedQuery, filterByPreferenceMatch } = require('../utils/smartPreferenceMatching');
const calculateDistance = require('../utils/distanceCalculator');
const { generateMultiCityRecommendations } = require('../utils/multiCity/multiCityOrchestrator');


router.use((req, res, next) => {
    req.startTime = Date.now();
    next();
});

router.post('/recommendations', async (req, res) => {
    try {
        const body = {
            ...req.body,
            travellers: req.body.travellers || req.body.travelers,
            userLocation: req.body.userLocation || req.body.location
        };

        const tripType = (body.tripType || 'single-destination')
            .toString()
            .toLowerCase()
            .trim();

        // ✅ Single destination
        if (['single', 'single-destination'].includes(tripType)) {
            return await handleSingleDestination(req, res, body);
        }

        // ✅ Multi destination
        if (['multi', 'multi-destination', 'multi-city'].includes(tripType)) {
            return await handleMultiCity(req, res, body);
        }

        // ❌ Invalid trip type
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_TRIP_TYPE',
                message: `Unknown tripType: "${body.tripType}". Use "single-destination" or "multi-destination".`
            }
        });

    } catch (err) {
        console.error('❌ Error in /recommendations:', err);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err.message
            }
        });
    }
});


/**
 * ✅ FIXED: Single-destination handler with all production improvements
 */
async function handleSingleDestination(req, res, body) {
    const {
        budget = Infinity,
        userLocation,
        tripDuration = 3,
        travellers = { adults: 1, children: 0, infants: 0 },
        preferences = [],
        accommodationPreference = 'Comfort',
        page = 1,
        limit = 20,
        sortBy = 'cheapest',
        filters = {}
    } = body;

    // ✅ VALIDATION
    if (!userLocation || !userLocation.name) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_LOCATION', message: 'userLocation is required' }
        });
    }

    console.log(`\n🔍 Processing single-destination request:`);
    console.log(`   📍 From: ${userLocation.name}, ${userLocation.state}`);
    console.log(`   💰 Budget: ₹${budget.toLocaleString()}`);
    console.log(`   📅 Duration: ${tripDuration} days`);
    console.log(`   👥 Travelers: ${travellers.adults}A + ${travellers.children}C + ${travellers.infants}I`);
    console.log(`   🎯 Preferences: ${preferences.join(', ')}`);

    // ✅ REVERTED: Use simple query that works with your database
    const normalizedPreferences = (Array.isArray(preferences) ? preferences : [])
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
    
    const query = {};
    if (normalizedPreferences.length) {
        query.type = { $in: normalizedPreferences };
    }
    if (filters.regions?.length) {
        query.region = { $in: filters.regions };
    }
    if (filters.states?.length) {
        query.state = { $in: filters.states };
    }
    
    console.log(`\n📊 Query built:`, JSON.stringify(query, null, 2));

    // ✅ STEP 2: Fetch matching destinations
    let destinations = await Destination.find(query)
        .select('destination_id name type latitude longitude state region description images travel localExpenses seasonality additionalLocalInfo visitMetrics infrastructure')
        .lean();

    console.log(`\n📍 Found ${destinations.length} destinations matching query`);

    // ✅ STEP 3: Exclude user's city and nearby destinations
    const userCityName = userLocation.name.toLowerCase().trim();
    const userState = userLocation.state?.toLowerCase().trim();

    destinations = destinations.filter(dest => {
        // Exclude same city
        const destNames = Array.isArray(dest.name) ? dest.name : [dest.name];
        const isSameCity = destNames.some(n =>
            n.toLowerCase().includes(userCityName) ||
            userCityName.includes(n.toLowerCase())
        );

        if (isSameCity && dest.state?.toLowerCase() === userState) {
            console.log(`   ❌ Excluded same city: ${dest.name}`);
            return false;
        }

        // Exclude very nearby (<50km)
        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            dest.latitude,
            dest.longitude
        );

        if (distance < 50) {
            console.log(`   ❌ Excluded nearby: ${dest.name} (${Math.round(distance)}km)`);
            return false;
        }

        return true;
    });

    console.log(`\n✅ After city filtering: ${destinations.length} destinations`);

    // ✅ SIMPLIFIED: Skip preference filtering since we're using simple query
    const filteredByPreference = destinations;

    console.log(`\n✅ After preference filtering: ${filteredByPreference.length} destinations`);

    if (filteredByPreference.length === 0) {
        return res.json({
            success: true,
            tripType: 'single-destination',
            results: [],
            message: 'No destinations found matching your preferences. Try broadening your search.',
            suggestions: [
                'Reduce number of preferences',
                'Increase budget',
                'Try different regions'
            ]
        });
    }

    // ✅ STEP 5: Enhance each destination with travel/cost calculations
    console.log(`\n🔄 Enhancing ${filteredByPreference.length} destinations...`);
    
    const enhancedResults = (await Promise.all(
        filteredByPreference.map(dest =>
            enhanceSingleDestination(dest, body)
                .catch(err => {
                    console.error(`❌ Error enhancing ${dest.destination_id}:`, err.message);
                    return null;
                })
        )
    )).filter(r => r !== null);

    console.log(`\n✅ Successfully enhanced: ${enhancedResults.length} destinations`);

    // ✅ STEP 6: Filter by budget feasibility
    const feasibleResults = enhancedResults.filter(item => {
        const cheapestVariant = item.variants.find(v => v.label === 'cheapest') || item.variants[0];
        const cheapestCost = cheapestVariant?.totalCost?.base || 0;
        const distance = cheapestVariant?.travel?.totalDistance || 0;

        const withinBudget = cheapestCost <= budget;
        const withinDistance = !filters.maxDistance || distance <= filters.maxDistance;

        if (!withinBudget) {
            console.log(`   💰 Excluded ${item.destination.name}: ₹${cheapestCost.toLocaleString()} > ₹${budget.toLocaleString()}`);
        }
        if (!withinDistance) {
            console.log(`   📏 Excluded ${item.destination.name}: ${distance}km > ${filters.maxDistance}km`);
        }

        return withinBudget && withinDistance;
    });

    console.log(`\n🎯 Final feasible destinations: ${feasibleResults.length}`);

    // ✅ STEP 7: Sort results
    const sortedResults = sortSingleDestinationResults(feasibleResults, sortBy);

    // ✅ STEP 8: Paginate
    const total = sortedResults.length;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const paginatedResults = sortedResults.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const computationTime = Date.now() - req.startTime;

    console.log(`\n✅ Returning ${paginatedResults.length} results (page ${pageNum}/${Math.ceil(total / limitNum)})`);
    console.log(`⏱️ Total time: ${computationTime}ms\n`);

    return res.json({
        success: true,
        tripType: 'single-destination',
        results: paginatedResults,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalResults: total,
            resultsPerPage: limitNum,
            hasNextPage: pageNum * limitNum < total,
            hasPrevPage: pageNum > 1
        },
        appliedFilters: {
            sortBy,
            budget,
            preferences,
            regions: filters.regions || [],
            states: filters.states || [],
            maxDistance: filters.maxDistance || null
        },
        metadata: {
            generatedAt: new Date().toISOString(),
            destinationsEvaluated: filteredByPreference.length,
            destinationsFeasible: feasibleResults.length,
            computationTime: `${computationTime}ms`,
            averagePreferenceMatch: Math.round(
                feasibleResults.reduce((sum, r) => sum + (r.destination.preferenceMatchScore || 0), 0) / feasibleResults.length
            )
        }
    });
}

/**
 * ✅ Multi-city handler
 */
// async function handleMultiCity(req, res, body) {
//     const {
//         budget = 15000,
//         userLocation,
//         tripDuration = 5,
//         travellers = { adults: 1, children: 0, infants: 0 },
//         preferences = [],
//         accommodationPreference = 'Comfort'
//     } = body;

//     // ✅ Validation
//     if (!userLocation || !userLocation.name) {
//         return res.status(400).json({
//             success: false,
//             error: { 
//                 code: 'MISSING_LOCATION', 
//                 message: 'userLocation is required' 
//             }
//         });
//     }

//     if (tripDuration < 3) {
//         return res.status(400).json({
//             success: false,
//             error: { 
//                 code: 'INSUFFICIENT_DURATION', 
//                 message: 'Multi-city trips require at least 3 days' 
//             }
//         });
//     }

//     if (!preferences || preferences.length === 0) {
//         return res.status(400).json({
//             success: false,
//             error: { 
//                 code: 'MISSING_PREFERENCES', 
//                 message: 'At least one preference required (Mountains, Beaches, Cities, etc.)' 
//             }
//         });
//     }

//     console.log(`\n🌍 Multi-city request from ${userLocation.name}`);
//     console.log(`   Budget: ₹${budget}, Duration: ${tripDuration} days`);
//     console.log(`   Preferences: ${preferences.join(', ')}\n`);

//     try {
//         // ✅ Call orchestrator
//         const result = await generateMultiCityRecommendations({
//             userLocation,
//             budget,
//             tripDuration,
//             travellers,
//             preferences,
//             accommodationPreference
//         });

//         // ✅ Handle errors
//         if (!result.success) {
//             return res.status(400).json(result);
//         }

//         const routes = result.routes || result.recommendedItineraries || [];

//         // ✅ Handle no routes
//         if (!routes || routes.length === 0) {
//             return res.json({
//                 success: true,
//                 tripType: 'multi-city',
//                 routes: routes,  // keep this
//                 message: 'No multi-city routes found. Try adjusting your criteria.',
//                 suggestions: [
//                     'Reduce trip duration to 3-5 days',
//                     'Increase budget',
//                     'Select fewer preferences (1-2 instead of 5)',
//                     'Try single-destination for better options'
//                 ],
//                 alternatives: result.alternatives,
//                 results: [],
//                 metadata: result.metadata
//             });
//         }

//         // ✅ Success
//         console.log(`✅ Returning ${result.routes.length} routes\n`);
//         return res.json(result);

//     } catch (error) {
//         console.error('❌ Multi-city error:', error);
//         return res.status(500).json({
//             success: false,
//             error: {
//                 code: 'MULTI_CITY_ERROR',
//                 message: error.message
//             }
//         });
//     }
// }

async function handleMultiCity(req, res, body) {
    console.log('\n🌍 Processing multi-city request...');

    if (!body.userLocation || !body.userLocation.name) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_LOCATION', message: 'userLocation with name is required' }
        });
    }
    if (!body.budget || body.budget < 5000) {
        return res.status(400).json({
            success: false,
            error: { code: 'INVALID_BUDGET', message: 'Budget must be at least ₹5,000 for multi-city trips' }
        });
    }
    if (!body.tripDuration || body.tripDuration < 3) {
        return res.status(400).json({
            success: false,
            error: { code: 'INVALID_DURATION', message: 'Multi-city trips require at least 3 days' }
        });
    }
    if (!body.preferences || body.preferences.length === 0) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_PREFERENCES', message: 'At least one preference is required' }
        });
    }

    try {
        const orchestratorResult = await generateMultiCityRecommendations(body);

        console.log('🔍 Orchestrator returned:', {
            success: orchestratorResult.success,
            routesCount: orchestratorResult.routes?.length || 0,
            recommendedItineraries: orchestratorResult.recommendedItineraries?.length || 0,
            allKeys: Object.keys(orchestratorResult),
            error: orchestratorResult.error
        });

        if (!orchestratorResult.success) {
            return res.status(400).json(orchestratorResult);
        }

        const routes = orchestratorResult.routes || orchestratorResult.recommendedItineraries || [];

        console.log(`📊 Final routes count: ${routes.length}`);
        if (routes.length > 0) {
            console.log('📝 First route structure:', {
                name: routes[0].name,
                destinations: routes[0].destinations?.length,
                legs: routes[0].legs?.length,
                totalCost: routes[0].totalCost,
                hasDailySchedule: !!routes[0].dailySchedule
            });
        } else {
            console.log('❌ WARNING: No routes found in orchestrator result!');
        }

        const response = {
            success: true,
            tripType: 'multi-city',
            multiCityResults: { recommendedItineraries: routes },
            routes: routes,
            metadata: orchestratorResult.metadata || {
                generatedAt: new Date().toISOString(),
                computationTime: `${Date.now() - req.startTime}ms`,
                destinationsEvaluated: 0,
                clustersFormed: 0,
                routesGenerated: routes.length,
                routesReturned: routes.length,
                userQuery: {
                    location: body.userLocation.name,
                    budget: body.budget,
                    tripDuration: body.tripDuration,
                    preferences: body.preferences
                }
            },
            alternatives: orchestratorResult.alternatives,
            singleDestinationResults: [],
            results: []
        };

        console.log(`✅ Multi-city response prepared: ${response.multiCityResults.recommendedItineraries.length} routes`);

        return res.json(response);
    } catch (error) {
        console.error('❌ Multi-city error:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'MULTI_CITY_ERROR', message: error.message }
        });
    }
}

/**
 * ✅ IMPROVED: Sort with preference score consideration
 */
function sortSingleDestinationResults(results, sortBy) {
    return results.sort((a, b) => {
        if (sortBy === 'distance') {
            const distA = a.variants.find(v => v.label === 'cheapest')?.travel?.totalDistance || 0;
            const distB = b.variants.find(v => v.label === 'cheapest')?.travel?.totalDistance || 0;
            return distA - distB;
        }

        if (sortBy === 'preference') {
            const scoreA = a.destination.preferenceMatchScore || 0;
            const scoreB = b.destination.preferenceMatchScore || 0;
            return scoreB - scoreA; // Higher score first
        }

        // Default: sort by cost
        const costA = a.variants.find(v => v.label === 'cheapest')?.totalCost?.base || 0;
        const costB = b.variants.find(v => v.label === 'cheapest')?.totalCost?.base || 0;
        return costA - costB;
    });
}

module.exports = router;


