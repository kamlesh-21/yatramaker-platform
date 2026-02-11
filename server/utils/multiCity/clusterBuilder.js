/**
 * CLUSTER BUILDER
 * Groups destinations into geographic clusters using a controlled, dynamic config
 * @file server/utils/multiCity/clusterBuilder.js
 */

const calculateDistance = require('../distanceCalculator');

/**
 * Build clustering configuration dynamically
 */
// function getClusteringConfig(userQuery = {}) {
//     const { tripDuration = 5, budget = 15000 } = userQuery;

//     let maxDestinations = 2;
//     if (tripDuration >= 5) maxDestinations = 3;
//     if (tripDuration >= 7) maxDestinations = 4;
//     if (tripDuration >= 10) maxDestinations = 5;

//     let maxClusterDistance = 300;
//     let maxClusterSpan = 500;

//     if (budget >= 15000) {
//         maxClusterDistance = 500;
//         maxClusterSpan = 800;
//     }

//     if (budget >= 25000) {
//         maxClusterDistance = 700;
//         maxClusterSpan = 1200;
//     }

//     if (tripDuration <= 4) {
//         maxClusterDistance = Math.min(maxClusterDistance, 350);
//         maxClusterSpan = Math.min(maxClusterSpan, 600);
//     }

//     return {
//         MAX_CLUSTER_DISTANCE: Math.round(maxClusterDistance),
//         MIN_DESTINATIONS_PER_CLUSTER: 2,
//         MAX_DESTINATIONS_PER_CLUSTER: maxDestinations,
//         MAX_CLUSTER_SPAN: Math.round(maxClusterSpan),
//         SAME_STATE_BONUS: 0.7
//     };
// }

function getClusteringConfig(userQuery = {}) {
    const { tripDuration = 5, budget = 15000 } = userQuery;

    let maxDestinations = 3;
    if (tripDuration >= 7) maxDestinations = 5;
    if (tripDuration >= 10) maxDestinations = 6;

    let maxClusterDistance = 500;
    let maxClusterSpan = 900;

    if (budget >= 40000) {
        maxClusterDistance = 1200;
        maxClusterSpan = 2000;
    }
    if (budget >= 70000) {
        maxClusterDistance = 2000;
        maxClusterSpan = 3500;      // allow almost pan-India
    }
    if (budget >= 100000) {
        maxClusterDistance = 3000;
        maxClusterSpan = 5000;
    }

    if (tripDuration <= 5) {
        maxClusterDistance = Math.min(maxClusterDistance, 800);
        maxClusterSpan = Math.min(maxClusterSpan, 1400);
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