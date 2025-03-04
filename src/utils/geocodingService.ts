import axios from "axios";

// Define types for location results
export interface Location {
  placeName: string;
  latitude: number;
  longitude: number;
}

// Function to fetch geocoding suggestions using Google Maps API
export const fetchGeocodeSuggestions = async (query: string): Promise<Location[]> => {
  if (!query || query.length < 3) return [];
  
  try {
    // First try using Photon API which is based on OpenStreetMap data
    const response = await axios.get(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'EasyRoutePlanner/1.0'
        }
      }
    );

    // Transform response into the expected format
    return response.data.features.map((feature: any) => {
      const properties = feature.properties;
      const coordinates = feature.geometry.coordinates;
      
      // Build a more accurate and detailed place name
      let placeName = '';
      
      if (properties.name) placeName += properties.name;
      
      if (properties.street) {
        if (placeName) placeName += ', ';
        placeName += properties.street;
      }
      
      if (properties.housenumber) {
        if (properties.street) {
          placeName = placeName.replace(properties.street, `${properties.street} ${properties.housenumber}`);
        } else if (placeName) {
          placeName += `, ${properties.housenumber}`;
        } else {
          placeName = properties.housenumber;
        }
      }
      
      if (properties.city) {
        if (placeName) placeName += ', ';
        placeName += properties.city;
      } else if (properties.town) {
        if (placeName) placeName += ', ';
        placeName += properties.town;
      } else if (properties.village) {
        if (placeName) placeName += ', ';
        placeName += properties.village;
      }
      
      if (properties.state) {
        if (placeName) placeName += ', ';
        placeName += properties.state;
      }
      
      if (properties.country) {
        if (placeName) placeName += ', ';
        placeName += properties.country;
      }
      
      return {
        placeName: placeName || "Unknown location",
        latitude: coordinates[1],
        longitude: coordinates[0],
      };
    });
  } catch (error) {
    console.error("Error fetching geocode suggestions:", error);
    throw new Error("Failed to fetch geocode suggestions");
  }
};

// Function to perform reverse geocoding (coordinates to address)
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Using Photon's reverse geocoding API
    const response = await axios.get(
      `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'EasyRoutePlanner/1.0'
        }
      }
    );
    
    if (response.data.features && response.data.features.length > 0) {
      const properties = response.data.features[0].properties;
      
      // Build a more accurate and detailed place name
      let placeName = '';
      
      if (properties.name) placeName += properties.name;
      
      if (properties.street) {
        if (placeName) placeName += ', ';
        placeName += properties.street;
      }
      
      if (properties.housenumber) {
        if (properties.street) {
          placeName = placeName.replace(properties.street, `${properties.street} ${properties.housenumber}`);
        } else if (placeName) {
          placeName += `, ${properties.housenumber}`;
        } else {
          placeName = properties.housenumber;
        }
      }
      
      if (properties.city) {
        if (placeName) placeName += ', ';
        placeName += properties.city;
      } else if (properties.town) {
        if (placeName) placeName += ', ';
        placeName += properties.town;
      } else if (properties.village) {
        if (placeName) placeName += ', ';
        placeName += properties.village;
      }
      
      if (properties.state) {
        if (placeName) placeName += ', ';
        placeName += properties.state;
      }
      
      if (properties.country) {
        if (placeName) placeName += ', ';
        placeName += properties.country;
      }
      
      return placeName || "Unknown location";
    }
    
    return "Unknown location";
  } catch (error) {
    console.error("Error performing reverse geocoding:", error);
    throw new Error("Failed to get address from coordinates");
  }
};