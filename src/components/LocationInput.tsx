import React, { useState, useEffect, useRef } from "react";
import { fetchGeocodeSuggestions, reverseGeocode } from "../utils/geocodingService";
import { Search, Navigation, MapPin, Loader2 } from "lucide-react";

// Define the type for a suggestion
interface Suggestion {
  placeName: string;
  latitude: number;
  longitude: number;
}

interface LocationInputProps {
  source: string;
  destination: string;
  setSource: (value: string) => void;
  setDestination: (value: string) => void;
  onSelectSource: (coords: { lat: number; lng: number }) => void;
  onSelectDestination: (coords: { lat: number; lng: number }) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({
  source,
  destination,
  setSource,
  setDestination,
  onSelectSource,
  onSelectDestination,
  setIsLoading,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeInput, setActiveInput] = useState<"source" | "destination" | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const sourceCoords = useRef<{ lat: number; lng: number } | null>(null);
  const destCoords = useRef<{ lat: number; lng: number } | null>(null);

  // Debounce function to limit API calls
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedFetchSuggestions = useRef(
    debounce(async (value: string, type: "source" | "destination") => {
      if (value.length < 3) {
        setSuggestions([]);
        setActiveInput(null);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const results: Suggestion[] = await fetchGeocodeSuggestions(value);
        
        if (results.length > 0) {
          setSuggestions(results);
          setActiveInput(type);
        } else {
          setSuggestions([]);
          setActiveInput(null);
        }
      } catch (error) {
        console.error("Failed to fetch geocode suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300)
  ).current;

  const handleInputChange = (value: string, type: "source" | "destination") => {
    if (type === "source") setSource(value);
    else setDestination(value);
    
    debouncedFetchSuggestions(value, type);
  };

  const getCurrentLocation = async (forInput: "source" | "destination") => {
    setIsGettingLocation(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }
    
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          
          // Perform reverse geocoding to get the address
          try {
            const address = await reverseGeocode(latitude, longitude);
            
            if (forInput === "source") {
              setSource(address);
              onSelectSource(coords);
              sourceCoords.current = coords;
            } else {
              setDestination(address);
              onSelectDestination(coords);
              destCoords.current = coords;
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            setLocationError("Failed to get address from your location");
            
            // Even if reverse geocoding fails, still set the coordinates
            if (forInput === "source") {
              setSource(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
              onSelectSource(coords);
              sourceCoords.current = coords;
            } else {
              setDestination(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
              onSelectDestination(coords);
              destCoords.current = coords;
            }
          }
          
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Failed to get your location";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          
          setLocationError(errorMessage);
          setIsGettingLocation(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error("Geolocation error:", error);
      setLocationError("An unexpected error occurred while getting your location");
      setIsGettingLocation(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setActiveInput(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePlanRoute = () => {
    if (source && destination && sourceCoords.current && destCoords.current) {
      setIsLoading(true);
      onSelectSource(sourceCoords.current);
      onSelectDestination(destCoords.current);
      console.log("Planning route from", source, "to", destination);
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full relative">
      {locationError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-2 text-sm">
          {locationError}
        </div>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={source}
          onChange={(e) => handleInputChange(e.target.value, "source")}
          onFocus={() => source.length >= 3 && setActiveInput("source")}
          placeholder="Enter source location"
          className="pl-10 w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        {isLoadingSuggestions && activeInput === "source" && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
        <button
          onClick={() => getCurrentLocation("source")}
          disabled={isGettingLocation}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
          title="Use current location"
        >
          {isGettingLocation && activeInput === "source" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MapPin className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={destination}
          onChange={(e) => handleInputChange(e.target.value, "destination")}
          onFocus={() => destination.length >= 3 && setActiveInput("destination")}
          placeholder="Enter destination location"
          className="pl-10 w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        {isLoadingSuggestions && activeInput === "destination" && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
        <button
          onClick={() => getCurrentLocation("destination")}
          disabled={isGettingLocation}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
          title="Use current location"
        >
          {isGettingLocation && activeInput === "destination" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MapPin className="h-5 w-5" />
          )}
        </button>
      </div>

      {suggestions.length > 0 && activeInput && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto suggestions"
          style={{ top: activeInput === "source" ? "48px" : "108px" }}
        >
          {suggestions.map((s, index) => (
            <div
              key={index}
              className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => {
                if (activeInput === "source") {
                  setSource(s.placeName);
                  onSelectSource({ lat: s.latitude, lng: s.longitude });
                  sourceCoords.current = { lat: s.latitude, lng: s.longitude };
                } else {
                  setDestination(s.placeName);
                  onSelectDestination({ lat: s.latitude, lng: s.longitude });
                  destCoords.current = { lat: s.latitude, lng: s.longitude };
                }
                setActiveInput(null);
              }}
            >
              {s.placeName}
            </div>
          ))}
        </div>
      )}
      
      <button 
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center disabled:bg-blue-300 disabled:cursor-not-allowed"
        onClick={handlePlanRoute}
        disabled={!source || !destination}
      >
        {isGettingLocation ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Navigation className="mr-2" size={20} />
        )}
        Plan Route
      </button>
    </div>
  );
};

export default LocationInput;