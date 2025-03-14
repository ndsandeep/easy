import axios from 'axios';

const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;
const TOMTOM_API_BASE_URL = 'https://api.tomtom.com/traffic/services/4/flowSegmentData';

interface TrafficResponse {
  flowSegmentData: {
    currentSpeed: number;
    freeFlowSpeed: number;
    currentTravelTime: number;
    freeFlowTravelTime: number;
    confidence: number;
    roadClosure: boolean;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

interface TrafficInfo {
  hasTraffic: boolean;
  trafficSegments: [number, number][];
  severity: 'low' | 'medium' | 'high';
  delay: number;
}

export const getTrafficInfo = async (coordinates: [number, number][]): Promise<TrafficInfo> => {
  const trafficSegments: [number, number][] = [];
  let totalDelay = 0;
  let maxSpeedRatio = 1;
  
  // Check every 5th coordinate to reduce API calls but maintain coverage
  const stride = 5;
  const checkPoints = coordinates.filter((_, index) => index % stride === 0);

  const trafficPromises = checkPoints.map(async (coord) => {
    try {
      const response = await axios.get<TrafficResponse>(`${TOMTOM_API_BASE_URL}/absolute/10/json`, {
        params: {
          key: TOMTOM_API_KEY,
          point: `${coord[0]},${coord[1]}`,
        },
      });

      const { currentSpeed, freeFlowSpeed, currentTravelTime, freeFlowTravelTime, roadClosure } = response.data.flowSegmentData;
      
      // If road is closed, consider it as severe traffic
      if (roadClosure) {
        trafficSegments.push(coord);
        totalDelay += 1000; // Add a large delay for closed roads
        maxSpeedRatio = 0;
        return;
      }

      const speedRatio = currentSpeed / freeFlowSpeed;
      const delay = currentTravelTime - freeFlowTravelTime;

      // Update max speed ratio if this segment is more congested
      maxSpeedRatio = Math.min(maxSpeedRatio, speedRatio);

      // Consider traffic if speed is less than 70% of free flow speed
      if (speedRatio < 0.7) {
        trafficSegments.push(coord);
        totalDelay += delay;
      }
    } catch (error) {
      console.error('Error fetching traffic data:', error);
    }
  });

  await Promise.all(trafficPromises);

  // Determine traffic severity based on the worst speed ratio encountered
  let severity: 'low' | 'medium' | 'high';
  if (maxSpeedRatio > 0.7) {
    severity = 'low';
  } else if (maxSpeedRatio > 0.4) {
    severity = 'medium';
  } else {
    severity = 'high';
  }

  return {
    hasTraffic: trafficSegments.length > 0,
    trafficSegments,
    severity,
    delay: totalDelay
  };
};