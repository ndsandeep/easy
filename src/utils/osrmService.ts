import axios from 'axios';
import { getTrafficInfo } from './trafficService';

const OSRM_API_BASE = 'https://router.project-osrm.org/route/v1/driving';

interface Route {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  isSelected: boolean;
  hasTraffic?: boolean;
  trafficSegments?: [number, number][];
}

export async function getAlternativeRoutes(
  source: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<Route[]> {
  try {
    const response = await axios.get(
      `${OSRM_API_BASE}/${source.lng},${source.lat};${destination.lng},${destination.lat}`,
      {
        params: {
          alternatives: true,
          steps: true,
          geometries: 'geojson',
          overview: 'full'
        }
      }
    );

    const routes: Route[] = await Promise.all(
      response.data.routes.map(async (route: any) => {
        const coordinates = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );

        // Get traffic information for this route
        const trafficInfo = await getTrafficInfo(coordinates);

        return {
          coordinates,
          distance: route.distance,
          duration: route.duration,
          isSelected: false,
          hasTraffic: trafficInfo.hasTraffic,
          trafficSegments: trafficInfo.trafficSegments
        };
      })
    );

    // Mark the first route as selected by default
    if (routes.length > 0) {
      routes[0].isSelected = true;
    }

    return routes;
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
}
