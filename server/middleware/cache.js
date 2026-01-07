// // server/middleware/cache.js
// // In-process request-response cache middleware. Safe for hobby hosting (no external deps).
// // Use carefully: cache duration is short by default to preserve freshness.

// const defaultTtlMs = 1000 * 60 * 5; // 5 minutes
// const store = new Map();

// function makeReqKey(req) {
//   const method = req.method.toUpperCase();
//   // key uses path + body (POST) or query (GET)
//   const payload = method === 'GET' ? req.originalUrl : `${req.originalUrl}|${JSON.stringify(req.body || {})}`;
//   return `${method}:${payload}`;
// }

// function cleanup() {
//   const now = Date.now();
//   for (const [k, v] of store.entries()) {
//     if (v.expiresAt <= now) store.delete(k);
//   }
// }

// // middleware factory
// function cacheMiddleware(ttlMs = defaultTtlMs) {
//   return (req, res, next) => {
//     // only cache idempotent-looking read endpoints (GET or POST), you can restrict more tightly
//     if (!['GET', 'POST'].includes(req.method.toUpperCase())) return next();

//     const key = makeReqKey(req);
//     const hit = store.get(key);
//     if (hit && hit.expiresAt > Date.now()) {
//       return res.json(hit.payload);
//     }

//     // wrap res.json to capture response
//     const originalJson = res.json.bind(res);
//     res.json = (payload) => {
//       try {
//         store.set(key, { payload, expiresAt: Date.now() + ttlMs });
//         // do light cleanup occasionally
//         if (Math.random() < 0.01) cleanup();
//       } catch (e) {
//         // ignore cache errors
//       }
//       return originalJson(payload);
//     };

//     next();
//   };
// }

// module.exports = {
//   cacheMiddleware,
//   _internal_store: store // exported for debug/tests if needed
// };
