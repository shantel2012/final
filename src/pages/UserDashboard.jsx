import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Star,
  Heart,
  Car,
  AlertCircle,
} from "lucide-react";
import { supabase } from '../supabaseClient';

/* ---------- Main Component ---------- */
const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("search");

  // Data states
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  // Favorites (store IDs)
  const [favorites, setFavorites] = useState([]);

  // Success message from booking
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check for success message from booking
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
    
    fetchData();
  }, [location.state]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch parking spaces from backend
      const spacesResponse = await fetch('http://localhost:4000/parking-lots', {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      if (spacesResponse.ok) {
        const spacesData = await spacesResponse.json();
        setParkingSpaces(spacesData || []);
      } else {
        throw new Error('Failed to fetch parking spaces');
      }

      // Fetch user bookings if logged in
      if (token) {
        try {
          const response = await fetch('http://localhost:4000/bookings/user', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const bookingsData = await response.json();
            setBookings(bookingsData);
          }
        } catch (bookingError) {
          console.error('Error fetching bookings:', bookingError);
        }
      }

    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ----- Helpers ----- */
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const isFavorited = (id) => favorites.includes(id);

  const filteredSpaces = useMemo(() => {
    let spaces = [...parkingSpaces];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      spaces = spaces.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)
      );
    }

    if (priceFilter) {
      spaces = spaces.filter((s) => {
        const price = parseFloat(s.price_per_hour);
        if (priceFilter === "0-5") return price >= 0 && price <= 5;
        if (priceFilter === "5-10") return price > 5 && price <= 10;
        if (priceFilter === "10+") return price > 10;
        return true;
      });
    }

    // Date filter placeholder: no-op for now
    return spaces;
  }, [searchQuery, priceFilter, parkingSpaces]);

  /* ----- Render ----- */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Parking Dashboard</h1>
          <p className="text-gray-600 mt-2">Find and manage your parking spaces</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <TabButton
              label="Search Parking"
              active={activeTab === "search"}
              onClick={() => setActiveTab("search")}
            />
            <TabButton
              label="My Bookings"
              active={activeTab === "bookings"}
              onClick={() => setActiveTab("bookings")}
            />
            <TabButton
              label="Favorites"
              active={activeTab === "favorites"}
              onClick={() => setActiveTab("favorites")}
            />
          </nav>
        </div>

        {/* Content */}
        {activeTab === "search" && (
          <SearchTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
            spaces={filteredSpaces}
            toggleFavorite={toggleFavorite}
            isFavorited={isFavorited}
          />
        )}

        {activeTab === "bookings" && <BookingsTab bookings={bookings} loading={loading} />}

        {activeTab === "favorites" && (
          <FavoritesTab
            favorites={favorites}
            spaces={parkingSpaces}
            toggleFavorite={toggleFavorite}
          />
        )}
      </div>
    </div>
  );
};

/* ---------- Subcomponents ---------- */

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`py-2 px-1 border-b-2 font-medium text-sm ${
      active
        ? "border-blue-500 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    {label}
  </button>
);

const SearchTab = ({
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  priceFilter,
  setPriceFilter,
  spaces,
  toggleFavorite,
  isFavorited,
}) => {
  const handleSearch = (e) => {
    e.preventDefault();
    // Filtering happens reactively; no extra work needed here.
  };

  return (
    <div>
      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Prices</option>
              <option value="0-5">$0 - $5/hr</option>
              <option value="5-10">$5 - $10/hr</option>
              <option value="10+">$10+/hr</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="grid gap-6">
        {spaces.map((space) => (
          <ParkingSpaceCard
            key={space.id}
            space={space}
            isFavorited={isFavorited(space.id)}
            onToggleFavorite={() => toggleFavorite(space.id)}
          />
        ))}
        {spaces.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No spaces match your search.
          </div>
        )}
      </div>
    </div>
  );
};

const ParkingSpaceCard = ({ space, isFavorited, onToggleFavorite }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/3">
        <div className="w-full h-48 md:h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <Car className="h-16 w-16 text-blue-600" />
        </div>
      </div>
      <div className="md:w-2/3 p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{space.name}</h3>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{space.location}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            className={`transition-colors ${
              isFavorited ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart className={`h-6 w-6 ${isFavorited ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="flex items-center mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            space.available_spaces > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {space.available_spaces > 0 ? `${space.available_spaces} spaces available` : 'Full'}
          </span>
          <span className="mx-3 text-gray-300">•</span>
          <span className="text-sm text-gray-600">
            {space.is_24_hours ? '24/7' : `${space.opening_time?.slice(0, 5)} - ${space.closing_time?.slice(0, 5)}`}
          </span>
        </div>

        {space.features && space.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {space.features.slice(0, 4).map((feature, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
              >
                {feature.replace('_', ' ')}
              </span>
            ))}
            {space.features.length > 4 && (
              <span className="text-sm text-gray-500">
                +{space.features.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">
            ${space.price_per_hour}/hr
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/parking/${space.id}`}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              View Details
            </Link>
            <Link
              to={`/booking/${space.id}`}
              className={`px-4 py-2 rounded-md transition-colors ${
                space.available_spaces > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (space.available_spaces <= 0) {
                  e.preventDefault();
                }
              }}
            >
              {space.available_spaces > 0 ? 'Book Now' : 'Full'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BookingsTab = ({ bookings, loading }) => (
  <div className="bg-white rounded-lg shadow-sm">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-semibold">My Bookings</h2>
    </div>
    <div className="divide-y divide-gray-200">
      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading bookings...</p>
        </div>
      ) : bookings.length > 0 ? (
        bookings.map((booking) => (
          <div key={booking.id} className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Car className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">{booking.parking_lots?.name || 'Parking Space'}</h3>
                <p className="text-sm text-gray-500">{booking.parking_lots?.location}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(booking.start_time).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                    {new Date(booking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">${booking.total_cost}</span>
              <span
                className={`px-2 py-1 rounded text-sm capitalize ${
                  booking.status === "active"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "completed"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {booking.status}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="p-6 text-center text-gray-500">
          <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p>No bookings yet.</p>
          <p className="text-sm mt-1">Book a parking space to see it here.</p>
        </div>
      )}
    </div>
  </div>
);

const FavoritesTab = ({ favorites, spaces, toggleFavorite }) => {
  const favSpaces = spaces.filter((s) => favorites.includes(s.id));

  return (
    <div>
      {favSpaces.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No favorites yet. Add some from Search.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favSpaces.map((space) => (
            <div key={space.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{space.title}</h3>
                <button
                  className="text-red-500 hover:text-red-600 transition-colors"
                  onClick={() => toggleFavorite(space.id)}
                  aria-label="Remove from favorites"
                >
                  <Heart className="h-5 w-5 fill-current" />
                </button>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{space.location}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium">{space.rating}</span>
                  <span className="ml-1 text-sm text-gray-500">
                    ({space.reviews})
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  ${space.price}/day
                </span>
              </div>
              <div className="flex space-x-3">
                <Link
                  to={`/parking/${space.id}`}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  Details
                </Link>
                <Link
                  to={`/booking/${space.id}`}
                  className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
