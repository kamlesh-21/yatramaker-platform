// // client/vite-project/src/components/results/AccommodationSection.tsx
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Hotel, Users, Check, Info } from "lucide-react";

// interface AccommodationSectionProps {
//   accommodation: {
//     accommodationType?: string;
//     numberOfRooms?: number;
//     numberOfNights?: number;
//     cost?: number;
//     adults?: number;
//     children?: number;
//     averageRate?: number;
//     starRating?: number;
//     isEstimated?: boolean;
//     estimationReason?: string;
//   };
// }

// export function AccommodationSection({ accommodation }: AccommodationSectionProps) {
//   return (
//     <section>
//       <h2 className="font-display font-semibold text-2xl mb-4">Accommodation</h2>
      
//       {/* Estimation Notice */}
//       {accommodation.isEstimated && (
//         <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
//           <div className="flex items-start gap-2">
//             <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
//             <div className="text-sm">
//               <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
//                 Estimated Pricing
//               </p>
//               <p className="text-yellow-800 dark:text-yellow-200">
//                 {accommodation.estimationReason || 'Hotel data unavailable - showing estimated costs based on market rates.'}
//                 {' '}Actual prices may vary. We'll provide exact quotes when you request a booking.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
      
//       <Card className="overflow-hidden">
//         <div className="p-6 space-y-4">
//           <div className="flex items-start justify-between">
//             <div className="flex-1">
//               <div className="flex items-center gap-2 mb-2">
//                 <Hotel className="h-5 w-5 text-primary" />
//                 <h3 className="font-semibold text-lg">{accommodation.accommodationType || 'Hotel'}</h3>
//               </div>
//               <p className="text-sm text-muted-foreground mb-4">
//                 {accommodation.numberOfRooms || 1} room(s) • {accommodation.numberOfNights || 1} night(s)
//               </p>

//               <div className="flex items-center gap-4 text-sm">
//                 <div className="flex items-center gap-1">
//                   <Users className="h-4 w-4" />
//                   <span>{accommodation.adults || 1} adults</span>
//                 </div>
//                 {(accommodation.children || 0) > 0 && (
//                   <div className="flex items-center gap-1">
//                     <Users className="h-4 w-4" />
//                     <span>{accommodation.children} children</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="text-right">
//               <div className="text-2xl font-bold text-primary">
//                 ₹{(accommodation.cost || 0).toLocaleString()}
//               </div>
//               <div className="text-sm text-muted-foreground">
//                 ₹{(accommodation.averageRate || 0).toLocaleString()}/night
//               </div>
//               <Badge variant="outline" className="mt-2">
//                 {accommodation.starRating || 3}★
//               </Badge>
//             </div>
//           </div>

//           <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
//             <h4 className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">
//               What's Included:
//             </h4>
//             <div className="grid grid-cols-2 gap-2 text-sm text-green-800 dark:text-green-200">
//               <div className="flex items-center gap-1">
//                 <Check className="h-4 w-4" />
//                 <span>Room accommodation</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <Check className="h-4 w-4" />
//                 <span>Breakfast</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <Check className="h-4 w-4" />
//                 <span>Housekeeping</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <Check className="h-4 w-4" />
//                 <span>Hotel taxes</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Card>
//     </section>
//   );
// }

// client/vite-project/src/components/results/AccommodationSection.tsx

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hotel, Users, Check, Info, ExternalLink } from "lucide-react";
import { getDestinationAffiliateLink, trackAffiliateClick, AFFILIATE_DISCLOSURE } from "@/utils/affiliateLinks";

interface AccommodationSectionProps {
  accommodation: {
    accommodationType?: string;
    numberOfRooms?: number;
    numberOfNights?: number;
    cost?: number;
    adults?: number;
    children?: number;
    averageRate?: number;
    starRating?: number;
    isEstimated?: boolean;
    estimationReason?: string;
  };
  destination?: any;
}

export function AccommodationSection({
  accommodation,
  destination,
}: AccommodationSectionProps) {

  const handleHotelBooking = () => {
    const searchData = JSON.parse(
      sessionStorage.getItem("searchData") ||
        localStorage.getItem("lastSearchData") ||
        "{}"
    );

    const travelDetails = {
      duration: accommodation.numberOfNights || searchData.tripDuration || 3,
      adults: accommodation.adults || searchData.travellers?.adults || 2,
      children: accommodation.children || searchData.travellers?.children || 0,
    };

    const affiliateLink = getDestinationAffiliateLink(destination, travelDetails);

    trackAffiliateClick(destination?.name || "Accommodation", "detail");

    window.open(affiliateLink, "_blank", "noopener,noreferrer");
  };

  return (
    <section>
      <h2 className="font-display font-semibold text-2xl mb-4">
        Accommodation
      </h2>

      {/* Estimation Notice */}
      {accommodation.isEstimated && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Estimated Pricing
              </p>
              <p className="text-yellow-800 dark:text-yellow-200">
                {accommodation.estimationReason ||
                  "Hotel data unavailable - showing estimated costs based on market rates."}{" "}
                Actual prices may vary.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Hotel className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">
                  {accommodation.accommodationType || "Hotel"}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {accommodation.numberOfRooms || 1} room(s) •{" "}
                {accommodation.numberOfNights || 1} night(s)
              </p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{accommodation.adults || 1} adults</span>
                </div>
                {(accommodation.children || 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{accommodation.children} children</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                ₹{(accommodation.cost || 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                ₹{(accommodation.averageRate || 0).toLocaleString()}/night
              </div>
              <Badge variant="outline" className="mt-2">
                {accommodation.starRating || 3}★
              </Badge>
            </div>
          </div>

          {/* BOOKING.COM CTA */}
          <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Book hotels instantly
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Live prices & availability on Booking.com
                </p>
              </div>

              <Button
                onClick={handleHotelBooking}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Book Now
              </Button>
            </div>

            <p className="mt-2 text-[11px] text-muted-foreground">
              {AFFILIATE_DISCLOSURE}
            </p>
          </div>

          {/* Inclusions */}
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">
              What's Included:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-green-800 dark:text-green-200">
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4" />
                <span>Room accommodation</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4" />
                <span>Breakfast</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4" />
                <span>Housekeeping</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4" />
                <span>Hotel taxes</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

