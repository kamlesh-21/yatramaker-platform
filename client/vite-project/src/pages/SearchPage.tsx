// client/vite-project/src/pages/SearchPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchForm } from "@/components/SearchForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import type { SearchRequest } from "@/shared/schema";
import { trackEvent } from "@/analytics/ga";


export default function SearchPage() {
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState<Partial<SearchRequest>>({});

  // Load last search from sessionStorage or localStorage
  useEffect(() => {
    const lastSearch = sessionStorage.getItem("searchData");
    const fallback = localStorage.getItem("lastSearchData");
    try {
      const parsed = JSON.parse(lastSearch || fallback || "{}");
      if (parsed.location || parsed.userLocation?.name) {
        setInitialValues(parsed);
      }
    } catch (e) {
      console.warn("Failed to parse saved search data");
    }
  }, []);

  const handleSubmit = (data: SearchRequest) => {

    // ✅ TRACK SEARCH (SEARCH PAGE)
    trackEvent("search_submit", {
      trip_type: data.tripType,
      origin_city: data.userLocation.name,
      budget: data.budget,
      days: data.tripDuration,
      travellers: data.travellers.adults + data.travellers.children
    });

    sessionStorage.setItem("searchData", JSON.stringify(data));
    localStorage.setItem("lastSearchData", JSON.stringify(data));
    navigate("/results");
  };

  const handleReset = () => {
    sessionStorage.removeItem("searchData");
    setInitialValues({});
  };

  return (
    <div className="min-h-screen bg-background pt-18 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back to Home */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <Card className="border rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Plan Your Perfect Trip</h1>
              <p className="text-muted-foreground">
                Full control over budget, duration, preferences, and more.
              </p>
            </div>

            <SearchForm
              initialValues={initialValues}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
          </div>

          {/* Help / Tip */}
          <div className="p-6 bg-muted/30 border-t">
            <p className="text-sm text-muted-foreground text-center">
              ⚡ Prefer a quick AI-powered search? Try our{" "}
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="p-0 h-auto font-medium inline"
              >
                one-click planner
              </Button>
              .
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}