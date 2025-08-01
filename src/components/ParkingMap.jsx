import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different parking statuses
const createCustomIcon = (color, isUserLocation = false) => {
  if (isUserLocation) {
    return L.divIcon({
      className: 'custom-user-marker',
      html: `<div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #3b82f6;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }

  return L.divIcon({
    className: 'custom-parking-marker',
    html: `<div style="
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    ">P</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Component to handle map updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const ParkingMap = ({ 
  userLocation, 
  parkingSpaces = [], 
  onLocationFound, 
  onParkingSpaceClick,
  height = '400px',
  showUserLocation = true 
}) => {
  const [mapCenter, setMapCenter] = useState([-17.8216, 31.0492]); // Default to Harare
  const [mapZoom, setMapZoom] = useState(13);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef();

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = [latitude, longitude];
        
        setMapCenter(newLocation);
        setMapZoom(15);
        setIsLocating(false);
        
        if (onLocationFound) {
          onLocationFound({ latitude, longitude });
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = 'Unable to retrieve your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Get marker color based on availability
  const getMarkerColor = (space) => {
    if (!space.available_spaces || space.available_spaces === 0) {
      return '#ef4444'; // Red for full
    } else if (space.available_spaces <= (space.total_spaces || 10) * 0.2) {
      return '#f59e0b'; // Orange for nearly full
    } else {
      return '#10b981'; // Green for available
    }
  };

  // Get directions to parking space
  const getDirections = (space) => {
    if (!userLocation) {
      alert('Please enable location access to get directions.');
      return;
    }

    const { latitude: userLat, longitude: userLng } = userLocation;
    const spaceLat = space.latitude || space.coordinates?.latitude;
    const spaceLng = space.longitude || space.coordinates?.longitude;

    if (!spaceLat || !spaceLng) {
      alert('Parking space location not available.');
      return;
    }

    // Open Google Maps with directions
    const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${spaceLat},${spaceLng}`;
    window.open(googleMapsUrl, '_blank');
  };

  // Calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setMapZoom(15);
    }
  }, [userLocation]);

  return (
    <div className="relative">
      {/* Location Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLocating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Locating...
            </>
          ) : (
            <>
              📍 Find Me
            </>
          )}
        </button>
      </div>

      {/* Map Container */}
      <div style={{ height }} className="rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          {showUserLocation && userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={createCustomIcon('#3b82f6', true)}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold text-blue-600">Your Location</h3>
                  <p className="text-sm text-gray-600">
                    {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Parking Space Markers */}
          {parkingSpaces.map((space) => {
            const lat = space.latitude || space.coordinates?.latitude;
            const lng = space.longitude || space.coordinates?.longitude;
            
            // Skip spaces without coordinates
            if (!lat || !lng) return null;

            return (
              <Marker
                key={space.id}
                position={[lat, lng]}
                icon={createCustomIcon(getMarkerColor(space))}
                eventHandlers={{
                  click: () => onParkingSpaceClick && onParkingSpaceClick(space)
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold text-lg mb-2">{space.name || space.parking_lot_name}</h3>
                    <p className="text-gray-600 mb-2">{space.location}</p>
                    
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span>Available:</span>
                        <span className="font-semibold">
                          {space.available_spaces || 'N/A'}/{space.total_spaces || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-semibold text-green-600">
                          ${space.price_per_hour || space.price || 0}/hr
                        </span>
                      </div>
                      {userLocation && (
                        <div className="flex justify-between">
                          <span>Distance:</span>
                          <span className="font-semibold">
                            {calculateDistance(userLocation.latitude, userLocation.longitude, lat, lng).toFixed(1)} km
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => getDirections(space)}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Directions
                      </button>
                      {onParkingSpaceClick && (
                        <button
                          onClick={() => onParkingSpaceClick(space)}
                          className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span>Nearly Full</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Full</span>
        </div>
        {showUserLocation && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Your Location</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingMap;