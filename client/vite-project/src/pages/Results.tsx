// client/vite-project/src/pages/Results.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import DestinationCard from "@/components/DestinationCard";
import MultiCityCard from "@/components/MultiCityCard";
import { searchDestinations, saveItinerary } from "@/lib/api";
import type { SearchRequest, SearchResponse } from "../shared/schema";
import { Loader2, AlertCircle, MapPin, Calendar, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/analytics/ga";

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchData, setSearchData] = useState<SearchRequest | null>(null);
  const [page, setPage] = useState<number>(1);
  const [savedItineraries, setSavedItineraries] = useState<Set<string>>(new Set());

  // Load saved itineraries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedItineraries");
    if (saved) {
      try {
        setSavedItineraries(new Set(JSON.parse(saved)));
      } catch (err) {
        console.error("Failed to parse saved itineraries:", err);
      }
    }
  }, []);

  // Save itineraries to localStorage
  const updateSavedItineraries = useCallback((itineraryId: string) => {
    const updated = new Set(savedItineraries);
    updated.add(itineraryId);
    setSavedItineraries(updated);
    localStorage.setItem("savedItineraries", JSON.stringify(Array.from(updated)));
  }, [savedItineraries]);


  // Handle back to results with proper state
  const handleBackToResults = useCallback(() => {
    if (location.state?.fromSearch) {
      navigate(-1);
    } else {
      navigate("/", { state: { fromResults: true } });
    }
  }, [navigate, location]);

  useEffect(() => {
    const s = sessionStorage.getItem("searchData");
    if (s) {
      try {
        const parsed = JSON.parse(s);
        setSearchData(parsed);
        // Also store in localStorage for persistence
        localStorage.setItem("lastSearchData", s);
      } catch (err) {
        console.error("Failed to parse search data:", err);
      }
    } else {
      // Try to get from localStorage as fallback
      const lastSearch = localStorage.getItem("lastSearchData");
      if (lastSearch) {
        try {
          setSearchData(JSON.parse(lastSearch));
        } catch (err) {
          console.error("Failed to parse last search data:", err);
        }
      }
    }
  }, []);

  // Save itinerary function
  const handleSaveItinerary = async (itinerary: any) => {
    try {
      const itineraryId = itinerary.routeId || itinerary.id || `itinerary_${Date.now()}`;
      
      // Save to backend
      const response = await saveItinerary({
        itineraryId,
        itineraryData: itinerary,
        searchData: searchData,
        savedAt: new Date().toISOString()
      });

      if (response.success) {
        // Update local state
        updateSavedItineraries(itineraryId);
        
        toast({
          title: "Itinerary Saved",
          description: "Your itinerary has been saved successfully.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to save itinerary:", error);
      toast({
        title: "Error",
        description: "Failed to save itinerary. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Query: includes page so react-query refetches when page changes
  const { data, isLoading, error } = useQuery<SearchResponse, Error>({
    queryKey: ["/api/travelData/recommendations", searchData, page],
    queryFn: async (): Promise<SearchResponse> => {
      if (!searchData) {
        throw new Error("No search data available");
      }

      const payload: Partial<SearchRequest> = {
        ...searchData,
        page,
        limit: searchData.limit ?? 20,
      };

      const response = await searchDestinations(payload as SearchRequest) as SearchResponse;
           
      return response;
    },
    enabled: !!searchData,
    retry: 1,
  });

  const result = data;

  useEffect(() => {
    if (result && result.success) {
      const resultCount = isSingleDestination ? singleResults.length : multiRoutes.length;
      
      // ✅ TRACK RESULTS VIEWED
      trackEvent("results_viewed", {
        result_count: resultCount,
        trip_type: searchData?.tripType || "unknown",
        budget: searchData?.budget || 0
      });
    }
  }, [result]); // Only trigger when result changes

  // Extract data based on trip type
  const isSingleDestination = result?.tripType === "single-destination";
  const isMultiCity = result?.tripType === "multi-city";

  const singleResults = isSingleDestination
    ? (result?.results || result?.singleDestinationResults || [])
    : [];

  // Enhanced multiRoutes extraction with deduplication
  const multiRoutes = React.useMemo(() => {
    if (!isMultiCity || !result) return [];

    const routes = result.routes || 
                  result.multiCityResults?.recommendedItineraries || 
                  result.multiCityResults?.routes || 
                  [];
 
    // Remove duplicate routes (same destinations in same order)
    const seen = new Set();
    const uniqueRoutes = [];

    for (const route of routes) {
      // Create a unique signature based on destination names and order
      const signature = route.destinations
        ?.map((d: any) => d.destination?.name || d.destination)
        ?.join('->') || route.name;
      
      if (!seen.has(signature)) {
        seen.add(signature);
        uniqueRoutes.push(route);
      }
    }
  
    // Sort by rank or overall score
    return uniqueRoutes.sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }, [result, isMultiCity]);

  const pagination = result?.pagination || null;

  // Loading state
  if (!searchData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Search Data</h2>
          <p className="text-muted-foreground mb-6">
            Please start a new search to see results.
          </p>
          <button 
            className="btn btn-primary px-6 py-2 rounded-lg"
            onClick={() => navigate("/")}
          >
            Start New Search
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Finding Your Perfect Trip</h2>
          <p className="text-muted-foreground">
            {searchData.tripType === "multi-city" 
              ? "Analyzing routes, calculating costs, building itineraries..." 
              : "Searching destinations, comparing prices..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state with suggestions
  if (error || !result || !result.success) {
    const errorMessage = error?.message || result?.error?.message || "Failed to load results";
    const suggestions = result?.error?.suggestions || [];

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-2xl w-full bg-card border rounded-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-destructive">
            {result?.error?.code || "Error"}
          </h2>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          
          {suggestions.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>💡</span> Suggestions:
              </h3>
              <ul className="space-y-2 text-sm">
                {suggestions.map((suggestion: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex gap-3 justify-center">
            <button 
              className="btn btn-outline px-6 py-2 rounded-lg"
              onClick={() => navigate("/")}
            >
              Modify Search
            </button>
            <button 
              className="btn btn-primary px-6 py-2 rounded-lg"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty results state
  if (
    (isSingleDestination && singleResults.length === 0) ||
    (isMultiCity && multiRoutes.length === 0)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Results Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find any destinations matching your criteria. 
            Try adjusting your budget, duration, or preferences.
          </p>
          <button 
            className="btn btn-primary px-6 py-2 rounded-lg"
            onClick={() => navigate("/")}
          >
            Modify Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              className="btn btn-ghost flex items-center gap-2"
              onClick={handleBackToResults}
            >
              <span>←</span>
              <span>Back to Results</span>
            </button>

            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{searchData.userLocation?.name || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{searchData.tripDuration} days</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {searchData.travellers?.adults || 1}A
                  {searchData.travellers?.children ? ` ${searchData.travellers.children}C` : ""}
                </span>
              </div>
              <div className="font-semibold text-primary">
                ₹{searchData.budget?.toLocaleString()}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {pagination?.totalResults || 
               (isSingleDestination ? singleResults.length : multiRoutes.length)} results
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {isMultiCity ? "Multi-City Itineraries" : "Recommended Destinations"}
              </h1>
              <p className="text-muted-foreground text-lg">
                {isMultiCity 
                  ? `${multiRoutes.length} personalized routes covering ${searchData.preferences?.join(", ")}`
                  : `${singleResults.length} destinations matching your preferences: ${searchData.preferences?.join(", ")}`
                }
              </p>
            </div>
            {isMultiCity && (
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  const allItineraries = JSON.stringify(multiRoutes);
                  const blob = new Blob([allItineraries], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `itineraries-${Date.now()}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4" />
                Export All
              </Button>
            )}
          </div>
          
          {result.metadata && (
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Generated: {new Date(result.metadata.generatedAt).toLocaleTimeString()}</span>
              <span>•</span>
              <span>Computed in: {result.metadata.computationTime}</span>
              <span>•</span>
              <span>Evaluated: {result.metadata.destinationsEvaluated} destinations</span>
              {result.metadata.routesGenerated && (
                <>
                  <span>•</span>
                  <span>Routes analyzed: {result.metadata.routesGenerated}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Multi-City Results */}
        {isMultiCity && multiRoutes.length > 0 && (
          <section>
            <div className="grid gap-6">
              {multiRoutes.map((route: any, idx: number) => {
                const itineraryId = route.routeId || route.id || idx;
                const isSaved = savedItineraries.has(itineraryId.toString());
                
                return (
                  <div key={itineraryId} className="relative">
                    <MultiCityCard
                      itinerary={route}
                      rank={route.rank || idx + 1}
                      tripDuration={searchData.tripDuration}
                      onView={() => {
                      // ✅ TRACK RESULT CLICK
                        trackEvent("result_clicked", {
                          destination_name: route.name || `${route.destinations?.length || 0} destinations`,
                          position: idx + 1,
                          total_cost: route.totalCost?.total || route.totalCost?.base || 0,
                          trip_type: "multi-city"
                        });
                        sessionStorage.setItem("selectedItinerary", JSON.stringify(route));
                        localStorage.setItem("lastViewedItinerary", JSON.stringify(route));
                        navigate(`/itinerary/${itineraryId}`, { 
                          state: { 
                            itinerary: route,
                            fromResults: true 
                          } 
                        });
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-4 right-4 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveItinerary(route);
                      }}
                    >
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Single-Destination Results */}
        {isSingleDestination && singleResults.length > 0 && (
          <section>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {singleResults.map((dest: any, idx: number) => {
                const id = dest.destination?.destination_id || dest.destination?.id || idx;
                return (
                  <DestinationCard
                    key={id}
                    data={dest}
                    onClick={() => {
                      // ✅ TRACK RESULT CLICK
                      trackEvent("result_clicked", {
                        destination_name: dest.destination?.name || "Unknown",
                        position: idx + 1,
                        total_cost: dest.totalCost?.base || dest.totalCost?.total || 0,
                        trip_type: "single-destination"
                      });
                      sessionStorage.setItem("selectedDestination", JSON.stringify(dest));
                      localStorage.setItem("lastViewedDestination", JSON.stringify(dest));
                      navigate(`/destination/${id}`, { 
                        state: { 
                          destination: dest,
                          fromResults: true 
                        } 
                      });
                    }}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              className="btn btn-outline px-6 py-2 rounded-lg disabled:opacity-50"
              disabled={!pagination.hasPrevPage}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              ← Previous
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Page</span>
              <span className="font-semibold">{pagination.currentPage}</span>
              <span className="text-sm text-muted-foreground">of</span>
              <span className="font-semibold">{pagination.totalPages}</span>
            </div>
            
            <button
              className="btn btn-outline px-6 py-2 rounded-lg disabled:opacity-50"
              disabled={!pagination.hasNextPage}
              onClick={() => {
                setPage((p) => p + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Alternative suggestions for multi-city */}
        {isMultiCity && result.alternatives && (
          <section className="mt-12 p-6 bg-muted/30 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">💡 Alternative Suggestions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {result.alternatives.if_extend_duration?.map((alt: any, idx: number) => (
                <div key={idx} className="p-4 bg-card rounded border">
                  <p className="font-medium mb-1">{alt.addDestination}</p>
                  <p className="text-sm text-muted-foreground">
                    Add {alt.daysNeeded} days • +₹{alt.costIncrease?.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{alt.reasoning}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t mt-16 py-8 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            All prices are estimates based on current rates. 
            {isMultiCity && " Routes optimized for your preferences and budget."}
          </p>
          <p className="mt-2">
            Need help? <button className="underline">Contact support</button>
          </p>
        </div>
      </footer>
    </div>
  );
}