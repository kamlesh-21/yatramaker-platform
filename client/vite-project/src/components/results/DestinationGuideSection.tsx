// client/vite-project/src/components/results/DestinationGuideSection.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Info, Utensils } from "lucide-react";

interface DestinationGuideSectionProps {
  destination: {
    seasonality?: {
      peakSeason?: string;
    };
    additionalLocalInfo?: {
      weatherInfo?: string;
      mustTryDishes?: string[];
    };
  };
}

export function DestinationGuideSection({ destination }: DestinationGuideSectionProps) {
  const dest = destination;

  return (
    <section>
      <h2 className="font-display font-semibold text-2xl mb-4">Destination Guide</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {dest?.seasonality?.peakSeason && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Best Time to Visit</h3>
                <p className="text-sm text-muted-foreground">{dest.seasonality.peakSeason}</p>
              </div>
            </div>
          </Card>
        )}

        {dest?.additionalLocalInfo?.weatherInfo && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Weather</h3>
                <p className="text-sm text-muted-foreground">{dest.additionalLocalInfo.weatherInfo}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {dest?.additionalLocalInfo?.mustTryDishes && (
        <Card className="p-4 mt-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Must-Try Local Dishes
          </h3>
          <div className="flex flex-wrap gap-2">
            {dest.additionalLocalInfo.mustTryDishes.map((dish: string, idx: number) => (
              <Badge key={idx} variant="outline">{dish}</Badge>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}