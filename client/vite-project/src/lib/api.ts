// //client/vite-project/src/lib/api.ts
import type { SearchRequest, SearchResponse } from "../shared/schema";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const MOCK_MODE = false; // <-- toggle here: true = use /public/mock/backendResponse.json, false = call real backend
const MOCK_PATH = "/mock/backendResponse.json";
const REAL_API = `${API_BASE}/api/travelData/recommendations`;

export async function searchDestinations(data: SearchRequest): Promise<SearchResponse> {
  if (MOCK_MODE) {
    const res = await fetch(MOCK_PATH);
    if (!res.ok) {
      const txt = await res.text().catch(() => "mock file not found");
      throw new Error(`Mock load failed: ${res.status} ${txt}`);
    }
    const backendData = await res.json();
    return transformBackendResponse(backendData, data);
  }

  console.log("Payload being sent to backend:", JSON.stringify(data, null, 2));

  const response = await fetch(REAL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    console.error("Backend Error:", errorText);
    throw new Error(`Search failed: ${response.status}`);
  }

  const backendData = await response.json();
  return transformBackendResponse(backendData, data);
}

function transformBackendResponse(backendData: any, requestData: SearchRequest): SearchResponse {
  const tripType = backendData.tripType ?? requestData.tripType ?? "single-destination";

  const singleDestinationResults =
    backendData.singleDestinationResults ||
    backendData.results ||
    backendData.results_list ||
    [];

const multiCityResults =
  backendData.multiCityResults ||
  (backendData.recommendedItineraries
    ? { recommendedItineraries: backendData.recommendedItineraries }
    : { recommendedItineraries: [] });


  const pagination = backendData.pagination ?? undefined;
  const appliedFilters = backendData.appliedFilters ?? undefined;
  const metadata = backendData.metadata ?? {
    generatedAt: new Date().toISOString(),
    computationTime: backendData.computationTime ?? "N/A",
    destinationsEvaluated: Array.isArray(singleDestinationResults) ? singleDestinationResults.length : 0,
  };

  const transformed: SearchResponse = {
    success: backendData.success ?? true,
    tripType,
    metadata,
    singleDestinationResults,
    multiCityResults,
    pagination,
    appliedFilters,
    results: backendData.results ?? undefined,
  };

  return transformed;
}

// export const saveItinerary = async (data: {
//   itineraryId: string;
//   itineraryData: any;
//   searchData: any;
//   savedAt: string;
// }) => {
//   try {
//     if (MOCK_MODE) {
//       return { success: true, message: "Itinerary saved successfully (mock)" };
//     }

//     // Get token from localStorage
//     const token = localStorage.getItem('token');
//     if (!token) {
//       throw new Error("Authentication token not found");
//     }

//     // First, try to get search data from sessionStorage (where Home.tsx saves it)
//     let searchData = data.searchData;
    
//     // If searchData is empty, try to get from sessionStorage
//     if (!searchData || !searchData.userLocation) {
//       const savedSearch = sessionStorage.getItem("searchData");
//       if (savedSearch) {
//         try {
//           searchData = JSON.parse(savedSearch);
//         } catch (e) {
//           console.warn("Could not parse saved search data from sessionStorage");
//         }
//       }
//     }

//     // If still no search data, try localStorage as fallback
//     if (!searchData || !searchData.userLocation) {
//       const lastSearch = localStorage.getItem("lastSearchData");
//       if (lastSearch) {
//         try {
//           searchData = JSON.parse(lastSearch);
//         } catch (e) {
//           console.warn("Could not parse last search data from localStorage");
//         }
//       }
//     }

//     // Extract userLocation from searchData
//     let userLocation = searchData?.userLocation;
    
//     // If userLocation is a string, convert it to object format
//     if (typeof userLocation === 'string') {
//       userLocation = {
//         name: userLocation,
//         latitude: 0,
//         longitude: 0,
//         state: "Unknown"
//       };
//     }

//     // Ensure required fields exist with defaults
//     const safeUserLocation = {
//       name: userLocation?.name || "Unknown Location",
//       latitude: userLocation?.latitude || 0,
//       longitude: userLocation?.longitude || 0,
//       state: userLocation?.state || "Unknown",
//       nearest_hubs: userLocation?.nearest_hubs || {
//         airports: [],
//         railway_stations: []
//       }
//     };

//     console.log("Extracted userLocation:", safeUserLocation);
//     console.log("Full searchData:", searchData);

//     // Format the data to match your Itinerary schema
//     const itineraryPayload = {
//       budget: searchData?.budget || data.itineraryData.totalCost || 0,
//       userLocation: safeUserLocation,
//       tripDuration: searchData?.tripDuration || 1,
//       travellers: searchData?.travellers || { adults: 1, children: 0, infants: 0 },
//       preferences: searchData?.preferences || [],
//       accommodationPreference: searchData?.accommodationPreference || 'Comfort',
//       tripType: searchData?.tripType || 'single-destination',
//       singleDestinationRecommendation: data.itineraryData,
//       notes: `Saved on ${new Date().toLocaleDateString()}`,
//       tags: ['saved', 'customized']
//     };

//     console.log("Saving itinerary payload:", itineraryPayload);

