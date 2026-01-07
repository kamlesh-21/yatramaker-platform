// client/vite-project/src/components/LoadingState.tsx
import { Compass } from "lucide-react";

export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="text-center">
        <div className="relative">
          <Compass className="h-20 w-20 text-primary mx-auto mb-6 animate-pulse" />
          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Building Your Journey</h2>
        <p className="text-muted-foreground">Assembling the perfect itinerary...</p>
      </div>
    </div>
  );
}