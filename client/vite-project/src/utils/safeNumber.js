// src/utils/safeNumber.js
export const safeNumber = (v) => (typeof v === 'number' && !isNaN(v) ? v : 0);