// client/vite-project/src/components/results/ItineraryDestinationCard.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hotel, Sun, Thermometer, Activity, Coffee, Camera, ExternalLink } from "lucide-react";
import { getDestinationAffiliateLink, trackAffiliateClick, AFFILIATE_DISCLOSURE, extractDestinationName } from "@/utils/affiliateLinks";
import { Button } from "@/components/ui/button";

interface ItineraryDestinationCardProps {
  destination: any;
  index: number;
  total: number;
}

export function ItineraryDestinationCard({ destination, index, total }: ItineraryDestinationCardProps) {
  const dest = destination.destination || {};
  const localInfo = dest.additionalLocalInfo || {};
  const seasonality = dest.seasonality || {};
  const accommodation = destination.accommodation || {};
  const localExpenses = destination.localExpenses || {};
  const activities = destination.activities || [];

  const image = dest.images?.[0]?.url || `https://source.unsplash.com/random/800x600/?${dest.name?.[0] || 'travel'}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
      <div className="grid md:grid-cols-4 gap-6 p-6">
        {/* Image & Basic Info */}
        <div className="md:col-span-1">
          <div className="relative h-48 rounded-lg overflow-hidden">
            <img src={image} alt={dest.name?.[0]} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3">
              <Badge className="bg-background/90 backdrop-blur-sm text-foreground">
                Day {destination.arrivalDay}-{destination.departureDay}
              </Badge>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-transparent p-4">
              <h3 className="text-lg font-bold text-white">{dest.name?.[0]}</h3>
              <p className="text-white/90 text-sm">{dest.location?.state}, {dest.location?.region}</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">Nights</div>
              <div className="font-bold">{destination.nights || 1}</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">Activities</div>
              <div className="font-bold">{activities.length}</div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-3 space-y-4">
          {/* Description & Tags */}
          <div>
            <p className="text-muted-foreground mb-3 line-clamp-2">{dest.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {dest.type?.map((type: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Seasonality & Weather */}
          {seasonality && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                <Sun className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium">Best Time</div>
                  <div className="text-muted-foreground text-xs">{seasonality.peakSeason}</div>
                </div>
              </div>
              {seasonality.weather && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                  <Thermometer className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium">Weather</div>
                    <div className="text-muted-foreground text-xs">
                      {/* Weather info can be added here */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

{/* Accommodation */}
<div className="p-3 bg-muted/20 rounded-lg">
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      <Hotel className="h-4 w-4 text-primary" />
      <span className="font-medium">Accommodation</span>
    </div>
    <div className="font-bold">₹{accommodation.cost?.toLocaleString() || 0}</div>
  </div>
  <div className="text-sm text-muted-foreground">
    {accommodation.accommodationType || 'Hotel'} • {accommodation.starRating || '—'}★
    {accommodation.isEstimated && (
      <Badge variant="outline" className="ml-2 text-xs">
        Estimated
      </Badge>
    )}
  </div>
  {accommodation.estimationReason && (
    <div className="text-xs text-orange-600 mt-1">
      {/* {accommodation.estimationReason} */}
    </div>
  )}

  {/* NEW: Booking.com CTA - small, contextual */}
  <div className="mt-3">
    <Button
      asChild
      variant="outline"
      size="sm"
      className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/10 text-xs"
    >
      <a
        href={getDestinationAffiliateLink(
          dest, // full destination object
          { duration: destination.nights || 2 },
          'multi-city-destination'
        )}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={() => {
          trackAffiliateClick(
            extractDestinationName(dest) || 'Unknown City',
            'detail',
            'multi-city'
          );
        }}
      >
        <ExternalLink className="h-3 w-3" />
        Book Hotels in {extractDestinationName(dest)}
      </a>
    </Button>

    <p className="text-[10px] text-center text-muted-foreground mt-1">
      {AFFILIATE_DISCLOSURE}
    </p>
  </div>
</div>

          {/* Local Expenses */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="p-2 bg-muted/10 rounded">
              <div className="text-xs text-muted-foreground">Transport</div>
              <div className="font-medium">₹{localExpenses.transportationCost || 0}</div>
            </div>
            <div className="p-2 bg-muted/10 rounded">
              <div className="text-xs text-muted-foreground">Meals</div>
              <div className="font-medium">₹{localExpenses.mealsCost || 0}</div>
            </div>
            <div className="p-2 bg-muted/10 rounded">
              <div className="text-xs text-muted-foreground">Attractions</div>
              <div className="font-medium">₹{localExpenses.attractionsCost || 0}</div>
            </div>
          </div>

          {/* Top Activities */}
          {activities.length > 0 && (
            <div>
              <div className="font-medium text-sm mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Top Activities
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activities.slice(0, 3).map((activity: any, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {activity.name}
                    {activity.cost > 0 && ` • ₹${activity.cost}`}
                  </Badge>
                ))}
                {activities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{activities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Local Insights Preview */}
          {localInfo && (
            <div className="text-sm">
              <div className="font-medium mb-1">Local Tips</div>
              <div className="grid grid-cols-2 gap-2">
                {localInfo.mustTryDishes?.[0] && (
                  <div className="flex items-center gap-1.5">
                    <Coffee className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{localInfo.mustTryDishes[0]}</span>
                  </div>
                )}
                {localInfo.hiddenGems?.[0] && (
                  <div className="flex items-center gap-1.5">
                    <Camera className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{localInfo.hiddenGems[0]}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}