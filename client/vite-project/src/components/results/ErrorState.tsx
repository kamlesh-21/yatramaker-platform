// client/vite-project/src/components/ErrorState.tsx
import { AlertCircle, ArrowLeft, Compass } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-destructive/5 p-4">
      <Card className="p-8 max-w-md text-center border-destructive/20 shadow-lg">
        <div className="relative">
          <AlertCircle className="h-20 w-20 text-destructive mx-auto mb-4" />
          <div className="absolute inset-0 bg-destructive/10 blur-xl rounded-full" />
        </div>
        <h2 className="text-2xl font-semibold mb-3 text-destructive">Journey Interrupted</h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={onRetry} className="gap-2">
            <Compass className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </Card>
    </div>
  );
}