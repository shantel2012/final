// Location Service for handling GPS, parking lot data, and location-based operations
const API_BASE_URL = 'http://localhost:4000';

class LocationService {
  // Get user's current location using browser geolocation API
  static async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage = 'Unable to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Get nearby parking lots based on coordinates
  static async getNearbyParkingLots(latitude, longitude, radius = 5) {
    try {
      const response = await fetch(
        ${API_BASE_URL}/map/nearby?latitude=&longitude=&radius=
      );
      
      if (!response.ok) {
        throw new Error(HTTP error! status: );
      }
      
      const data = await response.json();
      
      // Transform the response to match expected format
      return data.parking_lots?.map(lot => ({
        id: lot.id,
        name: lot.parking_lot_name || lot.name,
        location: lot.location,
        latitude: lot.latitude,
        longitude: lot.longitude,
        total_spaces: lot.total_spaces,
        available_spaces: lot.available_spaces,
        price_per_hour: lot.price_per_hour,
        distance_km: lot.distance_km,
        occupancy_percentage: lot.occupancy_percentage,
        owner_name: lot.owner_name,
        company_name: lot.company_name
      })) || [];
    } catch (error) {
      console.error('Error fetching nearby parking lots:', error);
      // Return mock data as fallback
      return this.getMockParkingLots().filter(lot => {
        const distance = this.calculateDistance(latitude, longitude, lot.latitude, lot.longitude);
        return distance <= radius;
      }).map(lot => ({
        ...lot,
        distance_km: this.calculateDistance(latitude, longitude, lot.latitude, lot.longitude)
      }));
    }
  }

  // Get all parking lots for map display
  static async getAllParkingLots() {
    try {
      const response = await fetch(${API_BASE_URL}/map/parking-lots);
      
      if (!response.ok) {
        throw new Error(HTTP error! status: );
      }
      
      const data = await response.json();
      
      // Transform the response to match expected format
      return data.map_markers?.map(marker => ({
        id: marker.id,
        name: marker.name,
        location: marker.location,
        latitude: marker.coordinates.latitude,
        longitude: marker.coordinates.longitude,
        total_spaces: marker.availability.total_spaces,
        available_spaces: marker.availability.available_spaces,
        price_per_hour: marker.pricing.price_per_hour,
        occupancy_percentage: marker.availability.occupancy_percentage,
        owner_name: marker.owner.name,
        company_name: marker.owner.company,
        status: marker.status
      })) || [];
    } catch (error) {
      console.error('Error fetching all parking lots:', error);
      // Return mock data as fallback
      return this.getMockParkingLots();
    }
  }

  // Search parking lots by query and location
  static searchParkingLots(query, userLocation = null) {
    const allLots = this.getMockParkingLots();
    
    if (!query) {
      return allLots;
    }

    const searchTerm = query.toLowerCase();
    let filteredLots = allLots.filter(lot => 
      lot.name.toLowerCase().includes(searchTerm) ||
      lot.location.toLowerCase().includes(searchTerm)
    );

    // Add distance if user location is provided
    if (userLocation) {
      filteredLots = filteredLots.map(lot => ({
        ...lot,
        distance_km: this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          lot.latitude,
          lot.longitude
        )
      })).sort((a, b) => a.distance_km - b.distance_km);
    }

    return filteredLots;
  }

  // Calculate distance between two coordinates using Haversine formula
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Convert degrees to radians
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get Zimbabwe location suggestions for search
  static getZimbabweLocationSuggestions() {
    return [
      { name: 'Harare CBD', coordinates: { latitude: -17.8216, longitude: 31.0492 } },
      { name: 'Mufakose', coordinates: { latitude: -17.8667, longitude: 30.9833 } },
      { name: 'Avondale', coordinates: { latitude: -17.8047, longitude: 31.0669 } },
      { name: 'Borrowdale', coordinates: { latitude: -17.7833, longitude: 31.0833 } },
      { name: 'Eastlea', coordinates: { latitude: -17.8167, longitude: 31.0833 } },
      { name: 'Highlands', coordinates: { latitude: -17.7833, longitude: 31.0500 } },
      { name: 'Newlands', coordinates: { latitude: -17.7833, longitude: 31.1000 } },
      { name: 'Belvedere', coordinates: { latitude: -17.8333, longitude: 31.0667 } },
      { name: 'Mount Pleasant', coordinates: { latitude: -17.7833, longitude: 31.0667 } },
      { name: 'Waterfalls', coordinates: { latitude: -17.8833, longitude: 31.0167 } }
    ];
  }

  // Mock parking lots data for fallback
  static getMockParkingLots() {
    return [
      {
        id: 1,
        name: "Harare CBD Central Parking",
        location: "Corner First Street & Nelson Mandela Avenue, Harare",
        latitude: -17.8216,
        longitude: 31.0492,
        total_spaces: 150,
        available_spaces: 45,
        price_per_hour: 2.50,
        occupancy_percentage: 70
      },
      {
        id: 2,
        name: "Eastgate Mall Parking",
        location: "Eastgate Shopping Centre, Harare",
        latitude: -17.8167,
        longitude: 31.0833,
        total_spaces: 300,
        available_spaces: 120,
        price_per_hour: 1.50,
        occupancy_percentage: 60
      },
      {
        id: 3,
        name: "Avondale Shopping Center",
        location: "Avondale Shopping Centre, Harare",
        latitude: -17.8047,
        longitude: 31.0669,
        total_spaces: 200,
        available_spaces: 80,
        price_per_hour: 2.00,
        occupancy_percentage: 60
      },
      {
        id: 4,
        name: "Borrowdale Village Mall",
        location: "Borrowdale Village, Harare",
        latitude: -17.7833,
        longitude: 31.0833,
        total_spaces: 400,
        available_spaces: 200,
        price_per_hour: 1.75,
        occupancy_percentage: 50
      },
      {
        id: 5,
        name: "Mufakose Shopping Centre",
        location: "Mufakose, Harare",
        latitude: -17.8667,
        longitude: 30.9833,
        total_spaces: 100,
        available_spaces: 60,
        price_per_hour: 1.00,
        occupancy_percentage: 40
      }
    ];
  }
}

export default LocationService;
