/**
 * EXPLANATION GENERATOR
 * Generates human-readable explanations for why routes were chosen
 * Makes the AI decision-making transparent to users
 * 
 * @file server/utils/multiCity/explanationGenerator.js
 */

/**
 * Generate all explanations for a route
 */
function generateExplanations(route, userQuery, allRoutes) {
    return {
        whyThisRoute: generateRouteRationale(route, userQuery),
        preferenceFit: generatePreferenceFitExplanation(route, userQuery),
        budgetBreakdown: generateBudgetExplanation(route, userQuery),
        travelStrategy: generateTravelStrategyExplanation(route),
        hiddenGems: extractHiddenGems(route),
        tradeoffs: generateTradeoffs(route, allRoutes, userQuery)
    };
}

/**
 * Generate overall route rationale
 */
function generateRouteRationale(route, userQuery) {
    const destCount = route.destinations.length;
    const destNames = route.destinations.map(d => d.destination.name[0] || d.destination.name[0]);
    const totalDays = route.summary.totalDays;
    const efficiency = route.scores.routeEfficiency;
    const pacing = route.metadata.pacing;
    
    let rationale = `This ${totalDays}-day ${route.metadata.routeType} route covers ${destCount} destinations: ${destNames.join(', ')}.\n\n`;
    
    // Geographic efficiency
    if (efficiency >= 0.8) {
        rationale += `✓ Geographic Efficiency: ${(efficiency * 100).toFixed(0)}% route efficiency (minimal backtracking)\n`;
        rationale += `  Total distance: ${route.summary.totalDistance}km in a logical sequence\n\n`;
    } else {
        rationale += `✓ Comprehensive Coverage: Covers ${destCount} diverse destinations worth the ${route.summary.totalDistance}km journey\n\n`;
    }
    
    // Thematic coherence
    const prefs = route.metadata.preferenceTags;
    if (prefs.length > 0) {
        rationale += `✓ Thematic Coherence: All destinations align with your '${prefs.join(', ')}' preferences\n`;
        rationale += `  Average preference fit: ${route.scores.preferenceFit.toFixed(1)}/10\n\n`;
    }

// Time optimization
    const avgTravelTime = route.summary.totalTravelTime / (destCount + 1);
    rationale += `✓ Time Optimization: Average ${avgTravelTime.toFixed(1)} hours travel per leg (${pacing} pacing)\n`;
    
    const nightsPerDest = route.destinations.map(d => d.nights);
    const avgNights = nightsPerDest.reduce((sum, n) => sum + n, 0) / destCount;
    rationale += `  ${avgNights.toFixed(1)} nights average per destination for immersive experience\n\n`;
    
    // Budget fit
    const budgetUtil = route.scores.budgetUtilization;
    const remaining = userQuery.budget - route.totalCost.base;
    
    if (budgetUtil <= 0.85) {
        rationale += `✓ Budget Fit: ₹${route.totalCost.base.toLocaleString()} vs your budget ₹${userQuery.budget.toLocaleString()} (${(budgetUtil * 100).toFixed(0)}% utilization)\n`;
        rationale += `  Leaves ₹${remaining.toLocaleString()} buffer for shopping, upgrades, or emergencies`;
    } else {
        rationale += `✓ Budget Maximization: Uses ${(budgetUtil * 100).toFixed(0)}% of budget for comprehensive experience\n`;
        rationale += `  Includes all major attractions and comfortable travel`;
    }
    
    return rationale;
}

/**
 * Generate preference fit explanation
 */
function generatePreferenceFitExplanation(route, userQuery) {
    const prefs = userQuery.preferences || [];
    let explanation = `This route was selected because:\n\n`;
    
    route.destinations.forEach((dest, idx) => {
        const destName = dest.destination.name[0] || dest.destination.name;
        const profile = dest.destination.experienceProfile || {};
        
        // Find top 3 matching preferences
        const matches = prefs.map(pref => {
            const profileKeys = getProfileKeysForPreference(pref);
            const scores = profileKeys.map(key => profile[key] || 0);
            const maxScore = Math.max(...scores);
            return { pref, score: maxScore };
        }).filter(m => m.score >= 6).sort((a, b) => b.score - a.score).slice(0, 2);
        
        if (matches.length > 0) {
            explanation += `${idx + 1}. **${destName}**\n`;
            matches.forEach(m => {
                explanation += `   • ${m.pref}: ${m.score}/10\n`;
            });
            
            // Add unique selling point
            const uniqueness = dest.destination.visitMetrics?.uniquenessScore || 5;
            if (uniqueness >= 7) {
                explanation += `   • Unique destination (${uniqueness}/10 uniqueness score)\n`;
            }
            
            explanation += '\n';
        }
    });
    
    // Overall preference alignment
    const prefScore = route.scores.preferenceFit;
    if (prefScore >= 8) {
        explanation += `Overall: Excellent match (${prefScore.toFixed(1)}/10) - All destinations strongly align with your interests.`;
    } else if (prefScore >= 6) {
        explanation += `Overall: Good match (${prefScore.toFixed(1)}/10) - Destinations well-suited to your preferences.`;
    } else {
        explanation += `Overall: Moderate match (${prefScore.toFixed(1)}/10) - Balanced variety with preference alignment.`;
    }
    
    return explanation;
}

