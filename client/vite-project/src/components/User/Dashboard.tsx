// client/vite-project/src/components/user/dashboard.tsx

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trash2, 
  Eye, 
  BookOpen,
  TrendingUp,
  Package,
  DollarSign,
  Download,
  Plane,
  Hotel,
  Loader2,
  Heart,
  Plus,
  Star,
  Clock
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';
import { backendURL } from '@/utils/env';


const API_URL = `${backendURL}/api`;

interface Itinerary {
  _id: string;
  userLocation: {
    name: string;
  };
  budget: number;
  tripDuration: number;
  travellers: {
    adults: number;
    children: number;
    infants: number;
  };
  preferences: string[];
  accommodationPreference: string;
  createdAt: string;
  isFavorite?: boolean;

  singleDestinationRecommendation?: {
    name?: string | string[];  // <-- Allow array
    destination?: { name?: string | string[] };
    [key: string]: any;
  };

  multiCityRecommendation?: {
    name?: string | string[];  // <-- Allow array or string
    tagline?: string;
    destinations?: Array<{
      destination?: { name?: string | string[] };
      [key: string]: any;
    }>;
    [key: string]: any;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalBudget: 0,
    totalNights: 0,
    uniqueDestinations: 0,
  });

  useEffect(() => {
    fetchItineraries();
  }, []);

  useEffect(() => {
    if (itineraries.length > 0) {
      calculateStats();
    }
  }, [itineraries]);

  const fetchItineraries = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/itineraries`, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      setItineraries(response.data.itineraries || []);
      setError(null);
    } catch (err: any) {
      setError('Error fetching itineraries');
      console.error('Error fetching itineraries:', err);
    } finally {
      setLoading(false);
    }
  };

const calculateStats = () => {
  let totalBudget = 0;
  let totalNights = 0;
  const destinations = new Set<string>();

  itineraries.forEach((itinerary) => {
    totalBudget += itinerary.budget || 0;
    totalNights += itinerary.tripDuration || 0;

    // Safe extraction for single destination
    if (itinerary.singleDestinationRecommendation) {
      const rec = itinerary.singleDestinationRecommendation;
      let destName: string | undefined;

      if (rec.name) {
        destName = Array.isArray(rec.name) ? rec.name[0] : rec.name;
      } else if (rec.destination?.name) {
        destName = Array.isArray(rec.destination.name) ? rec.destination.name[0] : rec.destination.name;
      }

      if (destName) destinations.add(destName);
    }

    // Safe extraction for multi-city
    if (itinerary.multiCityRecommendation) {
      const rec = itinerary.multiCityRecommendation;

      // Prefer destinations array (most reliable in v2.0)
      if (rec.destinations && Array.isArray(rec.destinations)) {
        rec.destinations.forEach((d: any) => {
          let cityName: string | undefined;
          if (d.destination?.name) {
            cityName = Array.isArray(d.destination.name) ? d.destination.name[0] : d.destination.name;
          } else if (typeof d === 'string') {
            cityName = d;
          }
          if (cityName) destinations.add(cityName);
        });
      } else if (rec.name) {
        // Fallback to top-level name
        if (Array.isArray(rec.name)) {
          rec.name.forEach((n: string) => destinations.add(n));
        } else if (typeof rec.name === 'string') {
          destinations.add(rec.name);
        }
      }
    }
  });

  setStats({
    totalTrips: itineraries.length,
    totalBudget,
    totalNights,
    uniqueDestinations: destinations.size,
  });
};

  const handleDeleteItinerary = async (itineraryId: string) => {
    try {
      await axios.delete(`${API_URL}/auth/itineraries/${itineraryId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      setItineraries(prev => prev.filter(it => it._id !== itineraryId));
    } catch (error) {
      console.error('Error deleting itinerary:', error);
    }
  };

const handleViewItinerary = (itinerary: Itinerary) => {
  const isSingle = !!itinerary.singleDestinationRecommendation;

  if (isSingle) {
    navigate(`/destination/${itinerary._id}`, {
      state: {
        fromSaved: true,
        itinerary: itinerary,
        destination: itinerary.singleDestinationRecommendation,
        fromDashboard: true
      }
    });
  } else {
    navigate(`/itinerary/${itinerary._id}`, {
      state: {
        fromSaved: true,
        itinerary: itinerary,
        fromDashboard: true
      }
    });
  }
};

  const handleBookPackage = (itinerary: Itinerary) => {
    navigate('/booking/checkout', { state: { itinerary } });
  };

  // const getTripName = (itinerary: Itinerary): string => {
  //   if (itinerary.singleDestinationRecommendation?.name) {
  //     return `${itinerary.singleDestinationRecommendation.name} Getaway`;
  //   } else if (itinerary.multiCityRecommendation?.name) {
  //     return `${itinerary.multiCityRecommendation.name.slice(0, 2).join(' & ')} Tour`;
  //   }
  //   return 'Custom Trip';
  // };

  // const getTripType = (itinerary: Itinerary): 'single-destination' | 'multi-city' => {
  //   return itinerary.singleDestinationRecommendation ? 'single-destination' : 'multi-city';
  // };

  // const getDestinations = (itinerary: Itinerary): string[] => {
  //   if (itinerary.singleDestinationRecommendation?.name) {
  //     return [itinerary.singleDestinationRecommendation.name];
  //   } else if (itinerary.multiCityRecommendation?.name) {
  //     return itinerary.multiCityRecommendation.name;
  //   }
  //   return ['Custom Destination'];
  // };

  const getTripType = (itinerary: Itinerary): 'single-destination' | 'multi-city' => {
  return itinerary.singleDestinationRecommendation ? 'single-destination' : 'multi-city';
};

const getTripName = (itinerary: Itinerary): string => {
  // Single destination
  if (itinerary.singleDestinationRecommendation) {
    const rec = itinerary.singleDestinationRecommendation;
    const name = typeof rec.name === 'string' 
      ? rec.name 
      : Array.isArray(rec.name) 
        ? rec.name[0] 
        : rec.destination?.name || 'Amazing Getaway';
    return `${name} Getaway`;
  }

  // Multi-city (v2.0 structure)
  if (itinerary.multiCityRecommendation) {
    const rec = itinerary.multiCityRecommendation;

    // Try tagline first (usually the best title)
    if (rec.tagline) {
      return rec.tagline;
    }

    // Try top-level name
    if (rec.name) {
      return typeof rec.name === 'string' ? rec.name : rec.name.join(' → ');
    }

    // Extract from destinations array (most common in v2.0)
    if (rec.destinations && Array.isArray(rec.destinations) && rec.destinations.length > 0) {
      const names = rec.destinations
        .map((d: any) => {
          if (typeof d === 'string') return d;
          if (d.destination?.name) {
            return Array.isArray(d.destination.name) 
              ? d.destination.name[0] 
              : d.destination.name;
          }
          return null;
        })
        .filter(Boolean);

      if (names.length > 0) {
        if (names.length === 1) return `${names[0]} Tour`;
        if (names.length === 2) return `${names.join(' & ')} Tour`;
        return `${names.slice(0, 2).join(' → ')} + ${names.length - 2} more`;
      }
    }
  }

  return 'Custom Multi-City Trip';
};

const getDestinations = (itinerary: Itinerary): string[] => {
  if (itinerary.singleDestinationRecommendation) {
    const rec = itinerary.singleDestinationRecommendation;
    const name = typeof rec.name === 'string' 
      ? rec.name 
      : Array.isArray(rec.name) 
        ? rec.name[0] 
        : rec.destination?.name || 'Unknown Destination';
    return Array.isArray(name) ? name : [name];
  }

  if (itinerary.multiCityRecommendation) {
    const rec = itinerary.multiCityRecommendation;

    if (rec.destinations && Array.isArray(rec.destinations)) {
      return rec.destinations
        .map((d: any) => {
          if (typeof d === 'string') return d;
          if (d.destination?.name) {
            return Array.isArray(d.destination.name) 
              ? d.destination.name[0] 
              : d.destination.name;
          }
          return null;
        })
        .filter(Boolean) as string[];
    }

    // Fallback to name if exists
    if (rec.name) {
      return Array.isArray(rec.name) ? rec.name : [rec.name];
    }
  }

  return ['Custom Destination'];
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-10">
      {/* Header */}
      <header className="pt-[64px] md:pt-[56px]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name || 'Traveler'}! 👋
              </p>
            </div>
            <Button onClick={() => navigate('/')}>
              <Plus className="mr-2 h-4 w-4" />
              Plan New Trip
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrips}</div>
              <p className="text-xs text-muted-foreground">Planned trips</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.totalBudget.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Across all trips</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nights Planned</CardTitle>
              <Hotel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNights}</div>
              <p className="text-xs text-muted-foreground">Total travel nights</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Destinations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueDestinations}</div>
              <p className="text-xs text-muted-foreground">Unique places</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Trips</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="planned">Planned</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {itineraries.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start planning your first adventure!
                  </p>
                  <Button onClick={() => navigate('/')}>
                    Plan Your First Trip
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {itineraries.map((itinerary) => (
                  <Card key={itinerary._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={getTripType(itinerary) === 'multi-city' ? 'secondary' : 'outline'}>
                              {getTripType(itinerary) === 'multi-city' ? 'Multi-City' : 'Single Destination'}
                            </Badge>
                            <Badge variant={itinerary.accommodationPreference === 'Luxury' ? 'default' : 'secondary'}>
                              {itinerary.accommodationPreference || 'Comfort'}
                            </Badge>
                            {itinerary.isFavorite && (
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            )}
                          </div>
                          <h3 className="text-xl font-semibold">{getTripName(itinerary)}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{itinerary.tripDuration} days</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>₹{itinerary.budget?.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{getDestinations(itinerary).join(', ')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {itinerary.travellers?.adults || 1}A
                                {itinerary.travellers?.children ? ` ${itinerary.travellers.children}C` : ''}
                              </span>
                            </div>
                          </div>
                          {/* Preferences */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {itinerary.preferences?.slice(0, 3).map((pref: string) => (
                              <Badge key={pref} variant="outline" className="text-xs">
                                {pref}
                              </Badge>
                            ))}
                            {itinerary.preferences?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{itinerary.preferences.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewItinerary(itinerary)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleBookPackage(itinerary)}
                          >
                            Book Now
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Itinerary</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{getTripName(itinerary)}"? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteItinerary(itinerary._id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            {itineraries.filter(it => it.isFavorite).length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No favorite trips</h3>
                  <p className="text-muted-foreground mb-4">
                    Mark trips as favorites to see them here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {itineraries.filter(it => it.isFavorite).map((itinerary) => (
                  <Card key={itinerary._id} className="overflow-hidden border-2 border-yellow-200">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            <Badge variant="secondary">Favorite</Badge>
                          </div>
                          <h3 className="text-xl font-semibold">{getTripName(itinerary)}</h3>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewItinerary(itinerary)}>
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="planned" className="space-y-6">
            {itineraries.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No planned trips</h3>
                  <p className="text-muted-foreground mb-4">
                    All your trips will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {itineraries.map((itinerary) => (
                  <Card key={itinerary._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{getTripName(itinerary)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {itinerary.tripDuration} days • ₹{itinerary.budget?.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="secondary">Planned</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats Section */}
        {itineraries.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">Your Travel Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Plane className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {itineraries.filter(it => getTripType(it) === 'multi-city').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Multi-City Trips</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {itineraries.filter(it => getTripType(it) === 'single-destination').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Single Destinations</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {itineraries.filter(it => it.isFavorite).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Favorites</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;