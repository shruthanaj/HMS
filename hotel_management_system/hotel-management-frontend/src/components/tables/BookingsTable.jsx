import { useState } from 'react';
import { Edit2, Trash2, Plus, Calendar, User, Bed, AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';
import BookingForm from '../forms/BookingForm';
import { useAuth } from '../../context/AuthContext';

const BookingsTable = ({ bookings, onEdit, onDelete, onAdd, onUpdateStatus }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { hasPermission } = useAuth();

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDelete = (booking) => {
    if (!hasPermission('canDeleteRecords')) {
      alert('You do not have permission to delete bookings');
      return;
    }

    // Show detailed confirmation message based on booking status
    let message = '';
    if (booking.status === 'Checked-in') {
      message = `Cannot delete checked-in booking #${booking.booking_id}. Please check out the guest first.`;
      alert(message);
      return;
    } else if (booking.status === 'Confirmed') {
      message = `Are you sure you want to delete confirmed booking #${booking.booking_id}? Consider cancelling instead.`;
    } else {
      message = `Are you sure you want to delete booking #${booking.booking_id}? This action cannot be undone.`;
    }

    if (window.confirm(message)) {
      onDelete(booking.booking_id);
    }
  };

  const handleAdd = () => {
    setSelectedBooking(null);
    setIsAddModalOpen(true);
  };

  const handleStatusChange = (bookingId, newStatus) => {
    onUpdateStatus(bookingId, newStatus);
  };

  const handleFormSubmit = (data) => {
    if (selectedBooking) {
      onEdit(selectedBooking.booking_id, data);
    } else {
      onAdd(data);
    }
    setIsModalOpen(false);
    setIsAddModalOpen(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'Checked-in': 'bg-green-100 text-green-800',
      'Checked-out': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const canEditBooking = (booking) => {
    // Allow editing of pending and confirmed bookings
    return booking.status === 'Pending' || booking.status === 'Confirmed';
  };

  const canDeleteBooking = (booking) => {
    // Only allow deletion of pending and cancelled bookings
    return booking.status === 'Pending' || booking.status === 'Cancelled';
  };

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Bookings</h2>
            <button
              onClick={handleAdd}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              New Booking
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer & Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.booking_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Calendar size={20} className="text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          #{booking.booking_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(booking.created_at)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.first_name} {booking.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Room {booking.room_number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.total_nights} nights
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{booking.total_amount}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.number_of_guests} guests
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.booking_id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-primary-500 ${getStatusColor(booking.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked-in">Checked-in</option>
                      <option value="Checked-out">Checked-out</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {canEditBooking(booking) && (
                        <button
                          onClick={() => handleEdit(booking)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit Booking"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {canDeleteBooking(booking) && hasPermission('canDeleteRecords') && (
                        <button
                          onClick={() => handleDelete(booking)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Booking"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {!canDeleteBooking(booking) && (
                        <span className="text-gray-400 cursor-not-allowed" title="Cannot delete active booking">
                          <Trash2 size={16} />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Booking"
      >
        <BookingForm
          booking={selectedBooking}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Booking"
      >
        <BookingForm
          onSubmit={handleFormSubmit}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default BookingsTable;