// client/vite-project/src/components/TravelLegCard.tsx
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { IndianRupee, Compass, ChevronRight } from "lucide-react";
import { ModeIcon } from "./ModeIcon";

interface TravelLegCardProps {
  leg: any;
  index: number;
  total: number;
}

export function TravelLegCard({ leg, index, total }: TravelLegCardProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);

  return (
    <div className="space-y-3">
      {/* Main Leg */}
      <Card className={`p-4 ${leg.alternatives?.length > 0 ? 'border-l-4 border-l-primary' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary text-sm">{index + 1}</span>
              </div>
              {index < total - 1 && (
                <div className="w-0.5 h-8 bg-border mt-2" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <ModeIcon mode={leg.mode} size="lg" />
                <h4 className="font-semibold">{leg.name}</h4>
                <Badge variant="outline" className="capitalize">
                  {leg.mode}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground">Distance</div>
                  <div className="font-bold">{leg.distance} km</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                  <div className="font-bold">{leg.estimatedTimeHours?.toFixed(1)}h</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Cost</div>
                  <div className="font-bold flex items-center gap-0.5">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {leg.cost?.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{leg.whySuitable}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ₹{leg.cost?.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total cost</div>
          </div>
        </div>

        {/* Comfort Score */}
        {leg.comfortScore && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Comfort Score</span>
              <div className="flex items-center gap-2">
                <div className="w-24">
                  <Progress value={leg.comfortScore * 10} className="h-2" />
                </div>
                <span className="font-bold">{leg.comfortScore}/10</span>
              </div>
            </div>
          </div>
        )}

        {/* Alternatives Toggle */}
        {leg.alternatives?.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowAlternatives(!showAlternatives)}
            >
              <span className="flex items-center gap-2">
                <Compass className="h-4 w-4" />
                {showAlternatives ? 'Hide' : 'Show'} {leg.alternatives.length} Alternative Routes
              </span>
              <ChevronRight className={`h-4 w-4 transition-transform ${showAlternatives ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        )}
      </Card>

      {/* Alternatives */}
      {showAlternatives && leg.alternatives?.length > 0 && (
        <div className="ml-8 space-y-3 pl-4 border-l-2 border-border">
          <h5 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
            <Compass className="h-4 w-4" />
            Alternative Options
          </h5>
          {leg.alternatives.map((alt: any, altIndex: number) => (
            <Card key={altIndex} className="p-3 bg-muted/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ModeIcon mode={alt.mode} />
                    <span className="font-medium text-sm">{alt.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-medium ml-1">₹{alt.cost?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium ml-1">{alt.estimatedTimeHours?.toFixed(1)}h</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Comfort:</span>
                      <span className="font-medium ml-1">{alt.comfortScore}/10</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{alt.whySuitable}</p>
                  
                  {/* Breakdown */}
                  {alt.breakdown && (
                    <div className="mt-2 pt-2 border-t border-border/50 text-xs">
                      <div className="grid grid-cols-2 gap-1">
                        {alt.breakdown.userCabCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">To {alt.breakdown.userHubName}:</span>
                            <span>₹{alt.breakdown.userCabCost}</span>
                          </div>
                        )}
                        {alt.breakdown.mainLegCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Main Journey:</span>
                            <span>₹{alt.breakdown.mainLegCost}</span>
                          </div>
                        )}
                        {alt.breakdown.destCabCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">To Destination:</span>
                            <span>₹{alt.breakdown.destCabCost}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="ml-2">
                  Alternative
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}