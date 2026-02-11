// // server/routes/travelData.js - PRODUCTION-READY VERSION
// const express = require('express');
// const router = express.Router();
// const Destination = require('../models/Destination');
// const { enhanceSingleDestination } = require('../utils/singleDestination/singleDestinationEnhancer');
// const { buildEnhancedQuery, filterByPreferenceMatch } = require('../utils/smartPreferenceMatching');
// const calculateDistance = require('../utils/distanceCalculator');
// const { generateMultiCityRecommendations } = require('../utils/multiCity/multiCityOrchestrator');

// router.use((req, res, next) => {
//     req.startTime = Date.now();
//     next();
// });

// router.post('/recommendations', async (req, res) => {
//     try {
//         const body = {
//             ...req.body,
//             travellers: req.body.travellers || req.body.travelers,
//             userLocation: req.body.userLocation || req.body.location
//         };

//         const tripType = (body.tripType || 'single-destination')
//             .toString()
//             .toLowerCase()
//             .trim();

//         if (['single', 'single-destination'].includes(tripType)) {
//             return await handleSingleDestination(req, res, body);
//         }

//         if (['multi', 'multi-destination', 'multi-city'].includes(tripType)) {
//             return await handleMultiCity(req, res, body);
//         }

//         return res.status(400).json({
//             success: false,
//             error: {
//                 code: 'INVALID_TRIP_TYPE',
//                 message: `Unknown tripType: "${body.tripType}". Use "single-destination" or "multi-destination".`
//             }
//         });

//     } catch (err) {
//         console.error('❌ Error in /recommendations:', err);
//         return res.status(500).json({
//             success: false,
//             error: {
//                 code: 'INTERNAL_SERVER_ERROR',
//                 message: err.message
//             }
//         });
//     }
// });

// async function handleSingleDestination(req, res, body) {
//     const {
//         budget = Infinity,
//         userLocation,
//         tripDuration = 3,
//         travellers = { adults: 1, children: 0, infants: 0 },
//         preferences = [],
//         accommodationPreference = 'Comfort',
//         page = 1,
//         limit = 20,
//         sortBy = 'cheapest',
//         filters = {}
//     } = body;

//     if (!userLocation || !userLocation.name) {
//         return res.status(400).json({
//             success: false,
//             error: { code: 'MISSING_LOCATION', message: 'userLocation is required' }
//         });
//     }

//     const normalizedPreferences = (Array.isArray(preferences) ? preferences : [])
//         .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
    
//     const query = {};
//     if (normalizedPreferences.length) {
//         query.type = { $in: normalizedPreferences };
//     }
//     if (filters.regions?.length) {
//         query.region = { $in: filters.regions };
//     }
//     if (filters.states?.length) {
//         query.state = { $in: filters.states };
//     }

//     let destinations = await Destination.find(query)
//         .select('destination_id name type latitude longitude state region description images travel localExpenses seasonality additionalLocalInfo visitMetrics infrastructure')
//         .lean();

//     const userCityName = userLocation.name.toLowerCase().trim();
//     const userState = userLocation.state?.toLowerCase().trim();

//     destinations = destinations.filter(dest => {
//         const destNames = Array.isArray(dest.name) ? dest.name : [dest.name];
//         const isSameCity = destNames.some(n =>
//             n.toLowerCase().includes(userCityName) ||
//             userCityName.includes(n.toLowerCase())
//         );

//         if (isSameCity && dest.state?.toLowerCase() === userState) {
//             return false;
//         }

//         const distance = calculateDistance(
//             userLocation.latitude,
//             userLocation.longitude,
//             dest.latitude,
//             dest.longitude
//         );

//         return distance >= 50;
//     });

//     const filteredByPreference = destinations;

//     if (filteredByPreference.length === 0) {
//         return res.json({
//             success: true,
//             tripType: 'single-destination',
//             results: [],
//             message: 'No destinations found matching your preferences. Try broadening your search.',
//             suggestions: [
//                 'Reduce number of preferences',
//                 'Increase budget',
//                 'Try different regions'
//             ]
//         });
//     }

//     const enhancedResults = (await Promise.all(
//         filteredByPreference.map(dest =>
//             enhanceSingleDestination(dest, body)
//                 .catch(err => {
//                     console.error(`❌ Error enhancing ${dest.destination_id}:`, err.message);
//                     return null;
//                 })
//         )
//     )).filter(r => r !== null);

