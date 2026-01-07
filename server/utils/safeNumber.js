// server/utils/safeNumber.js
const safeNumber = (v) => (typeof v === 'number' && !isNaN(v) ? v : 0);
module.exports = { safeNumber };