//server/utils/singleDestination/singleDestinationEnhancer.js

/**
 * ENHANCED SINGLE DESTINATION ENHANCER
 * Complete precomputation with detailed breakdown for all travel modes
 * 
 * @file server/utils/singleDestination/singleDestinationEnhancer.js
 */

const calculateTravelCost = require('../calculateTravelCost');
const calculateAccommodationCost = require('../calculateAccommodationCost');
const calculateLocalExpenses = require('../calculateLocalExpenses');
const generateVariants = require('../generateVariants');

/**
 * ✅ NEW: Filters out travel options that consume too much trip time
 * Rule: Travel should not exceed 25% of total trip duration
 */
function filterByTravelTimeFeasibility(travelOptions, tripDuration) {
    if (!travelOptions || travelOptions.length === 0) return [];
    
    const totalTripHours = tripDuration * 24;
    
    // ✅ REALISTIC thresholds based on trip duration
    let maxTravelPercent;
    let maxAbsoluteHours;
    
    if (tripDuration <= 2) {
        // 1-2 day trips: 30% max (weekend getaways)
        maxTravelPercent = 0.30;
        maxAbsoluteHours = 16; // Max 8 hours each way
    } else if (tripDuration <= 4) {
        // 3-4 day trips: 45% max (long weekends)
        maxTravelPercent = 0.45;
        maxAbsoluteHours = 48; // Max 24 hours each way (overnight trains OK)
    } else if (tripDuration <= 7) {
        // 5-7 day trips: 35% max (week-long vacations)
        maxTravelPercent = 0.35;
        maxAbsoluteHours = 60; // Max 30 hours each way
    } else {
        // 7+ day trips: 25% max (long vacations)
        maxTravelPercent = 0.25;
        maxAbsoluteHours = 72; // Max 36 hours each way
    }
    
    const maxTravelTimeByPercent = totalTripHours * maxTravelPercent;
    const maxTravelTime = Math.max(maxTravelTimeByPercent, maxAbsoluteHours);
    
    return travelOptions.filter(opt => {
        const oneWayTime = opt.estimatedTimeHours || estimateTravelTimeSimple(opt);
        const roundTripTime = oneWayTime * 2;
        
        // ✅ SPECIAL CASE: Flights get more leniency (worth the time for long distances)
        const isLongDistanceFlight = opt.mode === 'flight' && opt.distance > 1500;
        const effectiveMaxTime = isLongDistanceFlight ? maxTravelTime * 1.2 : maxTravelTime;
        
        if (roundTripTime > effectiveMaxTime) {
            console.log(`   ⏱️ Excluded ${opt.mode}: ${Math.round(roundTripTime)}h exceeds ${Math.round(effectiveMaxTime)}h limit`);
            return false;
        }
        return true;
    });
}

