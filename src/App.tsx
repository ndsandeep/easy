import React, { useState } from 'react';
import LocationInput from './components/LocationInput';
import Map from './components/Map';
import RouteInfo from './components/RouteInfo';
import { MapPin, Navigation } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Route {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  isSelected: boolean;
}

function App() {
  const [source, setSource] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [sourceCoords, setSourceCoords] = useState<Coordinates | null>(null);
  const [destCoords, setDestCoords] = useState<Coordinates | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRouteSelect = (index: number) => {
    setSelectedRouteIndex(index);
    setRoutes(prevRoutes => 
      prevRoutes.map((route, i) => ({
        ...route,
        isSelected: i === index
      }))
    );
  };

  const handleRoutesLoaded = (newRoutes: Route[]) => {
    // Mark the first route as selected by default
    const routesWithSelection = newRoutes.map((route, index) => ({
      ...route,
      isSelected: index === 0
    }));
    setRoutes(routesWithSelection);
    setSelectedRouteIndex(0);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Navigation className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">EasyRoutePlanner</h1>
          </div>
          <div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <SignedOut>
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to EasyRoutePlanner</h2>
            <p className="mb-6 text-gray-600">Sign in to plan your routes and get started.</p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Plan Your Route
              </h2>
              
              <LocationInput 
                source={source}
                destination={destination}
                setSource={setSource}
                setDestination={setDestination}
                onSelectSource={setSourceCoords}
                onSelectDestination={setDestCoords}
                setIsLoading={setIsLoading}
              />
              
              {routes.length > 0 && (
                <RouteInfo 
                  routes={routes}
                  selectedRouteIndex={selectedRouteIndex}
                  onRouteSelect={handleRouteSelect}
                  sourceName={source}
                  destinationName={destination}
                />
              )}
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <Map 
                  source={sourceCoords} 
                  destination={destCoords} 
                  routes={routes}
                  onRoutesLoaded={handleRoutesLoaded}
                  onRouteSelect={handleRouteSelect}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </div>
            </div>
          </div>
        </SignedIn>
      </main>
      
      <footer className="bg-gray-100 p-4 mt-8">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          <p>© 2025 EasyRoutePlanner | Using OpenStreetMap and OSRM</p>
        </div>
      </footer>
    </div>
  );
}

export default App;