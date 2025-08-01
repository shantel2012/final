import React, { useState, useEffect } from 'react';
import ParkingMap from './ParkingMap';
import LocationService from '../services/locationService';

const MapDemo = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbySpaces, setNearbySpaces] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get user's current location
  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await LocationService.getCurrentLocation();
      setUserLocation(location);
      
      // Get nearby parking spaces
      const nearby = await LocationService.getNearbyParkingLots(
        location.latitude, 
        location.longitude, 
        10
      );
      setNearbySpaces(nearby);
      
      console.log('User location:', location);
      console.log('Nearby spaces:', nearby);
    } catch (error) {
      console.error('Location error:', error);
      alert(error.message);
    }
    setIsLoading(false);
  };

  // Set location to Mufakose for demo
  const setMufakoseLocation = async () => {
    const mufakoseCoords = { latitude: -17.8667, longitude: 30.9833 };
    setUserLocation(mufakoseCoords);
    
    // Get nearby parking spaces
    const nearby = await LocationService.getNearbyParkingLots(
      mufakoseCoords.latitude, 
      mufakoseCoords.longitude, 
      10
    );
    setNearbySpaces(nearby);
    
    console.log('Mufakose location set:', mufakoseCoords);
    console.log('Nearby spaces from Mufakose:', nearby);
  };

  // Handle parking space selection
  const handleParkingSpaceClick = (space) => {
    setSelectedLocation(space);
    
    // Show directions option
    if (userLocation) {
      const distance = LocationService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        space.latitude,
        space.longitude
      );
      
      const message = `Selected: ${space.name}\nLocation: ${space.location}\nDistance: ${distance.toFixed(2)} km\nPrice: $${space.price_per_hour}/hr\nAvailable: ${space.available_spaces}/${space.total_spaces}\n\nWould you like directions?`;
      
      if (confirm(message)) {
        // Open Google Maps with directions
        const googleMapsUrl = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${space.latitude},${space.longitude}`;
        window.open(googleMapsUrl, '_blank');
      }
    } else {
      alert(`Selected: ${space.name}\nLocation: ${space.location}\nPrice: $${space.price_per_hour}/hr\nAvailable: ${space.available_spaces}/${space.total_spaces}`);
    }
  };

  // Load mock data on component mount
  useEffect(() => {
    const loadMockData = async () => {
      const mockSpaces = await LocationService.getAllParkingLots();
      setNearbySpaces(mockSpaces);
      console.log('Loaded mock parking spaces:', mockSpaces);
    };
    
    loadMockData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🗺️ Parking Map Demo</h1>
      
      {/* Location Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Location Controls</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Getting Location...' : '📍 Get My Location'}
          </button>
          
          <button
            onClick={setMufakoseLocation}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            🏪 Set to Mufakose
          </button>
          
          <button
            onClick={() => {
              setUserLocation({ latitude: -17.8216, longitude: 31.0492 });
              LocationService.getNearbyParkingLots(-17.8216, 31.0492, 10).then(setNearbySpaces);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            🏢 Set to Harare CBD
          </button>
        </div>
      </div>

      {/* Location Status */}
      {userLocation && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-semibold">📍 Current Location</h3>
          <p>Latitude: {userLocation.latitude.toFixed(4)}, Longitude: {userLocation.longitude.toFixed(4)}</p>
          <p>Found {nearbySpaces.length} nearby parking spaces</p>
        </div>
      )}

      {/* Selected Space Info */}
      {selectedLocation && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <h3 className="font-semibold">🚗 Selected Parking Space</h3>
          <p><strong>{selectedLocation.name}</strong></p>
          <p>{selectedLocation.location}</p>
          <p>Price: ${selectedLocation.price_per_hour}/hr</p>
          <p>Available: {selectedLocation.available_spaces}/{selectedLocation.total_spaces}</p>
          {userLocation && selectedLocation.distance_km && (
            <p>Distance: {selectedLocation.distance_km.toFixed(2)} km away</p>
          )}
        </div>
      )}

      {/* Map */}
      <div className="mb-6">
        <ParkingMap
          userLocation={userLocation}
          parkingSpaces={nearbySpaces}
          onLocationFound={setUserLocation}
          onParkingSpaceClick={handleParkingSpaceClick}
          height="500px"
          showUserLocation={!!userLocation}
        />
      </div>

      {/* Nearby Spaces List */}
      {nearbySpaces.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Nearby Parking Spaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbySpaces.map((space) => (
              <div
                key={space.id}
                className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => handleParkingSpaceClick(space)}
              >
                <h3 className="font-bold text-lg">{space.name}</h3>
                <p className="text-gray-600 text-sm">{space.location}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-green-600 font-semibold">
                    ${space.price_per_hour}/hr
                  </span>
                  <span className="text-sm text-gray-500">
                    {space.available_spaces}/{space.total_spaces} available
                  </span>
                </div>
                {userLocation && space.distance_km && (
                  <p className="text-blue-600 text-sm mt-1">
                    📍 {space.distance_km.toFixed(2)} km away
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">How to Use:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>Click "Get My Location" to use your actual GPS coordinates</li>
          <li>Or click "Set to Mufakose" to simulate being in Mufakose</li>
          <li>The map will show nearby parking spaces with different colors:
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>🟢 Green: Available spaces</li>
              <li>🟡 Yellow: Nearly full</li>
              <li>🔴 Red: Full</li>
              <li>🔵 Blue: Your location</li>
            </ul>
          </li>
          <li>Click on any parking marker to see details and get directions</li>
          <li>The "Get Directions" button will open Google Maps with turn-by-turn directions</li>
        </ol>
      </div>
    </div>
  );
};

export default MapDemo;