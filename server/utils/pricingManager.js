// server/utils/pricingManager.js
const pricingConfig = require('../config/pricingConfig.json');

function getFixedPrice(type) {
    return pricingConfig.fixedPrices[type];
}

function applyPriceAdjustment(price, type) {
    const adjustmentFactor = pricingConfig.adjustments[type] || 0;
    return price * (1 + adjustmentFactor);
}


function getPricingConfig() {
    return pricingConfig;
}

module.exports = {
    getFixedPrice,
    applyPriceAdjustment,
    getPricingConfig
};