async function enhanceSingleDestination(destination, userQuery) {
  try {
    const {
      budget,
      userLocation,
      tripDuration,
      travellers,
      accommodationPreference
    } = userQuery;

    if (!destination || !userLocation || !travellers) {
      throw new Error('Missing required parameters for enhancement');
    }

    // ============================================
    // 1. Calculate ALL Travel Options
    // ============================================
const travelOptions = calculateTravelCost(userLocation, destination, travellers) || [];

    // ✅ NEW: Filter out travel options that take too long for trip duration
    const feasibleTravelOptions = filterByTravelTimeFeasibility(travelOptions, tripDuration);

    if (feasibleTravelOptions.length === 0) {
      console.warn(`⚠️ All travel options for ${destination.destination_id} exceed time feasibility`);
      return null;
    }    

    // ============================================
    // 2. Generate Travel Variants with FULL details
    // ============================================
    let travelVariants = generateVariants(userLocation, destination, travellers, feasibleTravelOptions);
    
    if (!travelVariants || travelVariants.length === 0) {
      travelVariants = createVariantsManually(feasibleTravelOptions, userLocation, destination);
    }
    
    if (!travelVariants || travelVariants.length === 0) {
      console.error(`Failed to create variants for destination ${destination.destination_id}`);
      return null;
    }

    // ============================================
    // 3. Calculate Accommodation with FALLBACK for missing hotels
    // ============================================
    let accommodationCost = await calculateAccommodationCost(
      destination,
      accommodationPreference,
      tripDuration,
      travellers
    );

    // ✅ NEW: Create estimated accommodation if hotel data is missing
    if (!accommodationCost || typeof accommodationCost.cost !== 'number') {
      console.warn(`⚠️ No hotels found for destination ${destination.destination_id} (${destination.name}), using estimated cost`);
      
      // Calculate estimated accommodation based on preference
      const estimatedRates = {
        'Luxury': 3500,
        'Comfort': 1800,
        'Cheap': 900,
        'Midrange': 1800
      };
      
      const baseRate = estimatedRates[accommodationPreference] || estimatedRates['Comfort'];
      
      // Apply regional multiplier based on destination type/region
      let regionalMultiplier = 1.0;
      if (destination.type?.includes('beach') || destination.type?.includes('hill-station')) {
        regionalMultiplier = 1.2; // Tourist spots are pricier
      } else if (destination.type?.includes('pilgrimage') || destination.type?.includes('rural')) {
        regionalMultiplier = 0.8; // Religious/rural spots are cheaper
      }
      
      const adjustedRate = Math.round(baseRate * regionalMultiplier);
      const totalNights = Math.max(1, tripDuration - 1);
      
      // Calculate number of rooms needed
      const { adults = 1, children = 0, infants = 0 } = travellers;
      const totalPeople = adults + (children * 0.5); // Children count as 0.5
      const numberOfRooms = Math.ceil(totalPeople / 2.5); // 2.5 people per room avg
      
      const totalAccommodationCost = adjustedRate * totalNights * numberOfRooms;
      
      accommodationCost = {
        cost: totalAccommodationCost,
        accommodationType: accommodationPreference,
        numberOfRooms: numberOfRooms,
        numberOfNights: totalNights,
        averageRate: adjustedRate,
        adults: adults,
        childrens: children,
        infants: infants,
        hotelName: 'Estimated Accommodation',
        starRating: accommodationPreference === 'Luxury' ? 4 : 
                   accommodationPreference === 'Comfort' ? 3 : 2,
        isEstimated: true, // ✅ Flag to show "estimated" in UI
        estimationReason: 'No hotels in database for this destination',
        destination_id: destination.destination_id
      };
      
      console.log(`✅ Created estimated accommodation: ₹${totalAccommodationCost} (${numberOfRooms} rooms × ${totalNights} nights × ₹${adjustedRate}/night)`);
    }

    // ============================================
    // 4. Calculate Local Expenses & Activities
    // ============================================
    const localExpensesData = await calculateLocalExpenses(
      destination,
      accommodationPreference,
      tripDuration,
      travellers
    );

    const {
      transportationCost = 0,
      mealsCost = 0,
      attractionsCost = 0,
      localExpensesCost = 0,
      activities = [],
      activitiesCost = 0
    } = localExpensesData || {};

    // ============================================
    // 5. Build Enhanced Variants with FULL breakdown
    // ============================================
    const enhancedVariants = buildEnhancedVariants(
      travelVariants,
      accommodationCost,
      localExpensesData,
      travellers,
      budget,
      userLocation,
      destination,
      feasibleTravelOptions
    );

    const cheapestVariant = enhancedVariants.find(v => v.label === 'cheapest') || enhancedVariants[0];
    if (cheapestVariant.totalCost.base > budget) {
      return null;
    }

    // ============================================
    // 6. Build Final Enhanced Destination Object
    // ============================================
    return {
      destination: buildDestinationMetadata(destination),
      variants: enhancedVariants,
      defaultVariant: 'cheapest',
      
      // 🎯 PRESERVE ALL TRAVEL OPTIONS for mode switching
      feasibleTravelOptions: feasibleTravelOptions.map(opt => ({
        mode: opt.mode,
        cost: opt.cost,
        distance: opt.distance,
        breakdown: opt.breakdown || {},
        estimatedTimeHours: estimateTravelTimeSimple(opt),
        comfortScore: calculateComfortScore(opt),
        whySuitable: generateModeExplanation(opt.mode, opt.distance)
      })),
      
      // 🎯 PRESERVE accommodation details (including isEstimated flag)
      accommodationCost: {
        cost: accommodationCost.cost,
        accommodationType: accommodationCost.accommodationType,
        numberOfRooms: accommodationCost.numberOfRooms,
        numberOfNights: accommodationCost.numberOfNights,
        averageRate: accommodationCost.averageRate,
        adults: travellers.adults,
        children: travellers.children,
        infants: travellers.infants,
        hotelName: accommodationCost.hotelName || 'Selected Hotel',
        starRating: accommodationCost.starRating || 3,
        isEstimated: accommodationCost.isEstimated || false, // ✅ Pass through flag
        estimationReason: accommodationCost.estimationReason || null
      },
      
      // 🎯 PRESERVE local expenses breakdown
      localExpenses: {
        total: localExpensesCost,
        transportation: transportationCost,
        meals: mealsCost,
        attractions: attractionsCost
      },
      
      // 🎯 PRESERVE activities
      activities: activities.map(act => ({
        name: act.name,
        type: act.type,
        cost: act.cost,
        duration: act.duration,
        period: act.period,
        isIncludedInBase: false
      })),
      
      // Quick reference costs
      transportationCost,
      mealsCost,
      attractionsCost,
      activitiesCost,
      localExpensesCost,
      
      metadata: {
        computed_at: new Date().toISOString(),
        fits_budget: cheapestVariant.totalCost.base <= budget,
        recommended_days: destination.visitMetrics?.recommendedDays || tripDuration,
        destination_id: destination.destination_id,
        has_estimated_accommodation: accommodationCost.isEstimated || false // ✅ Add flag
      }
    };

  } catch (error) {
    console.error(`Error enhancing destination ${destination?.destination_id}:`, error.message);
    return null;
  }
}

/**
 * Build enhanced variants with COMPLETE breakdown
 */
function buildEnhancedVariants(
  travelVariants,
  accommodationCost,
  localExpensesData,
  travellers,
  budget,
  userLocation,
  destination,
  allTravelOptions
) {
  const {
    transportationCost = 0,
    mealsCost = 0,
    attractionsCost = 0,
    localExpensesCost = 0,
    activities = [],
    activitiesCost = 0
  } = localExpensesData || {};

  const variants = travelVariants.map(variant => {
    const travelCost = safeNumber(variant.totalCost || variant.cost || 0);
    const accommodationTotal = safeNumber(accommodationCost.cost);
    const localTotal = safeNumber(localExpensesCost);
    const activitiesTotal = safeNumber(activitiesCost);

    const baseCost = travelCost + accommodationTotal + localTotal;
    const withActivitiesCost = baseCost + activitiesTotal;

    // Build detailed travel breakdown
    const travelDetails = buildDetailedTravelBreakdown(
      variant,
      userLocation,
      destination,
      allTravelOptions
    );

    return {
      label: variant.label || getVariantLabel(variant),
      priority: getPriorityLabel(variant.label || getVariantLabel(variant)),
      
      // Total costs with complete breakdown
      totalCost: {
        base: Math.round(baseCost),
        withActivities: Math.round(withActivitiesCost),
        breakdown: {
          travel: Math.round(travelCost),
          accommodation: Math.round(accommodationTotal),
          localExpenses: Math.round(localTotal),
          transportation: Math.round(transportationCost),
          meals: Math.round(mealsCost),
          attractions: Math.round(attractionsCost),
          activities: Math.round(activitiesTotal)
        }
      },
      
      // Detailed travel information
      travel: travelDetails,
      
      // Keep accommodation reference
      accommodation: {
        cost: accommodationTotal,
        type: accommodationCost.accommodationType,
        rooms: accommodationCost.numberOfRooms,
        nights: accommodationCost.numberOfNights
      },
      
      // Local expenses detail
      localExpenses: {
        transportation: Math.round(transportationCost),
        meals: Math.round(mealsCost),
        attractions: Math.round(attractionsCost),
        total: Math.round(localTotal)
      },
      
      // Activities
      activities: activities.map(act => ({
        ...act,
        isIncludedInBase: false,
        impactOnTotal: calculateActivityImpact(act, travellers)
      })),
      
      // Explanations
      explanations: generateExplanations(
        variant,
        baseCost,
        budget,
        travelVariants
      )
    };
  });

  return sortVariants(variants);
}

/**
 * Build DETAILED travel breakdown for UI rendering
 */
// function buildDetailedTravelBreakdown(variant, userLocation, destination, allTravelOptions) {
//   const legs = variant.legs || [];
//   const mode = variant.mode || 'unknown';
//   const totalDistance = safeNumber(variant.totalDistance || variant.distance || 0);
//   const totalTimeHours = safeNumber(variant.totalTimeHours || estimateTravelTime(variant));

//   // Find the original travel option for this mode to get breakdown
//   const originalOption = allTravelOptions?.find(opt => opt.mode === mode) || {};
//   const breakdown = originalOption.breakdown || variant.breakdown || {};

//   return {
//     mode: mode,
    
//     // Detailed legs for step-by-step display
//     legs: legs.map(leg => ({
//       mode: leg.mode || mode,
//       description: leg.description || `${leg.mode} travel`,
//       distanceKm: Math.round(safeNumber(leg.distanceKm || leg.distance || 0)),
//       costTotal: Math.round(safeNumber(leg.costTotal || leg.cost || 0)),
//       duration: leg.duration
//     })),
    
//     // Complete breakdown for detailed views
//     breakdown: {
//       // Hub information (for flights/trains)
//       userHubName: breakdown.userHubName || breakdown.hubName,
//       destHubName: breakdown.destHubName,
      
//       // Distance breakdown
//       userToUserHubKm: breakdown.userToUserHubKm || 0,
//       userHubToDestHubKm: breakdown.userHubToDestHubKm || breakdown.mainLegKm || 0,
//       destHubToDestKm: breakdown.destHubToDestKm || 0,
//       directDriveKm: breakdown.directDriveKm || 0,
//       totalDistance: breakdown.totalDistance || totalDistance,
      
//       // Cost breakdown
//       userCabCost: breakdown.userCabCost || 0,
//       mainLegCost: breakdown.mainLegCost || 0,
//       destCabCost: breakdown.destCabCost || 0,
//       lastMileCost: breakdown.lastMileCost || 0
//     },
    
//     totalDistance: Math.round(totalDistance),
//     totalTimeHours: parseFloat(totalTimeHours.toFixed(1)),
//     totalCost: Math.round(variant.totalCost || variant.cost || 0),
//     comfortScore: calculateComfortScore(variant),
//     whySuitable: variant.whySuitable || generateModeExplanation(mode, totalDistance),
//     journeyDescription: buildJourneyDescription(legs, userLocation, destination, mode, breakdown)
//   };
// }

// /**
//  * Build human-readable journey description with hub details
//  */
// function buildJourneyDescription(legs, userLocation, destination, mode, breakdown) {
//   const userName = userLocation.name || 'Your location';
//   const destName = Array.isArray(destination.name) ? destination.name[0] : destination.name;
  
//   if (legs && legs.length > 0) {
//     return legs.map(leg => leg.description).join(' → ');
//   }
  
//   // Build from breakdown if available
//   if (breakdown && (breakdown.userHubName || breakdown.destHubName)) {
//     const parts = [];
    
//     if (breakdown.userToUserHubKm > 0) {
//       parts.push(`CAB from ${userName} to ${breakdown.userHubName}`);
//     }
    
//     const modeUpper = mode.toUpperCase();
//     const hubRoute = breakdown.userHubName && breakdown.destHubName
//       ? `${breakdown.userHubName} → ${breakdown.destHubName}`
//       : destName;
//     parts.push(`${modeUpper} to ${hubRoute}`);
    
//     if (breakdown.destHubToDestKm > 0) {
//       parts.push(`CAB from ${breakdown.destHubName} to ${destName}`);
//     }
    
//     return parts.join(' → ');
//   }
  
