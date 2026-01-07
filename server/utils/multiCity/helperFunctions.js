/**
 * HELPER FUNCTIONS
 * Utility functions shared across multi-city modules
 * 
 * @file server/utils/multiCity/helperFunctions.js
 */

const calculateDistance = require('../distanceCalculator');

/**
 * Safe number conversion
 */
function safeNumber(value, defaultValue = 0) {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
}

/**
 * Calculate centroid of multiple destinations
 */
function calculateCentroid(destinations) {
    if (!destinations || destinations.length === 0) {
        return { latitude: 0, longitude: 0 };
    }
    
    const sumLat = destinations.reduce((sum, d) => sum + (d.latitude || 0), 0);
    const sumLon = destinations.reduce((sum, d) => sum + (d.longitude || 0), 0);
    
    return {
        latitude: sumLat / destinations.length,
        longitude: sumLon / destinations.length
    };
}

/**
 * Format destination name
 */
function formatDestinationName(destination) {
    if (!destination) return 'Unknown';
    
    if (Array.isArray(destination.name)) {
        return destination.name[0] || 'Unknown';
    }
    
    return destination.name || 'Unknown';
}

/**
 * Calculate traveller multiplier for costs
 */
function getTravellerMultiplier(travellers) {
    if (!travellers) return 1;
    
    const adults = travellers.adults || 1;
    const children = travellers.children || 0;
    const infants = travellers.infants || 0;
    
    return adults + (children * 0.5) + (infants * 0.1);
}

/**
 * Estimate minimum budget for multi-city trip
 */
function estimateMinimumBudget(userQuery) {
    const { tripDuration, travellers } = userQuery;
    
    const minPerPersonPerDay = 2000; // Very conservative
    const multiplier = getTravellerMultiplier(travellers);
    
    return Math.ceil(minPerPersonPerDay * tripDuration * multiplier / 1000) * 1000;
}

/**
 * Check if two destinations are in same region
 */
function isSameRegion(dest1, dest2) {
    if (!dest1 || !dest2) return false;
    
    // Same state = definitely same region
    if (dest1.state === dest2.state) return true;
    
    // Check region field
    if (dest1.region && dest2.region) {
        return dest1.region === dest2.region;
    }
    
    // Fallback: check distance (< 300km = likely same region)
    const distance = calculateDistance(
        dest1.latitude,
        dest1.longitude,
        dest2.latitude,
        dest2.longitude
    );
    
    return distance < 300;
}

/**
 * Group destinations by state
 */
function groupByState(destinations) {
    const grouped = {};
    
    destinations.forEach(dest => {
        const state = dest.state || 'Unknown';
        if (!grouped[state]) {
            grouped[state] = [];
        }
        grouped[state].push(dest);
    });
    
    return grouped;
}

/**
 * Group destinations by region
 */
function groupByRegion(destinations) {
    const grouped = {};
    
    destinations.forEach(dest => {
        const region = dest.region || 'Unknown';
        if (!grouped[region]) {
            grouped[region] = [];
        }
        grouped[region].push(dest);
    });
    
    return grouped;
}

/**
 * Calculate route span (distance from start to farthest point)
 */
function calculateRouteSpan(destinations, startLocation) {
    if (!destinations || destinations.length === 0) return 0;
    
    const distances = destinations.map(dest => 
        calculateDistance(
            startLocation.latitude,
            startLocation.longitude,
            dest.latitude,
            dest.longitude
        )
    );
    
    return Math.max(...distances);
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Format duration in hours to readable string
 */
function formatDuration(hours) {
    if (hours < 1) {
        return `${Math.round(hours * 60)} minutes`;
    }
    
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    
    if (m === 0) {
        return `${h} hour${h > 1 ? 's' : ''}`;
    }
    
    return `${h}h ${m}m`;
}

/**
 * Calculate days from nights
 */
function nightsToDays(nights) {
    return nights + 1;
}

/**
 * Calculate nights from days
 */
function daysToNights(days) {
    return Math.max(0, days - 1);
}

/**
 * Deep clone object (for route manipulation)
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Remove duplicates from array by key
 */
function uniqueByKey(array, key) {
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

/**
 * Shuffle array (for random sampling)
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get random subset of array
 */
function randomSubset(array, count) {
    if (array.length <= count) return array;
    return shuffleArray(array).slice(0, count);
}

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
function lerp(start, end, t) {
    return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Calculate percentage
 */
function percentage(value, total) {
    if (total === 0) return 0;
    return (value / total) * 100;
}

/**
 * Round to nearest multiple
 */
function roundToNearest(value, multiple) {
    return Math.round(value / multiple) * multiple;
}

/**
 * Check if date is within season
 */
function isInSeason(destination, month) {
    if (!destination.seasonality) return true;
    
    const peakSeason = destination.seasonality.peakSeason || '';
    const offPeakSeason = destination.seasonality.offPeakSeason || '';
    
    // Simple month name matching
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const currentMonth = monthNames[month - 1];
    
    // If peak season includes current month, return true
    if (peakSeason.includes(currentMonth)) return true;
    
    // If off-peak season includes current month, return false
    if (offPeakSeason.includes(currentMonth)) return false;
    
    // Default: assume in season
    return true;
}

/**
 * Generate unique ID
 */
function generateUniqueId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate user query
 */
function validateUserQuery(userQuery) {
    const errors = [];
    
    if (!userQuery.userLocation) {
        errors.push('userLocation is required');
    }
    
    if (!userQuery.budget || userQuery.budget < 5000) {
        errors.push('budget must be at least ₹5,000');
    }
    
    if (!userQuery.tripDuration || userQuery.tripDuration < 3) {
        errors.push('Multi-city trips require at least 3 days');
    }
    
    if (!userQuery.travellers || userQuery.travellers.adults < 1) {
        errors.push('At least 1 adult traveller required');
    }
    
    if (!userQuery.preferences || userQuery.preferences.length === 0) {
        errors.push('At least one preference is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Calculate cost per person
 */
function calculateCostPerPerson(totalCost, travellers) {
    const totalPeople = (travellers.adults || 1) + 
                        (travellers.children || 0) + 
                        (travellers.infants || 0);
    
    return Math.round(totalCost / totalPeople);
}

/**
 * Calculate cost per day
 */
function calculateCostPerDay(totalCost, days) {
    return Math.round(totalCost / days);
}

module.exports = {
    safeNumber,
    calculateCentroid,
    formatDestinationName,
    getTravellerMultiplier,
    estimateMinimumBudget,
    isSameRegion,
    groupByState,
    groupByRegion,
    calculateRouteSpan,
    formatCurrency,
    formatDuration,
    nightsToDays,
    daysToNights,
    deepClone,
    uniqueByKey,
    shuffleArray,
    randomSubset,
    clamp,
    lerp,
    percentage,
    roundToNearest,
    isInSeason,
    generateUniqueId,
    validateUserQuery,
    calculateCostPerPerson,
    calculateCostPerDay
};