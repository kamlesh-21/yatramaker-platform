// /**
//  * CLUSTER BUILDER
//  * Groups destinations into geographic clusters that make logical multi-city routes
//  * Uses modified DBSCAN algorithm with travel-specific heuristics
//  * 
//  * @file server/utils/multiCity/clusterBuilder.js
//  */

// const calculateDistance = require('../distanceCalculator');

// // Clustering parameters
// const CLUSTERING_CONFIG = {
//     MAX_CLUSTER_DISTANCE: 350,      // Max km between destinations in cluster
//     MIN_DESTINATIONS_PER_CLUSTER: 2, // Minimum size
//     MAX_DESTINATIONS_PER_CLUSTER: 5, // Maximum size (avoid overwhelming routes)
//     MAX_CLUSTER_SPAN: 700,          // Max total distance across cluster
//     SAME_STATE_BONUS: 0.7           // Multiplier for distance if same state
// };

// /**
//  * Main function: Build clusters from destination list
//  */
// async function buildClusters(destinations, userLocation, userQuery) {
//     try {
//         console.log(`🗺️  Building clusters from ${destinations.length} destinations...`);
        
//         if (destinations.length < 2) {
//             console.warn('Not enough destinations for clustering');
//             return [];
//         }
        
//         // Step 1: Precompute distance matrix
//         const distanceMatrix = buildDistanceMatrix(destinations);
        
//         // Step 2: Form initial clusters using DBSCAN-like approach
//         const rawClusters = formInitialClusters(
//             destinations,
//             distanceMatrix,
//             userLocation
//         );
        
//         console.log(`   Formed ${rawClusters.length} initial clusters`);
        
//         // Step 3: Optimize each cluster's internal sequence
//         const optimizedClusters = rawClusters.map(cluster => 
//             optimizeClusterSequence(cluster, userLocation, distanceMatrix)
//         );
        
//         // Step 4: Validate and score clusters
//         const validClusters = optimizedClusters
//             .filter(cluster => validateCluster(cluster, userQuery))
//             .map(cluster => scoreCluster(cluster, userLocation, userQuery));
        
//         // Step 5: Sort by score and return
//         validClusters.sort((a, b) => b.score - a.score);
        
//         console.log(`   ✅ ${validClusters.length} valid clusters after filtering`);
        
//         return validClusters;
        
//     } catch (error) {
//         console.error('Error building clusters:', error);
//         throw error;
//     }
// }

// /**
//  * Build distance matrix for all destination pairs
//  */
// function buildDistanceMatrix(destinations) {
//     const matrix = new Map();
    
//     for (let i = 0; i < destinations.length; i++) {
//         for (let j = i + 1; j < destinations.length; j++) {
//             const dest1 = destinations[i];
//             const dest2 = destinations[j];
            
//             const distance = calculateDistance(
//                 dest1.latitude,
//                 dest1.longitude,
//                 dest2.latitude,
//                 dest2.longitude
//             );
            
//             // Apply same-state bonus
//             const adjustedDistance = dest1.state === dest2.state
//                 ? distance * CLUSTERING_CONFIG.SAME_STATE_BONUS
//                 : distance;
            
//             const key = `${dest1.destination_id}:${dest2.destination_id}`;
//             matrix.set(key, adjustedDistance);
//         }
//     }
    
//     return matrix;
// }

// /**
//  * Get distance from matrix (handles both orderings)
//  */
// function getDistance(dest1, dest2, matrix) {
//     const key1 = `${dest1.destination_id}:${dest2.destination_id}`;
//     const key2 = `${dest2.destination_id}:${dest1.destination_id}`;
    
//     return matrix.get(key1) || matrix.get(key2) || 
//            calculateDistance(dest1.latitude, dest1.longitude, dest2.latitude, dest2.longitude);
// }

// /**
//  * Form initial clusters using density-based approach
//  */
// function formInitialClusters(destinations, distanceMatrix, userLocation) {
//     const clusters = [];
//     const visited = new Set();
    
