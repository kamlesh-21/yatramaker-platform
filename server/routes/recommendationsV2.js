// /**
//  * server/routes/recommendationsV2.js
//  *
//  * Optimized wrapper around your existing business logic.
//  * - Uses your existing utils unchanged:
//  *    server/utils/calculateTravelCost.js
//  *    server/utils/calculateAccommodationCost.js
//  *    server/utils/calculateLocalExpenses.js
//  *    server/utils/generateVariants.js
//  *
//  * - Adds:
//  *    - request-level caching (optional via middleware)
//  *    - per-destination memoization (memo.js)
//  *    - controlled concurrency (batching using Promise.all)
//  *    - pagination and candidate limit
//  *
//  * Non-destructive: does not modify any existing util implementation.
//  */

// const express = require('express');
// const router = express.Router();

// const Destination = require('../models/Destination');

// // IMPORTANT: use your real util filenames; these must NOT be modified in content
// const calculateTravelCost = require('../utils/calculateTravelCost');
// const calculateAccommodationCost = require('../utils/calculateAccommodationCost');
// const calculateLocalExpenses = require('../utils/calculateLocalExpenses');
// const generateVariants = require('../utils/generateVariants');

// const memo = require('../utils/memo'); // per-destination memo
// const { cacheMiddleware } = require('../middleware/cache'); // optional request cache

// // Tunables (safe defaults)
// const CANDIDATE_LIMIT = 500;      // avoid full scans
// const BATCH_SIZE = 12;           // parallel concurrently processed destinations
// const DEST_TTL_MS = 1000 * 60 * 10; // memo TTL for per-destination compute

// // normalize incoming request body
// function normalizeReq(body) {
//   return {
//     userLocation: body.userLocation || null,
//     travellers: body.travellers || { adults: 1, children: 0, infants: 0 },
//     budget: typeof body.budget === 'number' ? body.budget : null,
//     preferences: Array.isArray(body.preferences) ? body.preferences : [],
//     tripDuration: Number(body.tripDuration) || 3,
//     accommodationPreference: body.accommodationPreference || 'midrange',
//     page: Math.max(1, Number(body.page) || 1),
//     pageSize: Math.max(10, Math.min(100, Number(body.pageSize) || 20)),
//   };
// }

// // Create a stable memo key for a single destination compute based on relevant inputs
// function makeDestMemoKey(dest, reqBody) {
//   const key = {
//     destId: dest.destination_id || dest._id || null,
//     userLocation: reqBody.userLocation ? { lat: roundCoord(reqBody.userLocation.latitude || reqBody.userLocation.lat, 4), lon: roundCoord(reqBody.userLocation.longitude || reqBody.userLocation.lon, 4) } : null,
//     travellers: reqBody.travellers,
//     tripDuration: reqBody.tripDuration,
//     accommodationPreference: reqBody.accommodationPreference,
//     preferences: reqBody.preferences || []
//   };
//   return JSON.stringify(key);
// }

// function roundCoord(v, precision = 4) {
//   if (typeof v !== 'number') return v;
//   const p = Math.pow(10, precision);
//   return Math.round(v * p) / p;
// }

// async function computeForDestination(dest, reqBody) {
//   // memoize full display object to avoid re-running heavy utils
//   const memoKey = makeDestMemoKey(dest, reqBody);
//   const cached = memo.get(memoKey);
//   if (cached) return cached;

//   // call your existing utils (unchanged)
//   const travelOptions = await calculateTravelCost(reqBody.userLocation, dest, reqBody.travellers);
//   const accommodationCost = await calculateAccommodationCost(dest, reqBody.accommodationPreference, reqBody.tripDuration, reqBody.travellers);
//   const localExpensesObj = await calculateLocalExpenses(dest, reqBody.accommodationPreference, reqBody.tripDuration, reqBody.travellers);

//   // determine cheapest travel option (same semantics as your original code expects)
//   let cheapestTravelOption = null;
//   if (Array.isArray(travelOptions) && travelOptions.length > 0) {
//     cheapestTravelOption = travelOptions.reduce((best, cur) => {
//       if (!best) return cur;
//       const b = Number(best.cost || Infinity);
//       const c = Number(cur.cost || Infinity);
//       return c < b ? cur : best;
//     }, null);
//   } else {
//     cheapestTravelOption = { cost: 0, mode: null, legs: [] };
//   }

