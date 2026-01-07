// server/utils/smartPreferenceMatching.js - NEW FILE
/**
 * Intelligent preference matching that goes beyond exact string matching
 * Handles synonyms, related categories, and fuzzy matching
 */

/**
 * Maps user preferences to actual destination types (including synonyms)
 */
const PREFERENCE_MAP = {
    // Religious/Spiritual
    'temples': ['spiritual', 'pilgrimage', 'religious', 'temples', 'culture'],
    'spiritual': ['spiritual', 'pilgrimage', 'religious', 'temples'],
    'pilgrimage': ['spiritual', 'pilgrimage', 'religious', 'temples'],
    
    // Nature
    'beaches': ['beach', 'coastal', 'seaside', 'islands'],
    'beach': ['beach', 'coastal', 'seaside', 'islands'],
    'mountains': ['hill-station', 'mountains', 'hills', 'trekking', 'adventure'],
    'hill-station': ['hill-station', 'mountains', 'hills'],
    'jungles': ['wildlife', 'jungle', 'forest', 'safari', 'nature', 'adventure'],
    'wildlife': ['wildlife', 'jungle', 'forest', 'safari', 'nature'],
    'nature': ['nature', 'wildlife', 'scenic', 'forest', 'countryside'],
    
    // Urban/Culture
    'cities': ['metropolitan', 'urban', 'cities', 'modern', 'shopping'],
    'metropolitan': ['metropolitan', 'urban', 'cities', 'modern'],
    'culture': ['cultural', 'heritage', 'historical', 'culture', 'art'],
    'historical': ['historical', 'heritage', 'culture', 'monuments'],
    'heritage': ['heritage', 'historical', 'monuments', 'culture'],
    
    // Activities
    'adventure': ['adventure', 'trekking', 'sports', 'rafting', 'mountains'],
    'shopping': ['shopping', 'markets', 'metropolitan', 'urban'],
    'nightlife': ['nightlife', 'entertainment', 'metropolitan', 'urban'],
    
    // Water bodies
    'riverside': ['riverside', 'river', 'waterfalls', 'lakes'],
    'lakes': ['lakes', 'riverside', 'waterfalls', 'nature'],
    'waterfalls': ['waterfalls', 'nature', 'scenic']
};

/**
 * Converts user preferences into MongoDB-compatible query
 * Returns: { query, scoreMultipliers }
 */
function buildSmartPreferenceQuery(userPreferences) {
    if (!userPreferences || userPreferences.length === 0) {
        return {
            query: {},
            scoreMultipliers: {}
        };
    }

    // Normalize preferences (lowercase, trim)
    const normalized = userPreferences.map(p => 
        p.toLowerCase().trim().replace(/\s+/g, '-')
    );

    // Expand preferences using synonym map
    const expandedTypes = new Set();
    const preferenceScores = {};

    normalized.forEach(pref => {
        const mappedTypes = PREFERENCE_MAP[pref] || [pref];
        
        // Primary match (user's exact preference) gets score 1.0
        preferenceScores[pref] = 1.0;
        expandedTypes.add(pref);
        
        // Synonyms get score 0.8
        mappedTypes.forEach(type => {
            if (type !== pref) {
                preferenceScores[type] = 0.8;
            }
            expandedTypes.add(type);
        });
    });

    // Build MongoDB query
    const query = {
        type: { $in: Array.from(expandedTypes) }
    };

    return {
        query,
        preferenceScores
    };
}

/**
 * Calculates preference match score for a destination
 * Returns score 0-100 based on how well destination matches user preferences
 */
function calculatePreferenceScore(destination, userPreferences, preferenceScores) {
    if (!userPreferences || userPreferences.length === 0) {
        return 50; // Neutral score if no preferences
    }

    const destTypes = Array.isArray(destination.type) 
        ? destination.type.map(t => t.toLowerCase()) 
        : [];

    if (destTypes.length === 0) {
        return 0; // No types = no match
    }

    // Calculate match score
    let totalScore = 0;
    let maxPossibleScore = userPreferences.length;

    userPreferences.forEach(pref => {
        const prefLower = pref.toLowerCase().trim().replace(/\s+/g, '-');
        const mappedTypes = PREFERENCE_MAP[prefLower] || [prefLower];
        
        // Check if any destination type matches this preference (or its synonyms)
        const hasMatch = destTypes.some(dt => mappedTypes.includes(dt));
        
        if (hasMatch) {
            // Get the best score for this preference
            const bestScore = Math.max(
                ...mappedTypes
                    .filter(mt => destTypes.includes(mt))
                    .map(mt => preferenceScores[mt] || 0.5)
            );
            totalScore += bestScore;
        }
    });

    // Convert to 0-100 scale
    const percentageScore = (totalScore / maxPossibleScore) * 100;
    
    return Math.round(percentageScore);
}

/**
 * Filters destinations based on preference match threshold
 * Only keeps destinations with score >= threshold
 */
function filterByPreferenceMatch(destinations, userPreferences, preferenceScores, threshold = 30) {
    return destinations
        .map(dest => ({
            ...dest,
            preferenceMatchScore: calculatePreferenceScore(dest, userPreferences, preferenceScores)
        }))
        .filter(dest => dest.preferenceMatchScore >= threshold)
        .sort((a, b) => b.preferenceMatchScore - a.preferenceMatchScore);
}

/**
 * Enhanced query builder for the recommendations endpoint
 * Use this in travelData.js instead of simple $in query
 */
function buildEnhancedQuery(userInput) {
    const { preferences, filters } = userInput;
    
    const { query: preferenceQuery, preferenceScores } = buildSmartPreferenceQuery(preferences);
    
    // Combine with other filters
    const finalQuery = {
        ...preferenceQuery
    };
    
    if (filters?.regions?.length) {
        finalQuery.region = { $in: filters.regions };
    }
    
    if (filters?.states?.length) {
        finalQuery.state = { $in: filters.states };
    }
    
    return {
        query: finalQuery,
        preferenceScores
    };
}

/**
 * Example usage in your travelData.js route:
 * 
 * const { query, preferenceScores } = buildEnhancedQuery(body);
 * const destinations = await Destination.find(query).lean();
 * const filtered = filterByPreferenceMatch(destinations, body.preferences, preferenceScores, 30);
 */

module.exports = {
    buildSmartPreferenceQuery,
    calculatePreferenceScore,
    filterByPreferenceMatch,
    buildEnhancedQuery,
    PREFERENCE_MAP
};