//     // Sort destinations by distance from user (prefer nearby as cluster seeds)
//     const sorted = [...destinations].sort((a, b) => {
//         const distA = calculateDistance(
//             userLocation.latitude, userLocation.longitude, a.latitude, a.longitude
//         );
//         const distB = calculateDistance(
//             userLocation.latitude, userLocation.longitude, b.latitude, b.longitude
//         );
//         return distA - distB;
//     });
    
//     for (const dest of sorted) {
//         if (visited.has(dest.destination_id)) continue;
        
//         // Find neighbors within threshold
//         const neighbors = destinations.filter(d => {
//             if (d.destination_id === dest.destination_id) return false;
//             if (visited.has(d.destination_id)) return false;
            
//             const distance = getDistance(dest, d, distanceMatrix);
//             return distance <= CLUSTERING_CONFIG.MAX_CLUSTER_DISTANCE;
//         });
        
//         // Only form cluster if we have enough neighbors
//         if (neighbors.length >= CLUSTERING_CONFIG.MIN_DESTINATIONS_PER_CLUSTER - 1) {
//             // Take closest neighbors up to max size
//             const sortedNeighbors = neighbors
//                 .map(n => ({
//                     destination: n,
//                     distance: getDistance(dest, n, distanceMatrix)
//                 }))
//                 .sort((a, b) => a.distance - b.distance)
//                 .slice(0, CLUSTERING_CONFIG.MAX_DESTINATIONS_PER_CLUSTER - 1)
//                 .map(n => n.destination);
            
//             const clusterDests = [dest, ...sortedNeighbors];
            
//             // Check total span
//             const span = calculateClusterSpan(clusterDests, distanceMatrix);
//             if (span <= CLUSTERING_CONFIG.MAX_CLUSTER_SPAN) {
//                 clusters.push({
//                     destinations: clusterDests,
//                     span: span
//                 });
                
//                 // Mark as visited
//                 clusterDests.forEach(d => visited.add(d.destination_id));
//             }
//         }
//     }
    
//     // Handle remaining singletons by trying to merge with nearby clusters
//     const remaining = destinations.filter(d => !visited.has(d.destination_id));
//     for (const dest of remaining) {
//         // Try to add to nearest cluster if it doesn't violate constraints
//         let bestCluster = null;
//         let bestDistance = Infinity;
        
//         for (const cluster of clusters) {
//             if (cluster.destinations.length >= CLUSTERING_CONFIG.MAX_DESTINATIONS_PER_CLUSTER) {
//                 continue;
//             }
            
//             // Calculate average distance to cluster
//             const avgDist = cluster.destinations.reduce((sum, d) => 
//                 sum + getDistance(dest, d, distanceMatrix), 0
//             ) / cluster.destinations.length;
            
//             if (avgDist < bestDistance && avgDist <= CLUSTERING_CONFIG.MAX_CLUSTER_DISTANCE) {
//                 bestDistance = avgDist;
//                 bestCluster = cluster;
//             }
//         }
        
//         if (bestCluster) {
//             bestCluster.destinations.push(dest);
//             bestCluster.span = calculateClusterSpan(bestCluster.destinations, distanceMatrix);
//         }
//     }
    
//     return clusters;
// }

// /**
//  * Calculate total span (max distance) across cluster
//  */
// function calculateClusterSpan(destinations, distanceMatrix) {
//     let maxDistance = 0;
    
//     for (let i = 0; i < destinations.length; i++) {
//         for (let j = i + 1; j < destinations.length; j++) {
//             const distance = getDistance(destinations[i], destinations[j], distanceMatrix);
//             if (distance > maxDistance) {
//                 maxDistance = distance;
//             }
//         }
//     }
    
//     return Math.round(maxDistance);
// }

// /**
//  * Optimize internal sequence using nearest-neighbor TSP heuristic
//  */
// function optimizeClusterSequence(cluster, userLocation, distanceMatrix) {
//     const destinations = cluster.destinations;
    
//     if (destinations.length <= 2) {
//         return cluster; // No optimization needed
//     }
    
