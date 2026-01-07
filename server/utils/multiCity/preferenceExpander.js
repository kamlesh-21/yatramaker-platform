// server/utils/multiCity/preferenceExpander.js - CORRECTED VERSION
// ✅ Uses ONLY the data you actually have in your database

const Destination = require('../../models/Destination');
const calculateDistance = require('../distanceCalculator');

// ✅ CORRECT: Frontend preferences DIRECTLY match database type values
const FRONTEND_PREFERENCES = [
    'Mountains', 'Beaches', 'Cities', 'Jungles', 
    'Temples', 'Riverside', 'Culture', 'Desert'
];

// ✅ Map preferences to experienceProfile fields for additional scoring
const PREFERENCE_TO_EXPERIENCE_MAP = {
    'Mountains': ['nature', 'adventure', 'photography'],
    'Beaches': ['relaxation', 'nature', 'photography'],
    'Cities': ['cultural', 'shopping', 'food', 'nightlife'],
    'Jungles': ['nature', 'adventure'],
    'Temples': ['spiritual', 'cultural', 'historical'],
    'Riverside': ['nature', 'relaxation', 'photography'],
    'Culture': ['cultural', 'historical', 'food'],
    'Desert': ['adventure', 'nature', 'photography']
};

function getMaxDistanceForDuration(tripDuration) {
    if (tripDuration <= 4) return 800;
    if (tripDuration <= 7) return 1500;
    if (tripDuration <= 10) return 2000;
    return 2500;
}

/**
 * ✅ CORRECTED: Expand preference using ONLY actual database fields
 */
async function expandPreference(preferenceName, userLocation, userQuery) {
    try {
        const { budget, tripDuration, travellers, accommodationPreference } = userQuery;
        
        console.log(`   🔍 Expanding "${preferenceName}"...`);
        
        // ✅ STEP 1: Direct type match (destination.type includes preferenceName)
        const directMatches = await Destination.find({
            type: preferenceName  // ✅ Exact match since your DB has same values
        }).lean();
        
        console.log(`      Found ${directMatches.length} direct type matches`);
        
        // ✅ STEP 2: Experience profile boost (destinations with high scores in related experiences)
        const experienceKeys = PREFERENCE_TO_EXPERIENCE_MAP[preferenceName] || [];
        const experienceQuery = {};
        
        // Build query for high experience scores
        if (experienceKeys.length > 0) {
            experienceQuery.$or = experienceKeys.map(key => ({
                [`experienceProfile.${key}`]: { $gte: 7 }
            }));
        }
        
        let experienceMatches = [];
        if (experienceQuery.$or) {
            experienceMatches = await Destination.find(experienceQuery).lean();
            console.log(`      Found ${experienceMatches.length} experience profile matches`);
        }
        
        // ✅ STEP 3: Merge and deduplicate
        const allMatches = deduplicateDestinations([...directMatches, ...experienceMatches]);
        console.log(`      Total unique matches: ${allMatches.length}`);
        
        if (allMatches.length === 0) {
            console.warn(`      ⚠️ No destinations found for ${preferenceName}`);
            return [];
        }
        
        // ✅ STEP 4: Score each destination
        const scored = allMatches.map(dest => {
            const distanceFromUser = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                dest.latitude,
                dest.longitude
            );
            
            return {
                ...dest,
                preferenceScore: calculatePreferenceScore(dest, preferenceName, experienceKeys),
                distanceFromUser: distanceFromUser
            };
        });
        
        // ✅ STEP 5: Filter by feasibility
        const maxDistance = getMaxDistanceForDuration(tripDuration);
        const feasible = scored.filter(dest => {
            // Distance check
            if (dest.distanceFromUser > maxDistance) {
                return false;
            }
            
            // Infrastructure check
            if (!dest.infrastructure?.accommodationAvailable) {
                return false;
            }
            
            // Hotel quality check
            if (accommodationPreference === 'Luxury' && 
                (dest.infrastructure?.hotelQualityAvg || 0) < 6) {
                return false;
            }
            
            // Basic data completeness
            if (!dest.latitude || !dest.longitude) {
                return false;
            }
            
            // ✅ Exclude user's own city
            const destNames = Array.isArray(dest.name) ? dest.name : [dest.name];
            const userCityLower = userLocation.name.toLowerCase();
            const userStateLower = userLocation.state?.toLowerCase();
            
            const isSameCity = destNames.some(n => {
                const nameLower = n.toLowerCase();
                return nameLower === userCityLower || 
                       nameLower.includes(userCityLower) || 
                       userCityLower.includes(nameLower);
            });
            
            if (isSameCity && dest.state?.toLowerCase() === userStateLower) {
                console.log(`      ❌ Excluded user's city: ${dest.name}`);
                return false;
            }
            
            // ✅ Exclude very nearby destinations (< 50km)
            if (dest.distanceFromUser < 50) {
                console.log(`      ❌ Too close: ${dest.name} (${Math.round(dest.distanceFromUser)}km)`);
                return false;
            }
            
            return true;
        });
        
        console.log(`      ✅ ${feasible.length} feasible destinations after filtering`);
        
        // ✅ STEP 6: Sort by preference score and return top 20
        const sorted = feasible.sort((a, b) => b.preferenceScore - a.preferenceScore);
        
        return sorted.slice(0, 20);
        
    } catch (error) {
        console.error(`❌ Error expanding preference ${preferenceName}:`, error.message);
        return [];
    }
}

/**
 * ✅ Calculate preference fit score using ONLY actual database fields
 */
function calculatePreferenceScore(destination, preferenceName, experienceKeys) {
    const profile = destination.experienceProfile || {};
    const metrics = destination.visitMetrics || {};
    const infrastructure = destination.infrastructure || {};
    const types = destination.type || [];
    
    // ✅ COMPONENT 1: Direct type match (most important)
    const hasDirectMatch = types.includes(preferenceName);
    const typeScore = hasDirectMatch ? 10 : 0;
    
    // ✅ COMPONENT 2: Experience profile scores
    let experienceScore = 5.0;
    if (experienceKeys.length > 0) {
        const scores = experienceKeys.map(key => profile[key] || 0);
        experienceScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    }
    
    // ✅ COMPONENT 3: Quality metrics
    const uniquenessScore = (metrics.uniquenessScore || 5);
    const popularityScore = (metrics.popularityScore || 5);
    const accessibilityScore = (infrastructure.accessibilityScore || 5);
    
    // ✅ Weighted final score (0-10)
    const finalScore = Math.min(10,
        typeScore * 0.40 +           // Direct type match is KING
        experienceScore * 0.30 +     // Experience profile boost
        uniquenessScore * 0.15 +     // Unique destinations preferred
        popularityScore * 0.10 +     // Some popularity is good
        accessibilityScore * 0.05    // Easy to reach is better
    );
    
    return parseFloat(finalScore.toFixed(2));
}

/**
 * Deduplicate destinations by destination_id
 */
function deduplicateDestinations(destinations) {
    const seen = new Set();
    const unique = [];
    
    for (const dest of destinations) {
        if (!seen.has(dest.destination_id)) {
            seen.add(dest.destination_id);
            unique.push(dest);
        }
    }
    
    return unique;
}

/**
 * ✅ Expand all preferences
 */
async function expandAllPreferences(preferences, userLocation, userQuery) {
    try {
        const results = {};
        
        console.log(`\n🔍 Expanding ${preferences.length} preferences...`);
        
        for (const pref of preferences) {
            // ✅ Validate preference is in allowed list
            if (!FRONTEND_PREFERENCES.includes(pref)) {
                console.warn(`   ⚠️ Unknown preference: "${pref}" (allowed: ${FRONTEND_PREFERENCES.join(', ')})`);
                results[pref] = [];
                continue;
            }
            
            results[pref] = await expandPreference(pref, userLocation, userQuery);
        }
        
        // ✅ Log summary
        const totalDestinations = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
        console.log(`✅ Total destinations found: ${totalDestinations}\n`);
        
        // ✅ Debug: Show top destination per preference
        Object.entries(results).forEach(([pref, dests]) => {
            if (dests.length > 0) {
                const top = dests[0];
                console.log(`   ${pref}: ${top.name} (score: ${top.preferenceScore}, ${Math.round(top.distanceFromUser)}km)`);
            }
        });
        console.log('');
        
        return results;
        
    } catch (error) {
        console.error('❌ Error expanding all preferences:', error);
        throw error;
    }
}

module.exports = {
    expandPreference,
    expandAllPreferences,
    FRONTEND_PREFERENCES,
    PREFERENCE_TO_EXPERIENCE_MAP
};