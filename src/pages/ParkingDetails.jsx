import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from '../supabaseClient';

// Default marker icon fix for Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function ParkingDetails() {
  const { id } = useParams();
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchParking() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('parking_lots')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          setError('Failed to load parking details');
          console.error("Failed to fetch parking data:", error);
          return;
        }

        setParking(data);
      } catch (error) {
        setError('Failed to load parking details');
        console.error("Failed to fetch parking data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchParking();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <Link to="/search" className="text-blue-600 hover:underline mt-2 inline-block">
            ← Back to Search
          </Link>
        </div>
      </div>
    );
  }

  if (!parking) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10">
        <p className="text-gray-600">Parking details not found.</p>
        <Link to="/search" className="text-blue-600 hover:underline mt-2 inline-block">
          ← Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <Link to="/search" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Search
      </Link>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{parking.name}</h1>
          <p className="text-gray-600 mb-4">{parking.location}</p>
          
          {parking.description && (
            <p className="text-gray-700 mb-4">{parking.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Price per hour:</span>
                <span className="text-green-600 font-semibold">${parking.price_per_hour}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Available spaces:</span>
                <span className={`font-semibold ${parking.available_spaces > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parking.available_spaces} / {parking.total_spaces}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Operating hours:</span>
                <span className="text-gray-700">
                  {parking.is_24_hours ? '24/7' : `${parking.opening_time} - ${parking.closing_time}`}
                </span>
              </div>

              {parking.contact_phone && (
                <div className="flex justify-between">
                  <span className="font-medium">Contact:</span>
                  <span className="text-gray-700">{parking.contact_phone}</span>
                </div>
              )}
            </div>

            <div>
              {parking.features && parking.features.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Features & Amenities:</h3>
                  <div className="flex flex-wrap gap-2">
                    {parking.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {feature.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {parking.latitude && parking.longitude && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Location Map:</h3>
              <MapContainer
                center={[parking.latitude, parking.longitude]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "400px", width: "100%", borderRadius: "8px" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={[parking.latitude, parking.longitude]}>
                  <Popup>
                    <div>
                      <strong>{parking.name}</strong><br />
                      {parking.location}<br />
                      ${parking.price_per_hour}/hour
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          <div className="flex gap-4">
            <Link 
              to={`/booking/${parking.id}`}
              className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {parking.available_spaces > 0 ? 'Book Now' : 'Join Waitlist'}
            </Link>
            
            <button className="bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors">
              Add to Favorites
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
