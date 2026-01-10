// client/vite-project/src/components/LocationInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import locationsDataRaw from '@/data/locations.json';
const locationsData = locationsDataRaw as LocationData[];

interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  state: string;
  nearest_hubs: {
    airports: Array<{
      name: string;
      code: string;
      city: string;
      distance_km: number;
      latitude: number;
      longitude: number;
    }>;
    railway_stations: Array<{
      name: string;
      code: string;
      city: string;
      distance_km: number;
      latitude: number;
      longitude: number;
    }>;
  };
}

interface LocationInputProps {
  onChange: (location: LocationData) => void;
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
  placeholder?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  onChange,
  showLabel = false,
  showIcon = true,
  className = '',
  placeholder = 'Where are you now?'
}) => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestions = (input: string): LocationData[] => {
    const escaped = input.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!escaped) return [];
    const regex = new RegExp('^' + escaped, 'i');
    return locationsData.filter((loc: LocationData) => regex.test(loc.name));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    const newSuggestions = getSuggestions(newValue);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: LocationData) => {
    setValue(suggestion.name);
    setShowSuggestions(false);
    onChange(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {showLabel && (
        <label className="block text-sm font-medium mb-2">
          Your Current Location
        </label>
      )}
      
      <div className="relative">
        {showIcon && (
          <MapPin 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white dark:text-white pointer-events-none z-10" 
          />
        )}
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className={cn(
            showIcon && 'pl-10',
            className
          )}
          required
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto scrollbar-thin">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.name}-${suggestion.state}`}
              className={cn(
                "px-4 py-2.5 cursor-pointer transition-colors duration-150",
                "text-sm text-foreground",
                "hover:bg-accent/70 hover:text-accent-foreground",
                highlightedIndex === index && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-medium">{suggestion.name}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                  , {suggestion.state}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;