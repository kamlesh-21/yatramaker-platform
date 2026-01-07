// client/vite-project/src/components/DayScheduleCard.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Moon, Star, Navigation, Utensils, Hotel, Activity, IndianRupee } from "lucide-react";

interface DayScheduleCardProps {
  day: any;
}

export function DayScheduleCard({ day }: DayScheduleCardProps) {
  const timeline = day.timeline || [];
  
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-bold text-primary">D{day.day}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{day.title}</h3>
              <p className="text-sm text-muted-foreground">{day.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="gap-1">
              <Moon className="h-3 w-3" />
              {day.overnight}
            </Badge>
            {day.daySummary?.highlight && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                {day.daySummary.highlight}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            ₹{day.daySummary?.totalCost?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-muted-foreground">Day cost</div>
        </div>
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="space-y-4 mt-6">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Daily Timeline
          </h4>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            {timeline.map((event: any, index: number) => (
              <div key={index} className="relative flex items-start gap-4 mb-4 last:mb-0">
                {/* Time dot */}
                <div className="relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    event.type === 'travel' ? 'bg-blue-100 text-blue-600' :
                    event.type === 'meal' ? 'bg-green-100 text-green-600' :
                    event.type === 'accommodation' ? 'bg-purple-100 text-purple-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {event.type === 'travel' ? <Navigation className="h-4 w-4" /> :
                     event.type === 'meal' ? <Utensils className="h-4 w-4" /> :
                     event.type === 'accommodation' ? <Hotel className="h-4 w-4" /> :
                     <Activity className="h-4 w-4" />}
                  </div>
                </div>
                
                {/* Event details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{event.description}</div>
                      {event.details && (
                        <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{event.time}</div>
                      {event.duration > 0 && (
                        <div className="text-xs text-muted-foreground">{event.duration}h</div>
                      )}
                    </div>
                  </div>
                  
                  {event.cost > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                      <IndianRupee className="h-3 w-3" />
                      <span>{event.cost}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Summary Stats */}
      {day.daySummary && (
        <div className="grid grid-cols-4 gap-3 mt-6 pt-6 border-t">
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-xs text-muted-foreground">Travel</div>
            <div className="font-bold">{day.daySummary.travelTime?.toFixed(1)}h</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-xs text-muted-foreground">Activities</div>
            <div className="font-bold">{day.daySummary.activityTime}h</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-xs text-muted-foreground">Rest</div>
            <div className="font-bold">{day.daySummary.restTime}h</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="font-bold">₹{day.daySummary.totalCost}</div>
          </div>
        </div>
      )}
    </Card>
  );
}