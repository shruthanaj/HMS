import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Bed, Calendar, CreditCard } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { analyticsAPI, bookingsAPI, roomsAPI, customersAPI, paymentsAPI, proceduresAPI } from '../../services/api';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    revenueByRoomType: [],
    occupancyRate: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    totalRooms: 0,
    activeBookings: 0,
    totalRevenue: 0,
    popularServices: [],
    premiumCustomers: [],
    detailedBookings: [],
    topCustomers: [] // From stored procedure
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      console.log('Fetching analytics data...');
      
      // Calculate date range for last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Fetch all data in parallel (including stored procedures)
      const [
        customersRes,
        roomsRes,
        bookingsRes,
        paymentsRes,
        revenueByRoomTypeRes,
        popularServicesRes,
        premiumCustomersRes,
        detailedBookingsRes,
        topCustomersRes, // Using stored procedure
        occupancyRateRes // Using stored procedure
      ] = await Promise.all([
        customersAPI.getAll().catch(err => { console.error('Customers API error:', err); return { data: [] }; }),
        roomsAPI.getAll().catch(err => { console.error('Rooms API error:', err); return { data: [] }; }),
        bookingsAPI.getAll().catch(err => { console.error('Bookings API error:', err); return { data: [] }; }),
        paymentsAPI.getAll().catch(err => { console.error('Payments API error:', err); return { data: [] }; }),
        analyticsAPI.revenueByRoomType().catch(err => { console.error('Revenue API error:', err); return { data: [] }; }),
        analyticsAPI.popularServices().catch(err => { console.error('Services API error:', err); return { data: [] }; }),
        analyticsAPI.premiumCustomers().catch(err => { console.error('Premium API error:', err); return { data: [] }; }),
        analyticsAPI.detailedBookings().catch(err => { console.error('Detailed API error:', err); return { data: [] }; }),
        proceduresAPI.getTopCustomers(5).catch(err => { console.error('Top Customers Procedure error:', err); return { data: { customers: [] } }; }),
        proceduresAPI.getOccupancyRate(startDate, endDate).catch(err => { console.error('Occupancy Procedure error:', err); return { data: { occupancy: [] } }; })
      ]);
      console.log('Analytics data fetched successfully');

      // Calculate real-time stats
      const totalCustomers = customersRes.data.length;
      const totalRooms = roomsRes.data.length;
      
      const activeBookings = bookingsRes.data.filter(
        booking => booking.status === 'Confirmed' || booking.status === 'Checked-in'
      ).length;

      // Calculate total revenue from completed payments
      const totalRevenue = paymentsRes.data
        .filter(payment => payment.payment_status === 'Completed')
        .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyRevenue = paymentsRes.data
        .filter(payment => {
          const paymentDate = new Date(payment.payment_date);
          return paymentDate >= thirtyDaysAgo && payment.payment_status === 'Completed';
        })
        .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

      // Use stored procedure occupancy rate or calculate fallback
      let occupancyRate = 0;
      if (occupancyRateRes.data?.occupancy && occupancyRateRes.data.occupancy.length > 0) {
        const overallOccupancy = occupancyRateRes.data.occupancy.find(o => o.room_type === 'OVERALL');
        occupancyRate = overallOccupancy ? parseFloat(overallOccupancy.occupancy_rate_percentage) : 0;
      } else {
        const occupiedRooms = roomsRes.data.filter(room => room.status === 'Occupied').length;
        occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
      }

      setAnalytics({
        revenueByRoomType: revenueByRoomTypeRes.data || [],
        occupancyRate: Math.round(occupancyRate),
        monthlyRevenue,
        totalCustomers,
        totalRooms,
        activeBookings,
        totalRevenue,
        popularServices: popularServicesRes.data || [],
        premiumCustomers: premiumCustomersRes.data || [],
        detailedBookings: detailedBookingsRes.data || [],
        topCustomers: topCustomersRes.data?.customers || [] // From stored procedure
      });
      console.log('Analytics state updated');
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      console.error('Error details:', err.message, err.stack);
      setError(`Failed to load analytics data: ${err.message}`);
    } finally {
      setLoading(false);
      console.log('Analytics loading complete');
    }
  };

  console.log('AnalyticsDashboard render - loading:', loading, 'error:', error);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div>{error}</div>
          <button
            onClick={fetchAnalyticsData}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: analytics.totalCustomers.toLocaleString(),
      icon: Users,
      color: 'blue',
      description: 'Registered customers'
    },
    {
      title: 'Total Rooms',
      value: analytics.totalRooms.toLocaleString(),
      icon: Bed,
      color: 'green',
      description: 'Available rooms'
    },
    {
      title: 'Active Bookings',
      value: analytics.activeBookings.toLocaleString(),
      icon: Calendar,
      color: 'purple',
      description: 'Current bookings'
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'yellow',
      description: 'All time revenue'
    },
    {
      title: 'Occupancy Rate',
      value: `${analytics.occupancyRate}%`,
      icon: TrendingUp,
      color: 'indigo',
      description: 'Current room occupancy'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${analytics.monthlyRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: 'pink',
      description: 'Last 30 days'
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time hotel performance insights and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue by Room Type */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Revenue by Room Type</h3>
          <p className="text-sm text-gray-600">Revenue breakdown by different room categories</p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {analytics.revenueByRoomType.length > 0 ? (
              analytics.revenueByRoomType.map((room) => (
                <div key={room.room_type} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-700">{room.room_type}</div>
                    <div className="text-sm text-gray-500">{room.total_bookings || 0} bookings</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ₹{(parseFloat(room.total_revenue) || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No revenue data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Services */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Popular Services</h3>
          <p className="text-sm text-gray-600">Most frequently booked services</p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {analytics.popularServices.length > 0 ? (
              analytics.popularServices.slice(0, 5).map((service) => (
                <div key={service.service_name} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-700">{service.service_name}</div>
                    <div className="text-sm text-gray-500 capitalize">{service.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {service.times_booked || 0} bookings
                    </div>
                    <div className="text-sm text-gray-500">
                      ₹{(parseFloat(service.total_revenue) || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No service data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium Customers */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Premium Customers</h3>
          <p className="text-sm text-gray-600">Customers who booked our most expensive rooms</p>
        </div>
        <div className="p-6">
          {analytics.premiumCustomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.premiumCustomers.map((customer) => (
                <div key={customer.customer_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {customer.first_name?.[0]}{customer.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No premium customer data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Customers (From Stored Procedure) */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top 5 Customers by Revenue</h3>
          <p className="text-sm text-gray-600">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Stored Procedure: GetTopCustomers
            </span>
            {" "}Customers ranked by total spending and loyalty points
          </p>
        </div>
        <div className="p-6">
          {analytics.topCustomers.length > 0 ? (
            <div className="space-y-4">
              {analytics.topCustomers.map((customer, index) => (
                <div key={customer.customer_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full text-white font-bold text-lg">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                        <div className="text-xs text-gray-400">{customer.phone}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        ₹{(parseFloat(customer.total_spent) || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {customer.total_bookings} booking{customer.total_bookings > 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center justify-end mt-1">
                        <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                          ⭐ {customer.loyalty_points || 0} points
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No top customer data available</p>
              <p className="text-xs mt-2">Stored procedure GetTopCustomers returned no results</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          <p className="text-sm text-gray-600">Latest booking activities</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.detailedBookings.slice(0, 10).map((booking) => (
                <tr key={booking.booking_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.first_name} {booking.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{booking.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.room_number}</div>
                    <div className="text-sm text-gray-500">{booking.room_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">{booking.total_nights} nights</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{(booking.total_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.booking_status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.booking_status === 'Checked-in' ? 'bg-blue-100 text-blue-800' :
                      booking.booking_status === 'Checked-out' ? 'bg-gray-100 text-gray-800' :
                      booking.booking_status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.booking_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {analytics.detailedBookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No booking data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;