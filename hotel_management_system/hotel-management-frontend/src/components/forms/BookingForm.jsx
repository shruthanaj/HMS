import { useState, useEffect } from 'react';
import { customersAPI, roomsAPI, proceduresAPI } from '../../services/api';

const BookingForm = ({ booking, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    room_id: '',
    room_type: '',
    check_in: '',
    check_out: '',
    number_of_guests: 1,
    special_requests: '',
    status: 'Confirmed' // Default status for new bookings
  });
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [useStoredProcedure, setUseStoredProcedure] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomersAndRooms();
    if (booking) {
      // Fix date format for input fields
      let checkIn = booking.check_in || '';
      let checkOut = booking.check_out || '';
      
      if (checkIn.includes('T')) {
        checkIn = checkIn.split('T')[0];
      }
      if (checkOut.includes('T')) {
        checkOut = checkOut.split('T')[0];
      }

      setFormData({
        customer_id: booking.customer_id,
        room_id: booking.room_id,
        room_type: '',
        check_in: checkIn,
        check_out: checkOut,
        number_of_guests: booking.number_of_guests,
        special_requests: booking.special_requests || '',
        status: booking.status || 'Confirmed' // Include status when editing
      });
    }
  }, [booking]);

  useEffect(() => {
    // Fetch available rooms when dates are selected
    if (formData.check_in && formData.check_out && !booking) {
      fetchAvailableRooms();
    }
  }, [formData.check_in, formData.check_out, formData.room_type]);

  const fetchCustomersAndRooms = async () => {
    try {
      const [customersRes, roomsRes] = await Promise.all([
        customersAPI.getAll(),
        roomsAPI.getAll()
      ]);
      setCustomers(customersRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAvailableRooms = async () => {
    if (!formData.check_in || !formData.check_out) return;
    
    try {
      setLoading(true);
      // Use stored procedure to get available rooms
      const response = await proceduresAPI.getAvailableRooms(
        formData.check_in,
        formData.check_out,
        formData.room_type || null
      );
      
      if (response.data?.rooms) {
        setAvailableRooms(response.data.rooms);
        setUseStoredProcedure(true);
      } else {
        // Fallback to all rooms
        setAvailableRooms(rooms);
        setUseStoredProcedure(false);
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      setAvailableRooms(rooms);
      setUseStoredProcedure(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate dates
    if (new Date(formData.check_in) >= new Date(formData.check_out)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // Only submit the required fields (remove room_type filter field)
    const submissionData = {
      customer_id: formData.customer_id,
      room_id: formData.room_id,
      check_in: formData.check_in,
      check_out: formData.check_out,
      number_of_guests: formData.number_of_guests,
      special_requests: formData.special_requests || '', // Ensure it's not undefined
      status: formData.status || 'Confirmed' // Ensure status is always included
    };
    
    onSubmit(submissionData);
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  // Determine which rooms to display
  const displayRooms = booking ? rooms : (availableRooms.length > 0 ? availableRooms : rooms);

  // Get unique room types for filter
  const roomTypes = [...new Set(rooms.map(r => r.room_type))];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer *
          </label>
          <select
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.customer_id} value={customer.customer_id}>
                {customer.first_name} {customer.last_name} - {customer.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date *
          </label>
          <input
            type="date"
            name="check_in"
            value={formData.check_in}
            onChange={handleChange}
            min={today}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date *
          </label>
          <input
            type="date"
            name="check_out"
            value={formData.check_out}
            onChange={handleChange}
            min={formData.check_in || today}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {!booking && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Room Type
              {useStoredProcedure && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Using GetAvailableRooms
                </span>
              )}
            </label>
            <select
              name="room_type"
              value={formData.room_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Room Types</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room *
            {!booking && availableRooms.length > 0 && (
              <span className="ml-2 text-xs text-green-600">
                ({availableRooms.length} available)
              </span>
            )}
          </label>
          <select
            name="room_id"
            value={formData.room_id}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
          >
            <option value="">
              {loading ? 'Loading available rooms...' : 'Select Room'}
            </option>
            {displayRooms.map((room) => (
              <option key={room.room_id} value={room.room_id}>
                Room {room.room_number} - {room.room_type} (₹{room.price_per_night})
                {room.status && room.status !== 'Available' && ` - ${room.status}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Guests *
          </label>
          <input
            type="number"
            name="number_of_guests"
            value={formData.number_of_guests}
            onChange={handleChange}
            min="1"
            max="10"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {booking && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-in">Checked-in</option>
              <option value="Checked-out">Checked-out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Special Requests
        </label>
        <textarea
          name="special_requests"
          value={formData.special_requests}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Any special requests or notes..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {booking ? 'Update Booking' : 'Create Booking'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;