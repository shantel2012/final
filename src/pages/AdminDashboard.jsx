import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Ban, Users, Car, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../supabaseClient';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Real data from database
  const [parkingLots, setParkingLots] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalParkingLots: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch parking lots
      const { data: parkingData, error: parkingError } = await supabase
        .from('parking_lots')
        .select('*')
        .order('created_at', { ascending: false });

      if (parkingError) throw parkingError;

      // Fetch users (you might need to adjust this based on your user table structure)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) console.error('Error fetching users:', userError);

      // Fetch bookings
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          users(name, email),
          parking_lots(name, location)
        `)
        .order('created_at', { ascending: false });

      if (bookingError) console.error('Error fetching bookings:', bookingError);

      setParkingLots(parkingData || []);
      setUsers(userData || []);
      setBookings(bookingData || []);

      // Calculate stats
      const totalRevenue = (bookingData || []).reduce((sum, booking) => sum + (booking.total_cost || 0), 0);
      setStats({
        totalUsers: (userData || []).length,
        totalParkingLots: (parkingData || []).length,
        totalBookings: (bookingData || []).length,
        totalRevenue: totalRevenue
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleParkingLotStatus = async (id) => {
    try {
      const lot = parkingLots.find(l => l.id === id);
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
      console.error('Error updating parking lot status:', error);
      alert('Failed to update parking lot status');
    }
  };

  const deleteParkingLot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parking lot?')) return;

    try {
      const { error } = await supabase
        .from('parking_lots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setParkingLots(parkingLots.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting parking lot:', error);
      alert('Failed to delete parking lot');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage parking lots, users, and bookings</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'parking-lots', 'users', 'bookings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'parking-lots' && (
          <ParkingLotsTab 
            parkingLots={parkingLots} 
            onToggleStatus={toggleParkingLotStatus}
            onDelete={deleteParkingLot}
          />
        )}
        {activeTab === 'users' && <UsersTab users={users} />}
        {activeTab === 'bookings' && <BookingsTab bookings={bookings} />}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats }) => (
  <div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Total Users" 
        value={stats.totalUsers} 
        icon={<Users className="h-8 w-8 text-blue-600" />}
        color="blue"
      />
      <StatCard 
        title="Parking Lots" 
        value={stats.totalParkingLots} 
        icon={<Car className="h-8 w-8 text-green-600" />}
        color="green"
      />
      <StatCard 
        title="Total Bookings" 
        value={stats.totalBookings} 
        icon={<Calendar className="h-8 w-8 text-purple-600" />}
        color="purple"
      />
      <StatCard 
        title="Total Revenue" 
        value={`$${stats.totalRevenue.toFixed(2)}`} 
        icon={<DollarSign className="h-8 w-8 text-yellow-600" />}
        color="yellow"
      />
    </div>
    
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">System Overview</h3>
      <p className="text-gray-600">
        Welcome to the admin dashboard. Here you can manage all aspects of the parking management system.
        Use the tabs above to navigate between different sections.
      </p>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// Parking Lots Tab Component
const ParkingLotsTab = ({ parkingLots, onToggleStatus, onDelete }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold">Parking Lots Management</h3>
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
                  onClick={() => onToggleStatus(lot.id)}
                  className={`${lot.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                >
                  {lot.is_active ? <Ban className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => onDelete(lot.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Users Tab Component
const UsersTab = ({ users }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold">Users Management</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.role || 'user'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Bookings Tab Component
const BookingsTab = ({ bookings }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold">Bookings Management</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parking Lot</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
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
                <div className="text-sm text-gray-500">{booking.parking_lots?.location || ''}</div>
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

export default AdminDashboard;
