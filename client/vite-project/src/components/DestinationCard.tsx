// client/vite-project/src/components/DestinationCard.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  IndianRupee,
  ArrowRight
} from "lucide-react";
import bodhGayaImg from "@assets/generated_images/Bodh_Gaya_temple_sunrise_f3cba291.png";
import nalandaImg from "@assets/generated_images/Nalanda_University_ruins_aerial_c0f04892.png";
import rajgirImg from "@assets/generated_images/Rajgir_hills_and_springs_0e31c4ac.png";
import keralaImg from "@assets/generated_images/Kerala_backwaters_with_houseboat_c52667af.png";

const fallbackImages = [bodhGayaImg, nalandaImg, rajgirImg, keralaImg];

interface DestinationCardProps {
  data: any;
  onClick: () => void;
}

export default function DestinationCard({ data, onClick }: DestinationCardProps) {
  const dest = data?.destination ?? {};
  
  // Name extraction
  const nameCandidate = dest?.name ?? dest?.title ?? data?.title;
  const name = Array.isArray(nameCandidate) ? nameCandidate[0] : 
              (typeof nameCandidate === 'object' ? (nameCandidate?.text || JSON.stringify(nameCandidate)) : nameCandidate) || 
              "Unknown Destination";

  // Image selection
  const backendImage =
    Array.isArray(dest?.images) && dest.images.length > 0
      ? typeof dest.images[0] === "string"
        ? dest.images[0]
        : dest.images[0].url || dest.images[0].image_url || dest.images[0].secure_url
      : Array.isArray(data?.images) && data.images.length > 0
      ? (typeof data.images[0] === 'string' ? data.images[0] : data.images[0].url)
      : null;

  const displayImage = backendImage || fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

  // Cost calculation
  const totalCost = data.totalCost ?? data.total_cost ?? data.variants?.[0]?.totalCost?.base ?? data.price ?? 0;

  // Type tags - take only first 2 for minimal display
  const rawTypes = dest?.type ?? dest?.categories ?? [];
  const typeTags: string[] = Array.isArray(rawTypes)
    ? rawTypes.map((t: any) => (typeof t === "string" ? t : t?.name || String(t))).slice(0, 2)
    : [];

  // Travel variants data
  const variants = data.variants || [];
  
  // Get unique variant labels (remove duplicates)
  const uniqueVariants = variants.reduce((acc: any[], variant: any) => {
    if (!acc.find((v: any) => v.label === variant.label)) {
      acc.push(variant);
    }
    return acc;
  }, []);

  // Safe number formatting
  const formatCost = (cost: any) => {
    const num = Number(cost);
    return isNaN(num) ? "Calculating..." : `₹${num.toLocaleString()}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col">
      {/* Image Hero Section - Takes 70% of card */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <img
          src={displayImage}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Top Badges - Minimal */}
        <div className="absolute top-3 left-3 flex gap-1">
          {typeTags.slice(0, 1).map((tag: string, i: number) => (
            <Badge key={i} variant="secondary" className="bg-primary/90 text-primary-foreground text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Bottom Content Over Image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white drop-shadow-md mb-1 line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-white/90 text-sm">
              <MapPin className="h-3 w-3" />
              <span>{dest?.location?.state || "India"}</span>
            </div>
            <div className="text-white font-semibold text-sm bg-black/30 px-2 py-1 rounded">
              {formatCost(totalCost)}
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Content Section - Takes 30% of card */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        {/* Travel Options - Very Compact */}
        {uniqueVariants.length > 0 && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1 justify-center">
              {uniqueVariants.slice(0, 2).map((variant: any, idx: number) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="text-xs capitalize bg-background/80"
                >
                  {variant.label}
                </Badge>
              ))}
              {uniqueVariants.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{uniqueVariants.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={onClick} 
          className="w-full gap-2" 
          size="sm"
          variant="outline"
        >
          Explore
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}