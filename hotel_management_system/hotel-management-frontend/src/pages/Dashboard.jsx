import { useState, useEffect } from 'react';
import { Users, User, Bed, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { analyticsAPI, bookingsAPI, roomsAPI, customersAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRooms: 0,
    activeBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper function to safely convert to number
  const safeNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const fetchDashboardData = async () => {
    try {
      const [
        customersRes,
        roomsRes,
        bookingsRes,
        occupancyRes,
        monthlyRevenueRes
      ] = await Promise.all([
        customersAPI.getAll().catch(() => ({ data: [] })),
        roomsAPI.getAll().catch(() => ({ data: [] })),
        bookingsAPI.getAll().catch(() => ({ data: [] })),
        analyticsAPI.occupancyRate().catch(() => ({ data: {} })),
        analyticsAPI.monthlyRevenue().catch(() => ({ data: [] }))
      ]);

      const activeBookings = (bookingsRes.data || []).filter(
        booking => booking.status === 'Confirmed' || booking.status === 'Checked-in'
      ).length;

      const totalRevenue = (bookingsRes.data || [])
        .filter(booking => booking.status === 'Checked-out')
        .reduce((sum, booking) => sum + safeNumber(booking.total_amount), 0);

      // Safely get occupancy rate
      const occupancyRate = safeNumber(occupancyRes.data?.occupancy_rate);

      // Safely get monthly revenue
      const monthlyRevenue = monthlyRevenueRes.data && monthlyRevenueRes.data.length > 0 
        ? safeNumber(monthlyRevenueRes.data[0]?.revenue)
        : 0;

      setStats({
        totalCustomers: (customersRes.data || []).length,
        totalRooms: (roomsRes.data || []).length,
        activeBookings,
        totalRevenue,
        occupancyRate,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values if API fails
      setStats({
        totalCustomers: 0,
        totalRooms: 0,
        activeBookings: 0,
        totalRevenue: 0,
        occupancyRate: 0,
        monthlyRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: Bed,
      color: 'green'
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      icon: Calendar,
      color: 'purple'
    },
    {
      title: 'Total Revenue',
      value: `₹${safeNumber(stats.totalRevenue).toFixed(2)}`,
      icon: DollarSign,
      color: 'yellow'
    },
    {
      title: 'Occupancy Rate',
      value: `${safeNumber(stats.occupancyRate).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'indigo'
    },
    {
      title: 'This Month Revenue',
      value: `₹${safeNumber(stats.monthlyRevenue).toFixed(2)}`,
      icon: DollarSign,
      color: 'pink'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      pink: 'bg-pink-50 text-pink-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                  <Icon size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/bookings'}
              className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              Create New Booking
            </button>
            <button 
              onClick={() => window.location.href = '/rooms'}
              className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              Manage Room Availability
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Backend API: Connected
            </div>
            <div className="flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Database: Online
            </div>
            <div className="flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              All Services: Operational
            </div>
            <div className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;