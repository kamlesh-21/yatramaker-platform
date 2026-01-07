// server/utils/generateVariants.js
// Generates travel variants (cheapest, fastest, comfortable) from travelOptions
// Produces rich objects: legs, travel (totals), totalCost, breakdowns, flags

const DEFAULTS = {
  AIR_SPEED_KMPH: 650,
  TRAIN_SPEED_KMPH: 55,
  BUS_SPEED_KMPH: 45,
  DRIVE_SPEED_KMPH: 50,
  AIRPORT_OVERHEAD_HOURS: 2.0,
  STATION_OVERHEAD_HOURS: 0.75,
  TRANSFER_PENALTY_HOURS: 0.5
};

const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function estimateLegTimeHours(leg) {
  const d = safeNum(leg.distanceKm ?? leg.distance ?? 0);
  const mode = String((leg.mode ?? '').toLowerCase());
  if (mode === 'flight' || mode === 'air') {
    return (d / DEFAULTS.AIR_SPEED_KMPH) + DEFAULTS.AIRPORT_OVERHEAD_HOURS;
  }
  if (mode === 'train') {
    return (d / DEFAULTS.TRAIN_SPEED_KMPH) + DEFAULTS.STATION_OVERHEAD_HOURS;
  }
  if (mode === 'bus') {
    return (d / DEFAULTS.BUS_SPEED_KMPH) + 0.15;
  }
  if (mode === 'driving' || mode === 'car' || mode === 'cab') {
    return (d / DEFAULTS.DRIVE_SPEED_KMPH);
  }
  return d / DEFAULTS.DRIVE_SPEED_KMPH;
}

/**
 * Builds legs array from a raw travel option.
 * Handles hub->hub breakdown (userHubName/destHubName) for flights/trains
 * Falls back to simple direct leg when breakdown missing.
 */
function buildLegsFromOption(userLocation = {}, destination = {}, opt = {}) {
  const legs = [];
  const breakdown = opt.breakdown || {};
  const destName = Array.isArray(destination.name) ? destination.name[0] : destination.name;
  const userName = (userLocation && userLocation.name) || 'Your location';
  const mode = String((opt.mode || '').toLowerCase());

  // Flight / Train complex hub routing
  if ((mode === 'flight' || mode === 'train') && breakdown && (breakdown.userHubName || breakdown.destHubName || breakdown.mainLegCost)) {
    // User -> user hub (cab)
    if (safeNum(breakdown.userToUserHubKm) > 0) {
      legs.push({
        mode: 'cab',
        description: `CAB from ${userName} → ${breakdown.userHubName}`,
        distanceKm: safeNum(breakdown.userToUserHubKm),
        costTotal: safeNum(breakdown.userCabCost || 0)
      });
    }

    // Main leg: userHub -> destHub (flight/train)
    legs.push({
      mode: mode,
      description: `${mode === 'flight' ? 'FLIGHT' : 'TRAIN'} from ${breakdown.userHubName || breakdown.hubName || 'Nearest Hub'} → ${breakdown.destHubName || breakdown.hubName || 'Destination Hub'}`,
      distanceKm: safeNum(breakdown.userHubToDestHubKm || breakdown.mainLegKm || opt.distance || 0),
      costTotal: safeNum(breakdown.mainLegCost || opt.cost || 0)
    });

    // dest hub -> destination (cab)
    if (safeNum(breakdown.destHubToDestKm) > 0) {
      legs.push({
        mode: 'cab',
        description: `CAB from ${breakdown.destHubName} → ${destName}`,
        distanceKm: safeNum(breakdown.destHubToDestKm),
        costTotal: safeNum(breakdown.destCabCost || 0)
      });
    }

    // Include last-mile fallback fields
    return legs;
  }

  // Generic: bus / driving / simple direct option or fallback
  const directDistance = safeNum(opt.distance || breakdown.directDriveKm || breakdown.totalDistance || 0);
  const directCost = safeNum(opt.cost || breakdown.mainLegCost || 0);
  legs.push({
    mode,
    description: `${mode === 'driving' ? 'DRIVE' : mode.toUpperCase()} from ${userName} → ${destName}`,
    distanceKm: directDistance,
    costTotal: directCost
  });

  // If breakdown contains additional local last-mile, include it (fallback)
  if (breakdown && safeNum(breakdown.lastMileCost) > 0 && breakdown.hubName) {
    legs.push({
      mode: 'cab',
      description: `CAB from ${breakdown.hubName} → ${destName}`,
      distanceKm: safeNum(breakdown.hubToDestinationKm || 0),
      costTotal: safeNum(breakdown.lastMileCost)
    });
  }

  return legs;
}

