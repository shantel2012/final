import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import ParkingMap from "../components/ParkingMap";
import LocationService from "../services/locationService";
import { Search as SearchIcon, MapPin, Filter, Star } from "lucide-react";

const SearchListingPage = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [viewMap, setViewMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New state for enhanced functionality
  const [userLocation, setUserLocation] = useState(null);
  const [nearbySpaces, setNearbySpaces] = useState([]);
  const [searchRadius, setSearchRadius] = useState(10);
  const [locationError, setLocationError] = useState(null);
  const [sortBy, setSortBy] = useState('distance'); // distance, price, rating, availability
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced fetch function with real and mock data
  const fetchParkingLots = async (
    query = "",
    locationQuery = "",
    priceMin = "",
    priceMax = ""
  ) => {
    console.log("fetchParkingLots called with:", { query, locationQuery, priceMin, priceMax });
    setLoading(true);
    setError(null);
    
    try {
      // First try to get from database
      let supabaseQuery = supabase.from("parking_lots").select(`
        id,
        name,
        location,
        latitude,
        longitude,
        price_per_hour,
        total_spaces,
        available_spaces,
        is_active,
        created_at,
        image
      `).eq('is_active', true);

      if (query.trim() !== "") {
        supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
      }

      if (locationQuery.trim() !== "") {
        supabaseQuery = supabaseQuery.ilike("location", `%${locationQuery}%`);
      }

      if (priceMin) {
        supabaseQuery = supabaseQuery.gte("price_per_hour", Number(priceMin));
      }

      if (priceMax) {
        supabaseQuery = supabaseQuery.lte("price_per_hour", Number(priceMax));
      }

      console.log("Executing Supabase query...");
      const { data: dbData, error } = await supabaseQuery;
      
      if (error) {
        console.error("Supabase error:", error);
        // Fallback to mock data
        console.log("Using mock data as fallback");
        const mockData = LocationService.searchParkingLots(query || locationQuery, userLocation);
        const filteredMockData = applyFilters(mockData, priceMin, priceMax);
        setParkingLots(filteredMockData);
        setNearbySpaces(filteredMockData);
      } else {
        console.log("Query successful, data received:", dbData);
        let resultData = dbData || [];
        
        // If no database results, supplement with mock data
        if (resultData.length === 0) {
          console.log("No database results, using mock data");
          const mockData = LocationService.searchParkingLots(query || locationQuery, userLocation);
          resultData = applyFilters(mockData, priceMin, priceMax);
        }
        
        // Add distance calculations if user location is available
        if (userLocation && resultData.length > 0) {
          resultData = resultData.map(lot => ({
            ...lot,
            distance_km: LocationService.calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              lot.latitude || -17.8216,
              lot.longitude || 31.0492
            )
          }));
        }
        
        // Sort results
        resultData = sortResults(resultData);
        
        setParkingLots(resultData);
        setNearbySpaces(resultData);
      }
    } catch (error) {
      console.error("Error fetching parking lots:", error.message);
      setError(error.message);
      
      // Final fallback to mock data
      const mockData = LocationService.searchParkingLots(query || locationQuery, userLocation);
      const filteredMockData = applyFilters(mockData, priceMin, priceMax);
      setParkingLots(filteredMockData);
      setNearbySpaces(filteredMockData);
    } finally {
      setLoading(false);
    }
  };

  // Apply price filters to data
  const applyFilters = (data, minPrice, maxPrice) => {
    return data.filter(lot => {
      const price = lot.price_per_hour || lot.price || 0;
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;
      return true;
    });
  };

  // Sort results based on selected criteria
  const sortResults = (data) => {
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (!a.distance_km || !b.distance_km) return 0;
          return a.distance_km - b.distance_km;
        case 'price':
          const priceA = a.price_per_hour || a.price || 0;
          const priceB = b.price_per_hour || b.price || 0;
          return priceA - priceB;
        case 'rating':
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        case 'availability':
          const availA = a.available_spaces || 0;
          const availB = b.available_spaces || 0;
          return availB - availA;
        default:
          return 0;
      }
    });
  };

  // Get user location and load initial data
  useEffect(() => {
    const initializeSearch = async () => {
      console.log("Component mounted, initializing search...");
      
      // Try to get user location
      try {
        const location = await LocationService.getCurrentLocation();
        setUserLocation(location);
        setLocationError(null);
        console.log("User location detected:", location);
        
        // Get nearby parking spaces
        const nearby = await LocationService.getNearbyParkingLots(
          location.latitude, 
          location.longitude, 
          searchRadius
        );
        setNearbySpaces(nearby);
        setParkingLots(nearby);
      } catch (error) {
        console.error("Location error:", error);
        setLocationError(error.message);
        
        // Load all available parking spaces if location fails
        fetchParkingLots();
      }
    };

    initializeSearch();
  }, []);

  // Update results when sort criteria changes
  useEffect(() => {
    if (parkingLots.length > 0) {
      const sorted = sortResults(parkingLots);
      setParkingLots(sorted);
    }
  }, [sortBy]);

  // Handle location found from map
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
      
      // If no current search, show nearby results
      if (!searchQuery && !location) {
        setParkingLots(nearby);
      }
    } catch (error) {
      console.error("Error fetching nearby spaces:", error);
    }
  };

  // Handle parking space click
  const handleParkingSpaceClick = (space) => {
    console.log("Parking space selected:", space);
    
    if (userLocation) {
      const distance = space.distance_km || LocationService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        space.latitude,
        space.longitude
      );
      
      const message = `${space.name}\n📍 ${space.location}\n💰 $${space.price_per_hour || space.price}/hr\n🚗 ${space.available_spaces}/${space.total_spaces} available\n📏 ${distance.toFixed(2)} km away\n\nGet directions?`;
      
      if (confirm(message)) {
        const googleMapsUrl = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${space.latitude},${space.longitude}`;
        window.open(googleMapsUrl, '_blank');
      }
    } else {
      alert(`${space.name}\n📍 ${space.location}\n💰 $${space.price_per_hour || space.price}/hr\n🚗 ${space.available_spaces}/${space.total_spaces} available`);
    }
  };

  // Enhanced handlers
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search button clicked!");
    console.log("Search parameters:", { searchQuery, location, priceMin, priceMax });
    fetchParkingLots(searchQuery, location, priceMin, priceMax);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setLocation("");
    setPriceMin("");
    setPriceMax("");
    setSortBy('distance');
    
    // Show nearby spaces if user location is available, otherwise show all
    if (userLocation) {
      LocationService.getNearbyParkingLots(
        userLocation.latitude, 
        userLocation.longitude, 
        searchRadius
      ).then(nearby => {
        setParkingLots(nearby);
        setNearbySpaces(nearby);
      });
    } else {
      fetchParkingLots();
    }
  };

  const handleQuickLocationSearch = (locationName, coordinates) => {
    setLocation(locationName);
    setUserLocation({
      latitude: coordinates[0],
      longitude: coordinates[1]
    });
    
    // Search for parking in that area
    LocationService.getNearbyParkingLots(
      coordinates[0], 
      coordinates[1], 
      searchRadius
    ).then(nearby => {
      setParkingLots(nearby);
      setNearbySpaces(nearby);
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔍 Find Parking Spaces</h1>
        <p className="text-gray-600">Discover available parking spaces near you in Zimbabwe</p>
      </div>

      {/* Location Status */}
      {locationError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">📍 Location Access:</p>
          <p>{locationError}</p>
          <p className="text-sm mt-1">You can still search for parking, but location-based features will be limited.</p>
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

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g., Mufakose)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="distance">Sort by Distance</option>
            <option value="price">Sort by Price</option>
            <option value="rating">Sort by Rating</option>
            <option value="availability">Sort by Availability</option>
          </select>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price ($/hr)</label>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0"
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price ($/hr)</label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="10"
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {userLocation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius: {searchRadius} km</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Searching...
              </>
            ) : (
              <>
                <SearchIcon className="h-4 w-4" />
                Search
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleClearFilters}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear All
          </button>
          
          <button
            type="button"
            onClick={() => setViewMap(!viewMap)}
            className={`px-6 py-2 rounded-lg transition-colors ${
              viewMap 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {viewMap ? '📋 List View' : '🗺️ Map View'}
          </button>
        </div>
      </form>

      {/* Quick Location Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">🏙️ Popular Areas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {LocationService.getZimbabweLocationSuggestions().slice(0, 6).map((loc) => (
            <button
              key={loc.name}
              onClick={() => handleQuickLocationSearch(loc.name, loc.coordinates)}
              className="text-left p-3 text-sm bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors"
            >
              📍 {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">❌ Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Results Summary */}
      {!loading && parkingLots.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            Found <strong>{parkingLots.length}</strong> parking spaces
            {userLocation && nearbySpaces.length > 0 && ` within ${searchRadius} km of your location`}
          </p>
        </div>
      )}

      {/* Loading Display */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-blue-600">Searching for parking spaces...</span>
        </div>
      )}

      {/* Results Section */}
      {!loading && (
        <>
          {viewMap ? (
            <div className="mb-8">
              <ParkingMap
                userLocation={userLocation}
                parkingSpaces={parkingLots}
                onLocationFound={handleLocationFound}
                onParkingSpaceClick={handleParkingSpaceClick}
                height="600px"
                showUserLocation={!!userLocation}
              />
            </div>
          ) : (
            <>
              {parkingLots.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🚗</div>
                  <h3 className="text-xl font-semibold mb-2">No parking spaces found</h3>
                  <p>Try adjusting your search criteria or expanding your search radius.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {parkingLots.map((lot) => (
                    <div
                      key={lot.id}
                      className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                      onClick={() => handleParkingSpaceClick(lot)}
                    >
                      {lot.image && (
                        <img
                          src={lot.image}
                          alt={lot.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{lot.name}</h3>
                          {lot.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{lot.rating}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{lot.location}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Price:</span>
                            <span className="font-semibold text-green-600">
                              ${lot.price_per_hour || lot.price || 0}/hr
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Available:</span>
                            <span className={`font-semibold ${
                              (lot.available_spaces || 0) > 10 ? 'text-green-600' : 
                              (lot.available_spaces || 0) > 0 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {lot.available_spaces || 0}/{lot.total_spaces || 'N/A'}
                            </span>
                          </div>
                          
                          {lot.distance_km && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Distance:</span>
                              <span className="font-semibold text-blue-600">
                                {lot.distance_km.toFixed(1)} km
                              </span>
                            </div>
                          )}
                        </div>

                        {lot.features && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {lot.features.slice(0, 3).map((feature, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleParkingSpaceClick(lot);
                          }}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {userLocation ? 'Get Directions' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SearchListingPage;