//   return `${mode.toUpperCase()} from ${userName} to ${destName}`;
// }

/**
 * Build DETAILED travel breakdown for UI rendering
 * ✅ Maps backend keys (flightKm, trainKm) to frontend keys (userHubToDestHubKm)
 * ✅ Preserves hub names
 * ✅ Safe for all modes
 */
function buildDetailedTravelBreakdown(variant, userLocation, destination, allTravelOptions) {
  const mode = variant.mode || 'unknown';
  const totalDistance = safeNumber(variant.totalDistance || variant.distance || 0);
  
  // Find matching travel option to get rich breakdown & hub names
  const originalOption = allTravelOptions?.find(opt => 
    opt.mode === mode && 
    Math.abs((opt.distance || 0) - totalDistance) < 50
  ) || {};

  const backendBreakdown = originalOption.breakdown || variant.breakdown || {};

  // ✅ KEY MAPPING: Backend → Frontend
  const uiBreakdown = {
    // Hub names (preserve from original option)
    userHubName: backendBreakdown.userHubName || 
                (backendBreakdown.userToOriginKm > 0 ? 'Nearest Hub' : null),
    destHubName: backendBreakdown.destHubName || 
                (backendBreakdown.destHubToFinalKm > 0 ? 'Nearest Hub' : null),

    // Distances
    userToUserHubKm: backendBreakdown.userToOriginKm || 0,
    userHubToDestHubKm: 
      backendBreakdown.flightKm || 
      backendBreakdown.trainKm || 
      backendBreakdown.busKm || 
      0,
    destHubToDestKm: backendBreakdown.destHubToFinalKm || 0,
    directDriveKm: backendBreakdown.directDriveKm || 0,
    totalDistance: backendBreakdown.totalDistance || totalDistance,

    // Costs
    userCabCost: backendBreakdown.userCabCost || 0,
    mainLegCost: 
      backendBreakdown.flightCost || 
      backendBreakdown.trainCost || 
      backendBreakdown.busCost || 
      0,
    destCabCost: backendBreakdown.destCabCost || 0,
    lastMileCost: backendBreakdown.lastMileCost || 0
  };

  return {
    mode: mode,
    // ✅ Pass full UI-ready breakdown
    breakdown: uiBreakdown,
    totalDistance: Math.round(totalDistance),
    totalTimeHours: parseFloat(safeNumber(variant.totalTimeHours || originalOption.estimatedTimeHours || 0).toFixed(1)),
    totalCost: Math.round(variant.totalCost || variant.cost || 0),
    comfortScore: calculateComfortScore(variant),
    whySuitable: variant.whySuitable || originalOption.whySuitable || 
                 generateModeExplanation(mode, totalDistance, originalOption.variant),
    journeyDescription: buildJourneyDescriptionFromBreakdown(uiBreakdown, mode, userLocation, destination)
  };
}

/**
 * Build human-readable description from UI-style breakdown
 */
function buildJourneyDescriptionFromBreakdown(breakdown, mode, userLocation, destination) {
  const userName = userLocation.name || 'Start';
  const destName = Array.isArray(destination.name) ? destination.name[0] : destination.name;

  const parts = [];

  if (breakdown.userToUserHubKm > 0) {
    const hub = breakdown.userHubName || 'nearest hub';
    parts.push(`CAB to ${hub}`);
  }

  if (breakdown.userHubToDestHubKm > 0) {
    const from = breakdown.userHubName || 'origin';
    const to = breakdown.destHubName || 'destination';
    parts.push(`${mode.toUpperCase()} ${from} → ${to}`);
  } else if (breakdown.directDriveKm > 0) {
    parts.push(`${mode.toUpperCase()} ${userName} → ${destName}`);
  }

  if (breakdown.destHubToDestKm > 0) {
    const hub = breakdown.destHubName || 'nearest hub';
    parts.push(`CAB from ${hub} to ${destName}`);
  }

  return parts.length ? parts.join(' → ') : `${mode.toUpperCase()} journey`;
}

/**
 * Create variants manually (fallback)
 */
// server/utils/singleDestination/singleDestinationEnhancer.js