/**
 * Compute totals (distance, cost, time) from legs
 */
function computeTotalsFromLegs(legs = []) {
  let totalDistance = 0;
  let totalCost = 0;
  let totalTimeHours = 0;
  for (const leg of legs) {
    const d = safeNum(leg.distanceKm ?? leg.distance ?? 0);
    const c = safeNum(leg.costTotal ?? leg.cost ?? 0);
    totalDistance += d;
    totalCost += c;
    totalTimeHours += estimateLegTimeHours({ mode: leg.mode, distanceKm: d });
  }
  // add transfer penalty for each transfer (legs - 1)
  const transfers = Math.max(0, legs.length - 1);
  totalTimeHours += transfers * DEFAULTS.TRANSFER_PENALTY_HOURS;
  return {
    totalDistance: Math.round(totalDistance),
    totalCost: Math.round(totalCost),
    totalTimeHours: parseFloat(totalTimeHours.toFixed(2))
  };
}

/**
 * Comfort heuristic: returns 1..10 (similar to old logic)
 */
function calculateComfortScoreFromOption(opt = {}) {
  const mode = String((opt.mode || '').toLowerCase());
  const distance = safeNum(opt.distance ?? opt.totalDistance ?? 0);
  let baseScore = 5;
  switch (mode) {
    case 'driving':
    case 'car':
      baseScore = 8;
      break;
    case 'train':
      baseScore = 7;
      break;
    case 'flight':
    case 'air':
      baseScore = distance > 300 ? 6 : 4;
      break;
    case 'bus':
      baseScore = distance > 200 ? 3 : 5;
      break;
    default:
      baseScore = 5;
  }
  if (mode !== 'flight' && distance > 400) baseScore -= 2;
  // clamp 1..10
  if (baseScore < 1) return 1;
  if (baseScore > 10) return 10;
  return baseScore;
}

/**
 * Convert a raw option -> structured variant object
 * userLocation + destination included to build leg descriptions
 */
function computeVariant(userLocation, destination, option) {
  // Build legs (detailed)
  const legs = buildLegsFromOption(userLocation, destination, option);

  // Compute totals
  const totals = computeTotalsFromLegs(legs);

  // Extract breakdown object for flight/train hub info if present on option
  const breakdown = option.breakdown || {};

  // Compose variant
  return {
    // preserve original fields from option for traceability
    rawOption: option,
    label: option.label ? String(option.label).toLowerCase() : undefined,
    mode: option.mode,
    name: option.name || '',
    legs,
    breakdown, // raw breakdown
    totalDistance: totals.totalDistance,
    totalCost: totals.totalCost,
    totalTimeHours: totals.totalTimeHours,
    estimatedTimeHours: totals.totalTimeHours, // old naming sometimes used in front
    comfortScore: calculateComfortScoreFromOption({
      mode: option.mode,
      distance: totals.totalDistance
    })
  };
}

/**
 * Main exported function:
 * generateVariants(userLocation, destination, travelOptions)
 *
 * travelOptions: array of { mode, cost, distance, breakdown?, ... }
 * Returns array of variants with flags and consistent shape:
 * {
 *   label, isCheapest, isFastest, isComfortable,
 *   travel: { mode, legs, totalDistance, totalTimeHours, totalCost, comfortScore, journeyDescription },
 *   totalCost: { base, withActivities, breakdown: { travel, accommodation, localExpenses, activities }},
 *   accommodation: {},
 *   localExpenses: {},
 *   activities: [],
 *   explanations: { whyThisVariant, whyThisMode, budgetFit, tradeoffs }
 * }
 */
function generateVariants(userLocation = {}, destination = {}, travelOptions = []) {
  if (!Array.isArray(travelOptions) || travelOptions.length === 0) return [];

  // Normalize options -> compute variant candidates
  const computed = travelOptions.map(opt => {
    // ensure expected shape: cost, distance exist
    const normalizedOpt = {
      ...opt,
      cost: safeNum(opt.cost ?? opt.totalCost ?? 0),
      distance: safeNum(opt.distance ?? opt.totalDistance ?? opt.dist ?? 0)
    };
    return computeVariant(userLocation, destination, normalizedOpt);
  });

  // Deduplicate by mode+cost+distance
  const unique = [];
  const seen = new Set();
  for (const v of computed) {
    const key = `${String((v.mode || 'unknown')).toLowerCase()}|${v.totalCost}|${v.totalDistance}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(v);
    }
  }

  // Choose cheapest, fastest, comfortable
  let cheapest = null;
  let fastest = null;
  let comfortable = null;

  for (const v of unique) {
    if (!cheapest || v.totalCost < cheapest.totalCost) cheapest = v;
    if (!fastest || v.totalTimeHours < fastest.totalTimeHours) fastest = v;
    if (!comfortable) comfortable = v;
    else {
      // heuristic: prefer not cheapest and not fastest, balanced by cost/time
      const vScore = (v.totalCost / (cheapest?.totalCost || 1)) + (v.totalTimeHours / (fastest?.totalTimeHours || 1));
      const currentScore = (comfortable.totalCost / (cheapest?.totalCost || 1)) + (comfortable.totalTimeHours / (fastest?.totalTimeHours || 1));
      if (vScore < currentScore) comfortable = v;
    }
  }

  // Ensure fallback coverage: if some labels missing, duplicate best candidate
  const variantsBase = [];
  const pickOrClone = (candidate, label) => {
    if (!candidate) return null;
    // clone and set label
    return {
      label,
      mode: candidate.mode,
      name: candidate.name,
      legs: candidate.legs,
      totalDistance: candidate.totalDistance,
      totalTimeHours: candidate.totalTimeHours,
      comfortScore: candidate.comfortScore,
      travelRawCost: candidate.totalCost,
      travelBreakdown: candidate.breakdown
    };
  };

  variantsBase.push(pickOrClone(cheapest, 'cheapest') || null);
  variantsBase.push(pickOrClone(fastest, 'fastest') || null);
  variantsBase.push(pickOrClone(comfortable, 'comfortable') || null);

  // If any are null, fill from available unique items (prefer cheapest)
  const available = unique.slice();
  for (let i = 0; i < variantsBase.length; i++) {
    if (!variantsBase[i]) {
      const fallback = available.shift() || unique[0];
      variantsBase[i] = pickOrClone(fallback, ['cheapest', 'fastest', 'comfortable'][i]);
    }
  }

  // Build final enriched variants (totalCost fields will be completed by enhancer later,
  // but we compute travel & travel breakdown here so frontend can render directly)
  const finalVariants = variantsBase.map(v => {
    // travel totals (recompute for safety)
    const travelTotals = computeTotalsFromLegs(v.legs || []);
    const travelObj = {
      mode: v.mode,
      legs: (v.legs || []).map(leg => ({
        mode: leg.mode,
        description: leg.description,
        distanceKm: safeNum(leg.distanceKm),
        costTotal: safeNum(leg.costTotal),
        duration: undefined
      })),
      totalDistance: travelTotals.totalDistance,
      totalTimeHours: travelTotals.totalTimeHours,
      totalCost: travelTotals.totalCost,
      whySuitable: undefined,
      journeyDescription: (v.legs || []).map(l => l.description).join(' → '),
      comfortScore: v.comfortScore
    };

    // Minimal totalCost (backend enhancer will add accommodation/local/activities)
    const travelOnlyBase = travelTotals.totalCost;

    return {
      label: v.label,
      isCheapest: v.label === 'cheapest',
      isFastest: v.label === 'fastest',
      isComfortable: v.label === 'comfortable',
      // simple totals (these are travel-only; enhancer will compute full `totalCost` object)
      travel: travelObj,
      // provide quick travel-only cost so frontend can show something while enhancer calculates full total
      totalCost: {
        base: travelOnlyBase,
        withActivities: travelOnlyBase,
        breakdown: {
          travel: travelOnlyBase,
          accommodation: 0,
          localExpenses: 0,
          activities: 0
        }
      },
      // keep raw breakdown for display (hub names + last-mile details)
      breakdown: v.travelBreakdown || {},
      // keep raw original option for traceability
      rawOption: v
    };
  });

  // Deduplicate finalVariants by label (keep first occurrence)
  const seenLabels = new Set();
  const deduped = [];
  for (const fv of finalVariants) {
    if (!fv || !fv.label) continue;
    if (!seenLabels.has(fv.label)) {
      seenLabels.add(fv.label);
      deduped.push(fv);
    }
  }

  // Guarantee ordering: cheapest, fastest, comfortable
  const order = { cheapest: 0, fastest: 1, comfortable: 2 };
  deduped.sort((a, b) => (order[a.label] ?? 99) - (order[b.label] ?? 99));

  return deduped;
}

module.exports = generateVariants;
