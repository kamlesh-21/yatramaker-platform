// client/src/lib/api.ts
import type { SearchRequest, SearchResponse } from "../shared/schema";

export async function searchDestinations(data: SearchRequest): Promise<SearchResponse> {
  const response = await fetch("/api/travelData/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userLocation: {
        name: data.location,
        latitude: null,
        longitude: null,
        nearest_hubs: [],
      },
      budget: data.budget,
      tripDuration: data.tripDuration,
      travellers: data.travelers,
      preferences: data.preferences,
      accommodationPreference: data.accommodationPreference,
      travelMode: "Air",
      includeMultiCityTrips: data.tripType === "multi-city",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Backend Error:", errorText);
    throw new Error(`Search failed: ${response.status}`);
  }

  const backendData = await response.json();

  // 🔧 transform backend to frontend-compatible format
  const transformed: SearchResponse = {
    tripType: backendData.tripType || (data.tripType === "multi-city" ? "multi-city" : "single-destination"),
    singleDestinationResults: backendData.results || [],
    multiCityResults: backendData.recommendedItineraries
      ? { recommendedItineraries: backendData.recommendedItineraries }
      : undefined,
    success: backendData.success ?? true,
    metadata: backendData.metadata ?? {
      source: "YatraMaker Backend",
      count: Array.isArray(backendData.results) ? backendData.results.length : 0,
    },
  };

  return transformed;
}