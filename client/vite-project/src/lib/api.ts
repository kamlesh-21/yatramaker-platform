// //client/vite-project/src/lib/api.ts
import type { SearchRequest, SearchResponse } from "../shared/schema";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// ADD THIS HELPER FUNCTION:
const getApiUrl = (path: string) => {
  // If we have an explicit API_BASE, use it
  if (import.meta.env.VITE_API_BASE) {
    return `${API_BASE}/api/${path.replace(/^\/?api\//, '')}`;
  }
  // In development without VITE_API_BASE, use relative path (Vite proxy)
  if (!import.meta.env.PROD) {
    return `/api/${path.replace(/^\/?api\//, '')}`;
  }
  // Fallback: use API_BASE
  return `${API_BASE}/api/${path.replace(/^\/?api\//, '')}`;
};

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
    return data;
  } catch (error) {
    console.error("Error fetching saved itinerary:", error);
    throw error;
  }
};


// Add this to client/vite-project/src/lib/api.ts

export const submitContactForm = async (contactData: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  inquiryType?: string;
}) => {
  try {
    const response = await fetch(getApiUrl('contact/submit'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit contact form');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Contact form error:', error);
    throw error;
  }
};

// Add to your existing api.ts file
// Replace these two functions (keep everything else exactly the same):

export const createBooking = async (bookingData: any) => {
  try {
    const response = await fetch(getApiUrl('bookings/create'), {
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
    const response = await fetch(getApiUrl('quotes/request'), {
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