//     // Find nearest destination to user as starting point
//     let current = destinations.reduce((nearest, dest) => {
//         const distToUser = calculateDistance(
//             userLocation.latitude,
//             userLocation.longitude,
//             dest.latitude,
//             dest.longitude
//         );
//         const nearestDistToUser = calculateDistance(
//             userLocation.latitude,
//             userLocation.longitude,
//             nearest.latitude,
//             nearest.longitude
//         );
        
//         return distToUser < nearestDistToUser ? dest : nearest;
//     });
    
//     const sequence = [current];
//     const remaining = destinations.filter(d => d.destination_id !== current.destination_id);
    
//     // Greedy nearest-neighbor
//     while (remaining.length > 0) {
//         let nearest = remaining[0];
//         let nearestDist = getDistance(current, nearest, distanceMatrix);
        
//         for (let i = 1; i < remaining.length; i++) {
//             const dist = getDistance(current, remaining[i], distanceMatrix);
//             if (dist < nearestDist) {
//                 nearest = remaining[i];
//                 nearestDist = dist;
//             }
//         }
        
//         sequence.push(nearest);
//         current = nearest;
//         remaining.splice(remaining.indexOf(nearest), 1);
//     }
    
//     return {
//         ...cluster,
//         destinations: sequence
//     };
// }

// /**
//  * Validate cluster meets quality criteria
//  */
// function validateCluster(cluster, userQuery) {
//     // Must have minimum destinations
//     if (cluster.destinations.length < CLUSTERING_CONFIG.MIN_DESTINATIONS_PER_CLUSTER) {
//         return false;
//     }
    
//     // All destinations must have required fields
//     for (const dest of cluster.destinations) {
//         if (!dest.latitude || !dest.longitude) return false;
//         if (!dest.visitMetrics?.recommendedDays) return false;
//         if (!dest.infrastructure?.accommodationAvailable) return false;
//     }
    
//     // Total recommended days should not wildly exceed trip duration
//     const totalRecommendedDays = cluster.destinations.reduce(
//         (sum, d) => sum + (d.visitMetrics.recommendedDays || 2), 0
//     );
    
//     if (totalRecommendedDays > userQuery.tripDuration * 1.5) {
//         return false; // Too many destinations for trip length
//     }
    
//     return true;
// }

// /**
//  * Score cluster based on quality factors
//  */
// function scoreCluster(cluster, userLocation, userQuery) {
//     const destinations = cluster.destinations;
    
//     // 1. Geographic efficiency (lower span = better)
//     const spanScore = Math.max(0, 10 - (cluster.span / 100));
    
//     // 2. Preference alignment (average preference scores)
//     const prefScores = destinations.map(d => d.preferenceScore || 5);
//     const avgPrefScore = prefScores.reduce((sum, s) => sum + s, 0) / prefScores.length;
    
//     // 3. Uniqueness (more unique = better)
//     const uniquenessScores = destinations.map(d => 
//         (d.visitMetrics?.uniquenessScore || 5) / 10
//     );
//     const avgUniqueness = uniquenessScores.reduce((sum, s) => sum + s, 0) / uniquenessScores.length;
    
//     // 4. Infrastructure quality
//     const infraScores = destinations.map(d => 
//         (d.infrastructure?.accessibilityScore || 5) / 10
//     );
//     const avgInfra = infraScores.reduce((sum, s) => sum + s, 0) / infraScores.length;
    
//     // 5. Distance from user (prefer nearer clusters for multi-city)
//     const distanceToNearestDest = Math.min(...destinations.map(d => 
//         calculateDistance(
//             userLocation.latitude,
//             userLocation.longitude,
//             d.latitude,
//             d.longitude
//         )
//     ));
//     const distanceScore = Math.max(0, 10 - (distanceToNearestDest / 200));
    
//     // Weighted score
//     const score = (
//         spanScore * 0.25 +
//         avgPrefScore * 0.35 +
//         avgUniqueness * 0.20 +
//         avgInfra * 0.10 +
//         distanceScore * 0.10
//     );
    
