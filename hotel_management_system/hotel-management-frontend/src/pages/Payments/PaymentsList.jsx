import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, Trash2, Eye, Plus, Search } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import Modal from '../../components/common/Modal';
import PaymentForm from '../../components/forms/PaymentForm';
import { paymentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentsAPI.getAll();
      setPayments(response.data);
    } catch (err) {
      setError('Failed to fetch payments data');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchPayments();
    showSuccess('Payment recorded successfully!');
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleDeletePayment = async (paymentId) => {
    if (!hasPermission('canDeleteRecords')) {
      setError('You do not have permission to delete payments');
      return;
    }

    try {
      console.log('Deleting payment:', paymentId);
      await paymentsAPI.delete(paymentId);
      fetchPayments();
      setError('');
      showSuccess('Payment deleted successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete payment';
      setError(errorMessage);
      console.error('Error deleting payment:', err.response?.data || err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'Failed':
        return <XCircle size={16} className="text-red-500" />;
      case 'Pending':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Refunded': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.first_name?.toLowerCase().includes(searchLower) ||
      payment.last_name?.toLowerCase().includes(searchLower) ||
      payment.transaction_id?.toLowerCase().includes(searchLower) ||
      payment.payment_method?.toLowerCase().includes(searchLower) ||
      payment.payment_status?.toLowerCase().includes(searchLower) ||
      payment.booking_id?.toString().includes(searchLower) ||
      payment.room_number?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <ProtectedRoute permission="canManagePayments">
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-2">View and manage payment transactions</p>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Make Payment
          </button>
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
              placeholder="Search by customer name, transaction ID, booking ID, or payment method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Payment Transactions</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking & Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount & Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <CreditCard size={20} className="text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            #{payment.payment_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.transaction_id || 'No transaction ID'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        Booking #{payment.booking_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.first_name} {payment.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{payment.amount}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {payment.payment_method}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(payment.payment_status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.payment_status)}`}>
                          {payment.payment_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Payment Details"
                        >
                          <Eye size={16} />
                        </button>
                        {hasPermission('canDeleteRecords') && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete payment #${payment.payment_id}?`)) {
                                handleDeletePayment(payment.payment_id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Payment"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Make Payment"
        >
          <PaymentForm
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentModal(false)}
          />
        </Modal>

        {/* Payment Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Payment Details"
        >
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment ID</label>
                  <p className="mt-1 text-sm text-gray-900">#{selectedPayment.payment_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                  <p className="mt-1 text-sm text-gray-900">#{selectedPayment.booking_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.first_name} {selectedPayment.last_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.room_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">₹{selectedPayment.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedPayment.payment_method}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                  <div className="mt-1 flex items-center">
                    {getStatusIcon(selectedPayment.payment_status)}
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.payment_status)}`}>
                      {selectedPayment.payment_status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedPayment.payment_date).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.transaction_id || 'No transaction ID'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Booking Total Amount</label>
                  <p className="mt-1 text-sm text-gray-900">₹{selectedPayment.booking_total}</p>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
};

export default PaymentsList;