import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
const MAPPLS_API_KEY = "5d26d6e1ab4850cb1d8ab5502cf02fdf"; 


interface MapProps {
  sourceCoords: { lat: number; lng: number };
  destinationCoords: { lat: number; lng: number };
}

const MapComponent: React.FC<MapProps> = ({ sourceCoords, destinationCoords }) => {
  const [route, setRoute] = useState<{ lat: number; lng: number }[]>([]);

  useEffect(() => {
    fetchRoute(sourceCoords, destinationCoords);
  }, [sourceCoords, destinationCoords]);

  const fetchRoute = async (source: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    try {
      const response = await axios.get<{ routes?: { geometry?: { coordinates: [number, number][] } }[] }>(
        `https://apis.mappls.com/advancedmaps/v1/${MAPPLS_API_KEY}/route_eta/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}`
      );
  
      if (response.data?.routes?.[0]?.geometry?.coordinates) {
        const routeCoords = response.data.routes[0].geometry.coordinates.map((coord) => ({
          lat: coord[1], // Latitude
          lng: coord[0], // Longitude
        }));
        setRoute(routeCoords);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };
  
  return (
    <MapContainer center={[sourceCoords.lat, sourceCoords.lng]} zoom={3} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[sourceCoords.lat, sourceCoords.lng]} />
      <Marker position={[destinationCoords.lat, destinationCoords.lng]} />
      {route.length > 0 && <Polyline positions={route} color="blue" />}
    </MapContainer>
  );
};

export default MapComponent;