//     return {
//         ...cluster,
//         score: parseFloat(score.toFixed(2)),
//         metrics: {
//             spanScore,
//             avgPrefScore,
//             avgUniqueness,
//             avgInfra,
//             distanceScore
//         }
//     };
// }

// /**
//  * Extract dominant preferences from cluster
//  */
// function extractDominantPreferences(cluster) {
//     const prefCounts = {};
    
//     cluster.destinations.forEach(dest => {
//         const types = dest.type || [];
//         types.forEach(type => {
//             prefCounts[type] = (prefCounts[type] || 0) + 1;
//         });
//     });
    
//     // Sort by count
//     const sorted = Object.entries(prefCounts)
//         .sort((a, b) => b[1] - a[1])
//         .map(([pref]) => pref);
    
//     return sorted.slice(0, 3); // Top 3 preferences
// }

// module.exports = {
//     buildClusters,
//     CLUSTERING_CONFIG
// };

/**
 * CLUSTER BUILDER
 * Groups destinations into geographic clusters using a controlled, dynamic config
 * @file server/utils/multiCity/clusterBuilder.js
 */

const calculateDistance = require('../distanceCalculator');

/**
 * Build clustering configuration dynamically
 */
function getClusteringConfig(userQuery = {}) {
    const { tripDuration = 5, budget = 15000 } = userQuery;

    let maxDestinations = 2;
    if (tripDuration >= 5) maxDestinations = 3;
    if (tripDuration >= 7) maxDestinations = 4;
    if (tripDuration >= 10) maxDestinations = 5;

    let maxClusterDistance = 300;
    let maxClusterSpan = 500;

    if (budget >= 15000) {
        maxClusterDistance = 500;
        maxClusterSpan = 800;
    }

    if (budget >= 25000) {
        maxClusterDistance = 700;
        maxClusterSpan = 1200;
    }

    if (tripDuration <= 4) {
        maxClusterDistance = Math.min(maxClusterDistance, 350);
        maxClusterSpan = Math.min(maxClusterSpan, 600);
    }

    return {
        MAX_CLUSTER_DISTANCE: Math.round(maxClusterDistance),
        MIN_DESTINATIONS_PER_CLUSTER: 2,
        MAX_DESTINATIONS_PER_CLUSTER: maxDestinations,
        MAX_CLUSTER_SPAN: Math.round(maxClusterSpan),
        SAME_STATE_BONUS: 0.7
    };
}

/**
 * MAIN ENTRY
 */
async function buildClusters(destinations, userLocation, userQuery) {
    const CONFIG = getClusteringConfig(userQuery);

    console.log("🧭 Active Clustering Config:", CONFIG);

    if (!destinations || destinations.length < 2) return [];

    const distanceMatrix = buildDistanceMatrix(destinations, CONFIG);
    const rawClusters = formInitialClusters(destinations, distanceMatrix, userLocation, CONFIG);

    const optimized = rawClusters.map(c =>
        optimizeClusterSequence(c, userLocation, distanceMatrix)
    );

    const finalClusters = optimized
        .filter(c => validateCluster(c, userQuery, CONFIG))
        .map(c => scoreCluster(c, userLocation, CONFIG));

    return finalClusters.sort((a, b) => b.score - a.score);
}

/* ---------------- CORE LOGIC ---------------- */

function buildDistanceMatrix(destinations, CONFIG) {
    const matrix = new Map();

    for (let i = 0; i < destinations.length; i++) {
        for (let j = i + 1; j < destinations.length; j++) {
            const a = destinations[i];
            const b = destinations[j];

            const dist = calculateDistance(a.latitude, a.longitude, b.latitude, b.longitude);
            const adjusted = a.state === b.state ? dist * CONFIG.SAME_STATE_BONUS : dist;

            matrix.set(`${a.destination_id}:${b.destination_id}`, adjusted);
        }
    }
    return matrix;
}

