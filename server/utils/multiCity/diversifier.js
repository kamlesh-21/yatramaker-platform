/**
 * DIVERSIFIER
 * Selects 12-14 maximally diverse routes from all generated routes
 * Ensures variety in geography, preferences, budget tiers, and route types
 * 
 * @file server/utils/multiCity/diversifier.js
 */

/**
 * Main function: Select diverse routes from candidates
 */
function diversifyRoutes(allRoutes, targetCount = 14) {
    try {
        if (!allRoutes || allRoutes.length === 0) {
            console.warn('No routes to diversify');
            return [];
        }
        
        
        // If we have fewer routes than target, return all
        if (allRoutes.length <= targetCount) {
            return allRoutes.sort((a, b) => b.scores.overallScore - a.scores.overallScore);
        }
        
        // Step 1: Always include top-scored route
        const sortedByScore = [...allRoutes].sort((a, b) => 
            b.scores.overallScore - a.scores.overallScore
        );
        
        const selected = [sortedByScore[0]];
        let remaining = sortedByScore.slice(1);
        
        
        // Step 2: Greedily add most diverse routes
        while (selected.length < targetCount && remaining.length > 0) {
            // Calculate diversity score for each remaining route
            const diversityScores = remaining.map(route => ({
                route: route,
                diversityScore: calculateAvgDiversity(route, selected)
            }));
            
            // Sort by diversity (highest first)
            diversityScores.sort((a, b) => b.diversityScore - a.diversityScore);
            
            // Take most diverse
            const mostDiverse = diversityScores[0];
            selected.push(mostDiverse.route);
            
            
            // Remove from remaining
            remaining = remaining.filter(r => r.routeId !== mostDiverse.route.routeId);
        }
        
        // Step 3: Final sort by overall score
        selected.sort((a, b) => b.scores.overallScore - a.scores.overallScore);
                
        return selected;
        
    } catch (error) {
        console.error('Error in diversifyRoutes:', error);
        return allRoutes.slice(0, targetCount);
    }
}

/**
 * Calculate average diversity of a route vs all selected routes
 */
function calculateAvgDiversity(route, selectedRoutes) {
    if (selectedRoutes.length === 0) return 10;
    
    const diversityScores = selectedRoutes.map(selected => 
        calculateDiversityBetween(route, selected)
    );
    
    return diversityScores.reduce((sum, s) => sum + s, 0) / diversityScores.length;
}

/**
 * Calculate diversity between two routes (0-10, higher = more different)
 */
function calculateDiversityBetween(route1, route2) {
    // 1. Geographic diversity (different states)
    const geoDiversity = calculateGeographicDiversity(route1, route2);
    
    // 2. Preference diversity (different preferences)
    const prefDiversity = calculatePreferenceDiversity(route1, route2);
    
    // 3. Budget tier diversity
    const budgetDiversity = calculateBudgetDiversity(route1, route2);
    
    // 4. Duration diversity
    const durationDiversity = calculateDurationDiversity(route1, route2);
    
    // 5. Route type diversity
    const routeTypeDiversity = calculateRouteTypeDiversity(route1, route2);
    
    // Weighted combination
    const totalDiversity = (
        geoDiversity * 0.35 +
        prefDiversity * 0.30 +
        budgetDiversity * 0.15 +
        durationDiversity * 0.10 +
        routeTypeDiversity * 0.10
    );
    
    return totalDiversity;
}

/**
 * Calculate geographic diversity (0-10)
 */
function calculateGeographicDiversity(route1, route2) {
    const states1 = new Set(route1.metadata.states || []);
    const states2 = new Set(route2.metadata.states || []);
    
    // Count common states
    const commonStates = [...states1].filter(s => states2.has(s)).length;
    const totalStates = Math.max(states1.size, states2.size);
    
    if (totalStates === 0) return 5;
    
    // Diversity = 1 - (overlap ratio)
    const overlap = commonStates / totalStates;
    return (1 - overlap) * 10;
}

/**
 * Calculate preference diversity (0-10)
 */
function calculatePreferenceDiversity(route1, route2) {
    const prefs1 = new Set(route1.metadata.preferenceTags || []);
    const prefs2 = new Set(route2.metadata.preferenceTags || []);
    
    // Count common preferences
    const commonPrefs = [...prefs1].filter(p => prefs2.has(p)).length;
    const totalPrefs = Math.max(prefs1.size, prefs2.size);
    
    if (totalPrefs === 0) return 5;
    
    const overlap = commonPrefs / totalPrefs;
    return (1 - overlap) * 10;
}

/**
 * Calculate budget diversity (0-10)
 */
function calculateBudgetDiversity(route1, route2) {
    const tier1 = getBudgetTier(route1.scores.budgetUtilization);
    const tier2 = getBudgetTier(route2.scores.budgetUtilization);
    
    // Different tiers = high diversity
    if (tier1 !== tier2) return 8;
    
    // Same tier, but check actual difference
    const diff = Math.abs(route1.totalCost.base - route2.totalCost.base);
    const avgCost = (route1.totalCost.base + route2.totalCost.base) / 2;
    const percentDiff = diff / avgCost;
    
    return Math.min(10, percentDiff * 20); // 50% diff = full diversity
}

/**
 * Get budget tier from utilization
 */
function getBudgetTier(budgetUtilization) {
    if (budgetUtilization < 0.65) return 'budget';
    if (budgetUtilization < 0.80) return 'midrange';
    return 'premium';
}

/**
 * Calculate duration diversity (0-10)
 */
function calculateDurationDiversity(route1, route2) {
    const nights1 = route1.summary.totalNights || 0;
    const nights2 = route2.summary.totalNights || 0;
    
    const diff = Math.abs(nights1 - nights2);
    
    // 3+ nights difference = high diversity
    return Math.min(10, (diff / 3) * 10);
}

/**
 * Calculate route type diversity (0-10)
 */
function calculateRouteTypeDiversity(route1, route2) {
    const type1 = route1.metadata.routeType || 'linear';
    const type2 = route2.metadata.routeType || 'linear';
    
    return type1 === type2 ? 2 : 8;
}

/**
 * Ensure minimum representation of each preference
 */
function ensurePreferenceBalance(routes, userPreferences, targetCount) {
    const selected = [];
    const remaining = [...routes];
    
    // For each user preference, ensure at least 2-3 routes
    const minPerPreference = Math.max(2, Math.floor(targetCount / userPreferences.length));
    
    for (const pref of userPreferences) {
        const matchingRoutes = remaining
            .filter(r => r.metadata.preferenceTags.includes(pref))
            .sort((a, b) => b.scores.overallScore - a.scores.overallScore)
            .slice(0, minPerPreference);
        
        selected.push(...matchingRoutes);
        
        // Remove from remaining
        matchingRoutes.forEach(route => {
            const idx = remaining.findIndex(r => r.routeId === route.routeId);
            if (idx >= 0) remaining.splice(idx, 1);
        });
    }
    
    // Fill remaining slots with most diverse
    while (selected.length < targetCount && remaining.length > 0) {
        const diversityScores = remaining.map(route => ({
            route: route,
            diversityScore: calculateAvgDiversity(route, selected)
        }));
        
        diversityScores.sort((a, b) => b.diversityScore - a.diversityScore);
        
        selected.push(diversityScores[0].route);
        remaining.splice(remaining.indexOf(diversityScores[0].route), 1);
    }
    
    return selected;
}

module.exports = {
    diversifyRoutes,
    calculateDiversityBetween,
    ensurePreferenceBalance
};