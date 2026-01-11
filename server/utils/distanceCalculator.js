// //server/utils/distanceCalculator.js

const calculateDistance = (lat1, lon1, lat2, lon2, terrainType = 'default') => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineDistance = R * c;
  
  // ✅ Apply road distance multiplier
  const multipliers = {
    'mountain': 1.6,      // Hilly/mountainous terrain
    'forest': 1.5,        // Forest/wildlife areas (poor roads)
    'coastal': 1.4,       // Coastal (go around water bodies)
    'rural': 1.3,         // Rural areas
    'urban': 1.2,         // Cities (good highways)
    'default': 1.3        // Conservative default
  };
  
  const multiplier = multipliers[terrainType] || multipliers.default;
  const roadDistance = straightLineDistance * multiplier;
  
  return roadDistance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

module.exports = calculateDistance;

// ========================================
// ✅ HELPER: Auto-detect terrain type
// ========================================

function getTerrainType(origin, destination) {
    const originTypes = origin.type || [];
    const destTypes = destination.type || [];
    const allTypes = [...originTypes, ...destTypes];
    
    // Priority-based detection
    if (allTypes.includes('Mountains') || allTypes.includes('hill-station')) {
        return 'mountain';
    }
    if (allTypes.includes('Jungles') || allTypes.includes('Wildlife')) {
        return 'forest';
    }
    if (allTypes.includes('Beaches') || allTypes.includes('coastal')) {
        return 'coastal';
    }
    if (allTypes.includes('Cities') || allTypes.includes('metropolitan')) {
        return 'urban';
    }
    
    return 'rural';
}

module.exports.getTerrainType = getTerrainType;