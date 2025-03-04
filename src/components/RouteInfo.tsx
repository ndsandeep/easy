import React from 'react';
import { Clock, Route, ArrowRight } from 'lucide-react';

interface Route {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  isSelected: boolean;
}

interface RouteInfoProps {
  routes: Route[];
  selectedRouteIndex: number;
  onRouteSelect: (index: number) => void;
  sourceName: string;
  destinationName: string;
}

const RouteInfo: React.FC<RouteInfoProps> = ({
  routes,
  selectedRouteIndex,
  onRouteSelect,
  sourceName,
  destinationName
}) => {
  // Format distance to km or m
  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // Format duration to hours and minutes
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  // Get short names for source and destination
  const getShortName = (fullName: string): string => {
    if (!fullName) return '';
    
    // Split by commas and take the first part
    const parts = fullName.split(',');
    return parts[0].trim();
  };

  const shortSourceName = getShortName(sourceName);
  const shortDestName = getShortName(destinationName);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Route className="h-5 w-5 mr-2 text-blue-600" />
        Route Options
      </h3>
      
      <div className="mb-4 flex items-center text-sm text-gray-600">
        <span className="font-medium">{shortSourceName}</span>
        <ArrowRight className="mx-2 h-4 w-4" />
        <span className="font-medium">{shortDestName}</span>
      </div>
      
      <div className="space-y-3">
        {routes.map((route, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              route.isSelected 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => onRouteSelect(index)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  route.isSelected ? 'bg-blue-500' : 'bg-gray-300'
                }`}></div>
                <span className="font-medium">
                  {index === 0 ? 'Fastest Route' : `Alternative ${index}`}
                </span>
              </div>
              {route.isSelected && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Selected
                </span>
              )}
            </div>
            
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatDuration(route.duration)}</span>
              <span className="mx-2">•</span>
              <span>{formatDistance(route.distance)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteInfo;