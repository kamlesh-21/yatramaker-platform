// client/vite-project/src/shared/schema.ts
// ✅ PROPER FIX - Extend types WITHOUT breaking server validation

import { z } from "zod";

// ==================== ZOD SCHEMAS (for validation) ====================
const userLocationSchema = z.object({
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  state: z.string().optional(),
  nearest_hubs: z
    .object({
      airports: z
        .array(
          z.object({
            name: z.string(),
            code: z.string(),
            city: z.string(),
            distance_km: z.number(),
            latitude: z.number(),
            longitude: z.number(),
          })
        )
        .optional(),
      railway_stations: z
        .array(
          z.object({
            name: z.string(),
            code: z.string(),
            city: z.string(),
            distance_km: z.number(),
            latitude: z.number(),
            longitude: z.number(),
          })
        )
        .optional(),
    })
    .optional(),
});

export const searchRequestSchema = z.object({
  location: z.string(),
  userLocation: userLocationSchema,
  budget: z.number(),
  tripDuration: z.number(),
  travellers: z.object({
    adults: z.number(),
    children: z.number(),
    infants: z.number(),
  }),
  preferences: z.array(z.string()),
  accommodationPreference: z
    .enum(["Cheap", "Luxury", "Comfort"])
    .optional(),
  tripType: z.enum(["single-destination", "multi-city"]),
  filters: z
    .object({
      regions: z.array(z.string()).optional(),
      states: z.array(z.string()).optional(),
      maxDistance: z.number().nullable().optional(),
    })
    .optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;

// ==================== SHARED BASE TYPES ====================
// These are used by BOTH client and server

export interface UserLocation {
  latitude: number;
  longitude: number;
  name: string;
  state?: string;
  nearest_hubs?: {
    airports: Array<{
      name: string;
      code: string;
      city: string;
      distance_km: number;
      latitude: number;
      longitude: number;
    }>;
    railway_stations: Array<{
      name: string;
      code: string;
      city: string;
      distance_km: number;
      latitude: number;
      longitude: number;
    }>;
  };
}

export interface Travellers {
  adults: number;
  children: number;
  infants: number;
}

export interface TravelOption {
  totalCost: number;
  route?: any[];
  totalTimeH?: number;
  comfortScore?: number;
  mode?: string;
  totalDistance?: number;
  totalTimeHours?: number;
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
  cost?: number;
  distance?: number;
  estimatedTimeHours?: number;
}

export interface Destination {
  destination_id?: number;
  id?: string;
  name: string | string[];
  type?: string[];
  location?: {
    latitude?: number;
    longitude?: number;
    state?: string;
    region?: string;
    country?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
  description?: string;
  images?: Array<string | { url: string }>;
  seasonality?: {
    peakSeason?: string;
    offSeason?: string;
  };
  additionalLocalInfo?: {
    weatherInfo?: string;
    mustTryDishes?: string[];
  };
}

// ==================== CLIENT-SIDE EXTENDED TYPES ====================
// These extend the base types for frontend use

export interface TravelDetail {
  mode: string;
  cost: number;
  dist: number;
}

export interface AccommodationDetails {
  accommodationType?: string;
  numberOfRooms?: number;
  numberOfNights?: number;
  cost?: number;
  adults?: number;
  children?: number;
  averageRate?: number;
  starRating?: number;
  name?: string;
  category?: string;
  rating?: number;
  ratingLabel?: string;
  nights?: number;
  totalCost?: number;
  image?: string;
}

export interface LocalExpenses {
  transportation?: number;
  meals?: number;
  attractions?: number;
  total?: number;
  totalCost?: number;
  activities?: Array<{
    name?: string;
    type?: string;
    duration?: number;
    cost?: number;
    description?: string;
  }>;
  localTransport?: number;
}

export interface Activity {
  activityId?: number;
  name: string;
  type: string;
  timeSlot?: string;
  duration: number;
  cost: number;
  costBreakdown?: any;
  experienceValue?: number;
  priority?: string;
  description?: string;
}

export interface Variant {
  label?: string;
  totalCost?: {
    base?: number;
    breakdown?: Record<string, number>;
  };
  travel?: TravelOption;
  accommodation?: AccommodationDetails;
  localExpenses?: LocalExpenses;
  activities?: Activity[];
  timeHours?: number;
  totalTimeH?: number;
  comfort?: number;
  comfortScore?: number;
  mode?: string;
  description?: string;
}

export interface SingleDestinationResult {
  destination: Destination;
  variants?: Variant[];
  travelOptions?: TravelOption[];
  accommodationCost?: AccommodationDetails;
  accommodation?: AccommodationDetails;
  localExpenses?: LocalExpenses;
  activities?: Activity[];
  totalCost?: number;
  breakdown?: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface DaySchedule {
  day: number;
  date: string;
  summary: string;
  location: string;
  overnight: string;
  travelLeg?: {
    from: { name: string; coordinates: number[] };
    to: { name: string; coordinates: number[] };
    distance: number;
    mode: string;
    modeBreakdown: any[];
    totalCost: number;
    totalDuration: number;
    comfortScore: number;
    whyThisMode: string;
  };
  accommodation: {
    hotelId?: number;
    name: string;
    category: string;
    address?: string;
    checkIn?: string;
    checkOut?: string;
    rooms: any[];
    totalCost: number;
    amenities?: string[];
    rating?: number;
    whyThisHotel?: string;
  };
  activities: Activity[];
  meals?: {
    breakfast?: any;
    lunch?: any;
    dinner?: any;
  };
  daySummary: {
    totalCost: number;
    travelTime: number;
    activityTime: number;
    freeTime: number;
    pacingScore: number;
    highlightMoment: string;
  };
}

export interface MultiCityItinerary {
  id?: string;
  routeId?: string;
  rank?: number;
  name: string | string[];
  tagline?: string;
  optimizationGoal?: string;
  totalCost: number;
  costBreakdown?: {
    travel: number;
    accommodation: number;
    food?: number;
    activities?: number;
    buffer?: number;
  };
  costPerPerson?: number;
  costPerDay?: number;
  destinations?: Array<{
    name?: string;
    destination?: string | Destination;
    days?: number;
    description?: string;
  }>;
  legs?: any[];
  route?: {
    sequence: string[];
    totalDistance: number;
    totalTravelTime: number;
    efficiencyScore: number;
    pattern: string;
    backtrackingPenalty?: number;
  };
  dailySchedule?: DaySchedule[];
  explanations?: {
    routeRationale?: string;
    destinationJustifications?: any[];
    transportChoices?: any[];
    accommodationStrategy?: string;
    tradeoffs?: string;
  };
  dynamicPricing?: any;
  scores?: any;
  metadata?: Record<string, any>;
  variantComparison?: any;
  confidenceMetrics?: any;
  bookingInformation?: {
    readyToBook?: boolean;
    bookingSteps?: string[];
    advanceBookingRecommended?: {
      hotels?: string;
      trains?: string;
      activities?: string;
    };
    cancellationPolicy?: Record<string, any>;
  };
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalResults?: number;
  resultsPerPage?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface SearchResponse {
  success: boolean;
  tripType: "single-destination" | "multi-city";
  metadata?: {
    generatedAt: string;
    computationTime: string;
    destinationsEvaluated: number;
    routesGenerated?: number;
    routesConsidered?: number;
  };
  singleDestinationResults?: SingleDestinationResult[];
  results?: SingleDestinationResult[];
  multiCityResults?: {
    recommendedItineraries: MultiCityItinerary[];
    routes?: MultiCityItinerary[];
    alternativeSuggestions?: any[];
  };
  routes?: MultiCityItinerary[];
  recommendedItineraries?: MultiCityItinerary[];
  pagination?: Pagination;
  appliedFilters?: any;
  alternatives?: {
    if_extend_duration?: Array<{
      addDestination: string;
      daysNeeded: number;
      costIncrease: number;
      reasoning: string;
    }>;
  };
  error?: {
    code?: string;
    message: string;
    suggestions?: string[];
  };
}

// ==================== SAVED ITINERARY TYPES ====================

export interface SingleDestinationRecommendation {
  destination?: string | Destination;
  destination_id?: number;
  name?: string | string[];
  type?: string[];
  state?: string;
  region?: string;
  description?: string;
  itineraryName?: string;
  totalCost?: number;
}

export interface MultiCityRecommendation {
  name: string | string[];
  destinations?: SingleDestinationRecommendation[];
  totalCost?: number;
}

export interface Itinerary {
  _id: string;
  userId: string;
  budget: number;
  userLocation: UserLocation;
  tripDuration: number;
  travellers: Travellers;
  preferences: string[];
  accommodationPreference: 'Cheap' | 'Comfort' | 'Luxury';
  tripType: 'single-destination' | 'multi-city';
  singleDestinationRecommendation?: any; // Flexible to handle various backend structures
  multiCityRecommendation?: any; // Flexible to handle various backend structures
  notes?: string;
  isFavorite?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ItinerariesResponse {
  itineraries: Itinerary[];
  pagination: PaginationInfo;
}

export interface UserItinerary {
  id: string;
  name: string;
  type: 'single-destination' | 'multi-city';
  budget: number;
  duration: number;
  destinations: string[];
  createdAt: Date;
  savedCount: number;
  status: 'planned' | 'booked' | 'completed' | 'cancelled';
  userQuery?: SearchRequest;
  recommendation?: SingleDestinationResult | MultiCityItinerary;
}