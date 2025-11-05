import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffTable from '../../components/tables/StaffTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import { staffAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Search, FileText } from 'lucide-react';

const StaffList = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (hasPermission('canManageStaff')) {
      fetchStaff();
    }
  }, [hasPermission]);

  const fetchStaff = async () => {
    try {
      const response = await staffAPI.getAll();
      setStaff(response.data);
    } catch (err) {
      setError('Failed to fetch staff data');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (staffData) => {
    try {
      console.log('Adding staff:', staffData);
      await staffAPI.create(staffData);
      fetchStaff();
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add staff member';
      setError(errorMessage);
      console.error('Error adding staff:', err.response?.data || err);
    }
  };

  const handleEditStaff = async (staffId, staffData) => {
    try {
      console.log('Updating staff:', staffId, staffData);
      await staffAPI.update(staffId, staffData);
      fetchStaff();
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update staff member';
      setError(errorMessage);
      console.error('Error updating staff:', err.response?.data || err);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!hasPermission('canDeleteRecords')) {
      setError('You do not have permission to delete staff members');
      return;
    }

    try {
      console.log('Deleting staff:', staffId);
      await staffAPI.delete(staffId);
      fetchStaff();
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete staff member';
      setError(errorMessage);
      console.error('Error deleting staff:', err.response?.data || err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter staff based on search term
  const filteredStaff = staff.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.full_name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.role?.toLowerCase().includes(searchLower) ||
      member.phone?.toLowerCase().includes(searchLower) ||
      member.username?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <ProtectedRoute permission="canManageStaff">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600 mt-2">Manage hotel staff members and their roles</p>
          </div>
          <button
            onClick={() => navigate('/staff/audit-log')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText size={20} className="mr-2" />
            View Audit Log
          </button>
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
              placeholder="Search by name, email, role, phone, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <StaffTable
          staff={filteredStaff}
          onAdd={handleAddStaff}
          onEdit={handleEditStaff}
          onDelete={handleDeleteStaff}
        />
      </div>
    </ProtectedRoute>
  );
};

export default StaffList;