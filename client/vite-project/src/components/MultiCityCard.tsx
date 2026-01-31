// // // // client/vite-project/src/components/MultiCityCard.tsx
// import React from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { IndianRupee, MapPin, Calendar, Users, Star, ArrowRight } from "lucide-react";

// interface MultiCityCardProps {
//   itinerary: any;
//   rank: number;
//   tripDuration: number;
//   onView: () => void;
// }

// export default function MultiCityCard({ itinerary, rank, tripDuration, onView }: MultiCityCardProps) {
//   // Safe data extraction
//   const title = itinerary.tagline || itinerary.name || "Multi-City Itinerary";
//   const totalCost = itinerary.totalCost?.base || itinerary.totalCost?.total || 0;
//   const destinations = itinerary.destinations || [];
//   const legs = itinerary.legs || [];
//   const coverImage = itinerary.coverImage;
  
//   // Calculate days from destinations or use summary
//   const totalDays = itinerary.summary?.totalDays || 
//                    destinations.reduce((sum: number, dest: any) => sum + (dest.nights || 0), 0) + 1 || 
//                    tripDuration;

//   // Get primary travel mode (most common or first leg)
//   const primaryMode = legs[0]?.mode || 'multiple';
  
//   // Format cost safely
//   const formatCost = (cost: any) => {
//     const num = Number(cost);
//     return isNaN(num) ? "Calculating..." : `₹${num.toLocaleString()}`;
//   };

//   // Get destination names
//   const destinationNames = destinations.map((dest: any) => 
//     dest.destination?.name || dest.destination || "Unknown"
//   ).join(", ");

//   return (
//     <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
//       <div className="grid md:grid-cols-3 gap-6 p-6">
//         {/* Image Section */}
//         <div className="md:col-span-1">
//           <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
//             {coverImage ? (
//               <img 
//                 src={coverImage} 
//                 alt={title}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center text-muted-foreground">
//                 <MapPin className="h-12 w-12 opacity-20" />
//               </div>
//             )}
//             <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur text-foreground">
//               #{rank}
//             </Badge>
//           </div>
//         </div>

//         {/* Content Section */}
//         <div className="md:col-span-2 flex flex-col justify-between">
//           <div>
//             <div className="flex items-start justify-between mb-3">
//               <div>
//                 <h3 className="text-xl font-semibold mb-1">{title}</h3>
//                 <p className="text-muted-foreground text-sm mb-2">
//                   {destinationNames || "Multiple destinations"}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <div className="text-2xl font-bold text-primary">
//                   {formatCost(totalCost)}
//                 </div>
//                 <div className="text-sm text-muted-foreground">
//                   total cost
//                 </div>
//               </div>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-3 gap-4 mb-4">
//               <div className="text-center p-3 bg-muted/30 rounded-lg">
//                 <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
//                 <div className="text-lg font-semibold">{totalDays}</div>
//                 <div className="text-xs text-muted-foreground">days</div>
//               </div>
//               <div className="text-center p-3 bg-muted/30 rounded-lg">
//                 <MapPin className="h-5 w-5 mx-auto mb-1 text-primary" />
//                 <div className="text-lg font-semibold">{destinations.length}</div>
//                 <div className="text-xs text-muted-foreground">stops</div>
//               </div>
//               <div className="text-center p-3 bg-muted/30 rounded-lg">
//                 <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
//                 <div className="text-lg font-semibold">{legs.length}</div>
//                 <div className="text-xs text-muted-foreground">journeys</div>
//               </div>
//             </div>

//             {/* Travel Modes */}
//             {legs.length > 0 && (
//               <div className="mb-4">
//                 <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
//                   <span>Travel modes:</span>
//                   <div className="flex gap-1">
//                     {legs.slice(0, 3).map((leg: any, idx: number) => (
//                       <Badge key={idx} variant="outline" className="text-xs capitalize">
//                         {leg.mode}
//                       </Badge>
//                     ))}
//                     {legs.length > 3 && (
//                       <Badge variant="outline" className="text-xs">
//                         +{legs.length - 3} more
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Route Description */}
//             {itinerary.explanations?.whyThisRoute && (
//               <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
//                 {itinerary.explanations.whyThisRoute.split('\n')[0]}
//               </p>
//             )}
//           </div>

