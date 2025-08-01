import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ParkingMap from "../components/ParkingMap";
import LocationService from "../services/locationService";

export default function ListSpace() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbySpaces, setNearbySpaces] = useState([]);
  const [mapView, setMapView] = useState('list'); // 'list' or 'map'
  const [searchRadius, setSearchRadius] = useState(5);
  const [locationError, setLocationError] = useState(null);

  const placeholderImages = [
    "https://images.unsplash.com/photo-1604066867775-43f48e3957d7", // rooftop
    "https://images.unsplash.com/photo-1598515213963-34dbb3f8b4e2", // city lot
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",    // open lot
    "https://images.unsplash.com/photo-1525107239900-3d0f4ca2d0c1", // underground
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809", // garage
  ];

  // Fetch all parking spaces
  useEffect(() => {
    const fetchSpaces = async () => {
      setLoading(true);
      try {
        // First try to get from parking_lots table (main table)
        const { data: parkingLots, error: parkingLotsError } = await supabase
          .from("parking_lots")
          .select(`
            id,
            name,
            location,
            latitude,
            longitude,
            price_per_hour,
            total_spaces,
            available_spaces,
            is_active,
            created_at
          `)
          .eq('is_active', true)
          .order("created_at", { ascending: false });

        if (parkingLotsError) {
          console.error("Parking lots fetch error:", parkingLotsError.message);
          
          // Fallback to parking_spaces table
          const { data: parkingSpaces, error: spacesError } = await supabase
            .from("parking_spaces")
            .select("*")
            .order("created_at", { ascending: false });

          if (spacesError) {
            console.error("Parking spaces fetch error:", spacesError.message);
            setSpaces([]);
          } else {
            setSpaces(parkingSpaces || []);
          }
        } else {
          setSpaces(parkingLots || []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setSpaces([]);
      }
      setLoading(false);
    };

    fetchSpaces();
  }, [submitted]);

  // Get user location and nearby spaces
  useEffect(() => {
    const getUserLocationAndNearbySpaces = async () => {
      try {
        const location = await LocationService.getCurrentLocation();
        setUserLocation(location);
        setLocationError(null);
        
        // Get nearby parking spaces
        const nearby = await LocationService.getNearbyParkingLots(
          location.latitude, 
          location.longitude, 
          searchRadius
        );
        setNearbySpaces(nearby);
      } catch (error) {
        console.error("Location error:", error);
        setLocationError(error.message);
        
        // Try to get all parking lots if location fails
        try {
          const allSpaces = await LocationService.getAllParkingLots();
          setNearbySpaces(allSpaces);
        } catch (mapError) {
          console.error("Map data error:", mapError);
        }
      }
    };

    getUserLocationAndNearbySpaces();
  }, [searchRadius]);

  // Update nearby spaces when user location changes
  const handleLocationFound = async (location) => {
    setUserLocation(location);
    setLocationError(null);
    
    try {
      const nearby = await LocationService.getNearbyParkingLots(
        location.latitude, 
        location.longitude, 
        searchRadius
      );
      setNearbySpaces(nearby);
    } catch (error) {
      console.error("Error fetching nearby spaces:", error);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const randomImage =
      placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

    const { error } = await supabase.from("parking_spaces").insert([
      {
        name: formData.name,
        location: formData.location,
        price: parseFloat(formData.price) || 3,
        image: randomImage,
      },
    ]);

    if (error) {
      console.error("Insert error:", error.message);
      alert("Failed to list your space. Please try again.");
      return;
    }

    setFormData({ name: "", location: "", price: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 500);
  };

  // Handle parking space click from map
  const handleParkingSpaceClick = (space) => {
    console.log("Parking space clicked:", space);
    alert(`Selected: ${space.name || space.parking_lot_name}\nLocation: ${space.location}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-6">List Your Parking Space</h1>

      {submitted && (
        <div className="text-green-600 font-semibold mb-6">
          ✅ Your parking space has been listed!
        </div>
      )}

      {/* Location Status */}
      {locationError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">📍 Location Access:</p>
          <p>{locationError}</p>
          <p className="text-sm mt-1">You can still view all parking spaces, but location-based features will be limited.</p>
        </div>
      )}

      {userLocation && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">📍 Your Location Detected</p>
          <p className="text-sm">
            Latitude: {userLocation.latitude.toFixed(4)}, Longitude: {userLocation.longitude.toFixed(4)}
            {nearbySpaces.length > 0 && ` • Found ${nearbySpaces.length} nearby parking spaces`}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block mb-1 font-medium">Space Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g. Main Street Lot"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g. Mufakose, Harare or 123 High Street"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Price per hour ($)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="1"
            max="10"
            step="0.5"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Submit Listing
        </button>
      </form>

      {/* View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Available Parking Spaces</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMapView('list')}
            className={`px-4 py-2 rounded transition ${
              mapView === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📋 List View
          </button>
          <button
            onClick={() => setMapView('map')}
            className={`px-4 py-2 rounded transition ${
              mapView === 'map' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🗺️ Map View
          </button>
        </div>
      </div>

      {/* Search Radius Control */}
      {userLocation && mapView === 'map' && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Search Radius: {searchRadius} km</label>
          <input
            type="range"
            min="1"
            max="20"
            value={searchRadius}
            onChange={(e) => setSearchRadius(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>1 km</span>
            <span>20 km</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-2">Loading parking spaces...</span>
        </div>
      ) : (
        <>
          {mapView === 'map' ? (
            <div className="mb-8">
              <ParkingMap
                userLocation={userLocation}
                parkingSpaces={nearbySpaces.length > 0 ? nearbySpaces : spaces}
                onLocationFound={handleLocationFound}
                onParkingSpaceClick={handleParkingSpaceClick}
                height="500px"
                showUserLocation={!!userLocation}
              />
              
              {nearbySpaces.length > 0 && (
                <div className="mt-4 text-center text-gray-600">
                  Showing {nearbySpaces.length} parking spaces within {searchRadius} km of your location
                </div>
              )}
            </div>
          ) : (
            <>
              {spaces.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p className="text-lg">No parking spaces listed yet.</p>
                  <p>Be the first to list your parking space!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spaces.map((space) => (
                    <div
                      key={space.id}
                      className="border rounded shadow-sm hover:shadow-md transition cursor-pointer"
                      onClick={() => handleParkingSpaceClick(space)}
                    >
                      {space.image && (
                        <img
                          src={space.image}
                          alt={space.name}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-bold">{space.name}</h3>
                        <p className="text-gray-600">{space.location}</p>
                        
                        {space.available_spaces !== undefined && (
                          <p className="text-sm text-gray-500 mt-1">
                            Available: {space.available_spaces}/{space.total_spaces || 'N/A'}
                          </p>
                        )}
                        
                        <p className="mt-2 text-green-600 font-semibold">
                          ${space.price_per_hour || space.price || 0} / hr
                        </p>
                        
                        {userLocation && space.latitude && space.longitude && (
                          <p className="text-sm text-blue-600 mt-1">
                            📍 {LocationService.formatDistance(
                              LocationService.calculateDistance(
                                userLocation.latitude,
                                userLocation.longitude,
                                space.latitude,
                                space.longitude
                              )
                            )} away
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Quick Location Suggestions */}
      {mapView === 'list' && (
        <div className="mt-8 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-3">Popular Areas in Zimbabwe</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {LocationService.getZimbabweLocationSuggestions().slice(0, 8).map((location) => (
              <button
                key={location.name}
                onClick={() => {
                  setUserLocation({
                    latitude: location.coordinates[0],
                    longitude: location.coordinates[1]
                  });
                  setMapView('map');
                }}
                className="text-left p-2 text-sm bg-white border rounded hover:bg-blue-50 hover:border-blue-300 transition"
              >
                📍 {location.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
