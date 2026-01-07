// client/vite-project/src/components/CostBreakdown.tsx
import { Card } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";

interface TravelDetail {
  mode: string;
  cost?: number;
  dist?: number;
}

interface CostBreakdownProps {
  breakdown?: {
    travel?: number;
    accommodation?: number;
    localExpenses?: number;
    activities?: number;
    food?: number;
    buffer?: number;
    [k: string]: any;
  };
  total?: number;
  travelDetails?: TravelDetail[];
}

/**
 * Displays clean cost summary with optional per-mode travel breakdown.
 * Handles missing or partial data gracefully.
 */
export function CostBreakdown({
  breakdown = {},
  total = 0,
  travelDetails = [],
}: CostBreakdownProps) {
  const {
    travel = 0,
    accommodation = 0,
    localExpenses = 0,
    activities = 0,
    food = 0,
    buffer = 0,
  } = breakdown;

  const items = [
    { label: "Travel", value: travel, color: "bg-chart-1" },
    { label: "Accommodation", value: accommodation, color: "bg-chart-2" },
    { label: "Local Expenses", value: localExpenses, color: "bg-chart-3" },
    { label: "Activities", value: activities, color: "bg-chart-4" },
    { label: "Food", value: food, color: "bg-chart-5" },
    { label: "Buffer", value: buffer, color: "bg-muted" },
  ].filter((i) => (i.value ?? 0) > 0);

  const computedTotal =
    total && total > 0
      ? total
      : items.reduce((s, v) => s + (v.value ?? 0), 0);

  return (
    <Card className="p-6 space-y-4" data-testid="card-cost-breakdown">
      <h3 className="font-semibold text-lg mb-2">Cost Breakdown</h3>

      {/* Breakdown Bars */}
      <div className="space-y-3">
        {items.map((item) => {
          const percentage = (item.value / computedTotal) * 100;
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium flex items-center gap-0.5">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {item.value.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Travel Mode Detail */}
      {Array.isArray(travelDetails) && travelDetails.length > 0 && (
        <div className="mt-4 border-t pt-3 text-sm text-muted-foreground space-y-1.5">
          <p className="font-medium text-foreground mb-1">Travel Details:</p>
          {travelDetails.map((t, i) => (
            <div key={`${t.mode}-${i}`} className="flex justify-between">
              <span>
                {t.mode?.toUpperCase()}{" "}
                {t.dist ? `(${t.dist} km)` : ""}
              </span>
              <span>₹{t.cost?.toLocaleString?.() ?? "—"}</span>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      <div className="pt-4 border-t flex items-center justify-between">
        <span className="font-semibold">Total Cost</span>
        <span
          className="font-bold text-xl flex items-center gap-0.5"
          data-testid="text-total-cost"
        >
          <IndianRupee className="h-5 w-5" />
          {computedTotal.toLocaleString()}
        </span>
      </div>
    </Card>
  );
}
