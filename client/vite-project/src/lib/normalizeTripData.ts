// src/lib/normalizeTripData.ts

import { safe } from './safe';

export function normalizeTripData(raw: any) {
  // Base normalized result shape
  const normalized: any = {
    success: !!raw?.success,
    tripType: raw?.tripType || (raw?.recommendedItineraries ? 'multi-city' : 'single-destination'),
    metadata: {
      generatedAt: raw?.metadata?.generatedAt || raw?.generated_at || new Date().toISOString(),
      computationTime: raw?.metadata?.computationTime || raw?.metadata?.computation_time || raw?.computationTime || '—',
      destinationsEvaluated: safe(raw?.metadata?.destinationsEvaluated, safe(raw?.metadata?.destinations_evaluated, 0)),
      routesEvaluated: safe(raw?.metadata?.routesEvaluated, 0),
      totalRoutes: safe(raw?.metadata?.totalRoutes, 0),
    },
    // single destination results normalized into `results`
    results: Array.isArray(raw?.results) ? raw.results : (Array.isArray(raw?.singleDestinationResults) ? raw.singleDestinationResults : []),
    // multi-city normalized container
    multiCityResults: {
      recommendedItineraries:
        Array.isArray(raw?.multiCityResults?.recommendedItineraries) ? raw.multiCityResults.recommendedItineraries
          : Array.isArray(raw?.recommendedItineraries) ? raw.recommendedItineraries
          : Array.isArray(raw?.multi_city_results?.recommended_itineraries) ? raw.multi_city_results.recommended_itineraries
          : []
    },
    pagination: raw?.pagination || null
  };

  // Ensure each itinerary has consistent keys/backups
  normalized.multiCityResults.recommendedItineraries = normalized.multiCityResults.recommendedItineraries.map((it: any) => {
    const safeRouteSequence =
      Array.isArray(it?.route?.sequence) ? it.route.sequence
        : Array.isArray(it?.sequence) ? it.sequence
        : Array.isArray(it?.route) ? it.route
        : (it?.route_sequence || it?.sequence_list) || [];

    const name = it?.name || (safeRouteSequence.length ? safeRouteSequence.join(' → ') : it?.tagline || 'Itinerary');

    const costTotal = (typeof it?.totalCost === 'number' && it.totalCost) || (typeof it?.total_cost === 'number' && it.total_cost) || it?.cost || null;
    const tripDuration = it?.totalDays || it?.total_days || it?.totalDaysSuggested || it?.tripDuration || null;
    const costPerDay = it?.costPerDay || (costTotal && tripDuration ? Math.round(costTotal / tripDuration) : it?.cost_per_day) || null;

    return {
      id: it?.id || it?.routeId || `r_${(safeRouteSequence.join('_') || Math.random().toString(36).slice(2,8))}`,
      name,
      tagline: it?.tagline || it?.summary || `${safeRouteSequence.length} stops`,
      optimizationGoal: it?.optimizationGoal || it?.goal || 'balanced',
      totalCost: costTotal,
      costPerDay,
      costPerPerson: it?.costPerPerson || it?.cost_per_person || null,
      costBreakdown: it?.costBreakdown || it?.cost_breakdown || it?.pricing || {},
      route: { sequence: ['User Location', ...safeRouteSequence, 'User Location'].filter(Boolean) },
      routeSequence: safeRouteSequence,
      images: Array.isArray(it?.images) ? it.images : (Array.isArray(it?.photo_urls) ? it.photo_urls.map((u:any)=> ({url:u})) : []),
      explanations: it?.explanations || {},
      confidenceMetrics: it?.confidenceMetrics || it?.confidence_metrics || {},
      bookingInformation: it?.bookingInformation || it?.booking_information || { readyToBook: false },
      dailySchedule: Array.isArray(it?.dailySchedule) ? it.dailySchedule : (Array.isArray(it?.daily_schedule) ? it.daily_schedule : []),
      original: it // keep original payload for debugging
    };
  });

  return normalized;
}
