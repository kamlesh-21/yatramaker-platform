// client/vite-project/src/pages/Home.tsx - YATRAMAKER 2.0
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mountain,
  Waves,
  Building2,
  Church,
  TreePine,
  Sunrise,
  Castle,
  Palmtree,
  ChevronDown,
  ChevronUp,
  Search,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  Route,
  Target,
  Zap,
  Globe,
  Star,
  Heart,
  Play,
  IndianRupee,
  Check,
  Pause
} from "lucide-react";

// Import all your beautiful images
import bodhGayaImg from "@assets/generated_images/Bodh_Gaya_temple_sunrise_f3cba291.png";
import nalandaImg from "@assets/generated_images/Nalanda_University_ruins_aerial_c0f04892.png";
import rajgirImg from "@assets/generated_images/Rajgir_hills_and_springs_0e31c4ac.png";
import keralaImg from "@assets/generated_images/Kerala_backwaters_with_houseboat_c52667af.png";
import himalayanImg from "@assets/generated_images/Himalayan_mountain_sunset_vista_ffd11ed1.png";
import beachImg from "@assets/generated_images/Tropical_beach_paradise_e4bd0af5.png";
import mountainImg from "@assets/generated_images/Snow_mountain_peaks_Himalayas_9d095955.png";
import desertImg from "@assets/generated_images/Desert_dunes_Rajasthan_sunset_4c4c6dc1.png";
import riverImg from "@assets/generated_images/River_valley_spiritual_destination_769a420a.png";
import cityImg from "@assets/generated_images/Modern_city_skyline_night_eca5e9d1.png";
import templeImg from "@assets/generated_images/Ancient_temple_architecture_India_48468ef6.png";
import forestImg from "@assets/generated_images/Forest_wildlife_sanctuary_nature_420e849d.png";
import palaceImg from "@assets/generated_images/Historic_palace_sunset_Jaipur_2835103b.png";
import marketImg from "@assets/generated_images/Traditional_Indian_market_street_e035db73.png";
import hotelImg from "@assets/generated_images/Luxury_heritage_hotel_exterior_0677b04b.png";
import roomImg from "@assets/generated_images/Mid-range_hotel_room_interior_3a9102f4.png";
import LocationInput from "@/components/LocationInput";
import type { SearchRequest } from "../shared/schema";
import { trackEvent } from "@/analytics/ga";

const PREFERENCES_OPTIONS = ['Mountains', 'Beaches', 'Cities', 'Jungles', 'Temples', 'Riverside', 'Culture', 'Desert'];

// Generate random preferences
const generateRandomPreference = () => {
  const numPreferences = Math.floor(Math.random() * 3) + 2;
  const shuffled = [...PREFERENCES_OPTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numPreferences);
};

