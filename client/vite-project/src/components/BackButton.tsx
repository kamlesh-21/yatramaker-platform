// // components/BackButton.tsx - Enhanced version
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, Home, Bookmark } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";

// interface BackButtonProps {
//   variant?: 'ghost' | 'outline' | 'default';
//   size?: 'default' | 'sm' | 'lg' | 'icon';
//   showIcon?: boolean;
//   customText?: string;
// }

// export const BackButton = ({ 
//   variant = 'ghost', 
//   size = 'default',
//   showIcon = true,
//   customText 
// }: BackButtonProps) => {
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   const isFromSaved = (location.state as any)?.fromSaved;
//   const isFromDashboard = location.pathname.includes('dashboard');
//   const isFromSearch = location.pathname.includes('results');
  
//   const getBackDestination = () => {
//     if (isFromSaved) return '/itineraries';
//     if (isFromDashboard) return '/dashboard';
//     if (isFromSearch) return '/results';
//     return '/';
//   };
  
//   const getButtonText = () => {
//     if (customText) return customText;
//     if (isFromSaved) return 'My Itineraries';
//     if (isFromDashboard) return 'Dashboard';
//     if (isFromSearch) return 'Back to Results';
//     return 'Home';
//   };
  
//   const getIcon = () => {
//     if (isFromSaved) return <Bookmark className="mr-2 h-4 w-4" />;
//     if (isFromDashboard || isFromSearch) return <ArrowLeft className="mr-2 h-4 w-4" />;
//     return <Home className="mr-2 h-4 w-4" />;
//   };
  
//   return (
//     <Button 
//       variant={variant} 
//       size={size}
//       onClick={() => navigate(getBackDestination())}
//     >
//       {showIcon && getIcon()}
//       {getButtonText()}
//     </Button>
//   );
// };

// src/components/BackButton.tsx
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Bookmark, Search } from "lucide-react";
import { useNavigation } from "@/context/NavigationContext";
import { useLocation } from "react-router-dom";

export const BackButton = () => {
  const { source } = useNavigation();
  const location = useLocation();

  // Determine if back button should be shown
  const shouldShowBack = [
    '/destination/',
    '/itinerary/',
    '/results'
  ].some(path => location.pathname.startsWith(path));

  if (!shouldShowBack) return null;

  const getBackDestination = () => {
    // Heuristic: use sessionStorage fallback if `source` is 'unknown' or stale
    const fallbackSource = sessionStorage.getItem('navSource') as any || 'unknown';

    switch (source || fallbackSource) {
      case 'saved': return '/itineraries';
      case 'dashboard': return '/dashboard';
      case 'search': return '/results';
      case 'home': return '/';
      default:
        // Deep link fallback: try to infer context from URL
        if (location.pathname.startsWith('/destination/') || location.pathname.startsWith('/itinerary/')) {
          return '/results'; // most common flow
        }
        return '/';
    }
  };

const getButtonText = () => {
  if (location.state?.fromDashboard) {
    return 'Back to Dashboard';
  }
  if (location.state?.fromItineraries) {
    return 'Back to Itineraries';
  }
  switch (source) {
    case 'saved': return 'My Itineraries';
    case 'dashboard': return 'Dashboard';
    case 'search': return 'Back to Results';
    default: return 'Home';
  }
};

  const getIcon = () => {
    switch (source) {
      case 'saved': return <Bookmark className="h-4 w-4 mr-2" />;
      case 'dashboard':
      case 'search':
      default: return <ArrowLeft className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        const dest = getBackDestination();
        window.history.replaceState(null, '', dest); // Optional: replace current state to avoid cycles
        window.history.back(); // safer than navigate(dest) — preserves browser back stack
      }}
      className="md:hidden" // mobile only
    >
      {getIcon()}
      <span className="truncate max-w-[120px]">{getButtonText()}</span>
    </Button>
  );
};