//     const feasibleResults = enhancedResults.filter(item => {
//         const cheapestVariant = item.variants.find(v => v.label === 'cheapest') || item.variants[0];
//         const cheapestCost = cheapestVariant?.totalCost?.base || 0;
//         const distance = cheapestVariant?.travel?.totalDistance || 0;

//         const withinBudget = cheapestCost <= budget;
//         const withinDistance = !filters.maxDistance || distance <= filters.maxDistance;

//         return withinBudget && withinDistance;
//     });

//     const sortedResults = sortSingleDestinationResults(feasibleResults, sortBy);

//     const total = sortedResults.length;
//     const pageNum = Math.max(1, parseInt(page));
//     const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
//     const paginatedResults = sortedResults.slice((pageNum - 1) * limitNum, pageNum * limitNum);

//     const computationTime = Date.now() - req.startTime;

//     return res.json({
//         success: true,
//         tripType: 'single-destination',
//         results: paginatedResults,
//         pagination: {
//             currentPage: pageNum,
//             totalPages: Math.ceil(total / limitNum),
//             totalResults: total,
//             resultsPerPage: limitNum,
//             hasNextPage: pageNum * limitNum < total,
//             hasPrevPage: pageNum > 1
//         },
//         appliedFilters: {
//             sortBy,
//             budget,
//             preferences,
//             regions: filters.regions || [],
//             states: filters.states || [],
//             maxDistance: filters.maxDistance || null
//         },
//         metadata: {
//             generatedAt: new Date().toISOString(),
//             destinationsEvaluated: filteredByPreference.length,
//             destinationsFeasible: feasibleResults.length,
//             computationTime: `${computationTime}ms`,
//             averagePreferenceMatch: feasibleResults.length > 0 
//                 ? Math.round(
//                     feasibleResults.reduce((sum, r) => sum + (r.destination.preferenceMatchScore || 0), 0) / feasibleResults.length
//                 )
//                 : 0
//         }
//     });
// }

// async function handleMultiCity(req, res, body) {
//     if (!body.userLocation || !body.userLocation.name) {
//         return res.status(400).json({
//             success: false,
//             error: { code: 'MISSING_LOCATION', message: 'userLocation with name is required' }
//         });
//     }
//     if (!body.budget || body.budget < 5000) {
//         return res.status(400).json({
//             success: false,
//             error: { code: 'INVALID_BUDGET', message: 'Budget must be at least ₹5,000 for multi-city trips' }
//         });
//     }
//     if (!body.tripDuration || body.tripDuration < 3) {
//         return res.status(400).json({
//             success: false,
//             error: { code: 'INVALID_DURATION', message: 'Multi-city trips require at least 3 days' }
//         });
//     }
//     if (!body.preferences || body.preferences.length === 0) {
//         return res.status(400).json({
//             success: false,
//             error: { code: 'MISSING_PREFERENCES', message: 'At least one preference is required' }
//         });
//     }

//     try {
//         const orchestratorResult = await generateMultiCityRecommendations(body);

//         if (!orchestratorResult.success) {
//             return res.status(400).json(orchestratorResult);
//         }

//         const routes = orchestratorResult.routes || orchestratorResult.recommendedItineraries || [];

//         const response = {
//             success: true,
//             tripType: 'multi-city',
//             multiCityResults: { recommendedItineraries: routes },
//             routes: routes,
//             metadata: orchestratorResult.metadata || {
//                 generatedAt: new Date().toISOString(),
//                 computationTime: `${Date.now() - req.startTime}ms`,
//                 destinationsEvaluated: 0,
//                 clustersFormed: 0,
//                 routesGenerated: routes.length,
//                 routesReturned: routes.length,
//                 userQuery: {
//                     location: body.userLocation.name,
//                     budget: body.budget,
//                     tripDuration: body.tripDuration,
//                     preferences: body.preferences
//                 }
//             },
//             alternatives: orchestratorResult.alternatives,
//             singleDestinationResults: [],
//             results: []
//         };

//         return res.json(response);
//     } catch (error) {
//         console.error('❌ Multi-city error:', error);
//         return res.status(500).json({
//             success: false,
//             error: { code: 'MULTI_CITY_ERROR', message: error.message }
//         });
//     }
// }