function createVariantsManually(travelOptions, userLocation, destination) {
  if (!travelOptions || travelOptions.length === 0) return [];
  
  const variants = [];
  const destName = Array.isArray(destination.name) ? destination.name[0] : destination.name;
  const userName = userLocation.name || 'Your location';
  
  // Calculate time for all options
  const withEstimatedTime = travelOptions.map(opt => ({
    ...opt,
    estimatedTimeHours: estimateTravelTimeSimple(opt),
    comfortScore: calculateComfortScore(opt)
  }));
  
  const sortedByCost = [...withEstimatedTime].sort((a, b) => (a.cost || 0) - (b.cost || 0));
  const sortedByTime = [...withEstimatedTime].sort((a, b) => 
    (a.estimatedTimeHours || 999) - (b.estimatedTimeHours || 999)
  );
  const sortedByComfort = [...withEstimatedTime].sort((a, b) => 
    (b.comfortScore || 0) - (a.comfortScore || 0)
  );
  
  // 1. CHEAPEST
  const cheapest = sortedByCost[0];
  variants.push({
    label: 'cheapest',
    mode: cheapest.mode,
    totalCost: cheapest.cost || 0,
    totalDistance: cheapest.distance || 0,
    totalTimeHours: cheapest.estimatedTimeHours,
    legs: createSimpleLegs(cheapest, userName, destName),
    breakdown: cheapest.breakdown || {},
    whySuitable: `Most economical option at ₹${(cheapest.cost || 0).toLocaleString()}`
  });
  
  // 2. FASTEST
  const fastest = sortedByTime[0];
  if (fastest.mode !== cheapest.mode) {
    variants.push({
      label: 'fastest',
      mode: fastest.mode,
      totalCost: fastest.cost || 0,
      totalDistance: fastest.distance || 0,
      totalTimeHours: fastest.estimatedTimeHours,
      legs: createSimpleLegs(fastest, userName, destName),
      breakdown: fastest.breakdown || {},
      whySuitable: `Quickest route - saves ${Math.round((cheapest.estimatedTimeHours - fastest.estimatedTimeHours) * 60)} minutes`
    });
  }
  
  // 3. COMFORTABLE - prioritize comfort score
  const comfortable = sortedByComfort[0];
  if (comfortable.mode !== cheapest.mode && comfortable.mode !== fastest.mode) {
    variants.push({
      label: 'comfortable',
      mode: comfortable.mode,
      totalCost: comfortable.cost || 0,
      totalDistance: comfortable.distance || 0,
      totalTimeHours: comfortable.estimatedTimeHours,
      legs: createSimpleLegs(comfortable, userName, destName),
      breakdown: comfortable.breakdown || {},
      whySuitable: `Best comfort score (${comfortable.comfortScore}/10)`
    });
  }
  
  // ✅ FIX: Always ensure 3 variants
  while (variants.length < 3 && withEstimatedTime.length > variants.length) {
    const remaining = withEstimatedTime.filter(opt => 
      !variants.some(v => v.mode === opt.mode)
    );
    
    if (remaining.length > 0) {
      const next = remaining[0];
      const label = variants.length === 1 ? 'fastest' : 'comfortable';
      variants.push({
        label,
        mode: next.mode,
        totalCost: next.cost || 0,
        totalDistance: next.distance || 0,
        totalTimeHours: next.estimatedTimeHours,
        legs: createSimpleLegs(next, userName, destName),
        breakdown: next.breakdown || {},
        whySuitable: `Alternative ${label} option`
      });
    } else {
      break;
    }
  }
  
  // ✅ LAST RESORT: Duplicate cheapest if still short
  while (variants.length < 3) {
    const label = variants.length === 1 ? 'fastest' : 'comfortable';
    variants.push({ ...variants[0], label });
  }
  
  return variants;
}

/**
 * Create simple legs from travel option
 */
