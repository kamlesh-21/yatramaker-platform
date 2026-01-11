// client/vite-project/src/components/User/UserItineraries.tsx (FIXED)
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { itineraryService } from '@/services/itineraryService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toast } from '@/components/ui/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, MoreVertical, Trash2, Edit, Heart, MapPin, Calendar, Users, Building } from 'lucide-react';
import type { Itinerary } from '@/shared/schema';
import { toast } from '@/hooks/use-toast';

const UserItineraries = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchItineraries();
  }, [currentPage]);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await itineraryService.getAll(currentPage, 10);
      
      setItineraries(response.itineraries);
      setTotalPages(response.pagination.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.msg || err.message || 'Error fetching itineraries');
      console.error('Error fetching itineraries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await itineraryService.delete(deleteId);
      setItineraries(itineraries.filter((it) => it._id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      setError(err.response?.data?.msg || err.message || 'Error deleting itinerary');
      console.error('Error deleting itinerary:', err);
    }
  };

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await itineraryService.toggleFavorite(id, !currentStatus);
      setItineraries(
        itineraries.map((it) =>
          it._id === id ? { ...it, isFavorite: !currentStatus } : it
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.msg || err.message || 'Error updating favorite');
    }
  };

  // Get itinerary name based on type
  const getItineraryName = (itinerary: Itinerary) => {
    if (itinerary.singleDestinationRecommendation) {
      const rec = itinerary.singleDestinationRecommendation;
      
      if (typeof rec === 'object') {
        if (rec.destination) {
          const destName = Array.isArray(rec.destination.name) 
            ? rec.destination.name[0] 
            : rec.destination.name;
          if (destName) return destName;
        }
        
        if (rec.name) {
          return Array.isArray(rec.name) ? rec.name[0] : rec.name;
        }
        
        if (rec.itineraryName) {
          return rec.itineraryName;
        }
        
        if (typeof rec.destination === 'string') {
          return rec.destination;
        }
      }
      
      return 'Single Destination Trip';
    } else if (itinerary.multiCityRecommendation) {
      const rec = itinerary.multiCityRecommendation;
      
      // Extract destination names from the multi-city structure
      if (rec.destinations && Array.isArray(rec.destinations)) {
        const names = rec.destinations
          .map((d: any) => {
            if (d.destination?.name) {
              return Array.isArray(d.destination.name) 
                ? d.destination.name[0] 
                : d.destination.name;
            }
            return null;
          })
          .filter(Boolean);
        
        if (names.length > 0) {
          return names.join(' → ');
        }
      }
      
      if (rec.tagline) return rec.tagline;
      if (rec.name) return rec.name;
      
      return 'Multi-City Trip';
    }
    
    if (itinerary.notes) {
      return itinerary.notes;
    }
    
    return `Trip on ${new Date(itinerary.createdAt).toLocaleDateString()}`;
  };

  // Get destination details for single destination trips
  const getDestinationDetails = (itinerary: Itinerary) => {
    if (!itinerary.singleDestinationRecommendation) return null;
    
    const rec = itinerary.singleDestinationRecommendation;
    
    if (typeof rec === 'object') {
      let destinationInfo = null;
      
      if (rec.destination) {
        if (typeof rec.destination === 'object') {
          destinationInfo = {
            name: Array.isArray(rec.destination.name) ? rec.destination.name[0] : rec.destination.name,
            state: rec.destination.location?.state,
            region: rec.destination.location?.region,
            type: rec.destination.type,
            totalCost: rec.totalCost || itinerary.budget
          };
        } else if (typeof rec.destination === 'string') {
          destinationInfo = {
            name: rec.destination,
            state: '',
            region: '',
            type: [],
            totalCost: rec.totalCost || itinerary.budget
          };
        }
      } else {
        destinationInfo = {
          name: rec.name || 'Destination',
          state: rec.state || '',
          region: rec.region || '',
          type: rec.type || [],
          totalCost: rec.totalCost || itinerary.budget
        };
      }
      
      return destinationInfo;
    }
    
    return null;
  };

  // Get multi-city details
  const getMultiCityDetails = (itinerary: Itinerary) => {
    if (!itinerary.multiCityRecommendation) return null;
    
    const rec = itinerary.multiCityRecommendation;
    
    // Extract destination names
    let destinationNames: string[] = [];
    
    if (rec.destinations && Array.isArray(rec.destinations)) {
      destinationNames = rec.destinations
        .map((d: any) => {
          if (d.destination?.name) {
            return Array.isArray(d.destination.name) 
              ? d.destination.name[0] 
              : d.destination.name;
          }
          return null;
        })
        .filter(Boolean);
    }
    
    return {
      destinations: destinationNames,
      totalCost: rec.totalCost?.total || rec.totalCost?.base || itinerary.budget,
      totalDays: rec.totalDays || itinerary.tripDuration,
      legs: rec.legs?.length || 0
    };
  };

  // ✅ FIXED: Navigation handler