//   const accCost = accommodationCost && typeof accommodationCost.cost === 'number' ? accommodationCost.cost : 0;
//   const localCost = (localExpensesObj && typeof localExpensesObj.localExpensesCost === 'number') ? localExpensesObj.localExpensesCost : 0;
//   const activitiesCost = (localExpensesObj && typeof localExpensesObj.activitiesCost === 'number') ? localExpensesObj.activitiesCost : 0;
//   const travelCost = Number(cheapestTravelOption.cost || 0);

//   const totalCost = travelCost + accCost + localCost + activitiesCost;

//   // generate variants using your exact variant generator (unchanged)
//   const variants = await generateVariants(reqBody.userLocation, dest, reqBody.travellers, travelOptions);

//   const display = {
//     _id: dest._id,
//     destination_id: dest.destination_id || null,
//     name: dest.name || dest.title || null,
//     slug: dest.slug || null,
//     region: dest.region || null,
//     state: dest.state || null,
//     country: dest.country || null,
//     images: dest.images || [],
//     description: dest.description || '',
//     accommodationCost: accommodationCost || null,
//     localExpenses: localExpensesObj || null,
//     travelOptions: travelOptions || [],
//     cheapestTravelOption: cheapestTravelOption || null,
//     variants: variants || [],
//     totalCost,
//     displayTotal: Number.isFinite(totalCost) ? Math.round(totalCost) : null,
//     bestVariant: (variants && variants.length > 0) ? variants[0] : null,
//     displaySummary: {
//       totalPerPerson: Number.isFinite(totalCost) ? Math.round(totalCost / Math.max(1, (reqBody.travellers.adults + reqBody.travellers.children + reqBody.travellers.infants))) : null,
//       nights: (accommodationCost && accommodationCost.numberOfNights) ? accommodationCost.numberOfNights : Math.max(1, reqBody.tripDuration - 1),
//       rooms: (accommodationCost && accommodationCost.numberOfRooms) ? accommodationCost.numberOfRooms : 1
//     },
//     _meta: { computedAt: new Date().toISOString() }
//   };

//   memo.set(memoKey, display, DEST_TTL_MS);
//   return display;
// }

// // chunk helper: returns list of batches
// function chunkArray(arr, size) {
//   const out = [];
//   for (let i = 0; i < arr.length; i += size) {
//     out.push(arr.slice(i, i + size));
//   }
//   return out;
// }

// /**
//  * POST /recommendations-v2
//  * Request body: { userLocation, travellers, budget, preferences, tripDuration, accommodationPreference, page, pageSize }
//  *
//  * This route:
//  *  - fetches a candidate set (bounded)
//  *  - computes display objects in parallel batches (using your existing logic)
//  *  - memoizes per-destination compute so repeated identical calls are cheap
//  *  - returns sorted, paginated list by totalCost ascending
//  *
//  * NOTE: No change to your existing util code; all heavy lifting happens inside those functions.
//  */
// router.post('/recommendations-v2', /* optional per-route cache: cacheMiddleware(5min) */ async (req, res) => {
//   const body = normalizeReq(req.body);

//   try {
//     // build db filter using indexed fields where possible
//     const filter = {};
//     if (body.preferences && body.preferences.length > 0) filter.type = { $in: body.preferences };

//     // fetch a safe candidate set to avoid full scans for large DBs
//     const candidates = await Destination.find(filter).lean().limit(CANDIDATE_LIMIT);
//     if (!Array.isArray(candidates) || candidates.length === 0) {
//       return res.json({ hits: 0, page: body.page, pageSize: body.pageSize, results: [] });
//     }

//     const batches = chunkArray(candidates, BATCH_SIZE);
//     const displays = [];

//     for (const batch of batches) {
//       // compute batch in parallel
//       const batchPromises = batch.map(dest => computeForDestination(dest, body));
//       const settled = await Promise.all(batchPromises);
//       for (const item of settled) {
//         if (item) {
//           // budget filter: if budget provided and item exceeds, skip
//           if (body.budget && typeof item.totalCost === 'number' && item.totalCost > body.budget) continue;
//           displays.push(item);
//         }
//       }
//       // optional micro-yield to event loop (uncomment to reduce CPU spikes)
//       // await new Promise(r => setTimeout(r, 2));
//     }

//     // sort by totalCost ascending
//     displays.sort((a, b) => {
//       const A = Number(a.totalCost || Infinity);
//       const B = Number(b.totalCost || Infinity);
//       return A - B;
//     });

//     const start = (body.page - 1) * body.pageSize;
//     const paged = displays.slice(start, start + body.pageSize);
//     res.json({ hits: displays.length, page: body.page, pageSize: body.pageSize, results: paged });
//   } catch (err) {
//     console.error('recommendations-v2 error:', err && err.message);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;