function createSimpleLegs(option, fromName, toName) {
  const breakdown = option.breakdown || {};
  const legs = [];
  
  if (breakdown.userHubName && breakdown.destHubName) {
    if (breakdown.userToUserHubKm > 0) {
      legs.push({
        mode: 'cab',
        description: `CAB from ${fromName} to ${breakdown.userHubName}`,
        distanceKm: breakdown.userToUserHubKm,
        costTotal: breakdown.userCabCost || 0
      });
    }
    
    legs.push({
      mode: option.mode,
      description: `${option.mode.toUpperCase()} from ${breakdown.userHubName} to ${breakdown.destHubName}`,
      distanceKm: breakdown.userHubToDestHubKm || breakdown.mainLegKm || 0,
      costTotal: breakdown.mainLegCost || 0
    });
    
    if (breakdown.destHubToDestKm > 0) {
      legs.push({
        mode: 'cab',
        description: `CAB from ${breakdown.destHubName} to ${toName}`,
        distanceKm: breakdown.destHubToDestKm,
        costTotal: breakdown.destCabCost || 0
      });
    }
  } else {
    legs.push({
      mode: option.mode,
      description: `${option.mode.toUpperCase()} from ${fromName} to ${toName}`,
      distanceKm: option.distance || 0,
      costTotal: option.cost || 0
    });
  }
  
  return legs;
}

// Helper functions (keep existing implementations)
function estimateTravelTimeSimple(opt) {
    const distance = opt.distance || 0;
    const mode = (opt.mode || '').toLowerCase();
    
    switch (mode) {
        case 'flight':
        case 'air':
            return (distance / 650) + 3; // Flight speed + overhead
        case 'train':
            return (distance / 55) + 1; // Train speed + overhead
        case 'bus':
            return (distance / 45) + 0.5;
        case 'driving':
        case 'car':
        case 'cab':
            return distance / 50;
        default:
            return distance / 50;
    }
}

function estimateTravelTime(variant) {
  const distance = safeNumber(variant.totalDistance || variant.distance || 0);
  if (distance === 0) return 0;
  
  const mode = (variant.mode || '').toLowerCase();
  
  switch (mode) {
    case 'flight':
    case 'air':
      return (distance / 650) + 3;
    case 'train':
      return (distance / 55) + 1;
    case 'bus':
      return (distance / 45) + 0.5;
    case 'driving':
    case 'car':
    case 'cab':
      return distance / 50;
    default:
      return distance / 50;
  }
}

function calculateComfortScore(variant) {
  const mode = (variant.mode || '').toLowerCase();
  const distance = safeNumber(variant.totalDistance || variant.distance || 0);
  
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
  }
  
  if (mode !== 'flight' && mode !== 'air' && distance > 400) {
    baseScore -= 2;
  }
  
  return Math.max(1, Math.min(10, baseScore));
}

function buildDestinationMetadata(destination) {
  return {
    id: destination.destination_id,
    name: Array.isArray(destination.name) ? destination.name : [destination.name],
    type: destination.type || [],
    location: {
      latitude: destination.latitude,
      longitude: destination.longitude,
      state: destination.state,
      region: destination.region
    },
    description: destination.description || '',
    images: (destination.images || []).slice(0, 5),
    seasonality: destination.seasonality || {},
    additionalLocalInfo: destination.additionalLocalInfo || {}
  };
}

function calculateActivityImpact(activity, travellers) {
  const { adults = 1, children = 0 } = travellers;
  const activityCost = safeNumber(activity.cost || 0);
  return Math.round((adults * activityCost) + (children * activityCost * 0.5));
}

function generateExplanations(variant, totalCost, budget, allVariants) {
  const label = variant.label || getVariantLabel(variant);
  
  return {
    whyThisVariant: generateVariantExplanation(label),
    whyThisMode: variant.whySuitable || generateModeExplanation(
      variant.mode, 
      variant.totalDistance || variant.distance
    ),
    budgetFit: generateBudgetExplanation(totalCost, budget),
    tradeoffs: generateTradeoffs(label, variant, allVariants)
  };
}

function generateVariantExplanation(label) {
  const explanations = {
    cheapest: "Most economical option using budget-friendly transport and strategic route planning.",
    fastest: "Quickest route prioritizing time over cost, ideal for short trips or business travel.",
    comfortable: "Balanced approach optimizing comfort, reasonable travel time, and moderate cost."
  };
  return explanations[label] || "Optimized for your preferences.";
}

