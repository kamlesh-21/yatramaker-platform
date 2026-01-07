//client/vite-project/src/components/TravelOptionCard.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndianRupee, Clock, TrendingDown, Zap, Award } from "lucide-react";

interface TravelOptionCardProps {
  type: 'cheapest' | 'fastest' | 'comfortable';
  totalCost: number;
  totalTimeH: number;
  comfortScore: number;
  mode?: string;          // ✅ ADD THIS
  modeIcon?: React.ReactNode; // ✅ ADD THIS
  isSelected: boolean;
  onSelect: () => void;
}

export function TravelOptionCard({
  type,
  totalCost,
  totalTimeH,
  comfortScore,
  mode,          // ✅ add
  modeIcon,      // ✅ add
  isSelected,
  onSelect,
}: TravelOptionCardProps) {
  const config = {
    cheapest: {
      icon: TrendingDown,
      label: "Most Economical",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    fastest: {
      icon: Zap,
      label: "Quickest Route",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    comfortable: {
      icon: Award,
      label: "Best Comfort",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
  };

  const Icon = config[type].icon;

  return (
    <Card
      className={`p-6 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-primary" : "hover-elevate"
      }`}
      onClick={onSelect}
      data-testid={`card-travel-option-${type}`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className={`p-2.5 rounded-md ${config[type].bgColor}`}>
            <Icon className={`h-5 w-5 ${config[type].color}`} />
          </div>
          {isSelected && <Badge variant="default">Selected</Badge>}
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-1">{config[type].label}</h3>
          {/* 👇 NEW: Mode badge */}
          {mode && (
            <Badge variant="secondary" className="mt-1 flex items-center gap-1.5 px-2 py-1 text-xs">
              {modeIcon}
              <span className="capitalize">{mode}</span>
            </Badge>
          )}
          <p className="text-sm text-muted-foreground capitalize mt-1">{type} option</p>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <IndianRupee className="h-4 w-4" />
              Cost
            </span>
            <span className="font-semibold" data-testid={`text-cost-${type}`}>
              ₹{totalCost.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Time
            </span>
            <span className="font-semibold">{totalTimeH}h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              Comfort
            </span>
            <span className="font-semibold">{comfortScore}/10</span>
          </div>
        </div>

        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          data-testid={`button-select-${type}`}
        >
          {isSelected ? "Selected" : "Select"}
        </Button>
      </div>
    </Card>
  );
}
