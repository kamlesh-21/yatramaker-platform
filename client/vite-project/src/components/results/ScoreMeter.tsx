// client/vite-project/src/components/ScoreMeter.tsx
import { Progress } from "@/components/ui/progress";

interface ScoreMeterProps {
  value: number;
  label: string;
  max?: number;
  showValue?: boolean;
}

export function ScoreMeter({ value, label, max = 10, showValue = true }: ScoreMeterProps) {
  const percentage = (value / max) * 100;
  
  const getColor = (val: number) => {
    if (val >= 8) return "bg-emerald-500";
    if (val >= 6) return "bg-blue-500";
    if (val >= 4) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getTextColor = (val: number) => {
    if (val >= 8) return "text-emerald-700";
    if (val >= 6) return "text-blue-700";
    if (val >= 4) return "text-yellow-700";
    return "text-orange-700";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        {showValue && (
          <span className={`font-bold ${getTextColor(value)}`}>
            {value.toFixed(1)}<span className="text-muted-foreground">/{max}</span>
          </span>
        )}
      </div>
      <div className="relative">
        <Progress value={percentage} className={`h-2.5 bg-muted ${getColor(value)}`} />
        <div className="absolute -top-1.5 left-0 right-0 flex justify-between px-0.5">
          {[0, 25, 50, 75, 100].map((pos) => (
            <div key={pos} className="h-1 w-0.5 bg-muted-foreground/30 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}