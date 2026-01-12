// client/vite-project/src/pages/DestinationDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { TravelOptionCard } from "@/components/TravelOptionCard";
import { CostBreakdown } from "@/components/CostBreakdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Star, 
  Plane, 
  Train, 
  Bus, 
  Car,
  Bookmark,
  Loader2,
  Check,
  MessageSquare,
  ShieldCheck,
  Wifi,
  FileText
} from "lucide-react";
import type { SingleDestinationResult } from "../shared/schema";
import keralaImg from "@assets/generated_images/Kerala_backwaters_with_houseboat_c52667af.png";
import { saveItinerary } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getSavedItineraryById } from "@/lib/api";
import { AccommodationSection } from "@/components/results/AccommodationSection";
import { LocalExpensesSection } from "@/components/results/LocalExpensesSection";
import { ActivitiesSection } from "@/components/results/ActivitiesSection";
import { DestinationGuideSection } from "@/components/results/DestinationGuideSection";
import { TravelOptionsSection } from "@/components/results/TravelOptionsSection";
import { BackButton } from "@/components/BackButton";
import { BookingModal } from "@/components/BookingModal"; // Add this import
import { trackEvent } from "@/analytics/ga";


// Import date-fns for formatting if needed
import { format } from "date-fns";

interface TravelOption {
  mode: string;
  totalCost: number;
  totalDistance: number;
  totalTimeHours: number;
  comfortScore: number;
  whySuitable?: string;
  breakdown?: {
    userHubName?: string;
    destHubName?: string;
    userToUserHubKm?: number;
    userCabCost?: number;
    mainLegCost?: number;
    userHubToDestHubKm?: number;
    destHubToDestKm?: number;
    destCabCost?: number;
    directDriveKm?: number;
  };
  journeyDescription?: string;
}

interface Variant {
  label?: string;
  totalCost?: { base?: number; breakdown?: Record<string, number> };
  travel?: TravelOption;
  accommodation?: { cost?: number; numberOfNights?: number; accommodationType?: string };
  localExpenses?: { total?: number };
  activities?: any[];
}

interface ActivityType {
  name: string;
  type: string;
  duration: number;
  cost: number;
  description?: string;
}