// function sortSingleDestinationResults(results, sortBy) {
//     return results.sort((a, b) => {
//         if (sortBy === 'distance') {
//             const distA = a.variants.find(v => v.label === 'cheapest')?.travel?.totalDistance || 0;
//             const distB = b.variants.find(v => v.label === 'cheapest')?.travel?.totalDistance || 0;
//             return distA - distB;
//         }

//         if (sortBy === 'preference') {
//             const scoreA = a.destination.preferenceMatchScore || 0;
//             const scoreB = b.destination.preferenceMatchScore || 0;
//             return scoreB - scoreA;
//         }

//         const costA = a.variants.find(v => v.label === 'cheapest')?.totalCost?.base || 0;
//         const costB = b.variants.find(v => v.label === 'cheapest')?.totalCost?.base || 0;
//         return costA - costB;
//     });
// }

// module.exports = router;

// server/routes/travelData.js - PRODUCTION-READY VERSION
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

        if (['single', 'single-destination'].includes(tripType)) {
            return await handleSingleDestination(req, res, body);
        }

        if (['multi', 'multi-destination', 'multi-city'].includes(tripType)) {
            return await handleMultiCity(req, res, body);
        }

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

    if (!userLocation || !userLocation.name) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_LOCATION', message: 'userLocation is required' }
        });
    }

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

    let destinations = await Destination.find(query)
        .select('destination_id name type latitude longitude state region description images travel localExpenses seasonality additionalLocalInfo visitMetrics infrastructure')
        .lean();

    const userCityName = userLocation.name.toLowerCase().trim();
    const userState = userLocation.state?.toLowerCase().trim();

    destinations = destinations.filter(dest => {
        const destNames = Array.isArray(dest.name) ? dest.name : [dest.name];
        const isSameCity = destNames.some(n =>
            n.toLowerCase().includes(userCityName) ||
            userCityName.includes(n.toLowerCase())
        );

        if (isSameCity && dest.state?.toLowerCase() === userState) {
            return false;
        }

        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            dest.latitude,
            dest.longitude
        );

        return distance >= 50;
    });

    const filteredByPreference = destinations;

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

    const enhancedResults = (await Promise.all(
        filteredByPreference.map(dest =>
            enhanceSingleDestination(dest, body)
                .catch(err => {
                    console.error(`❌ Error enhancing ${dest.destination_id}:`, err.message);
                    return null;
                })
        )
    )).filter(r => r !== null);

    // const feasibleResults = enhancedResults.filter(item => {
    //     const cheapestVariant = item.variants.find(v => v.label === 'cheapest') || item.variants[0];
    //     const cheapestCost = cheapestVariant?.totalCost?.base || 0;
    //     const distance = cheapestVariant?.travel?.totalDistance || 0;

    //     const withinBudget = cheapestCost <= budget;
    //     const withinDistance = !filters.maxDistance || distance <= filters.maxDistance;

    //     return withinBudget && withinDistance;
    // });

// --- Smart Budget Filtering ---

const numericBudget = Number(budget);
const hasValidBudget = Number.isFinite(numericBudget) && numericBudget > 0;

let feasibleResults = enhancedResults.filter(item => {
    const cheapestVariant =
        item.variants.find(v => v.label === 'cheapest') || item.variants[0];

    const cheapestCost = cheapestVariant?.totalCost?.base || 0;
    const distance = cheapestVariant?.travel?.totalDistance || 0;

    const withinDistance =
        !filters.maxDistance || distance <= filters.maxDistance;

    if (!hasValidBudget) {
        // No budget specified → allow all (distance-filtered only)
        return withinDistance;
    }

    const lowerBudgetBound = numericBudget * 0.6;
    const withinBudget = cheapestCost <= numericBudget;
    const aboveLowerBound = cheapestCost >= lowerBudgetBound;

    return withinBudget && aboveLowerBound && withinDistance;
});


