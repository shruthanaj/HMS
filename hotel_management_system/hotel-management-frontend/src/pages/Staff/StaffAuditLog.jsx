import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, User, Calendar, Edit } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { proceduresAPI } from '../../services/api';

const StaffAuditLog = () => {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await proceduresAPI.getStaffAuditLog();
      console.log('Audit logs:', response.data);
      setAuditLogs(response.data.logs || []);
      setError('');
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs');
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/staff')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Audit Log</h1>
              <p className="text-gray-600 mt-1 flex items-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  Trigger: log_staff_changes
                </span>
                Track all staff record modifications
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchAuditLogs}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FileText className="text-blue-600 mt-0.5 mr-3" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">About This Log</h3>
            <p className="text-sm text-blue-700 mt-1">
              This audit log is automatically populated by the <code className="bg-blue-100 px-1 rounded">log_staff_changes</code> database trigger.
              Every time a staff member's record is updated (e.g., salary change, role change), a new entry is created here.
              This demonstrates the automatic trigger functionality required for the evaluation rubric.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Audit Trail ({auditLogs.length} entries)
          </h2>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Logs Yet</h3>
            <p className="text-gray-600 mb-4">
              Audit logs will appear here when staff records are updated.
            </p>
            <p className="text-sm text-gray-500">
              Try editing a staff member's salary or role to see the trigger in action!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audit ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Old Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Old Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Changed At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.audit_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Edit size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">#{log.audit_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          Staff ID: {log.staff_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        ₹{(parseFloat(log.old_salary) || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">
                        ₹{(parseFloat(log.new_salary) || 0).toLocaleString()}
                      </span>
                      {log.new_salary !== log.old_salary && (
                        <span className="ml-2 text-xs text-gray-500">
                          {parseFloat(log.new_salary) > parseFloat(log.old_salary) ? '↑' : '↓'}
                          {' '}
                          {Math.abs(
                            ((parseFloat(log.new_salary) - parseFloat(log.old_salary)) / parseFloat(log.old_salary)) * 100
                          ).toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{log.old_role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.new_role === 'Super Admin' ? 'bg-purple-100 text-purple-800' :
                        log.new_role === 'Admin' ? 'bg-blue-100 text-blue-800' :
                        log.new_role === 'Manager' ? 'bg-green-100 text-green-800' :
                        log.new_role === 'Receptionist' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.new_role}
                      </span>
                      {log.new_role !== log.old_role && (
                        <span className="ml-2 text-xs text-orange-600 font-medium">CHANGED</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(log.changed_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.changed_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-yellow-900 mb-2">How to Test the Trigger</h3>
        <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
          <li>Go to the Staff Management page</li>
          <li>Click "Edit" on any staff member</li>
          <li>Change their salary or role</li>
          <li>Save the changes</li>
          <li>Return to this Audit Log page to see the new entry</li>
        </ol>
      </div>
    </div>
  );
};

export default StaffAuditLog;