//     const response = await fetch(`${API_BASE}/api/auth/itineraries`, {
//       method: "POST",
//       headers: { 
//         "Content-Type": "application/json",
//         "x-auth-token": token
//       },
//       body: JSON.stringify(itineraryPayload),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Backend error response:", errorText);
//       throw new Error(`Save failed: ${response.status} - ${errorText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Save itinerary error:", error);
//     throw error;
//   }
// };

export const saveItinerary = async (data: {
  itineraryId: string;
  itineraryData: any;
  searchData: any;
  savedAt: string;
}) => {
  try {
    if (MOCK_MODE) {
      return { success: true, message: "Itinerary saved successfully (mock)" };
    }
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token not found");
    }
    let searchData = data.searchData;
    if (!searchData || !searchData.userLocation) {
      const savedSearch = sessionStorage.getItem("searchData");
      if (savedSearch) {
        try {
          searchData = JSON.parse(savedSearch);
        } catch (e) {
          console.warn("Could not parse saved search data from sessionStorage");
        }
      }
    }
    if (!searchData || !searchData.userLocation) {
      const lastSearch = localStorage.getItem("lastSearchData");
      if (lastSearch) {
        try {
          searchData = JSON.parse(lastSearch);
        } catch (e) {
          console.warn("Could not parse last search data from localStorage");
        }
      }
    }
    let userLocation = searchData?.userLocation;
    if (typeof userLocation === 'string') {
      userLocation = {
        name: userLocation,
        latitude: 0,
        longitude: 0,
        state: "Unknown"
      };
    }
    const safeUserLocation = {
      name: userLocation?.name || "Unknown Location",
      latitude: userLocation?.latitude || 0,
      longitude: userLocation?.longitude || 0,
      state: userLocation?.state || "Unknown",
      nearest_hubs: userLocation?.nearest_hubs || {
        airports: [],
        railway_stations: []
      }
    };
    console.log("Extracted userLocation:", safeUserLocation);
    console.log("Full searchData:", searchData);

    // FIX: Determine tripType and set the correct recommendation field
    const tripType = searchData?.tripType || 'single-destination';
    const fullRecommendation = data.itineraryData;  // ← This comes from DestinationDetail
    const itineraryPayload: any = {
      budget: searchData?.budget || fullRecommendation?.totalCost || 0,
      userLocation: safeUserLocation,
      tripDuration: searchData?.tripDuration || fullRecommendation?.tripDuration || 1,
      travellers: searchData?.travellers || { adults: 1, children: 0, infants: 0 },
      preferences: searchData?.preferences || [],
      accommodationPreference: searchData?.accommodationPreference || 'Comfort',
      tripType,
      notes: `Saved on ${new Date().toLocaleDateString()}`,
      tags: ['saved', 'customized'],
      // ADD THIS: Save user choices for later customization
      savedVariant: fullRecommendation?.selectedVariant,
      savedTravelMode: fullRecommendation?.travelMode,
      savedActivities: fullRecommendation?.selectedActivities || [],
    };

    if (tripType === 'single-destination') {
      // ← SAVE THE FULL RICH OBJECT HERE
      itineraryPayload.singleDestinationRecommendation = fullRecommendation?.destination || data.itineraryData;
    } else {
      itineraryPayload.multiCityRecommendation = data.itineraryData;
    }

    console.log("Saving itinerary payload:", itineraryPayload);
    const response = await fetch(`${API_BASE}/api/auth/itineraries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      },
      body: JSON.stringify(itineraryPayload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error response:", errorText);
      throw new Error(`Save failed: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Save itinerary error:", error);
    throw error;
  }
};

export const getSavedItineraries = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("No token found for getSavedItineraries");
      return { success: false, itineraries: [], pagination: null };
    }

    const response = await fetch(
      `${API_BASE}/api/auth/itineraries?page=${page}&limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Fetch failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get saved itineraries error:", error);
    return { 
      success: false, 
      itineraries: [], 
      pagination: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Add these new functions for itinerary management
export const deleteItinerary = async (itineraryId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(`${API_BASE}/api/auth/itineraries/${itineraryId}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "x-auth-token": token
      },
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Delete itinerary error:", error);
    throw error;
  }
};

export const toggleFavorite = async (itineraryId: string, isFavorite: boolean) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token not found");
    }

    // Since your backend doesn't have a PATCH endpoint, you might need to update the entire itinerary
    // For now, we'll fetch, update, and save
    const response = await fetch(`${API_BASE}/api/auth/itineraries/${itineraryId}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "x-auth-token": token
      },
      body: JSON.stringify({ isFavorite }),
    });

    if (!response.ok) {
      throw new Error(`Toggle favorite failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Toggle favorite error:", error);
    throw error;
  }
};

// Add this to your existing api.ts file
export const getSavedItineraryById = async (itineraryId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_BASE}/api/auth/itineraries/${itineraryId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch saved itinerary: ${response.status}`);
    }

    const data = await response.json();
    console.log("DB Itinerary response:", data); // Debugging
    return data;
  } catch (error) {
    console.error("Error fetching saved itinerary:", error);
    throw error;
  }
};

// Add to your existing api.ts file
export const createBooking = async (bookingData: any) => {
  try {
    const response = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });
    
    if (!response.ok) {
      throw new Error('Booking request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Booking error:', error);
    throw error;
  }
};

export const sendQuoteRequest = async (quoteData: any) => {
  try {
    const response = await fetch('/api/quotes/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    
    return await response.json();
  } catch (error) {
    console.error('Quote request error:', error);
    throw error;
  }
};