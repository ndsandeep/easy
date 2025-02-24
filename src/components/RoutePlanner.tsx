import { useState } from "react";

const RoutePlanner = () => {
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [routes, setRoutes] = useState<any[]>([]);

    const fetchRoutes = async () => {
        if (!source || !destination) {
            alert("Please enter both source and destination!");
            return;
        }

        const apiKey = "YOUR_MAPPLS_API_KEY";  // Replace with your API Key
        const apiUrl = `https://apis.mappls.com/advancedmaps/v1/${apiKey}/route_eta/driving/${source};${destination}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.status === "success") {
                setRoutes(data.routes);
            } else {
                alert("No routes found! Check input format.");
            }
        } catch (error) {
            console.error("Error fetching routes:", error);
            alert("Failed to fetch route suggestions.");
        }
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Route Planner</h2>

            <input 
                type="text" 
                placeholder="Enter source coordinates (lng,lat)"
                value={source} 
                onChange={(e) => setSource(e.target.value)} 
                className="border p-2 rounded w-full mb-2"
            />

            <input 
                type="text" 
                placeholder="Enter destination coordinates (lng,lat)"
                value={destination} 
                onChange={(e) => setDestination(e.target.value)} 
                className="border p-2 rounded w-full mb-2"
            />

            <button 
                onClick={fetchRoutes} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Get Route Suggestions
            </button>

            {routes.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-medium">Suggested Routes:</h3>
                    <ul className="list-disc pl-5">
                        {routes.map((route, index) => (
                            <li key={index} className="mt-1">
                                {route.summary} - {route.distance} km
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default RoutePlanner;
