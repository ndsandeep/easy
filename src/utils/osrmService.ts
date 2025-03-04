import axios from "axios";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteData {
  coordinates: [number, number][];
  distance?: number;  // in meters
  duration?: number;  // in seconds
}

export const fetchRoute = async (
  source: Coordinates,
  destination: Coordinates
): Promise<RouteData> => {
  try {
    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`
    );

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error("No route found");
    }

    const route = response.data.routes[0];
    const routeCoordinates: [number, number][] =
      route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] // Convert to LatLngTuple
      );

    return { 
      coordinates: routeCoordinates,
      distance: route.distance,
      duration: route.duration
    };
  } catch (error) {
    console.error("Error fetching route:", error);
    throw new Error("Failed to fetch route");
  }
};

// Function to check for traffic conditions (simulated)
export const checkTrafficConditions = async (
  routeCoordinates: [number, number][]
): Promise<{
  hasTraffic: boolean;
  trafficSegments?: [number, number][];
}> => {
  // This is a simulated function - in a real app, you would call a traffic API
  // For demo purposes, we'll randomly determine if there's traffic
  
  const hasTraffic = Math.random() > 0.7; // 30% chance of traffic
  
  if (!hasTraffic) {
    return { hasTraffic: false };
  }
  
  // Simulate traffic segments by selecting random portions of the route
  const trafficSegments: [number, number][] = [];
  
  if (routeCoordinates.length > 10) {
    const startIndex = Math.floor(Math.random() * (routeCoordinates.length / 2));
    const endIndex = startIndex + Math.floor(Math.random() * 5) + 3; // 3-8 segments with traffic
    
    for (let i = startIndex; i < endIndex && i < routeCoordinates.length; i++) {
      trafficSegments.push(routeCoordinates[i]);
    }
  }
  
  return {
    hasTraffic: true,
    trafficSegments
  };
};

// Function to suggest alternative routes
export const getAlternativeRoutes = async (
  source: Coordinates,
  destination: Coordinates
): Promise<RouteData[]> => {
  try {
    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true`
    );

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error("No routes found");
    }

    return response.data.routes.map((route: any) => {
      const routeCoordinates: [number, number][] =
        route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );

      return {
        coordinates: routeCoordinates,
        distance: route.distance,
        duration: route.duration
      };
    });
  } catch (error) {
    console.error("Error fetching alternative routes:", error);
    throw new Error("Failed to fetch alternative routes");
  }
};