export default function DestinationDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<SingleDestinationResult | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<"cheapest" | "fastest" | "comfortable">("cheapest");
  const [selectedTravelMode, setSelectedTravelMode] = useState<string>('priority');
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Add booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [savedItineraryIds, setSavedItineraryIds] = useState<Set<string>>(new Set());

  // Load saved itineraries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedItineraryIds");
    if (saved) {
      try {
        setSavedItineraryIds(new Set(JSON.parse(saved)));
      } catch (err) {
        console.error("Failed to parse saved itineraries:", err);
      }
    }
  }, []);

  useEffect(() => {
    const loadDestination = async () => {
      const state = location.state as {
        fromSaved?: boolean;
        destination?: any;
        itinerary?: any;
      };

      // CASE 1: Coming from saved (My Itineraries or Dashboard)
      if (state?.fromSaved && id) {
        try {
          const response = await getSavedItineraryById(id);

          if (response.singleDestinationRecommendation) {
            const raw = response.singleDestinationRecommendation;

            // FULL NORMALIZATION — matches fresh search result shape
            const normalized: SingleDestinationResult = {
              destination: {
                name: typeof raw.name === 'string'
                  ? raw.name
                  : Array.isArray(raw.name)
                    ? raw.name[0]
                    : raw.destination?.name || 'Amazing Destination',
                location: raw.destination?.location || raw.location || { state: '', region: '' },
                type: raw.destination?.type || raw.type || [],
              },
              variants: raw.variants || [],
              travelOptions: raw.travelOptions || [],
              activities: raw.activities || [],
              accommodationCost: raw.accommodationCost || raw.accommodation || { cost: 0 },
              localExpenses: raw.localExpenses || { transportation: 0, meals: 0, attractions: 0 },
              totalCost: raw.totalCost || { base: response.budget || 0 },
              metadata: raw.metadata || {},
            };

            setDestination(normalized);
            setSelectedActivities([]);
            sessionStorage.setItem("selectedDestination", JSON.stringify(normalized));
            return;
          } else {
            // Wrong page — redirect to multi-city
            navigate(`/itinerary/${id}`, { replace: true });
            return;
          }
        } catch (err) {
          console.error("Failed to load saved destination:", err);
          // Fallback to sessionStorage if fetch fails
        }
      }

      // CASE 2: Fresh from search results
      const saved = sessionStorage.getItem("selectedDestination");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setDestination(parsed);
          setSelectedActivities([]);
        } catch (error) {
          console.error("Error parsing saved destination:", error);
        }
      }
    };

    loadDestination();
  }, [id, location.state, navigate]);

  const handleBackToResults = () => {
    navigate("/results");
  };

  if (!destination) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <BackButton/>
      </div>
    );
  }

  const variants = destination.variants ?? [];
  const travelOptions = (destination as any).travelOptions ?? [];
  const activities = (destination as any).activities ?? [];
  const accommodation = (destination as any).accommodationCost || {
    accommodationType: "Hotel",
    numberOfRooms: 1,
    numberOfNights: 3,
    cost: 0,
    adults: 1,
    children: 0,
    averageRate: 0,
    starRating: 3
  };
  
  const localExpenses = (destination as any).localExpenses || {
    transportation: 0,
    meals: 0,
    attractions: 0
  };

  // Ensure travel.mode is always a string
  const fixTravelOption = (travel: any): TravelOption => ({
    mode: travel?.mode ?? "driving",
    totalCost: travel?.totalCost ?? 0,
    totalDistance: travel?.totalDistance ?? 0,
    totalTimeHours: travel?.totalTimeHours ?? 0,
    comfortScore: travel?.comfortScore ?? 5,
    whySuitable: travel?.whySuitable,
    breakdown: travel?.breakdown,
    journeyDescription: travel?.journeyDescription ?? ""
  });

  const activeVariant: Variant = (() => {
    const variant = variants.find((v: any) => v.label === selectedLabel) || variants[0];
    if (variant) {
      return {
        ...variant,
        travel: variant.travel ? fixTravelOption(variant.travel) : {
          mode: "driving",
          totalDistance: 0,
          totalTimeHours: 0,
          totalCost: 0,
          comfortScore: 5,
          journeyDescription: "No travel options available"
        }
      };
    }
    return {
      label: "cheapest",
      travel: { 
        mode: "driving", 
        totalDistance: 0, 
        totalTimeHours: 0, 
        totalCost: 0, 
        comfortScore: 5, 
        journeyDescription: "No travel options available" 
      },
      totalCost: { base: 0, breakdown: {} }
    };
  })();

  // Get current travel option
  const getCurrentTravelOption = (): TravelOption => {
    if (selectedTravelMode === 'priority') {
      return activeVariant?.travel as TravelOption || {
        mode: 'driving',
        totalCost: 0,
        totalDistance: 0,
        totalTimeHours: 0,
        comfortScore: 5,
        breakdown: {},
        journeyDescription: ''
      };
    }

    const option = travelOptions.find((opt: any) => 
      (opt.mode || "").toLowerCase() === String(selectedTravelMode).toLowerCase()
    );
    
    if (option) {
      return {
        mode: option.mode,
        totalCost: option.cost ?? option.totalCost ?? 0,
        totalDistance: option.distance ?? option.totalDistance ?? 0,
        totalTimeHours: option.estimatedTimeHours ?? option.totalTimeHours ?? 0,
        comfortScore: option.comfortScore ?? 5,
        whySuitable: option.whySuitable,
        breakdown: option.breakdown,
        journeyDescription: buildJourneyDescriptionFromOption(option)
      };
    }

    return activeVariant?.travel as TravelOption || {
      mode: 'driving',
      totalCost: 0,
      totalDistance: 0,
      totalTimeHours: 0,
      comfortScore: 5,
      breakdown: {},
      journeyDescription: ''
    };
  };

  const currentTravel = getCurrentTravelOption();

  // // Calculate totals safely
  // const calculateTotalCost = () => {
  //   const baseBreakdown = activeVariant?.totalCost?.breakdown || {};
  //   const travelCost = currentTravel?.totalCost ?? baseBreakdown.travel ?? 0;
  //   const accommodationCost = accommodation.cost ?? baseBreakdown.accommodation ?? 0;
    
  //   const localExpensesSum = (localExpenses.transportation || 0) + (localExpenses.meals || 0) + (localExpenses.attractions || 0);
  //   const localExpensesCost = localExpensesSum > 0 ? localExpensesSum : (baseBreakdown.localExpenses ?? 0);
    
  //   const activitiesCost = selectedActivities.reduce((sum, act) => sum + (act.cost || 0), 0);
    
  //   return {
  //     travel: travelCost,
  //     accommodation: accommodationCost,
  //     localExpenses: localExpensesCost,
  //     activities: activitiesCost,
  //     total: travelCost + accommodationCost + localExpensesCost + activitiesCost
  //   };
  // };

  const calculateTotalCost = () => {
  const baseBreakdown = activeVariant?.totalCost?.breakdown || {};
  
  // Use current travel selection
  const travelCost = currentTravel?.totalCost ?? 0;
  
  // Use actual accommodation cost
  const accommodationCost = accommodation.cost ?? 0;
  
  // Calculate local expenses from individual fields (NOT from breakdown)
  const localExpensesCost = 
    (localExpenses.transportation || 0) + 
    (localExpenses.meals || 0) + 
    (localExpenses.attractions || 0);
  
  // Add ONLY selected activities (user's choice)
  const activitiesCost = selectedActivities.reduce((sum, act) => 
    sum + (act.cost || 0), 0);
  
  return {
    travel: travelCost,
    accommodation: accommodationCost,
    localExpenses: localExpensesCost,
    activities: activitiesCost,
    total: travelCost + accommodationCost + localExpensesCost + activitiesCost
  };
};

  const costs = calculateTotalCost();

  const dest = destination.destination;
  const name = Array.isArray(dest?.name) ? dest.name[0] : dest?.name || "Destination";

  const getModeIcon = (mode: string) => {
    switch ((mode || "").toLowerCase()) {
      case 'flight': return <Plane className="h-5 w-5" />;
      case 'train': return <Train className="h-5 w-5" />;
      case 'bus': return <Bus className="h-5 w-5" />;
      case 'driving':
      case 'cab': 
      case 'drive': return <Car className="h-5 w-5" />;
      case 'star': return <Star className="h-4 w-4" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  const toggleActivity = (activity: ActivityType) => {
    setSelectedActivities(prev => {
      const exists = prev.find(a => a.name === activity.name);
      if (exists) {
        return prev.filter(a => a.name !== activity.name);
      } else {
        return [...prev, activity];
      }
    });
  };

  function buildJourneyDescriptionFromOption(option: any): string {
    const breakdown = option.breakdown || {};

    if (breakdown.userHubName && breakdown.destHubName) {
      const parts: string[] = [];

      if (breakdown.userToUserHubKm && breakdown.userToUserHubKm > 0) {
        parts.push(`CAB to ${breakdown.userHubName}`);
      }

      parts.push(`${(option.mode || 'MODE').toUpperCase()} (${breakdown.userHubName} → ${breakdown.destHubName})`);

      if (breakdown.destHubToDestKm && breakdown.destHubToDestKm > 0) {
        parts.push(`CAB to ${name}`);
      }

      return parts.join(' → ');
    }

    return `${(option.mode || 'MODE').toUpperCase()} to ${name}`;
  }

  const handleSaveItinerary = async () => {
    if (!user) {
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
      const searchData = JSON.parse(
        sessionStorage.getItem("searchData") || 
        localStorage.getItem("lastSearchData") || 
        "{}"
      );
      
      const itineraryData = {
        destination: destination,
        selectedVariant: selectedLabel,
        travelMode: selectedTravelMode,
        selectedActivities: selectedActivities,
        totalCost: costs.total,
        breakdown: costs,
        travelDetails: currentTravel,
        accommodation: accommodation,
        localExpenses: localExpenses,
        savedAt: new Date().toISOString(),
        itineraryName: `${name} Trip - ${selectedLabel} option`
      };

      const payload = {
        itineraryId: `dest-${Date.now()}`,
        itineraryData,
        searchData,
        savedAt: new Date().toISOString()
      };

      const response = await saveItinerary(payload);
      
      // Update local saved state, 
      const updated = new Set(savedItineraryIds);
      updated.add(payload.itineraryId);
      setSavedItineraryIds(updated);
      localStorage.setItem("savedItineraryIds", JSON.stringify(Array.from(updated)));
      
      toast({
        title: "Itinerary Saved!",
        description: "Your itinerary has been saved to your account.",
      });
      
    } catch (error: any) {
      console.error("Error saving itinerary:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Create a SEPARATE function for getting quote (no login required)
  const handleGetQuote = () => {
    // ✅ TRACK QUOTE CLICK
    trackEvent("quote_clicked", {
      destination_name: name,
      total_cost: costs.total
    });

    setShowBookingModal(true);
  };

  // BOOKING FUNCTION - Fixed version
const handleBookPackage = async (bookingData: any) => {
  setBookingInProgress(true);
  try {
    // Get user search data from sessionStorage
    const searchData = JSON.parse(
      sessionStorage.getItem("searchData") || 
      localStorage.getItem("lastSearchData") || 
      "{}"
    );
    
    // Get full destination data - DON'T stringify it here
    const fullDestinationData = {
      name: name,
      type: dest?.type || [],
      location: dest?.location || {},
      selectedVariant: selectedLabel,
      selectedTravelMode: selectedTravelMode,
      selectedActivities: selectedActivities,
      totalCost: costs.total,
      breakdown: costs,
      travelDetails: currentTravel
    };
    
    // Prepare the payload - Make sure destinationData is an object, not string
    const payload = {
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
      
      // Destination data - Send as OBJECT, not string
      destinationData: fullDestinationData,
      
      // Package details
      packageDetails: {
        destination: name,
        totalCost: costs.total,
        travelMode: `${selectedLabel} (${selectedTravelMode})`,
        priority: selectedLabel
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
    };
    
    // Send to backend
    const bookingResponse = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload) // This will properly stringify the entire object
    });

    if (!bookingResponse.ok) {
      throw new Error('Booking request failed');
    }

    const result = await bookingResponse.json();
    
    setQuoteSubmitted(true);
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

  // Extract travel details for CostBreakdown component
  const travelDetails = currentTravel?.breakdown ? [
    ...(currentTravel.breakdown.userToUserHubKm && currentTravel.breakdown.userToUserHubKm > 0
      ? [{
          mode: 'CAB' as const,
          cost: currentTravel.breakdown.userCabCost || 0,
          dist: currentTravel.breakdown.userToUserHubKm || 0
        }]
      : []),
    {
      mode: currentTravel.mode?.toUpperCase() as any || 'TRAVEL',
      cost: currentTravel.breakdown.mainLegCost || currentTravel.totalCost || 0,
      dist: currentTravel.breakdown.userHubToDestHubKm || currentTravel.totalDistance || 0
    },
    ...(currentTravel.breakdown.destHubToDestKm && currentTravel.breakdown.destHubToDestKm > 0
      ? [{
          mode: 'CAB' as const,
          cost: currentTravel.breakdown.destCabCost || 0,
          dist: currentTravel.breakdown.destHubToDestKm || 0
        }]
      : [])
  ] : [];

  return (
    <div className="min-h-screen bg-background">  
      <main className="max-w-7xl mx-auto px-4 py-6">
        <BackButton />
      </main>
      
      {/* Hero */}
      <div className="relative h-[50vh] overflow-hidden">
        <img src={keralaImg} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              {(dest?.type || []).map((t: string, index: number) => (
                <Badge key={index} className="bg-background/20 backdrop-blur-sm border-white/30 text-white capitalize">
                  {t}
                </Badge>
              ))}
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-2">{name}</h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="h-5 w-5" />
              <span className="text-lg">
                {dest?.location?.state ?? ""}{dest?.location?.region ? `, ${dest.location.region}` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            {/* Priority */}
            <section>
              <h2 className="font-display font-semibold text-2xl mb-4">Choose Your Priority</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {(["cheapest", "fastest", "comfortable"] as const).map((type) => {
                  const variant = variants.find((v: any) => v.label === type) || variants[0];
                  const mode = variant?.travel?.mode || 'driving';
                  const modeIcon = getModeIcon(mode);

                  return (
                    <TravelOptionCard
                      key={type}
                      type={type}
                      totalCost={variant?.totalCost?.base || 0}
                      totalTimeH={variant?.travel?.totalTimeHours || 0}
                      comfortScore={variant?.travel?.comfortScore || 5}
                      mode={mode}
                      modeIcon={modeIcon}
                      isSelected={selectedLabel === type}
                      onSelect={() => {
                        setSelectedLabel(type);
                        setSelectedTravelMode('priority');
                      }}
                    />
                  );
                })}
              </div>
            </section>

            {/* Travel Options */}
            <TravelOptionsSection
              travelOptions={travelOptions}
              currentTravel={currentTravel}
              selectedTravelMode={selectedTravelMode}
              onModeChange={setSelectedTravelMode}
              getModeIcon={getModeIcon}
              destinationName={name}
            />

            {/* Accommodation */}
            <AccommodationSection accommodation={accommodation} />

            {/* Local Expenses */}
            <LocalExpensesSection localExpenses={localExpenses} />

            {/* Activities */}
            <ActivitiesSection
              activities={activities}
              selectedActivities={selectedActivities}
              onToggleActivity={toggleActivity}
            />

            {/* Destination Guide */}
            <DestinationGuideSection destination={dest} />
          </div>

          {/* Right column */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <CostBreakdown 
                breakdown={costs}
                total={costs.total}
                travelDetails={travelDetails}
              />
              
                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Get Quote Button - Available to ALL users */}
                  <Button 
                    className="w-full" 
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
                  
                  {/* Save Button - Only for logged-in users */}
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={handleSaveItinerary} 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Bookmark className="mr-2 h-4 w-4" />
                        Save Itinerary
                      </>
                    )}
                  </Button>
                  
                  {/* WhatsApp Button */}
                  <Button 
                    variant="outline"
                    className="w-full bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                    onClick={() => {
                      const message = `Hi! I'm interested in ${name} package for ₹${costs.total.toLocaleString()}. Can you send me a detailed quote?`;
                      window.open(`https://wa.me/919646562880?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
              
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
          </div>
        </div>
      </main>
      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleBookPackage}
        packageDetails={{
          destination: name,
          totalCost: costs.total,
          breakdown: costs,
          travelMode: `${selectedLabel} (${selectedTravelMode})`
        }}
        userData={user ?? undefined}
      />
    </div>
  );
}