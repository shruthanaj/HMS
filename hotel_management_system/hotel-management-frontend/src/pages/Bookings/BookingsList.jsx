import { useState, useEffect } from 'react';
import BookingsTable from '../../components/tables/BookingsTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import { bookingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Search } from 'lucide-react';

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getAll();
      setBookings(response.data);
    } catch (err) {
      setError('Failed to fetch bookings data');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddBooking = async (bookingData) => {
    try {
      console.log('Adding booking:', bookingData);
      await bookingsAPI.create(bookingData);
      fetchBookings();
      setError('');
      showSuccess('Booking created successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create booking';
      setError(errorMessage);
      console.error('Error creating booking:', err.response?.data || err);
    }
  };

  const handleEditBooking = async (bookingId, bookingData) => {
    try {
      console.log('Updating booking:', bookingId, bookingData);
      await bookingsAPI.update(bookingId, bookingData);
      fetchBookings();
      setError('');
      showSuccess('Booking updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update booking';
      setError(errorMessage);
      console.error('Error updating booking:', err.response?.data || err);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
  if (!hasPermission('canDeleteRecords')) {
    setError('You do not have permission to delete bookings');
    return;
  }

  try {
    console.log('Deleting booking:', bookingId);
    const response = await bookingsAPI.delete(bookingId);
    fetchBookings();
    setError('');
    showSuccess('Booking deleted successfully!');
  } catch (err) {
    const backendError = err.response?.data?.error || 'Unknown error';
    
    console.log('Full error:', err);
    console.log('Error response:', err.response?.data);

    // Provide specific guidance based on error type
    if (backendError.includes('payment')) {
      const paymentIds = backendError.match(/\d+/g);
      setError(
        <div>
          <strong>Cannot delete booking:</strong> It has associated payments.
          <br />
          <span className="text-sm">
            Please delete the payment(s) first from the <strong>Payments page</strong>.
            {paymentIds && paymentIds.length > 0 && (
              <span> Payment ID(s): {paymentIds.join(', ')}</span>
            )}
          </span>
          <br />
          <button
            onClick={() => window.location.href = '/payments'}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Go to Payments Page
          </button>
        </div>
      );
    } else if (backendError.includes('service')) {
      const serviceIds = backendError.match(/\d+/g);
      setError(
        <div>
          <strong>Cannot delete booking:</strong> It has associated services.
          <br />
          <span className="text-sm">
            Please delete the service booking(s) first.
            {serviceIds && serviceIds.length > 0 && (
              <span> Service Booking ID(s): {serviceIds.join(', ')}</span>
            )}
          </span>
          <br />
          <div className="mt-2 space-x-2">
            <button
              onClick={() => window.location.href = '/services'}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Go to Services Page
            </button>
            <button
              onClick={() => {
                // Quick SQL fix suggestion
                const sql = `DELETE FROM booking_services WHERE booking_service_id = ${serviceIds?.[0] || 'ID'};`;
                navigator.clipboard.writeText(sql);
                alert('SQL command copied to clipboard. Run it in your database.');
              }}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Copy SQL Fix
            </button>
          </div>
        </div>
      );
    } else {
      setError(`Delete failed: ${backendError}`);
    }
  }
};

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      console.log('Updating booking status:', bookingId, status);
      await bookingsAPI.updateStatus(bookingId, status);
      fetchBookings();
      setError('');
      showSuccess(`Booking ${status.toLowerCase()} successfully!`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update booking status';
      setError(errorMessage);
      console.error('Error updating booking status:', err.response?.data || err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter bookings based on search term
  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.customer_name?.toLowerCase().includes(searchLower) ||
      booking.room_number?.toLowerCase().includes(searchLower) ||
      booking.status?.toLowerCase().includes(searchLower) ||
      booking.booking_id?.toString().includes(searchLower)
    );
  });

  return (
    <ProtectedRoute permission="canManageBookings">
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">Manage hotel bookings and reservations</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
            <button 
              onClick={() => setError('')}
              className="absolute top-3 right-3 text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {success}
            <button 
              onClick={() => setSuccess('')}
              className="absolute top-3 right-3 text-green-700 hover:text-green-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by customer name, room number, booking ID, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <BookingsTable
          bookings={filteredBookings}
          onAdd={handleAddBooking}
          onEdit={handleEditBooking}
          onDelete={handleDeleteBooking}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </ProtectedRoute>
  );
};

export default BookingsList;