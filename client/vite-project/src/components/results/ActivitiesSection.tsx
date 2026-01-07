// client/vite-project/src/components/results/ActivitiesSection.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface ActivityType {
  name: string;
  type: string;
  duration: number;
  cost: number;
  description?: string;
}

interface ActivitiesSectionProps {
  activities: ActivityType[];
  selectedActivities: ActivityType[];
  onToggleActivity: (activity: ActivityType) => void;
}

export function ActivitiesSection({ 
  activities, 
  selectedActivities, 
  onToggleActivity 
}: ActivitiesSectionProps) {
  if (activities.length === 0) return null;

  return (
    <section>
      <h2 className="font-display font-semibold text-2xl mb-4">
        Optional Activities
        <Badge variant="secondary" className="ml-2">
          {selectedActivities.length} selected
        </Badge>
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {activities.map((activity: ActivityType, idx: number) => {
          const isSelected = selectedActivities.some(a => a.name === activity.name);
          return (
            <Card 
              key={idx} 
              className={`p-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              onClick={() => onToggleActivity(activity)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{activity.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.duration}h • {activity.type}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">₹{(activity.cost || 0).toLocaleString()}</div>
                  <Badge variant={isSelected ? "default" : "outline"} className="mt-1">
                    {isSelected ? "Added" : "Add"}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}