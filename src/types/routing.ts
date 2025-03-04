export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Route {
  distance: number;
  duration: number;
  coordinates: [number, number][];
}

export interface TrafficAlert {
  severity: 'low' | 'medium' | 'high';
  location: [number, number];
  description: string;
}