function generateModeExplanation(mode, distance) {
  const dist = safeNumber(distance);
  const modeStr = (mode || '').toLowerCase();
  
  if (modeStr === 'flight' || modeStr === 'air') {
    return dist > 500 
      ? "Flight chosen for long distance (500+ km) - saves significant travel time."
      : "Flight selected as the most practical option for this route.";
  }
  
  if (modeStr === 'train') {
    return dist > 300
      ? "Train offers best balance of cost and comfort for medium-long distance."
      : "Train provides comfortable travel with scenic views for this distance.";
  }
  
  if (modeStr === 'bus') {
    return "Direct bus service available - economical for this short-medium distance.";
  }
  
  if (modeStr === 'driving' || modeStr === 'car' || modeStr === 'cab') {
    return "Self-drive offers maximum flexibility and door-to-door convenience.";
  }
  
  return "Selected mode optimizes your journey based on distance and availability.";
}

function generateBudgetExplanation(totalCost, budget) {
  const utilization = (totalCost / budget) * 100;
  const remaining = budget - totalCost;
  
  if (utilization <= 60) {
    return `Well within budget (${utilization.toFixed(0)}% utilization). Leaves ₹${remaining.toLocaleString()} for spontaneous experiences.`;
  } else if (utilization <= 80) {
    return `Good budget fit (${utilization.toFixed(0)}% utilization). Balanced allocation across travel, stay, and activities.`;
  } else if (utilization <= 95) {
    const buffer = Math.ceil((totalCost * 1.1 - budget) / 1000) * 1000;
    return `Near budget limit (${utilization.toFixed(0)}% utilization). Consider adding ₹${buffer.toLocaleString()} buffer.`;
  } else {
    return `Exceeds budget by ₹${Math.abs(remaining).toLocaleString()}. Consider shorter duration or budget accommodation.`;
  }
}

function generateTradeoffs(selectedLabel, selectedVariant, allVariants) {
  const others = allVariants.filter(v => (v.label || getVariantLabel(v)) !== selectedLabel);
  
  if (others.length === 0) return "No alternative options available.";
  
  const comparisons = others.map(other => {
    const otherLabel = other.label || getVariantLabel(other);
    const costDiff = (selectedVariant.totalCost || selectedVariant.cost) - (other.totalCost || other.cost);
    const timeDiff = (selectedVariant.totalTimeHours || 0) - (other.totalTimeHours || 0);
    
    let comparison = `vs ${otherLabel}: `;
    
    if (costDiff > 0) {
      comparison += `Saves ₹${Math.abs(Math.round(costDiff)).toLocaleString()}`;
    } else {
      comparison += `Costs ₹${Math.abs(Math.round(costDiff)).toLocaleString()} more`;
    }
    
    comparison += ', ';
    
    if (timeDiff < 0) {
      comparison += `${Math.abs(timeDiff).toFixed(1)}h faster`;
    } else {
      comparison += `${Math.abs(timeDiff).toFixed(1)}h slower`;
    }
    
    return comparison;
  });
  
  return comparisons.join(' | ');
}

function getVariantLabel(variant) {
  if (variant.label) return variant.label;
  if (variant.isCheapest) return 'cheapest';
  if (variant.isFastest) return 'fastest';
  if (variant.isComfortable) return 'comfortable';
  return 'cheapest';
}

function getPriorityLabel(label) {
  const labels = {
    cheapest: '💰 Most Affordable',
    fastest: '⚡ Quickest Route',
    comfortable: '✨ Most Comfortable'
  };
  return labels[label] || '🎯 Recommended';
}

function sortVariants(variants) {
  const order = { cheapest: 0, fastest: 1, comfortable: 2 };
  
  return variants.sort((a, b) => {
    const orderA = order[a.label] !== undefined ? order[a.label] : 999;
    const orderB = order[b.label] !== undefined ? order[b.label] : 999;
    return orderA - orderB;
  });
}

function safeNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

module.exports = {
  enhanceSingleDestination
};