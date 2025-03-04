import axios from "axios";

const GO_MAP_API_KEY = import.meta.env.VITE_GOMAP_API_KEY; // Ensure key is in .env
const BASE_URL = "https://api.gomap.com"; // Replace with actual GoMap API endpoint

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

export const fetchGoMapRoutes = async (source: Coordinates, destination: Coordinates): Promise<RouteData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/route`, {
      params: {
        origin: `${source.lat},${source.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: GO_MAP_API_KEY,
        alternatives: true, // Request alternative routes
      },
    });

    if (response.data && response.data.routes) {
      return response.data.routes.map((route: any) => ({
        coordinates: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]), // Convert to Leaflet format
        distance: route.distance,
        duration: route.duration,
      }));
    } else {
      throw new Error("Invalid response from GoMap API");
    }
  } catch (error) {
    console.error("Error fetching routes from GoMap:", error);
    throw error;
  }
};
