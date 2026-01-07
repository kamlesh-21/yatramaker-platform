// // server/utils/memo.js
// // Lightweight TTL memoization used to cache expensive computations.
// // Non-persistent: in-process only. Safe fallback (no external infra).

// const { performance } = require('perf_hooks');

// class Memo {
//   constructor(defaultTtlMs = 1000 * 60 * 10) { // default 10 minutes
//     this.store = new Map();
//     this.defaultTtlMs = defaultTtlMs;
//   }

//   _key(obj) {
//     try {
//       return typeof obj === 'string' ? obj : JSON.stringify(obj);
//     } catch (e) {
//       // Fallback: string cast
//       return String(obj);
//     }
//   }

//   get(key) {
//     const k = this._key(key);
//     const meta = this.store.get(k);
//     if (!meta) return null;
//     if (performance.now() > meta.expiresAt) {
//       this.store.delete(k);
//       return null;
//     }
//     return meta.value;
//   }

//   set(key, value, ttlMs) {
//     const k = this._key(key);
//     const ttl = typeof ttlMs === 'number' ? ttlMs : this.defaultTtlMs;
//     const expiresAt = performance.now() + ttl;
//     this.store.set(k, { value, expiresAt });
//   }

//   del(key) {
//     const k = this._key(key);
//     this.store.delete(k);
//   }

//   clear() {
//     this.store.clear();
//   }
// }

// module.exports = new Memo();