/**
 * Generate budget breakdown explanation
 */
function generateBudgetExplanation(route, userQuery) {
    const breakdown = route.totalCost.breakdown;
    const total = route.totalCost.base;
    
    let explanation = `Your ₹${userQuery.budget.toLocaleString()} budget is allocated as follows:\n\n`;
    
    // Travel
    const travelPercent = (breakdown.travel / total * 100).toFixed(0);
    explanation += `**Travel (${travelPercent}%): ₹${breakdown.travel.toLocaleString()}**\n`;
    
    // Analyze travel strategy
    const legs = route.legs || [];
    const modes = legs.map(l => l.mode);
    const modeCount = {};
    modes.forEach(m => modeCount[m] = (modeCount[m] || 0) + 1);
    
    if (modeCount.flight >= 2) {
        explanation += `  • Flights for long distances save time\n`;
    }
    if (modeCount.train >= 1) {
        explanation += `  • Trains for medium distances offer comfort + economy\n`;
    }
    if (modeCount.bus >= 1) {
        explanation += `  • Buses for short hops are most economical\n`;
    }
    
    explanation += '\n';
    
    // Accommodation
    const accPercent = (breakdown.accommodation / total * 100).toFixed(0);
    const totalNights = route.summary.totalNights;
    const avgPerNight = breakdown.accommodation / totalNights;
    
    explanation += `**Stay (${accPercent}%): ₹${breakdown.accommodation.toLocaleString()}**\n`;
    explanation += `  • ${totalNights} nights at ${userQuery.accommodationPreference} hotels\n`;
    explanation += `  • Average ₹${Math.round(avgPerNight).toLocaleString()}/night\n\n`;
    
    // Local expenses
    const localPercent = (breakdown.localExpenses / total * 100).toFixed(0);
    explanation += `**Local Expenses (${localPercent}%): ₹${breakdown.localExpenses.toLocaleString()}**\n`;
    explanation += `  • Food: ₹${breakdown.meals.toLocaleString()} (${Math.round(breakdown.meals / total * 100)}%)\n`;
    explanation += `  • Local transport: ₹${breakdown.transportation.toLocaleString()} (${Math.round(breakdown.transportation / total * 100)}%)\n`;
    explanation += `  • Attractions: ₹${breakdown.attractions.toLocaleString()} (${Math.round(breakdown.attractions / total * 100)}%)\n\n`;
    
    // Activities (optional)
    if (breakdown.activities > 0) {
        const actPercent = (breakdown.activities / route.totalCost.withActivities * 100).toFixed(0);
        explanation += `**Optional Activities: ₹${breakdown.activities.toLocaleString()}**\n`;
        explanation += `  • Add ₹${breakdown.activities.toLocaleString()} for enhanced experiences\n`;
        explanation += `  • Total with activities: ₹${route.totalCost.withActivities.toLocaleString()}\n\n`;
    }
    
    // Buffer
    const remaining = userQuery.budget - total;
    if (remaining > 0) {
        const bufferPercent = (remaining / userQuery.budget * 100).toFixed(0);
        explanation += `**Buffer (${bufferPercent}%): ₹${remaining.toLocaleString()}**\n`;
        explanation += `  • Emergency fund + spontaneous experiences\n`;
        explanation += `  • Shopping, extra meals, upgrades`;
    }
    
    return explanation;
}

/**
 * Generate travel strategy explanation
 */
function generateTravelStrategyExplanation(route) {
    const legs = route.legs || [];
    let explanation = '';
    
    legs.forEach((leg, idx) => {
        if (idx === 0) {
            explanation += `**Outbound (${leg.from} → ${leg.to})**\n`;
        } else if (idx === legs.length - 1) {
            explanation += `\n**Return (${leg.from} → ${leg.to})**\n`;
        } else {
            explanation += `\n**Leg ${idx} (${leg.from} → ${leg.to})**\n`;
        }
        
        explanation += `  • Mode: ${leg.mode.toUpperCase()}\n`;
        explanation += `  • Distance: ${Math.round(leg.distance)}km\n`;
        explanation += `  • Duration: ${(leg.duration || 0).toFixed(1)} hours\n`;
        explanation += `  • Cost: ₹${leg.cost.toLocaleString()}\n`;
        
        // Why this mode?
        if (leg.alternatives && leg.alternatives.length > 1) {
            const cheapest = leg.alternatives.reduce((min, opt) => opt.cost < min.cost ? opt : min);
            const fastest = leg.alternatives.reduce((min, opt) => {
                const timeA = min.duration || estimateDuration(min);
                const timeB = opt.duration || estimateDuration(opt);
                return timeB < timeA ? opt : min;
            });
            
            if (leg.mode === cheapest.mode) {
                explanation += `  • Why: Most economical option\n`;
            } else if (leg.mode === fastest.mode) {
                explanation += `  • Why: Fastest route, saves ${((cheapest.duration || estimateDuration(cheapest)) - leg.duration).toFixed(1)} hours\n`;
            } else {
                explanation += `  • Why: Best balance of time and cost\n`;
            }
        }
    });
    
    return explanation;
}

