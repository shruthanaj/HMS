import { useState, useEffect } from 'react';
import CustomersTable from '../../components/tables/CustomersTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { customersAPI } from '../../services/api';
import { Search } from 'lucide-react';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      // Fetch loyalty points for each customer
      const customersWithLoyalty = await Promise.all(
        response.data.map(async (customer) => {
          try {
            const loyaltyResponse = await customersAPI.getLoyaltyPoints(customer.customer_id);
            return {
              ...customer,
              loyalty_points: loyaltyResponse.data.loyalty_points
            };
          } catch {
            return { ...customer, loyalty_points: 0 };
          }
        })
      );
      setCustomers(customersWithLoyalty);
    } catch (err) {
      setError('Failed to fetch customers data');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (customerData) => {
    try {
      console.log('Adding customer:', customerData);
      await customersAPI.create(customerData);
      fetchCustomers(); // Refresh the list
      setError(''); // Clear any previous errors
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add customer';
      setError(errorMessage);
      console.error('Error adding customer:', err.response?.data || err);
    }
  };

  const handleEditCustomer = async (customerId, customerData) => {
    try {
      console.log('Updating customer:', customerId, customerData);
      await customersAPI.update(customerId, customerData);
      fetchCustomers(); // Refresh the list
      setError(''); // Clear any previous errors
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update customer';
      setError(errorMessage);
      console.error('Error updating customer:', err.response?.data || err);
    }
  };

const handleDeleteCustomer = async (customerId) => {
  try {
    console.log('Deleting customer:', customerId);
    const response = await customersAPI.delete(customerId);
    fetchCustomers(); // Refresh the list
    setError(''); // Clear any previous errors
  } catch (err) {
    const errorMessage = err.response?.data?.error || 'Failed to delete customer';
    setError(`Error: ${errorMessage}`);
    console.error('Full error deleting customer:', err);
    console.error('Error response:', err.response?.data);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.full_name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.address?.toLowerCase().includes(searchLower) ||
      customer.id_proof?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-2">Manage hotel customers and their information</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-right text-red-700 hover:text-red-900"
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
            placeholder="Search by name, email, phone, address, or ID proof..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <CustomersTable
        customers={filteredCustomers}
        onAdd={handleAddCustomer}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
      />
    </div>
  );
};

export default CustomersList;