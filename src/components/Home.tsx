import React, { useState } from "react";
import MapComponent from "./Map";

const DEFAULT_LOCATIONS = [
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Tokyo", lat: 35.6895, lng: 139.6917 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Guntur", lat: 16.3142, lng: 80.4350 },
  { name: "Nambur", lat: 16.3626, lng: 80.5017 },
];

const Home: React.FC = () => {
  const [source, setSource] = useState(DEFAULT_LOCATIONS[0]);
  const [destination, setDestination] = useState(DEFAULT_LOCATIONS[1]);

  return (
    <div className="p-6 max-w-3xl mx-auto ">
      <h1 className="text-2xl font-bold mb-4 text-red-500">Global Route Planner</h1>

      {/* Dropdown for Source Selection */}
      <label>Source:</label>
      <select onChange={(e) => setSource(DEFAULT_LOCATIONS.find(loc => loc.name === e.target.value)!)}>
        {DEFAULT_LOCATIONS.map((loc) => (
          <option key={loc.name} value={loc.name}>{loc.name}</option>
        ))}
      </select>

      {/* Dropdown for Destination Selection */}
      <label className="ml-4">Destination:</label>
      <select onChange={(e) => setDestination(DEFAULT_LOCATIONS.find(loc => loc.name === e.target.value)!)}>
        {DEFAULT_LOCATIONS.map((loc) => (
          <option key={loc.name} value={loc.name}>{loc.name}</option>
        ))}
      </select>

      {/* Map Display */}
      <div className="mt-4">
        <MapComponent sourceCoords={source} destinationCoords={destination} />
      </div>
    </div>
  );
};

export default Home;