/**
 * Extract hidden gems from route
 */
function extractHiddenGems(route) {
    const gems = [];
    
    route.destinations.forEach(dest => {
        const destGems = dest.destination.additionalLocalInfo?.hiddenGems || [];
        destGems.slice(0, 2).forEach(gem => {
            gems.push({
                destination: dest.destination.name[0] || dest.destination.name,
                gem: gem
            });
        });
    });
    
    return gems;
}

/**
 * Generate tradeoffs vs other routes
 */
function generateTradeoffs(route, allRoutes, userQuery) {
    if (!allRoutes || allRoutes.length < 2) {
        return {
            summary: 'This is the optimal route for your preferences and budget.'
        };
    }
    
    // Find routes with different optimization goals
    const otherRoutes = allRoutes.filter(r => 
        r.routeId !== route.routeId &&
        r.destinations.length >= route.destinations.length - 1 &&
        r.destinations.length <= route.destinations.length + 1
    ).slice(0, 2);
    
    if (otherRoutes.length === 0) {
        return {
            summary: 'This route provides the best value for your requirements.'
        };
    }
    
    const tradeoffs = {};
    
    otherRoutes.forEach((other, idx) => {
        const costDiff = route.totalCost.base - other.totalCost.base;
        const timeDiff = route.summary.totalTravelTime - other.summary.totalTravelTime;
        const comfortDiff = route.scores.comfortScore - other.scores.comfortScore;
        
        const label = idx === 0 ? 'alternative_1' : 'alternative_2';
        
        tradeoffs[label] = {
            routeName: other.name,
            costDifference: costDiff,
            timeDifference: timeDiff,
            comfortDifference: comfortDiff,
            summary: generateTradeoffSummary(costDiff, timeDiff, comfortDiff, route, other)
        };
    });
    
    return tradeoffs;
}

/**
 * Generate tradeoff summary
 */
function generateTradeoffSummary(costDiff, timeDiff, comfortDiff, thisRoute, otherRoute) {
    let summary = '';
    
    if (costDiff > 0) {
        summary += `Saves ₹${Math.abs(Math.round(costDiff)).toLocaleString()}`;
    } else {
        summary += `Costs ₹${Math.abs(Math.round(costDiff)).toLocaleString()} more`;
    }
    
    if (Math.abs(timeDiff) >= 1) {
        if (timeDiff > 0) {
            summary += `, ${Math.abs(timeDiff).toFixed(1)}h faster`;
        } else {
            summary += `, ${Math.abs(timeDiff).toFixed(1)}h slower`;
        }
    }
    
    if (Math.abs(comfortDiff) >= 1) {
        if (comfortDiff > 0) {
            summary += `, more comfortable`;
        } else {
            summary += `, less comfortable`;
        }
    }
    
    // Add key difference
    if (thisRoute.destinations.length !== otherRoute.destinations.length) {
        summary += `. Covers ${thisRoute.destinations.length} vs ${otherRoute.destinations.length} destinations.`;
    } else {
        const thisPrefs = new Set(thisRoute.metadata.preferenceTags);
        const otherPrefs = new Set(otherRoute.metadata.preferenceTags);
        const uniqueToOther = [...otherPrefs].filter(p => !thisPrefs.has(p));
        
        if (uniqueToOther.length > 0) {
            summary += `. Alternative focuses on ${uniqueToOther.join(', ')}.`;
        }
    }
    
    return summary;
}

/**
 * Get profile keys for preference
 */
function getProfileKeysForPreference(preference) {
    const map = {
        'Mountains': ['nature', 'adventure', 'photography'],
        'Beaches': ['relaxation', 'nature', 'photography'],
        'Cities': ['cultural', 'shopping', 'food'],
        'Jungles': ['nature', 'adventure'],
        'Temples': ['spiritual', 'cultural', 'historical'],
        'Riverside': ['nature', 'relaxation'],
        'Culture': ['cultural', 'historical', 'food'],
        'Desert': ['adventure', 'nature', 'photography']
    };
    
    return map[preference] || ['cultural'];
}

/**
 * Estimate duration helper
 */
function estimateDuration(travelOption) {
    const distance = travelOption.distance || 0;
    const mode = (travelOption.mode || 'bus').toLowerCase();
    
    const speeds = { flight: 650, train: 55, bus: 45, driving: 50, car: 50, cab: 50 };
    const overhead = { flight: 3, train: 1, bus: 0.5, driving: 0 };
    
    return (distance / (speeds[mode] || 50)) + (overhead[mode] || 0);
}

module.exports = {
    generateExplanations,
    generateRouteRationale,
    generatePreferenceFitExplanation,
    generateBudgetExplanation,
    generateTravelStrategyExplanation,
    extractHiddenGems,
    generateTradeoffs
};