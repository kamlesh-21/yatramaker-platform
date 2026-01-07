// client/vite-project/src/components/results/TravelOptionsSection.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";
import { ModeIcon } from "./ModeIcon";

interface TravelOption {
  mode: string;
  totalCost: number;
  totalDistance: number;
  totalTimeHours: number;
  comfortScore: number;
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
}

interface TravelOptionsSectionProps {
  travelOptions: any[];
  currentTravel: TravelOption;
  selectedTravelMode: string;
  onModeChange: (mode: string) => void;
  getModeIcon: (mode: string) => React.ReactNode;
  destinationName: string;
}

export function TravelOptionsSection({
  travelOptions,
  currentTravel,
  selectedTravelMode,
  onModeChange,
  getModeIcon,
  destinationName
}: TravelOptionsSectionProps) {
  return (
    <section>
      <h2 className="font-display font-semibold text-2xl mb-4">Travel Options</h2>

      <Tabs value={selectedTravelMode} onValueChange={onModeChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="priority" className="flex items-center gap-1">
            {getModeIcon('star')}
            <span className="hidden sm:inline">Priority</span>
          </TabsTrigger>
          {travelOptions.map((option: any, index: number) => (
            <TabsTrigger key={index} value={option.mode} className="flex items-center gap-1">
              {getModeIcon(option.mode)}
              <span className="hidden sm:inline capitalize">{option.mode}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedTravelMode} className="mt-4">
          <Card className="p-6">
            <div className="space-y-4">
              {/* Overview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ModeIcon mode={currentTravel?.mode} />
                    <h3 className="font-semibold text-lg capitalize">{currentTravel?.mode ?? "Journey"} Journey</h3>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    ₹{(currentTravel?.totalCost ?? 0).toLocaleString()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{currentTravel?.journeyDescription}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(currentTravel?.totalTimeHours ?? 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Travel Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {currentTravel?.totalDistance ?? 0} km
                  </div>
                  <div className="text-xs text-muted-foreground">Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {currentTravel?.comfortScore ?? 0}/10
                  </div>
                  <div className="text-xs text-muted-foreground">Comfort</div>
                </div>
              </div>

              {/* Breakdown */}
              {currentTravel?.breakdown && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Journey Breakdown</h4>
                  {currentTravel.breakdown.userHubName && currentTravel.breakdown.destHubName && (
                    <div className="space-y-2">
                      {currentTravel.breakdown.userToUserHubKm && currentTravel.breakdown.userToUserHubKm > 0 && (
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            {getModeIcon('cab')}
                            <span className="text-sm">CAB to {currentTravel.breakdown.userHubName}</span>
                          </div>
                          <div className="text-sm">
                            ₹{(currentTravel.breakdown.userCabCost ?? 0).toLocaleString()} • {currentTravel.breakdown.userToUserHubKm} km
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <ModeIcon mode={currentTravel.mode} />
                          <span className="text-sm uppercase">
                            {currentTravel.mode} ({currentTravel.breakdown.userHubName} → {currentTravel.breakdown.destHubName})
                          </span>
                        </div>
                        <div className="text-sm">
                          ₹{(currentTravel.breakdown.mainLegCost ?? 0).toLocaleString()} • {currentTravel.breakdown.userHubToDestHubKm} km
                        </div>
                      </div>

                      {currentTravel.breakdown.destHubToDestKm && currentTravel.breakdown.destHubToDestKm > 0 && (
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            {getModeIcon('cab')}
                            <span className="text-sm">CAB from {currentTravel.breakdown.destHubName}</span>
                          </div>
                          <div className="text-sm">
                            ₹{(currentTravel.breakdown.destCabCost ?? 0).toLocaleString()} • {currentTravel.breakdown.destHubToDestKm} km
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentTravel.breakdown?.directDriveKm && currentTravel.breakdown.directDriveKm > 0 && (
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <ModeIcon mode={currentTravel.mode} />
                        <span className="text-sm">Direct {currentTravel.mode}</span>
                      </div>
                      <div className="text-sm">
                        ₹{(currentTravel.totalCost ?? 0).toLocaleString()} • {currentTravel.breakdown.directDriveKm} km
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Why */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                      Why this mode?
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {currentTravel?.whySuitable ?? "We chose this route for the best balance of cost, time and comfort."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}