// --- Fallback Logic ---
// If nothing falls inside 60%–100% band, fallback to <= budget
if (hasValidBudget && feasibleResults.length === 0) {
    feasibleResults = enhancedResults.filter(item => {
        const cheapestVariant =
            item.variants.find(v => v.label === 'cheapest') || item.variants[0];

        const cheapestCost = cheapestVariant?.totalCost?.base || 0;
        const distance = cheapestVariant?.travel?.totalDistance || 0;

        const withinBudget = cheapestCost <= numericBudget;
        const withinDistance =
            !filters.maxDistance || distance <= filters.maxDistance;

        return withinBudget && withinDistance;
    });
}



    // const sortedResults = sortSingleDestinationResults(feasibleResults, sortBy);
const sortedResults = sortSingleDestinationResults(feasibleResults, sortBy, budget);

    const total = sortedResults.length;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const paginatedResults = sortedResults.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const computationTime = Date.now() - req.startTime;

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
            averagePreferenceMatch: feasibleResults.length > 0 
                ? Math.round(
                    feasibleResults.reduce((sum, r) => sum + (r.destination.preferenceMatchScore || 0), 0) / feasibleResults.length
                )
                : 0
        }
    });
}

async function handleMultiCity(req, res, body) {
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

        if (!orchestratorResult.success) {
            return res.status(400).json(orchestratorResult);
        }

        const routes = orchestratorResult.routes || orchestratorResult.recommendedItineraries || [];

        //added route sorting based on proximity to budget
        // routes.sort((a, b) => {
        //     const costA = a.totalCost?.base || 0;
        //     const costB = b.totalCost?.base || 0;

        //     return Math.abs(body.budget - costA) - Math.abs(body.budget - costB);
        // });
        
        routes.sort((a, b) => {
            const costA = a.totalCost?.base || 0;
            const costB = b.totalCost?.base || 0;

            // Prefer HIGHER utilization
            const utilA = costA / body.budget;
            const utilB = costB / body.budget;

            if (Math.abs(utilA - utilB) < 0.05) {
                // tiebreaker: overall score
                return (b.scores?.overallScore || 0) - (a.scores?.overallScore || 0);
            }

            return utilB - utilA;   // higher % first
        });

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

        return res.json(response);
    } catch (error) {
        console.error('❌ Multi-city error:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'MULTI_CITY_ERROR', message: error.message }
        });
    }
}

// function sortSingleDestinationResults(results, sortBy) {
//     return results.sort((a, b) => {
//         if (sortBy === 'distance') {
//             const distA = a.variants.find(v => v.label === 'cheapest')?.travel?.totalDistance || 0;
//             const distB = b.variants.find(v => v.label === 'cheapest')?.travel?.totalDistance || 0;
//             return distA - distB;
//         }

//         if (sortBy === 'preference') {
//             const scoreA = a.destination.preferenceMatchScore || 0;
//             const scoreB = b.destination.preferenceMatchScore || 0;
//             return scoreB - scoreA;
//         }

//         const costA = a.variants.find(v => v.label === 'cheapest')?.totalCost?.base || 0;
//         const costB = b.variants.find(v => v.label === 'cheapest')?.totalCost?.base || 0;
//         return costA - costB;
//     });
// }

function sortSingleDestinationResults(results, sortBy, budget) {

    const numericBudget = Number(budget);
    const hasValidBudget = Number.isFinite(numericBudget) && numericBudget > 0;

    return results.sort((a, b) => {

        const getCheapestCost = (item) =>
            item.variants.find(v => v.label === 'cheapest')
                ?.totalCost?.base || 0;

        const costA = getCheapestCost(a);
        const costB = getCheapestCost(b);

        // If low budget user → cheapest first
        if (hasValidBudget && numericBudget < 20000) {
            return costA - costB;
        }

        if (sortBy === 'distance') {
            const distA = a.variants.find(v => v.label === 'cheapest')
                ?.travel?.totalDistance || 0;

            const distB = b.variants.find(v => v.label === 'cheapest')
                ?.travel?.totalDistance || 0;

            return distA - distB;
        }

        if (sortBy === 'preference') {
            const scoreA = a.destination.preferenceMatchScore || 0;
            const scoreB = b.destination.preferenceMatchScore || 0;
            return scoreB - scoreA;
        }

        // Default: closest to budget first (only if valid budget exists)
        if (hasValidBudget) {
            const diffA = Math.abs(numericBudget - costA);
            const diffB = Math.abs(numericBudget - costB);
            return diffA - diffB;
        }

        // If no budget provided → fallback cheapest first
        return costA - costB;
    });
}



module.exports = router;