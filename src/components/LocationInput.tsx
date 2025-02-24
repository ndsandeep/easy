import React, { useState } from "react";
import axios from "axios";
import { MapPin } from "lucide-react";

const MAPPLS_API_KEY = "5d26d6e1ab4850cb1d8ab5502cf02fdf"; // API Key

// Define API Response Type
interface Suggestion {
  placeName: string;
  latitude: number;
  longitude: number;
}

interface MapplsResponse {
  suggestedLocations: Suggestion[];
}

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onSelectLocation: (lat: number, lng: number) => void; // Callback for selecting a location
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  onSelectLocation,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const handleInputChange = async (text: string) => {
    onChange(text);

    if (text.length < 3) {
      setSuggestions([]); // Show suggestions only if 3+ characters are typed
      return;
    }

    try {
      const response = await axios.get<MapplsResponse>(
        `https://atlas.mappls.com/api/places/search/json?query=${text}&pod=CITY&access_token=${MAPPLS_API_KEY}`
      );

      if (response.data.suggestedLocations) {
        setSuggestions(response.data.suggestedLocations);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSelect = (place: Suggestion) => {
    onChange(place.placeName);
    onSelectLocation(place.latitude, place.longitude);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 mt-1 rounded-md w-full max-h-40 overflow-y-auto">
          {suggestions.map((place, index) => (
            <li
              key={index}
              onClick={() => handleSelect(place)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {place.placeName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationInput;