const handleViewDetails = (itinerary: Itinerary) => {
  const isSingle = !!itinerary.singleDestinationRecommendation;
  const isMulti = !!itinerary.multiCityRecommendation;
  
  if (isSingle) {
    // Navigate to DestinationDetail with ID parameter
    navigate(`/destination/${itinerary._id}`, {
      state: {
        fromSaved: true,
        fromItineraries: true,
        // itinerary: itinerary,
        // destination: itinerary.singleDestinationRecommendation
      }
    });
  } else if (isMulti) {
    // Navigate to ItineraryDetail with ID parameter
    navigate(`/itinerary/${itinerary._id}`, {
      state: {
        fromSaved: true,
        // itinerary: itinerary
        fromItineraries: true,
      }
    });
  } else {
    // Fallback - this shouldn't happen
    console.error('Itinerary has neither single nor multi data:', itinerary);
    toast({
      title: "Error",
      description: "Could not load itinerary details",
      variant: "destructive",
    });
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your itineraries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">My Itineraries</h1>
          <p className="text-muted-foreground text-lg">
            Welcome back, {user?.name}! Here are your saved travel plans.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {itineraries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No itineraries yet</h3>
              <p className="text-muted-foreground mb-6">
                Start planning your dream vacation today!
              </p>
              <Button onClick={() => navigate('/')}>
                Create Your First Itinerary
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Itineraries Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {itineraries.map((itinerary) => {
                const isSingle = !!itinerary.singleDestinationRecommendation;
                const isMulti = !!itinerary.multiCityRecommendation;
                const destinationDetails = getDestinationDetails(itinerary);
                const multiCityDetails = getMultiCityDetails(itinerary);
                
                return (
                  <Card key={itinerary._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {getItineraryName(itinerary)}
                            {itinerary.isFavorite && (
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            )}
                            <Badge variant="outline" className="ml-2">
                              {isSingle ? 'Single' : 'Multi-City'}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Created {new Date(itinerary.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleFavorite(
                                  itinerary._id,
                                  itinerary.isFavorite || false
                                )
                              }
                            >
                              <Heart className="h-4 w-4 mr-2" />
                              {itinerary.isFavorite ? 'Remove from' : 'Add to'} Favorites
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetails(itinerary)}>
                              <Edit className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(itinerary._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Destination Info */}
                        {isSingle && destinationDetails && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{getItineraryName(itinerary)}</span>
                            </div>
                            {destinationDetails.state && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building className="h-4 w-4" />
                                <span>{destinationDetails.state}{destinationDetails.region ? `, ${destinationDetails.region}` : ''}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {isMulti && multiCityDetails && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{multiCityDetails.destinations.slice(0, 3).join(' → ')}</span>
                              {multiCityDetails.destinations.length > 3 && (
                                <span className="text-muted-foreground">
                                  +{multiCityDetails.destinations.length - 3} more
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{multiCityDetails.totalDays} days</span>
                              <span>•</span>
                              <span>{multiCityDetails.legs} journeys</span>
                            </div>
                          </div>
                        )}

                        {/* Trip Summary */}
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>From {itinerary.userLocation.name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{itinerary.tripDuration} days</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {itinerary.travellers.adults} adult
                            {itinerary.travellers.adults > 1 && 's'}
                            {itinerary.travellers.children > 0 &&
                              `, ${itinerary.travellers.children} child${
                                itinerary.travellers.children > 1 ? 'ren' : ''
                              }`}
                            {itinerary.travellers.infants > 0 &&
                              `, ${itinerary.travellers.infants} infant${
                                itinerary.travellers.infants > 1 ? 's' : ''
                              }`}
                          </span>
                        </div>

                        {/* Budget */}
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Budget</span>
                            <span className="text-lg font-bold">
                              ₹{itinerary.budget.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Preferences */}
                        {itinerary.preferences && itinerary.preferences.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {itinerary.preferences.slice(0, 3).map((pref) => (
                              <Badge key={pref} variant="secondary">
                                {pref}
                              </Badge>
                            ))}
                            {itinerary.preferences.length > 3 && (
                              <Badge variant="outline">
                                +{itinerary.preferences.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Action Button */}
                        <Button
                          className="w-full mt-4"
                          onClick={() => handleViewDetails(itinerary)}
                        >
                          View {isSingle ? 'Destination' : 'Itinerary'} Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Itinerary?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your itinerary.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default UserItineraries;