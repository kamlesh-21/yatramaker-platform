// // client/vite-project/src/pages/ItineraryDetail.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  IndianRupee, 
  MapPin, 
  ArrowLeft, 
  Info,
  Calendar,
  Check,
  ChevronRight,
  Bookmark,
  Loader2,
  TrendingUp,
  Award,
  Phone,
  Mail,
  Share2,
  Compass,
  Package,
  Plus,
  Minus,
  Camera,
  ShieldCheck,
  Wifi,
  Navigation,
  BarChart3,
  Star,
  FileText,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { saveItinerary, getSavedItineraryById } from "@/lib/api";
import { CostBreakdown } from "@/components/CostBreakdown";
import { LoadingState } from "@/components/results/LoadingState";
import { ErrorState } from "@/components/results/ErrorState";
import { ModeIcon } from "@/components/results/ModeIcon";
import { ScoreMeter } from "@/components/results/ScoreMeter";
import { ItineraryDestinationCard } from "@/components/results/ItineraryDestinationCard";
import { TravelLegCard } from "@/components/results/TravelLegCard";
import { DayScheduleCard } from "@/components/results/DayScheduleCard";
import { BackButton } from "@/components/BackButton";
import type { MultiCityItinerary } from "../shared/schema";
import { BookingModal } from "@/components/BookingModal"; // Add this import
import { trackEvent } from "@/analytics/ga";
import { getDestinationAffiliateLink, trackAffiliateClick, AFFILIATE_DISCLOSURE, extractDestinationName } from "@/utils/affiliateLinks";

export default function ItineraryDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [itinerary, setItinerary] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [savedItineraryIds, setSavedItineraryIds] = useState<Set<string>>(new Set());

  // Helper to normalize database itinerary to component format
  const normalizeMultiCityItinerary = (dbItinerary: any) => {
    const multiCity = dbItinerary.multiCityRecommendation;
    
    if (multiCity.destinations && multiCity.legs) {
      return {
        ...multiCity,
        _id: dbItinerary._id,
        budget: dbItinerary.budget,
        userLocation: dbItinerary.userLocation,
        tripDuration: dbItinerary.tripDuration,
        travellers: dbItinerary.travellers,
        preferences: dbItinerary.preferences,
        notes: dbItinerary.notes,
        isFavorite: dbItinerary.isFavorite,
        name: multiCity.name || `Multi-City Trip (${dbItinerary._id})`,
        totalCost: multiCity.totalCost || {
          total: dbItinerary.budget,
          breakdown: {
            accommodation: 0,
            transportation: 0,
            activities: 0,
            meals: 0,
            misc: 0
          }
        }
      };
    }
    
    return {
      _id: dbItinerary._id,
      name: multiCity.name || `Multi-City Trip`,
      tagline: multiCity.tagline || '',
      totalDays: dbItinerary.tripDuration || 7,
      destinations: multiCity.destinations || 
                   (multiCity.recommendedItineraries?.[0]?.destinations) || 
                   [],
      legs: multiCity.legs || multiCity.travelLegs || [],
      dailySchedule: multiCity.dailySchedule || 
                    (multiCity.recommendedItineraries?.[0]?.dailySchedule) || 
                    [],
      explanations: multiCity.explanations || {},
      totalCost: {
        total: dbItinerary.budget || 0,
        breakdown: multiCity.totalCost?.breakdown || {
          accommodation: 0,
          transportation: 0,
          activities: 0,
          meals: 0,
          misc: 0
        }
      },
      scores: multiCity.scores || {
        comfortScore: 7,
        preferenceFit: 8,
        routeEfficiency: 0.8,
        budgetUtilization: 0.9,
        overallScore: 8.5
      },
      metadata: multiCity.metadata || {
        routeType: 'linear',
        pacing: 'balanced',
        optimizationGoal: 'cost',
        destinationNames: []
      },
      budget: dbItinerary.budget,
      userLocation: dbItinerary.userLocation,
      tripDuration: dbItinerary.tripDuration,
      travellers: dbItinerary.travellers,
      preferences: dbItinerary.preferences,
      notes: dbItinerary.notes,
      isFavorite: dbItinerary.isFavorite,
      _isSaved: true,
      _source: 'database'
    };
  };

  const loadItinerary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let itineraryData: any = null;
      const locationState = location.state as any;
      const fromSaved = locationState?.fromSaved;
      
      if (fromSaved && id) {
        try {
          const response = await getSavedItineraryById(id);
          
          if (response.multiCityRecommendation) {
            itineraryData = normalizeMultiCityItinerary(response);
          } else if (response.singleDestinationRecommendation) {
            navigate(`/destination/${id}`, {
              state: {
                itinerary: response,
                destination: response.singleDestinationRecommendation,
                fromSaved: true
              },
              replace: true
            });
            return;
          } else {
            itineraryData = response;
          }
          
          itineraryData._isSaved = true;
          itineraryData._source = 'database';
          
        } catch (dbError) {
          console.error('DB fetch failed:', dbError);
          if (locationState?.itinerary) {
            itineraryData = locationState.itinerary;
          }
        }
      } else if (locationState?.itinerary) {
        itineraryData = locationState.itinerary;
        itineraryData._isSaved = false;
        itineraryData._source = 'search';
      } else {
        const saved = sessionStorage.getItem("selectedItinerary");
        if (saved) {
          itineraryData = JSON.parse(saved);
          itineraryData._isSaved = false;
          itineraryData._source = 'search';
        }
      }
      
      if (itineraryData) {
        setItinerary(itineraryData);
        sessionStorage.setItem("selectedItinerary", JSON.stringify(itineraryData));
      } else {
        setError("No itinerary data found. Please go back and select an itinerary.");
      }
    } catch (err: any) {
      console.error('Error loading itinerary:', err);
      setError(err.message || "Failed to load itinerary");
    } finally {
      setIsLoading(false);
    }
  }, [location.state, id, navigate]);

  useEffect(() => {
    loadItinerary();
  }, [loadItinerary]);

  const handleGetQuote = () => {
    // ✅ TRACK QUOTE CLICK
    trackEvent("quote_clicked", {
      destination_name: `${destinations.length} destinations`,
      total_cost: totalCost,
      trip_type: "multi-city"
    });
    
    setShowBookingModal(true);
  };
  // Add this function before the handleSaveItinerary function
  const handleBookPackage = async (bookingData: any) => {
    setBookingInProgress(true);
    try {
      // Get user search data from sessionStorage
      const searchData = JSON.parse(
        sessionStorage.getItem("searchData") || 
        localStorage.getItem("lastSearchData") || 
        "{}"
      );
      
      // Get full itinerary data
      const fullItineraryData = {
        name: itinerary.name || title,
        destinations: destinations,
        legs: legs,
        dailySchedule: dailySchedule,
        explanations: explanations,
        totalCost: totalCost,
        totalDays: totalDays,
        metadata: metadata,
        scores: scores
      };
      
      // Send COMPLETE data to backend
      const bookingResponse = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // User contact info from modal
          contactInfo: bookingData.contactInfo,
          travelDates: bookingData.travelDates,
          notes: bookingData.notes,
          
          // User search preferences
          userSearchData: {
            budget: searchData.budget,
            userLocation: searchData.userLocation,
            tripDuration: searchData.tripDuration,
            travellers: searchData.travellers,
            preferences: searchData.preferences || [],
            accommodationPreference: searchData.accommodationPreference,
            includeMultiCityTrips: searchData.includeMultiCityTrips
          },
          
          // Full itinerary data
          itineraryData: fullItineraryData,
          
          // Package details
          packageDetails: {
            destination: `${destinations.length} destinations`,
            totalCost: totalCost,
            travelMode: 'multi-city',
            type: 'multi-city',
            itineraryName: itinerary.name || title
          },
          
          // Metadata
          type: "quote_request",
          status: "pending",
          source: "website",
          createdAt: new Date().toISOString(),
          
          // User info if logged in
          ...(user && {
            userId: user._id,
            userEmail: user.email
          })
        })
      });

      if (!bookingResponse.ok) {
        throw new Error('Quote request failed');
      }

      const result = await bookingResponse.json();
      
      setQuoteSubmitted(true);

          // ✅ TRACK SUCCESSFUL QUOTE SUBMISSION
      trackEvent("quote_submitted", {
        destination_name: `${destinations.length} destinations`,
        total_cost: totalCost,
        trip_type: "multi-city",
        user_email: bookingData.contactInfo.email,
        user_phone: bookingData.contactInfo.phone,
        travel_date: bookingData.travelDates.departureDate,
        is_logged_in: !!user
      });

      toast({
        title: "✅ Quote Request Received!",
        description: "We'll contact you within 24 hours.",
      });

      setShowBookingModal(false);

    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Request Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!user) {
      // ✅ TRACK LOGIN REQUIRED
      trackEvent("save_login_required", {
        destination_name: `${destinations.length} destinations`,
        total_cost: totalCost,
        trip_type: "multi-city"
      });

      toast({
        title: "Login Required",
        description: "Please log in to save itineraries",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsSaving(true);
    try {
      const response = await saveItinerary({
        itineraryId: itinerary.routeId || itinerary.id || `itinerary_${Date.now()}`,
        itineraryData: itinerary,
        searchData: JSON.parse(sessionStorage.getItem("searchData") || "{}"),
        savedAt: new Date().toISOString()
      });

      const isSuccess = 
        response.success === true || 
        response.message?.toLowerCase().includes("success") ||
        response.status === 200 ||
        response.status === 201;

      if (isSuccess) {
        // ✅ TRACK SUCCESSFUL SAVE
        trackEvent("itinerary_saved", {
          destination_name: `${destinations.length} destinations`,
          total_cost: totalCost,
          trip_type: "multi-city"
        });

        toast({
          title: "✨ Itinerary Saved!",
          description: "Your itinerary has been saved to your account.",
          variant: "default",
        });
      } else {
        toast({
          title: "Saved",
          description: "Itinerary saved successfully.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareItinerary = () => {
    const shareData = {
      title: itinerary.name || "My Travel Itinerary",
      text: `Check out this ${itinerary.totalDays || 0}-day trip itinerary!`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Itinerary link copied to clipboard.",
      });
    }
  };

  if (isLoading) return <LoadingState />;
  if (error || !itinerary) return <ErrorState message={error || "Itinerary not found"} onRetry={loadItinerary} />;

  const title = itinerary.tagline || itinerary.name || "Multi-City Itinerary";
  const totalCost = itinerary.totalCost?.base || itinerary.totalCost?.total || itinerary.totalCost || 0;
  const totalDays = itinerary.summary?.totalDays || itinerary.dailySchedule?.length || itinerary.totalDays || 1;
  const costPerDay = Math.round(totalCost / Math.max(1, totalDays));
  
  const destinations = itinerary.destinations || [];
  const legs = itinerary.legs || [];
  const dailySchedule = itinerary.dailySchedule || [];
  const explanations = itinerary.explanations || {};
  const dynamicPricing = itinerary.dynamicPricing || {};
  const scores = itinerary.scores || {};
  const metadata = itinerary.metadata || {};
  const hiddenGems = explanations.hiddenGems || [];
  const tradeoffs = explanations.tradeoffs || {};

  const image = itinerary.coverImage || 
               destinations[0]?.destination?.images?.[0]?.url || 
               "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=600&fit=crop";

    // NEW: Get affiliate link for first destination
  const firstDestObj = itinerary?.destinations?.[0]?.destination || { name: 'India' };
  const firstCityName = extractDestinationName(firstDestObj);

const affiliateLink = getDestinationAffiliateLink(
  firstDestObj,
  {
    duration: itinerary?.destinations?.[0]?.nights || totalDays || 3, // ← use totalDays
    travellers: itinerary.travellers || { adults: 2, children: 0 },
  },
  'multi-city'
);
  
  
               const getComfortLevel = () => {
    const comfort = scores.comfortScore || 5;
    if (comfort >= 8) return { level: "Luxury", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (comfort >= 6) return { level: "Comfort", color: "text-blue-600", bg: "bg-blue-50" };
    if (comfort >= 4) return { level: "Standard", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { level: "Budget", color: "text-orange-600", bg: "bg-orange-50" };
  };

  const comfort = getComfortLevel();

  return (
    <div className="min-h-screen bg-background pt-16">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <section className="mb-8">
          <div className="relative h-80 rounded-2xl overflow-hidden mb-6">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{title}</h1>
              <p className="text-white/90 text-lg mb-4">
                {destinations.length} destinations • {totalDays} days • {legs.length} journeys
              </p>
              <div className="flex flex-wrap gap-2">
                {metadata.preferenceTags?.map((tag: string, i: number) => (
                  <Badge key={i} className="bg-white/20 backdrop-blur-sm text-white">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-primary mb-1">{destinations.length}</div>
              <div className="text-sm text-muted-foreground">Destinations</div>
              <div className="text-xs text-muted-foreground mt-1">
                {metadata.destinationNames?.join(' → ')}
              </div>
            </Card>
            <Card className="p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-primary mb-1">{totalDays}</div>
              <div className="text-sm text-muted-foreground">Days</div>
              <div className="text-xs text-muted-foreground mt-1">
                {metadata.pacing || 'Balanced'} pacing
              </div>
            </Card>
            <Card className="p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-primary mb-1">{legs.length}</div>
              <div className="text-sm text-muted-foreground">Travel Legs</div>
              <div className="text-xs text-muted-foreground mt-1">
                {metadata.routeType || 'Linear'} route
              </div>
            </Card>
            <Card className="p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-primary mb-1">
                ₹{costPerDay.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Per Day</div>
              <div className="text-xs text-muted-foreground mt-1">
                Total: ₹{totalCost.toLocaleString()}
              </div>
            </Card>
          </div>
        </section>

        {/* Main Content with Tabs */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="destinations" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Destinations</span>
                </TabsTrigger>
                <TabsTrigger value="travel" className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  <span className="hidden sm:inline">Travel</span>
                </TabsTrigger>
                <TabsTrigger value="daily" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Daily Plan</span>
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Insights</span>
                </TabsTrigger>
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-8 mt-6">
                {explanations.whyThisRoute && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Why This Route?
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {explanations.whyThisRoute.split('\n\n').map((para: string, idx: number) => (
                        <p key={idx} className="text-muted-foreground leading-relaxed mb-4">
                          {para}
                        </p>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Route Visualization */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    Route Map
                  </h3>
                  
                  <div className="flex items-center overflow-x-auto pb-4 scrollbar-thin">
                    {legs.map((leg: any, i: number) => (
                      <React.Fragment key={i}>
                        <div className="flex flex-col items-center min-w-[140px] p-4 bg-primary/5 rounded-xl">
                          <MapPin className="h-6 w-6 text-primary mb-2" />
                          <div className="text-sm font-semibold">{leg.from}</div>
                          {i === 0 && (
                            <div className="text-xs text-muted-foreground mt-1">Start</div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center px-4">
                          <div className="w-12 h-12 rounded-full bg-card border flex items-center justify-center mb-2">
                            <ModeIcon mode={leg.mode} size="lg" />
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{leg.distance} km</div>
                            <div className="text-xs text-muted-foreground">{leg.estimatedTimeHours?.toFixed(1)}h</div>
                            <div className="font-bold mt-1">₹{leg.cost?.toLocaleString()}</div>
                          </div>
                        </div>
                        
                        {i < legs.length - 1 && (
                          <ChevronRight className="h-6 w-6 text-muted-foreground mx-2" />
                        )}
                      </React.Fragment>
                    ))}
                    
                    <div className="flex flex-col items-center min-w-[140px] p-4 bg-primary/5 rounded-xl ml-4">
                      <MapPin className="h-6 w-6 text-primary mb-2" />
                      <div className="text-sm font-semibold">
                        {legs[legs.length - 1]?.to || "End"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Final Stop</div>
                    </div>
                  </div>
                </Card>

                {/* Scores Grid */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Route Scores
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ScoreMeter value={scores.preferenceFit || 0} label="Preference Fit" />
                    <ScoreMeter value={scores.comfortScore || 0} label="Comfort Level" />
                    <ScoreMeter value={(scores.routeEfficiency || 0) * 10} label="Route Efficiency" max={10} />
                    <ScoreMeter value={(scores.budgetUtilization || 0) * 10} label="Budget Utilization" max={10} />
                  </div>
                  
                  {scores.overallScore && (
                    <div className="mt-8 p-4 bg-primary/5 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Overall Score</div>
                          <div className="text-3xl font-bold">{scores.overallScore.toFixed(1)}/10</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Rank</div>
                          <div className="text-3xl font-bold">#{itinerary.rank}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Hidden Gems */}
                {hiddenGems.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Camera className="h-5 w-5 text-primary" />
                      Hidden Gems
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {hiddenGems.map((gem: any, idx: number) => (
                        <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Camera className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{gem.gem}</div>
                              <div className="text-sm text-muted-foreground">{gem.destination}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* DESTINATIONS TAB */}
              <TabsContent value="destinations" className="space-y-6 mt-6">
                {destinations.map((destination: any, index: number) => (
                  <ItineraryDestinationCard
                    key={destination.destination?.id || index}
                    destination={destination}
                    index={index}
                    total={destinations.length}
                  />
                ))}
              </TabsContent>

              {/* TRAVEL TAB */}
              <TabsContent value="travel" className="space-y-6 mt-6">
                <div className="space-y-6">
                  {legs.map((leg: any, index: number) => (
                    <TravelLegCard
                      key={index}
                      leg={leg}
                      index={index}
                      total={legs.length}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* DAILY PLAN TAB */}
              <TabsContent value="daily" className="space-y-6 mt-6">
                <div className="space-y-6">
                  {dailySchedule.map((day: any) => (
                    <DayScheduleCard key={day.day} day={day} />
                  ))}
                </div>
              </TabsContent>

              {/* INSIGHTS TAB */}
              <TabsContent value="insights" className="space-y-8 mt-6">
                {explanations.budgetBreakdown && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Budget Breakdown
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {explanations.budgetBreakdown.split('\n\n').map((para: string, idx: number) => (
                        <div key={idx} className="mb-4 last:mb-0">
                          {para.split('\n').map((line: string, lineIdx: number) => (
                            <p key={lineIdx} className={`${line.startsWith('**') ? 'font-bold' : 'text-muted-foreground'} mb-1`}>
                              {line.replace(/\*\*/g, '')}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {dynamicPricing && Object.keys(dynamicPricing).length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Customization Options
                    </h3>
                    
                    <div className="space-y-4">
                      {dynamicPricing.ifAddOneDay && (
                        <div className={`p-4 rounded-lg border-2 ${selectedUpgrade === 'add-day' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Plus className="h-4 w-4 text-green-600" />
                                <h4 className="font-semibold">Add Extra Day in {dynamicPricing.ifAddOneDay.bestDestination}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {dynamicPricing.ifAddOneDay.reasoning}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold">+₹{dynamicPricing.ifAddOneDay.costIncrease?.toLocaleString()}</div>
                              <Button 
                                size="sm" 
                                variant={selectedUpgrade === 'add-day' ? 'default' : 'outline'}
                                onClick={() => setSelectedUpgrade('add-day')}
                              >
                                {selectedUpgrade === 'add-day' ? 'Selected' : 'Select'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {dynamicPricing.ifRemoveOneDestination && (
                        <div className={`p-4 rounded-lg border-2 ${selectedUpgrade === 'remove-dest' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Minus className="h-4 w-4 text-blue-600" />
                                <h4 className="font-semibold">Remove {dynamicPricing.ifRemoveOneDestination.recommend}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {dynamicPricing.ifRemoveOneDestination.reasoning}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-green-600">
                                -₹{dynamicPricing.ifRemoveOneDestination.costDecrease?.toLocaleString()}
                              </div>
                              <Button 
                                size="sm" 
                                variant={selectedUpgrade === 'remove-dest' ? 'default' : 'outline'}
                                onClick={() => setSelectedUpgrade('remove-dest')}
                              >
                                {selectedUpgrade === 'remove-dest' ? 'Selected' : 'Select'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {dynamicPricing.ifUpgradeAccommodation?.toLuxury && (
                        <div className={`p-4 rounded-lg border-2 ${selectedUpgrade === 'upgrade' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                                <h4 className="font-semibold">Upgrade to Luxury Accommodation</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {dynamicPricing.ifUpgradeAccommodation.toLuxury.perks}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold">+₹{dynamicPricing.ifUpgradeAccommodation.toLuxury.costIncrease?.toLocaleString()}</div>
                              <Button 
                                size="sm" 
                                variant={selectedUpgrade === 'upgrade' ? 'default' : 'outline'}
                                onClick={() => setSelectedUpgrade('upgrade')}
                              >
                                {selectedUpgrade === 'upgrade' ? 'Selected' : 'Select'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {tradeoffs && Object.keys(tradeoffs).length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Compass className="h-5 w-5 text-primary" />
                      Route Comparisons
                    </h3>
                    <div className="space-y-3">
                      {Object.values(tradeoffs).map((tradeoff: any, idx: number) => (
                        <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                          <div className="font-medium mb-2">{tradeoff.routeName}</div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Cost Difference</div>
                              <div className={`font-bold ${tradeoff.costDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tradeoff.costDifference > 0 ? '+' : ''}₹{Math.abs(tradeoff.costDifference)}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Time Difference</div>
                              <div className={`font-bold ${tradeoff.timeDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tradeoff.timeDifference > 0 ? '+' : ''}{Math.abs(tradeoff.timeDifference)}h
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Comfort Difference</div>
                              <div className={`font-bold ${tradeoff.comfortDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tradeoff.comfortDifference > 0 ? '+' : ''}{Math.abs(tradeoff.comfortDifference)}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{tradeoff.summary}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar (1/3 width) */}
          <div className="space-y-6">
            {/* Save & Actions Card */}
            <Card className="p-6">
              <div className="space-y-6">
                {/* Total Cost */}
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Total Trip Cost</div>
                  <div className="text-4xl font-bold flex items-center justify-center gap-1">
                    <IndianRupee className="h-8 w-8" />
                    {totalCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ₹{costPerDay.toLocaleString()} per day
                  </div>
                </div>

                <Separator />

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-medium">{totalDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Destinations</span>
                    <span className="font-medium">{destinations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Travel Legs</span>
                    <span className="font-medium">{legs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Distance</span>
                    <span className="font-medium">{itinerary.summary?.totalDistance?.toLocaleString()} km</span>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-4">
                  {/* Primary: Get Detailed Quote */}
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                    onClick={handleGetQuote}
                    disabled={bookingInProgress || quoteSubmitted}
                  >
                    {quoteSubmitted ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Quote Requested
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Get Detailed Quote
                      </>
                    )}
                  </Button>

                  {/* Secondary: Book Hotels - first destination */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <a
                    href={affiliateLink}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={() => {
                      trackAffiliateClick(firstCityName || 'Multi-City', 'detail', 'multi-city');
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Book Hotels in {firstCityName}
                  </a>
                </Button>

                  {/* Tertiary: Save + WhatsApp - 2-col grid, icons only */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="w-full border-primary/30 text-primary hover:bg-primary/5"
                      onClick={handleSaveItinerary}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Bookmark className="h-5 w-5" />
                            save
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-green-300 text-green-700 hover:bg-green-50"
                      onClick={() => {
                        const message = `Hi! Interested in this ${destinations.length}-destination itinerary for ₹${totalCost.toLocaleString()}. Can you send detailed quote?`;
                        window.open(`https://wa.me/919646562880?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                    >
                      <MessageSquare className="h-5 w-5" />
                      whatsapp
                    </Button>
                  </div>

                  {/* Disclosure */}
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {AFFILIATE_DISCLOSURE}
                  </p>
                </div>
                {/* Trust Badges */}
                <div className="pt-4 border-t">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Secure Booking
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Check className="h-3 w-3" />
                      Best Price
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Wifi className="h-3 w-3" />
                      Free Support
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Cost Breakdown Card */}
            {itinerary.totalCost?.breakdown && (
              <Card className="p-6">
                <CostBreakdown 
                  breakdown={itinerary.totalCost.breakdown}
                  total={totalCost}
                  travelDetails={legs.map((leg: any) => ({
                    mode: leg.mode,
                    cost: leg.cost,
                    dist: leg.distance
                  }))}
                />
              </Card>
            )}

            {/* Route Metadata */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Route Details
              </h3>
              <div className="space-y-3 text-sm">
                {metadata.routeType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route Type</span>
                    <span className="font-medium capitalize">{metadata.routeType}</span>
                  </div>
                )}
                {metadata.pacing && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pacing</span>
                    <span className="font-medium capitalize">{metadata.pacing}</span>
                  </div>
                )}
                {metadata.optimizationGoal && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Optimized For</span>
                    <span className="font-medium capitalize">{metadata.optimizationGoal}</span>
                  </div>
                )}
                {metadata.regions?.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Regions</span>
                    <span className="font-medium">{metadata.regions.join(', ')}</span>
                  </div>
                )}
                {metadata.states?.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">States/Countries</span>
                    <span className="font-medium">{metadata.states.join(', ')}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Need Help Card - kept as the single prominent CTA */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Need Help Customizing This Trip?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Our travel experts can adjust dates, budget, preferences, or build a fully custom package.
                </p>
                <Button 
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                  onClick={() => navigate("/contact")}
                >
                  <Mail className="h-4 w-4" />
                  Contact Expert
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer CTA - simplified: removed contact/quote mention */}
        {/* <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl text-center">
          <h3 className="text-2xl font-bold mb-3">Ready to embark on this journey?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Save this itinerary or share it with your travel companions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="gap-2" onClick={handleSaveItinerary}>
              <Bookmark className="h-4 w-4" />
              Save for Later
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={handleShareItinerary}>
              <Share2 className="h-4 w-4" />
              Share Itinerary
            </Button>
          </div>
        </div> */}
      </main>

      {/* Page Footer - removed contact CTA (sidebar already covers it) */}
      <footer className="border-t mt-16 py-8 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            All prices are estimates based on current rates. 
            Routes optimized for your preferences and budget.
          </p>
          <p className="mt-2">
            Have questions? <button 
              className="underline text-primary hover:text-primary/80 transition-colors"
              onClick={() => navigate("/contact")}
            >
              Contact support
            </button>
          </p>
        </div>
      </footer>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleBookPackage}
        packageDetails={{
          destination: `${destinations.length} destinations`,
          totalCost: totalCost,
          breakdown: itinerary.totalCost?.breakdown || {},
          travelMode: 'multi-city',
          // itineraryName: itinerary.name || title
        }}
        userData={user ?? undefined}
      />
    </div>
  );
}