// Hero background images for slideshow
const heroBackgrounds = [
  himalayanImg,
  beachImg,
  palaceImg,
  keralaImg,
  desertImg
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [tripType, setTripType] = useState<"multi-city" | "single-destination">("multi-city");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [searchData, setSearchData] = useState({
    budget: "",
    userLocation: { 
      latitude: null as number | null, 
      longitude: null as number | null, 
      name: "", 
      state: "",
      nearest_hubs: {
        airports: [] as any[],
        railway_stations: [] as any[]
      }
    },
    tripDuration: 3,
    travellers: { adults: 1, children: 0, infants: 0 },
    accommodationPreference: "Cheap" as "Cheap" | "Comfort" | "Luxury",
    preferences: generateRandomPreference()
  });

  // Hero background slideshow
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % heroBackgrounds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleLocationChange = (selectedLocation: any) => {
    setSearchData(prev => ({
      ...prev,
      userLocation: selectedLocation
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchData.budget) {
      alert("Please enter your budget");
      return;
    }
    
    if (!searchData.userLocation.name) {
      alert("Please select your starting location");
      return;
    }

    if (searchData.userLocation.latitude === null || searchData.userLocation.longitude === null) {
      alert("Please select a valid location from the suggestions");
      return;
    }

    const finalSearchData: SearchRequest = {
      location: searchData.userLocation.name,
      userLocation: {
        ...searchData.userLocation,
        latitude: searchData.userLocation.latitude!,
        longitude: searchData.userLocation.longitude!,
      },
      budget: parseInt(searchData.budget),
      tripDuration: searchData.tripDuration,
      travellers: searchData.travellers,
      preferences: searchData.preferences.length > 0 ? searchData.preferences : generateRandomPreference(),
      accommodationPreference: searchData.accommodationPreference,
      tripType,
      filters: { regions: [], states: [], maxDistance: null },
      page: 1,
    };

      // ✅ TRACK SEARCH (HOME PAGE)
  trackEvent("search_submit", {
    trip_type: tripType,
    origin_city: searchData.userLocation.name,
    budget: parseInt(searchData.budget),
    days: searchData.tripDuration,
    travellers: searchData.travellers.adults + searchData.travellers.children
  });

    sessionStorage.setItem("searchData", JSON.stringify(finalSearchData));
    navigate("/results");
  };

  const handlePreferenceToggle = (pref: string) => {
    setSearchData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter(p => p !== pref)
        : [...prev.preferences, pref]
    }));
  };

  const delhiUserLocation = {
    name: "New Delhi",
    latitude: 28.6791,
    longitude: 77.0697,
    state: "Delhi",
    nearest_hubs: {
      airports: [
        { name: "Indira Gandhi International Airport", code: "DEL", city: "Delhi", distance_km: 16, latitude: 28.5562, longitude: 77.1000 }
      ],
      railway_stations: [
        { name: "New Delhi Railway Station", code: "NDLS", city: "Delhi", distance_km: 0, latitude: 28.6418, longitude: 77.2206 },
        { name: "Old Delhi Railway Station", code: "DLI", city: "Delhi", distance_km: 8, latitude: 28.6625, longitude: 77.2273 }
      ],
    },
  };

  const handlePreferenceSearch = () => {
    if (selectedPreferences.length === 0) return;

    if (!searchData.userLocation.name) {
      alert("Please select your starting location in the search form above");
      return;
    }

    const finalSearchData: SearchRequest = {
      location: searchData.userLocation.name,
      userLocation: {
        ...searchData.userLocation,
        latitude: searchData.userLocation.latitude!,
        longitude: searchData.userLocation.longitude!,
      },
      budget: 80000,
      tripDuration: 11,
      travellers: { adults: 1, children: 0, infants: 0 },
      preferences: selectedPreferences,
      accommodationPreference: "Cheap",
      tripType,
      filters: { regions: [], states: [], maxDistance: null },
      page: 1,
    };

    sessionStorage.setItem("searchData", JSON.stringify(finalSearchData));
    navigate("/results");
  };

  const destinations = [
    { image: bodhGayaImg, name: "Bodh Gaya", price: 15000, type: "Spiritual" },
    { image: nalandaImg, name: "Nalanda", price: 12000, type: "Historical" },
    { image: rajgirImg, name: "Rajgir", price: 10000, type: "Nature" },
    { image: keralaImg, name: "Kerala", price: 25000, type: "Backwaters" },
    { image: palaceImg, name: "Jaipur", price: 18000, type: "Heritage" },
    { image: himalayanImg, name: "Himalayas", price: 30000, type: "Adventure" },
    { image: desertImg, name: "Rajasthan", price: 22000, type: "Desert" },
    { image: riverImg, name: "Varanasi", price: 14000, type: "Spiritual" },
  ];

  const preferences = [
    { icon: Church, label: "spiritual", image: bodhGayaImg, color: "from-purple-500 to-pink-500" },
    { icon: Castle, label: "heritage", image: palaceImg, color: "from-amber-500 to-orange-500" },
    { icon: Waves, label: "beach", image: beachImg, color: "from-blue-400 to-cyan-400" },
    { icon: Mountain, label: "mountains", image: mountainImg, color: "from-emerald-500 to-green-500" },
    { icon: Building2, label: "cities", image: cityImg, color: "from-gray-600 to-blue-600" },
    { icon: Church, label: "temples", image: templeImg, color: "from-orange-500 to-red-500" },
    { icon: Sunrise, label: "rivers", image: riverImg, color: "from-sky-400 to-blue-500" },
    { icon: Palmtree, label: "desert", image: desertImg, color: "from-yellow-500 to-orange-500" },
    { icon: TreePine, label: "forests", image: forestImg, color: "from-green-500 to-emerald-600" },
  ];

  const togglePreference = (label: string) => {
    setSelectedPreferences(prev =>
      prev.includes(label) ? prev.filter(p => p !== label) : [...prev, label]
    );
  };

  const toggleSlideshow = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-16">
        {/* Hero Section with Dynamic Background */}
        <section className="relative min-h-screen flex items-start justify-center overflow-y-auto pt-8 pb-8">
          {/* Background Slideshow */}
          <div className="absolute inset-0">
            {heroBackgrounds.map((bg, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentBackground ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={bg}
                  alt={`Travel background ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
            ))}
          </div>

          {/* Slideshow Controls - Fixed blur issue */}
          <div className="absolute top-24 right-8 z-20">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleSlideshow}
              className="bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 w-full mt-4">
            {/* <Badge variant="secondary" className="mb-4 bg-white/20 backdrop-blur text-white border-none">
              🚀 AI-Powered Travel Planning
            </Badge> */}
            
            <h1 className="font-display font-bold text-4xl md:text-6xl mb-6 leading-tight">
              Discover India's
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Hidden Gems
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Let AI craft your perfect journey. Budget-friendly, personalized, and unforgettable.
            </p>

            {/* Enhanced Search Form */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl mb-6">
              <form onSubmit={handleSearchSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Budget */}
                  <div className="space-y-2 lg:col-span-1">
                    <Label htmlFor="budget" className="text-white text-sm font-medium">
                      Your Budget
                    </Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                      <Input
                        id="budget"
                        type="number"
                        placeholder="50,000"
                        value={searchData.budget}
                        onChange={(e) => setSearchData(prev => ({ ...prev, budget: e.target.value }))}
                        className="bg-white/20 border-white/30 text-white placeholder-white/60 pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2 lg:col-span-1">
                    <Label className="text-white text-sm font-medium">
                      Starting From
                    </Label>
                    <LocationInput
                      onChange={handleLocationChange}
                      showIcon={true}
                      showLabel={false}
                      className="h-12 bg-white/20 border-white/30 text-white placeholder-white/60 [&_input]:text-white [&_input]:placeholder-white/60"
                    />
                  </div>

                  {/* Trip Type Toggle */}
                  <div className="space-y-2 lg:col-span-1">
                    <Label className="text-white text-sm font-medium">
                      Trip Type
                    </Label>
                    <div className="flex bg-white/20 rounded-lg p-1 h-12">
                      <button
                        type="button"
                        onClick={() => setTripType("multi-city")}
                        className={`flex-1 rounded-md text-sm font-medium transition-all ${
                          tripType === "multi-city" 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-white/80 hover:text-white"
                        }`}
                      >
                        Multi-City
                      </button>
                      <button
                        type="button"
                        onClick={() => setTripType("single-destination")}
                        className={`flex-1 rounded-md text-sm font-medium transition-all ${
                          tripType === "single-destination" 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-white/80 hover:text-white"
                        }`}
                      >
                        Single
                      </button>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="space-y-2 lg:col-span-1">
                    <Label className="text-white text-sm font-medium opacity-0">
                      Action
                    </Label>
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-none shadow-lg"
                      size="lg"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      AI Search
                    </Button>
                  </div>
                </div>

                {/* Advanced Options Toggle - Made more compact */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-white/80 hover:text-white hover:bg-white/10 text-sm py-2"
                  >
                    {showAdvanced ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4" />
                        Show Less Options
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Show More Options
                      </>
                    )}
                  </Button>
                </div>

                {/* Advanced Options */}
                {showAdvanced && (
                  <div className="space-y-6 pt-6 border-t border-white/20 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-white text-sm font-medium">
                          <Calendar className="inline h-4 w-4 mr-2" />
                          Trip Duration (Days)
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          value={searchData.tripDuration}
                          onChange={(e) => setSearchData(prev => ({ 
                            ...prev, 
                            tripDuration: Math.max(1, parseInt(e.target.value) || 1)
                          }))}
                          className="bg-white/20 border-white/30 text-white placeholder-white/60"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accommodation" className="text-white text-sm font-medium">
                          <Building2 className="inline h-4 w-4 mr-2" />
                          Accommodation Style
                        </Label>
                        <Select
                          value={searchData.accommodationPreference}
                          onValueChange={(value: "Cheap" | "Comfort" | "Luxury") => 
                            setSearchData(prev => ({ ...prev, accommodationPreference: value }))
                          }
                        >
                          <SelectTrigger id="accommodation" className="bg-white/20 border-white/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cheap">💰 Budget Friendly</SelectItem>
                            <SelectItem value="Comfort">🏨 Comfort Plus</SelectItem>
                            <SelectItem value="Luxury">✨ Luxury Experience</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Travelers */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">
                        <Users className="inline h-4 w-4 mr-2" />
                        Travelers
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="adults" className="text-xs text-white/70">Adults (18+)</Label>
                          <Input
                            id="adults"
                            type="number"
                            min="0"
                            value={searchData.travellers.adults}
                            onChange={(e) => setSearchData(prev => ({
                              ...prev,
                              travellers: { ...prev.travellers, adults: Math.max(0, parseInt(e.target.value) || 0) }
                            }))}
                            className="bg-white/20 border-white/30 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="children" className="text-xs text-white/70">Children (2-17)</Label>
                          <Input
                            id="children"
                            type="number"
                            min="0"
                            value={searchData.travellers.children}
                            onChange={(e) => setSearchData(prev => ({
                              ...prev,
                              travellers: { ...prev.travellers, children: Math.max(0, parseInt(e.target.value) || 0) }
                            }))}
                            className="bg-white/20 border-white/30 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="infants" className="text-xs text-white/70">Infants (0-2)</Label>
                          <Input
                            id="infants"
                            type="number"
                            min="0"
                            value={searchData.travellers.infants}
                            onChange={(e) => setSearchData(prev => ({
                              ...prev,
                              travellers: { ...prev.travellers, infants: Math.max(0, parseInt(e.target.value) || 0) }
                            }))}
                            className="bg-white/20 border-white/30 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Full Preferences - Shows pre-selected preferences and allows editing */}
                    <div className="space-y-3">
                      <Label className="text-white text-sm font-medium">
                          Destination Preferences
                        <span className="text-white/60 ml-2">
                          ({searchData.preferences.length} selected)
                        </span>
                      </Label>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {PREFERENCES_OPTIONS.map((pref) => (
                          <Badge
                            key={pref}
                            variant={searchData.preferences.includes(pref) ? "default" : "outline"}
                            className={`cursor-pointer transition-all ${
                              searchData.preferences.includes(pref) 
                                ? 'bg-white text-gray-900 border-white' 
                                : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                            }`}
                            onClick={() => handlePreferenceToggle(pref)}
                          >
                            {pref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-400" />
                <span>AI-Powered Recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span>Budget-Optimized</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-400" />
                <span>1000+ Destinations</span>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Destinations Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                ✨ Most Popular
              </Badge>
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
                Trending Destinations
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Handpicked by travelers like you. Perfectly optimized for your budget.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.map((dest, idx) => (
                <div 
                  key={idx}
                  className="group cursor-pointer"
                  onClick={() => {
                    sessionStorage.setItem(
                      "searchData",
                      JSON.stringify({
                        userLocation: delhiUserLocation,
                        location: "New Delhi",
                        budget: 50000,
                        tripDuration: 7,
                        travellers: { adults: 2, children: 0, infants: 0 },
                        preferences: [dest.type.toLowerCase()],
                        accommodationPreference: "Comfort",
                        tripType: "single-destination",
                        filters: { regions: [], states: [], maxDistance: null },
                        page: 1,
                      })
                    );
                    navigate("/results");
                  }}
                >
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/5]">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <Badge variant="secondary" className="mb-2 bg-white/20 backdrop-blur">
                        {dest.type}
                      </Badge>
                      <h3 className="font-semibold text-xl mb-1">{dest.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">₹{dest.price.toLocaleString()}</span>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm">4.8</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-6 w-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Travel Styles Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                🎯 Find Your Style
              </Badge>
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
                How Do You Want to Travel?
              </h2>
              <p className="text-muted-foreground text-lg">
                Select your interests and let AI work its magic
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {preferences.map((pref) => (
                <div
                  key={pref.label}
                  className={`relative overflow-hidden rounded-2xl aspect-square cursor-pointer group ${
                    selectedPreferences.includes(pref.label) ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  onClick={() => togglePreference(pref.label)}
                >
                  <img
                    src={pref.image}
                    alt={pref.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${pref.color} opacity-60`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <pref.icon className="h-8 w-8 mb-2" />
                    <span className="font-semibold text-sm text-center capitalize">
                      {pref.label}
                    </span>
                  </div>
                  {selectedPreferences.includes(pref.label) && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedPreferences.length > 0 && (
              <div className="text-center mt-8">
                <Button
                  size="lg"
                  onClick={handlePreferenceSearch}
                  className="bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create My {selectedPreferences.length} Interest Itinerary
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* AI Features Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                🤖 AI Magic
              </Badge>
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
                Why YatraMaker Stands Out
              </h2>
              <p className="text-muted-foreground text-lg">
                We combine AI intelligence with human-curated experiences
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl">Smart AI Matching</h3>
                <p className="text-muted-foreground text-sm">
                  Our AI understands your travel personality and matches you with perfect destinations
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl">Budget Optimization</h3>
                <p className="text-muted-foreground text-sm">
                  Get the most value for your money with our intelligent budget allocation
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Route className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl">Multi-City Magic</h3>
                <p className="text-muted-foreground text-sm">
                  Seamlessly connect multiple destinations with optimized routes and costs
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl">Real-Time Planning</h3>
                <p className="text-muted-foreground text-sm">
                  Instant itinerary generation with live pricing and availability
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Travel Stories Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                📸 Real Journeys
              </Badge>
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
                Travel Stories That Inspire
              </h2>
              <p className="text-muted-foreground text-lg">
                See how real travelers discovered hidden gems with YatraMaker
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  image: himalayanImg,
                  title: "Himalayan Adventure",
                  description: "7-day trekking expedition for ₹35,000",
                  traveler: "Adventure Seeker",
                  highlights: ["Mountain Views", "Local Culture", "Budget Stay"]
                },
                {
                  image: beachImg,
                  title: "Goa Beach Escape", 
                  description: "5-day coastal relaxation for ₹28,000",
                  traveler: "Couple Travelers",
                  highlights: ["Beachfront", "Seafood", "Sunset Cruises"]
                },
                {
                  image: palaceImg,
                  title: "Rajasthan Heritage",
                  description: "6-day royal experience for ₹42,000", 
                  traveler: "History Lover",
                  highlights: ["Palace Stays", "Forts", "Cultural Shows"]
                }
              ].map((story, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-4">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-semibold text-lg mb-1">{story.title}</h3>
                      <p className="text-sm opacity-90">{story.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{story.traveler}</span>
                      <Button variant="ghost" size="sm" className="text-primary">
                        View Itinerary →
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {story.highlights.map((highlight, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
              Ready to Discover Your Perfect Trip?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of travelers who've found their dream destinations with AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-gray-900 hover:bg-gray-100"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start AI Search
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                View Sample Itineraries
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}