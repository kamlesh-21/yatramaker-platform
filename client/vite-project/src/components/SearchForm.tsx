// client/vite-project/src/components/SearchForm.tsx - UPDATED VERSION
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Users, 
  Calendar, 
  Sparkles, 
  RotateCcw,
  IndianRupee,
  Building2
} from "lucide-react";
import LocationInput from "@/components/LocationInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SearchRequest } from "@/shared/schema";

// CONSISTENT PREFERENCES with Home Page
const PREFERENCES_OPTIONS = [
  { id: "Mountains", label: "Mountains", icon: "⛰️" },
  { id: "Beaches", label: "Beaches", icon: "🏖️" },
  { id: "Cities", label: "Cities", icon: "🏙️" },
  { id: "Jungles", label: "Jungles", icon: "🌿" },
  { id: "Temples", label: "Temples", icon: "🛕" },
  { id: "Riverside", label: "Riverside", icon: "🏞️" },
  { id: "Culture", label: "Culture", icon: "🎭" },
  { id: "Desert", label: "Desert", icon: "🏜️" },
];

// For backward compatibility with existing preferences
const LEGACY_PREFERENCE_MAP: Record<string, string> = {
  "spiritual": "Temples",
  "heritage": "Culture",
  "adventure": "Mountains",
  "cultural": "Culture",
  "nature": "Jungles",
  "photography": "Culture",
  "food": "Culture",
  "relaxation": "Beaches"
};

const normalizePreferences = (prefs: string[]): string[] => {
  return prefs
    .map(pref => LEGACY_PREFERENCE_MAP[pref] || pref)
    .filter(pref => PREFERENCES_OPTIONS.some(p => p.id === pref))
    .filter((pref, index, array) => array.indexOf(pref) === index); // Remove duplicates
};

const TRIP_TYPE_PRESETS = {
  "single-destination": {
    duration: 3,
    adults: 1,
    preferences: ["Mountains", "Culture", "Beaches", "Temples"],
  },
  "multi-city": {
    duration: 5,
    adults: 1,
    preferences: ["Culture", "Beaches", "Mountains", "Jungles"],
  },
} as const;


interface SearchFormProps {
  initialValues?: Partial<SearchRequest>;
  onSubmit?: (data: SearchRequest) => void;
  onReset?: () => void;
  className?: string;
  showReset?: boolean;
  compact?: boolean;
}

export function SearchForm({
  initialValues = {},
  onSubmit,
  onReset,
  className = "",
  showReset = true,
  compact = false,
}: SearchFormProps) {
  // Parse and normalize initial preferences
  const normalizedInitialPrefs = initialValues.preferences 
    ? normalizePreferences(initialValues.preferences)
    : [];

  // State from initialValues or defaults
  const [location, setLocation] = useState<string>(initialValues.userLocation?.name || "");
  const [locationData, setLocationData] = useState<any>(initialValues.userLocation || null);
  const [budget, setBudget] = useState<number[]>([initialValues.budget || 30000]);
  const [duration, setDuration] = useState<number>(initialValues.tripDuration || 5);
  const [adults, setAdults] = useState<number>(initialValues.travellers?.adults || 1);
  const [children, setChildren] = useState<number>(initialValues.travellers?.children || 0);
  const [infants, setInfants] = useState<number>(initialValues.travellers?.infants || 0);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    normalizedInitialPrefs
  );
  const [tripType, setTripType] = useState<"single-destination" | "multi-city">(
    (initialValues.tripType as any) || "multi-city"
  );
  
  const [accommodation, setAccommodation] = useState<"Cheap" | "Comfort" | "Luxury">(
    initialValues.accommodationPreference || "Cheap"
  );

  // Sync initialValues on prop change
  useEffect(() => {
    if (initialValues.userLocation?.name) setLocation(initialValues.userLocation.name);
    if (initialValues.userLocation) setLocationData(initialValues.userLocation);
    if (initialValues.budget) setBudget([initialValues.budget]);
    if (initialValues.tripDuration) setDuration(initialValues.tripDuration);
    if (initialValues.travellers) {
      setAdults(initialValues.travellers.adults || 2);
      setChildren(initialValues.travellers.children || 0);
      setInfants(initialValues.travellers.infants || 0);
    }
    if (initialValues.preferences) {
      setSelectedPreferences(normalizePreferences(initialValues.preferences));
    }
    if (initialValues.tripType) setTripType(initialValues.tripType as any);
    if (initialValues.accommodationPreference) {
      setAccommodation(initialValues.accommodationPreference as any);
    }
  }, [initialValues]);

  const togglePreference = (id: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleLocationChange = (data: any) => {
    setLocation(data.name || "");
    setLocationData(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationData?.name) {
      alert("Please select a valid starting location");
      return;
    }

    if (budget[0] < 5000) {
      alert("Budget must be at least ₹5,000");
      return;
    }

    // Use normalized preferences
    const finalPreferences = selectedPreferences.length > 0 
      ? selectedPreferences 
      : ["Mountains", "Beaches"]; // Default fallback matching Home page

    const data: SearchRequest = {
      location: locationData.name,
      userLocation: {
        ...locationData,
        latitude: locationData.latitude ?? null,
        longitude: locationData.longitude ?? null,
      },
      budget: budget[0],
      tripDuration: duration,
      travellers: { adults, children, infants },
      preferences: finalPreferences,
      tripType,
      accommodationPreference: accommodation,
      filters: initialValues.filters || { regions: [], states: [], maxDistance: null },
      page: 1,
    };

    onSubmit?.(data);
  };

  useEffect(() => {
    const preset = TRIP_TYPE_PRESETS[tripType];
    if (!preset) return;

    setDuration(preset.duration);
    setAdults(preset.adults);

    setChildren(0);
    setInfants(0);

    // 👇 convert readonly tuple → mutable array
    setSelectedPreferences([...preset.preferences]);
  }, [tripType]);


  const handleReset = () => {
    setLocation("");
    setLocationData(null);
    setBudget([50000]);
    setDuration(7);
    setAdults(2);
    setChildren(0);
    setInfants(0);
    setSelectedPreferences([]);
    setTripType("multi-city");
    setAccommodation("Comfort");
    onReset?.();
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm">
              Budget
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="budget"
                type="number"
                placeholder="50,000"
                value={budget[0]}
                onChange={(e) => setBudget([Math.max(5000, parseInt(e.target.value) || 50000)])}
                className="pl-10"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm">
              From
            </Label>
            <LocationInput
              id="location"
              onChange={handleLocationChange}
              value={location}
              showIcon={true}
              className="w-full"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Find Trips
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="space-y-6">
        {/* Starting Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-base font-medium">
            Where are you traveling from?
          </Label>
          <LocationInput
            id="location"
            onChange={handleLocationChange}
            value={location}
            showIcon={true}
            className="w-full h-12"
          />
        </div>

        {/* Budget Slider - Modern Design */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-base font-medium">Your Budget</Label>
            <span className="text-2xl font-bold text-primary">
              ₹{budget[0].toLocaleString()}
            </span>
          </div>
          <Slider
            value={budget}
            onValueChange={setBudget}
            min={5000}
            max={200000}
            step={5000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹5,000</span>
            <span>₹2,00,000</span>
          </div>
        </div>

        {/* Trip Duration & Travellers - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trip Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-base font-medium">
              <Calendar className="inline h-4 w-4 mr-2" />
              Trip Duration (days)
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="30"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-12"
            />
          </div>

          {/* Travelers */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              <Users className="inline h-4 w-4 mr-2" />
              Travelers
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="adults" className="text-xs text-muted-foreground">Adults (18+)</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="children" className="text-xs text-muted-foreground">Children (2-17)</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="infants" className="text-xs text-muted-foreground">Infants (0-2)</Label>
                <Input
                  id="infants"
                  type="number"
                  min="0"
                  value={infants}
                  onChange={(e) => setInfants(Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trip Type */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Trip Type</Label>
          <div className="flex bg-muted rounded-lg p-1 h-12">
            <button
              type="button"
              onClick={() => setTripType("single-destination")}
              className={`flex-1 rounded-md text-sm font-medium transition-all ${
                tripType === "single-destination" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Single Destination
            </button>
            <button
              type="button"
              onClick={() => setTripType("multi-city")}
              className={`flex-1 rounded-md text-sm font-medium transition-all ${
                tripType === "multi-city" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Multi-City
            </button>
          </div>
        </div>

        {/* Accommodation */}
        <div className="space-y-2">
          <Label className="text-base font-medium">
            <Building2 className="inline h-4 w-4 mr-2" />
            Accommodation Style
          </Label>
          <Select
            value={accommodation}
            onValueChange={(value: "Cheap" | "Comfort" | "Luxury") => setAccommodation(value)}
          >
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cheap">💰 Budget Friendly</SelectItem>
              <SelectItem value="Comfort">🏨 Comfort Plus</SelectItem>
              <SelectItem value="Luxury">✨ Luxury Experience</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preferences */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-base font-medium">Your Preferences</Label>
            <span className="text-sm text-muted-foreground">
              {selectedPreferences.length} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PREFERENCES_OPTIONS.map((pref) => (
              <Badge
                key={pref.id}
                variant={selectedPreferences.includes(pref.id) ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm hover:bg-accent transition-all ${
                  selectedPreferences.includes(pref.id) 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : ''
                }`}
                onClick={() => togglePreference(pref.id)}
              >
                <span className="mr-1.5">{pref.icon}</span>
                {pref.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 h-12" size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Find Perfect Trips
        </Button>
        {showReset && (
          <Button 
            type="button" 
            variant="outline" 
            size="lg" 
            onClick={handleReset}
            className="h-12 px-4"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </form>
  );
}