// client/vite-project/src/components/ModeIcon.tsx
import { Plane, Train, Bus, Car, MapPin } from "lucide-react";

interface ModeIconProps {
  mode?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ModeIcon({ mode, size = "md", className }: ModeIconProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };
  
  const sizeClass = sizes[size];
  const combinedClassName = `${sizeClass} ${className || ''}`.trim();
  
  if (!mode) return <MapPin className={combinedClassName} />;
  
  const m = mode.toLowerCase();
  
  if (m.includes("flight") || m.includes("air")) 
    return <Plane className={combinedClassName} />;
  if (m.includes("train")) 
    return <Train className={combinedClassName} />;
  if (m.includes("bus")) 
    return <Bus className={combinedClassName} />;
  if (m.includes("cab") || m.includes("car") || m.includes("drive")) 
    return <Car className={combinedClassName} />;
  
  return <MapPin className={combinedClassName} />;
}