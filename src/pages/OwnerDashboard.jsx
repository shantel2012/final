import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Car,
  DollarSign,
  Calendar,
  TrendingUp
} from "lucide-react";
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/SimpleAuthContext';

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [parkingLots, setParkingLots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSpaces: 0,
    activeBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0
  });
  const { user } = useAuth();

  // Fetch owner's parking lots and related data
  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      // For now, fetch all parking lots (in a real app, you'd filter by owner)
      const { data: lotsData, error: lotsError } = await supabase
        .from('parking_lots')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (lotsError) throw lotsError;

      // Fetch bookings for these parking lots
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          users(name, email),
          parking_lots(name, location)
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) console.error('Error fetching bookings:', bookingsError);

      setParkingLots(lotsData || []);
      setBookings(bookingsData || []);

      // Calculate stats
      const totalSpaces = (lotsData || []).reduce((sum, lot) => sum + lot.total_spaces, 0);
      const activeBookings = (bookingsData || []).filter(b => b.status === 'active').length;
      const totalRevenue = (bookingsData || []).reduce((sum, booking) => sum + (booking.total_cost || 0), 0);
      const totalOccupied = (lotsData || []).reduce((sum, lot) => sum + (lot.total_spaces - lot.available_spaces), 0);
      const occupancyRate = totalSpaces > 0 ? (totalOccupied / totalSpaces) * 100 : 0;

      setStats({
        totalSpaces,
        activeBookings,
        totalRevenue,
        occupancyRate
      });

    } catch (error) {
      console.error('Error fetching owner data:', error);
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  // Add new parking lot
  const addParkingLot = async (newLot) => {
    try {
      const { data, error } = await supabase
        .from('parking_lots')
        .insert([{
          ...newLot,
          available_spaces: newLot.total_spaces, // Initially all spaces are available
          is_active: true
        }])
        .select();

      if (error) throw error;

      await fetchOwnerData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding parking lot:', error);
      alert('Failed to add parking lot');
    }
  };

  // Delete parking lot
  const deleteParkingLot = async (id) => {
    if (!window.confirm("Are you sure you want to delete this parking lot?")) return;
    
    try {
      const { error } = await supabase
        .from('parking_lots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setParkingLots(parkingLots.filter(lot => lot.id !== id));
    } catch (error) {
      console.error('Error deleting parking lot:', error);
      alert('Failed to delete parking lot');
    }
  };

  // Toggle parking lot status (active/inactive)
  const toggleStatus = async (id) => {
    try {
      const lot = parkingLots.find((l) => l.id === id);
      if (!lot) return;

      const { error } = await supabase
        .from('parking_lots')
        .update({ is_active: !lot.is_active })
        .eq('id', id);

      if (error) throw error;

      setParkingLots(parkingLots.map(l => 
        l.id === id ? { ...l, is_active: !l.is_active } : l
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your parking spaces and bookings</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Space</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {["overview", "parking-lots", "bookings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && <OverviewTab stats={stats} parkingLots={parkingLots} />}
            {activeTab === "parking-lots" && (
              <ParkingLotsTab
                parkingLots={parkingLots}
                deleteParkingLot={deleteParkingLot}
                toggleStatus={toggleStatus}
              />
            )}
            {activeTab === "bookings" && <BookingsTab bookings={bookings} />}
          </>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <AddSpaceModal
          setShowAddModal={setShowAddModal}
          addParkingLot={addParkingLot}
        />
      )}
    </div>
  );
}

function OverviewTab({ stats, parkingLots }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          name="Total Spaces" 
          value={stats.totalSpaces.toString()} 
          icon={<Car className="h-8 w-8 text-blue-600" />}
        />
        <StatCard 
          name="Active Bookings" 
          value={stats.activeBookings.toString()} 
          icon={<Calendar className="h-8 w-8 text-green-600" />}
        />
        <StatCard 
          name="Total Revenue" 
          value={`$${stats.totalRevenue.toFixed(2)}`} 
          icon={<DollarSign className="h-8 w-8 text-yellow-600" />}
        />
        <StatCard 
          name="Occupancy Rate" 
          value={`${stats.occupancyRate.toFixed(1)}%`} 
          icon={<TrendingUp className="h-8 w-8 text-purple-600" />}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Your Parking Lots</h2>
        <div className="space-y-4">
          {parkingLots.slice(0, 5).map((lot) => (
            <div key={lot.id} className="border border-gray-200 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{lot.name}</h3>
                <p className="text-sm text-gray-600">{lot.location}</p>
                <p className="text-sm text-gray-500">
                  {lot.available_spaces}/{lot.total_spaces} spaces available
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">${lot.price_per_hour}/hr</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  lot.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {lot.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
          {parkingLots.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No parking lots yet. Add your first parking space to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ name, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{name}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ParkingLotsTab({ parkingLots, deleteParkingLot, toggleStatus }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">My Parking Lots</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spaces</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Hour</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parkingLots.map((lot) => (
              <tr key={lot.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{lot.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{lot.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lot.available_spaces}/{lot.total_spaces}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${lot.price_per_hour}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    lot.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {lot.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => toggleStatus(lot.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Toggle Status"
                  >
                    <Edit className="inline-block h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteParkingLot(lot.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Parking Lot"
                  >
                    <Trash2 className="inline-block h-5 w-5" />
                  </button>
                  <Link to={`/parking/${lot.id}`} className="text-gray-600 hover:text-gray-900" title="View Details">
                    <Eye className="inline-block h-5 w-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingsTab({ bookings }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Recent Bookings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parking Lot</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.users?.name || 'Unknown User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.users?.email || ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.parking_lots?.name || 'Unknown'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(booking.start_time).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(booking.end_time).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${booking.total_cost}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'active' ? 'bg-green-100 text-green-800' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddSpaceModal({ setShowAddModal, addParkingLot }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [totalSpaces, setTotalSpaces] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [openingTime, setOpeningTime] = useState("06:00");
  const [closingTime, setClosingTime] = useState("22:00");
  const [is24Hours, setIs24Hours] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !location || !totalSpaces || !pricePerHour) {
      alert("Please fill all required fields");
      return;
    }

    await addParkingLot({
      name,
      location,
      description,
      total_spaces: Number(totalSpaces),
      price_per_hour: Number(pricePerHour),
      opening_time: is24Hours ? null : openingTime,
      closing_time: is24Hours ? null : closingTime,
      is_24_hours: is24Hours,
      features: []
    });
    
    // Reset form
    setName("");
    setLocation("");
    setDescription("");
    setTotalSpaces("");
    setPricePerHour("");
    setOpeningTime("06:00");
    setClosingTime("22:00");
    setIs24Hours(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Add New Parking Lot</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Downtown Parking Garage"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Location *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 123 Main Street, Harare"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the parking facility..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Spaces *</label>
              <input
                type="number"
                min="1"
                value={totalSpaces}
                onChange={(e) => setTotalSpaces(e.target.value)}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Price per Hour ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={is24Hours}
                onChange={(e) => setIs24Hours(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">24/7 Operation</span>
            </label>
          </div>
          
          {!is24Hours && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Opening Time</label>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Closing Time</label>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Add Parking Lot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
