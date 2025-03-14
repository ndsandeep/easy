import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap, Circle } from "react-leaflet"; 
import L, { LatLngExpression, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAlternativeRoutes } from "../utils/osrmService";
import { Loader2 } from "lucide-react";

// Create custom marker icons to ensure they display properly
const createCustomIcon = (color = 'blue') => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Define TypeScript Types
interface Coordinates {
  lat: number;
  lng: number;
}

interface Route {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  isSelected: boolean;
  hasTraffic?: boolean;
  trafficSegments?: [number, number][];
  severity?: 'low' | 'medium' | 'high';
  delay?: number;
}

interface MapProps {
  source: Coordinates | null;
  destination: Coordinates | null;
  routes: Route[];
  onRoutesLoaded: (routes: Route[]) => void;
  onRouteSelect: (index: number) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

// Component to handle map view updates
const MapUpdater: React.FC<{
  source: Coordinates | null;
  destination: Coordinates | null;
  routes: Route[];
}> = ({ source, destination, routes }) => {
  const map = useMap();
  
  useEffect(() => {
    if (source && destination) {
      const bounds = L.latLngBounds(
        [source.lat, source.lng],
        [destination.lat, destination.lng]
      );
      
      // If we have routes, include all route points in the bounds
      if (routes.length > 0) {
        const selectedRoute = routes.find(r => r.isSelected) || routes[0];
        if (selectedRoute) {
          selectedRoute.coordinates.forEach(point => {
            bounds.extend(point);
          });
        }
      }
      
      // Add some padding around the bounds
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (source) {
      map.setView([source.lat, source.lng], 13);
    } else if (destination) {
      map.setView([destination.lat, destination.lng], 13);
    }
  }, [map, source, destination, routes]);
  
  return null;
};

const defaultCenter: LatLngExpression = [16.3067, 80.4365]; // Default to Guntur

const Map: React.FC<MapProps> = ({ 
  source, 
  destination, 
  routes, 
  onRoutesLoaded, 
  onRouteSelect,
  isLoading,
  setIsLoading
}) => {
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const sourceIcon = createCustomIcon('green');
  const destinationIcon = createCustomIcon('red');

  const getTrafficColor = (severity?: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return '#ef4444'; // red
      case 'medium':
        return '#f97316'; // orange
      case 'low':
        return '#22c55e'; // green
      default:
        return '#ef4444';
    }
  };

  useEffect(() => {
    if (source && destination) {
      setIsLoading(true);
      setError(null);
      
      getAlternativeRoutes(source, destination)
        .then((data) => {
          onRoutesLoaded(data);
        })
        .catch((err) => {
          console.error("Error fetching routes:", err);
          setError("Failed to fetch routes. Please try again.");
          setIsLoading(false);
        });
    }
  }, [source, destination, onRoutesLoaded, setIsLoading]);

  const handleRouteClick = (index: number) => {
    onRouteSelect(index);
  };

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute top-2 right-2 z-[1000] bg-white px-3 py-1 rounded-full shadow-md text-sm flex items-center">
          <Loader2 className="animate-spin h-4 w-4 mr-2 text-blue-500" />
          Loading routes...
        </div>
      )}
      
      {error && (
        <div className="absolute top-2 right-2 z-[1000] bg-red-50 text-red-600 px-3 py-1 rounded-full shadow-md text-sm">
          {error}
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-md">
        <div className="text-sm font-medium mb-2">Traffic Legend</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 opacity-30"></div>
            <span className="text-xs">Heavy Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 opacity-30"></div>
            <span className="text-xs">Moderate Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 opacity-30"></div>
            <span className="text-xs">Clear Route</span>
          </div>
        </div>
      </div>
      
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        className="w-full h-full"
        whenCreated={(map) => { mapRef.current = map; }}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        
        {source && (
          <Marker 
            position={[source.lat, source.lng]}
            icon={sourceIcon}
            title="Source"
          />
        )}
        
        {destination && (
          <Marker 
            position={[destination.lat, destination.lng]}
            icon={destinationIcon}
            title="Destination"
          />
        )}
        
        {routes.map((route, index) => (
          <React.Fragment key={index}>
            <Polyline 
              positions={route.coordinates} 
              color={route.isSelected ? "#3b82f6" : "#9ca3af"} 
              weight={route.isSelected ? 5 : 3}
              opacity={route.isSelected ? 0.8 : 0.5}
              eventHandlers={{
                click: () => handleRouteClick(index)
              }}
              className="cursor-pointer"
            />
            {route.isSelected && route.trafficSegments && route.trafficSegments.map((segment, segIndex) => (
              <Circle
                key={`traffic-${segIndex}`}
                center={segment}
                radius={200}
                pathOptions={{
                  color: getTrafficColor(route.severity),
                  fillColor: getTrafficColor(route.severity),
                  fillOpacity: 0.3
                }}
              />
            ))}
          </React.Fragment>
        ))}
        
        <MapUpdater source={source} destination={destination} routes={routes} />
      </MapContainer>
    </div>
  );
};

export default Map;