function getDistance(a, b, matrix) {
    return (
        matrix.get(`${a.destination_id}:${b.destination_id}`) ||
        matrix.get(`${b.destination_id}:${a.destination_id}`) ||
        calculateDistance(a.latitude, a.longitude, b.latitude, b.longitude)
    );
}

function formInitialClusters(destinations, matrix, userLocation, CONFIG) {
    const clusters = [];
    const visited = new Set();

    const sorted = [...destinations].sort(
        (a, b) =>
            calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude) -
            calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude)
    );

    for (const dest of sorted) {
        if (visited.has(dest.destination_id)) continue;

        const neighbors = destinations.filter(d =>
            d.destination_id !== dest.destination_id &&
            !visited.has(d.destination_id) &&
            getDistance(dest, d, matrix) <= CONFIG.MAX_CLUSTER_DISTANCE
        );

        if (neighbors.length < CONFIG.MIN_DESTINATIONS_PER_CLUSTER - 1) continue;

        const selected = neighbors
            .map(d => ({ d, dist: getDistance(dest, d, matrix) }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, CONFIG.MAX_DESTINATIONS_PER_CLUSTER - 1)
            .map(x => x.d);

        const cluster = [dest, ...selected];
        const span = calculateClusterSpan(cluster, matrix);

        if (span <= CONFIG.MAX_CLUSTER_SPAN) {
            cluster.forEach(d => visited.add(d.destination_id));
            clusters.push({ destinations: cluster, span });
        }
    }

    return clusters;
}

function calculateClusterSpan(destinations, matrix) {
    let max = 0;
    for (let i = 0; i < destinations.length; i++) {
        for (let j = i + 1; j < destinations.length; j++) {
            const d = getDistance(destinations[i], destinations[j], matrix);
            if (d > max) max = d;
        }
    }
    return Math.round(max);
}

function optimizeClusterSequence(cluster, userLocation, matrix) {
    const dests = cluster.destinations;
    if (dests.length <= 2) return cluster;

    let current = dests.reduce((a, b) =>
        calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude) <
        calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude)
            ? a
            : b
    );

    const ordered = [current];
    const remaining = dests.filter(d => d !== current);

    while (remaining.length) {
        let nearest = remaining[0];
        let min = getDistance(current, nearest, matrix);

        for (const r of remaining) {
            const d = getDistance(current, r, matrix);
            if (d < min) {
                min = d;
                nearest = r;
            }
        }

        ordered.push(nearest);
        remaining.splice(remaining.indexOf(nearest), 1);
        current = nearest;
    }

    return { ...cluster, destinations: ordered };
}

function validateCluster(cluster, userQuery, CONFIG) {
    if (cluster.destinations.length < CONFIG.MIN_DESTINATIONS_PER_CLUSTER) return false;

    const totalDays = cluster.destinations.reduce(
        (sum, d) => sum + (d.visitMetrics?.recommendedDays || 2),
        0
    );

    return totalDays <= userQuery.tripDuration * 1.5;
}

function scoreCluster(cluster, userLocation, CONFIG) {
    const d = cluster.destinations;

    const spanScore = Math.max(0, 10 - cluster.span / 100);
    const pref = d.reduce((s, x) => s + (x.preferenceScore || 5), 0) / d.length;
    const uniq = d.reduce((s, x) => s + ((x.visitMetrics?.uniquenessScore || 5) / 10), 0) / d.length;
    const infra = d.reduce((s, x) => s + ((x.infrastructure?.accessibilityScore || 5) / 10), 0) / d.length;

    const nearest = Math.min(...d.map(x =>
        calculateDistance(userLocation.latitude, userLocation.longitude, x.latitude, x.longitude)
    ));

    const distScore = Math.max(0, 10 - nearest / 200);

    return {
        ...cluster,
        score: parseFloat((
            spanScore * 0.25 +
            pref * 0.35 +
            uniq * 0.20 +
            infra * 0.10 +
            distScore * 0.10
        ).toFixed(2))
    };
}

module.exports = {
    buildClusters,
    getClusteringConfig
};