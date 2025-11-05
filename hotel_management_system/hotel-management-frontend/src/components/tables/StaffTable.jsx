import { useState } from 'react';
import { Edit2, Trash2, UserPlus, Eye } from 'lucide-react';
import Modal from '../common/Modal';
import StaffForm from '../forms/StaffForm';
import { useAuth } from '../../context/AuthContext';

const StaffTable = ({ staff, onEdit, onDelete, onAdd }) => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { hasPermission, user } = useAuth();

  const handleEdit = (staffMember) => {
    // Check if user can edit this staff member
    if (!hasPermission('canEditAllRecords') && staffMember.staff_id !== user.staff_id) {
      alert('You can only edit your own profile');
      return;
    }
    setSelectedStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleDelete = (staffMember) => {
    if (!hasPermission('canDeleteRecords')) {
      alert('You do not have permission to delete staff members');
      return;
    }

    if (staffMember.staff_id === user.staff_id) {
      alert('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${staffMember.full_name}?`)) {
      onDelete(staffMember.staff_id);
    }
  };

  const handleAdd = () => {
    if (!hasPermission('canManageStaff')) {
      alert('You do not have permission to add staff members');
      return;
    }
    setSelectedStaff(null);
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (selectedStaff) {
      onEdit(selectedStaff.staff_id, data);
    } else {
      onAdd(data);
    }
    setIsModalOpen(false);
    setIsAddModalOpen(false);
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role) => {
    const colors = {
      'Super Admin': 'bg-purple-100 text-purple-800',
      'Admin': 'bg-red-100 text-red-800',
      'Manager': 'bg-orange-100 text-orange-800',
      'Receptionist': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Staff Members</h2>
            {hasPermission('canManageStaff') && (
              <button
                onClick={handleAdd}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <UserPlus size={20} className="mr-2" />
                Add Staff
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hire Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((person) => (
                <tr key={person.staff_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {person.full_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {person.full_name}
                          {person.staff_id === user.staff_id && (
                            <span className="ml-2 text-xs text-primary-600">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{person.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(person.role)}`}>
                      {person.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{person.email}</div>
                    <div className="text-sm text-gray-500">{person.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(person.status)}`}>
                      {person.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(person.hire_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {(hasPermission('canEditAllRecords') || person.staff_id === user.staff_id) && (
                        <button
                          onClick={() => handleEdit(person)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {hasPermission('canDeleteRecords') && person.staff_id !== user.staff_id && (
                        <button
                          onClick={() => handleDelete(person)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
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

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Staff Member"
      >
        <StaffForm
          staff={selectedStaff}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Staff Member"
      >
        <StaffForm
          onSubmit={handleFormSubmit}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default StaffTable;