//           {/* Action Button */}
//           <div className="flex items-center justify-between pt-4 border-t">
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//               <Star className="h-4 w-4" />
//               <span>Score: {itinerary.scores?.overallScore?.toFixed(1) || "—"}/10</span>
//             </div>
//             <Button onClick={onView} className="gap-2">
//               View Full Itinerary
//               <ArrowRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }

// client/vite-project/src/components/MultiCityCard.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, MapPin, Calendar, Users, Star, ArrowRight, ExternalLink } from "lucide-react";
import { getDestinationAffiliateLink, trackAffiliateClick, AFFILIATE_DISCLOSURE, extractDestinationName } from "@/utils/affiliateLinks";

interface MultiCityCardProps {
  itinerary: any;
  rank: number;
  tripDuration: number;
  onView: () => void;
}

export default function MultiCityCard({ itinerary, rank, tripDuration, onView }: MultiCityCardProps) {
  // Safe data extraction
  const title = itinerary.tagline || itinerary.name || "Multi-City Itinerary";
  const totalCost = itinerary.totalCost?.base || itinerary.totalCost?.total || 0;
  const destinations = itinerary.destinations || [];
  const legs = itinerary.legs || [];
  const coverImage = itinerary.coverImage;
  
  // Calculate days
  const totalDays = itinerary.summary?.totalDays || 
                   destinations.reduce((sum: number, dest: any) => sum + (dest.nights || 0), 0) + 1 || 
                   tripDuration;

  // Format cost
  const formatCost = (cost: any) => {
    const num = Number(cost);
    return isNaN(num) ? "Calculating..." : `₹${num.toLocaleString()}`;
  };

  // Get destination names for display
  const destinationNames = destinations.map((dest: any) => 
    dest.destination?.name?.[0] || dest.destination?.name || dest.destination || "Unknown"
  ).join(", ");

// Replace these two lines:
const firstDestObj = itinerary.destinations?.[0]?.destination || { name: 'India' };

// Generate link - pass the FULL first destination object directly
const affiliateLink = getDestinationAffiliateLink(
  firstDestObj,  // ← pass object, NOT { name: ... }
  {
    duration: itinerary.destinations?.[0]?.nights || 2,  // Use nights from first stop
    travellers: itinerary.travellers || { adults: 2, children: 0 },
  },
  'multi-city'
);

  // Extract first city name for button text (safe)
  const firstCityName = extractDestinationName(firstDestObj);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="grid md:grid-cols-3 gap-6 p-6">
        {/* Image Section */}
        <div className="md:col-span-1">
          <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            {coverImage ? (
              <img 
                src={coverImage} 
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <MapPin className="h-12 w-12 opacity-20" />
              </div>
            )}
            <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur text-foreground">
              #{rank}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold mb-1">{title}</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  {destinationNames || "Multiple destinations"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {formatCost(totalCost)}
                </div>
                <div className="text-sm text-muted-foreground">
                  total cost
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-semibold">{totalDays}</div>
                <div className="text-xs text-muted-foreground">days</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <MapPin className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-semibold">{destinations.length}</div>
                <div className="text-xs text-muted-foreground">stops</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-semibold">{legs.length}</div>
                <div className="text-xs text-muted-foreground">journeys</div>
              </div>
            </div>

            {/* Travel Modes */}
            {legs.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>Travel modes:</span>
                  <div className="flex gap-1">
                    {legs.slice(0, 3).map((leg: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs capitalize">
                        {leg.mode}
                      </Badge>
                    ))}
                    {legs.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{legs.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Route Description */}
            {itinerary.explanations?.whyThisRoute && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {itinerary.explanations.whyThisRoute.split('\n')[0]}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>Score: {itinerary.scores?.overallScore?.toFixed(1) || "—"}/10</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Primary: View Itinerary */}
              <Button 
                onClick={onView} 
                className="gap-2 flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                View Full Itinerary
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Secondary: Book Hotels - shows first city */}
              <Button
                asChild
                variant="outline"
                className="gap-2 flex-1 sm:flex-none border-primary/50 text-primary hover:bg-primary/10"
              >
                <a
                  href={affiliateLink}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  onClick={() => trackAffiliateClick(firstCityName, 'multi-city')}
                >
                  Book Hotels in {firstCityName}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>

          {/* Tiny disclosure */}
          <p className="text-xs text-center sm:text-right text-muted-foreground mt-2">
            {AFFILIATE_DISCLOSURE}
          </p>
        </div>
      </div>
    </Card>
  );
}