import type { SearchRequest, SearchResponse } from "../shared/schema";

export async function searchDestinations(data: SearchRequest): Promise<SearchResponse> {
  const MOCK_MODE = true; // ⚙️ Toggle ON for dev testing

  let backendData;
  if (MOCK_MODE) {
    const res = await fetch("/mock/backendResponse.json");
    backendData = await res.json();
  } else {
    const response = await fetch("/api/travelData/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Backend error ${response.status}`);
    backendData = await response.json();
  }

  // Transform to UI-compatible structure
  const transformed: SearchResponse = {
    tripType: backendData.tripType || data.tripType,
    singleDestinationResults: backendData.singleDestinationResults || [],
    multiCityResults: backendData.multiCityResults || undefined,
    success: backendData.success ?? true,
    metadata: backendData.metadata ?? {
      source: MOCK_MODE ? "Mock Data" : "YatraMaker Backend",
      count: backendData.singleDestinationResults?.length || 0,
    },
  };
  return transformed;
}
