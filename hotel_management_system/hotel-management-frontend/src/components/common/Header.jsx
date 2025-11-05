import { Menu, Bell, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role) => {
    const colors = {
      'Super Admin': 'bg-purple-100 text-purple-800',
      'Admin': 'bg-red-100 text-red-800',
      'Manager': 'bg-orange-100 text-orange-800',
      'Receptionist': 'bg-blue-100 text-blue-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="text-gray-500 hover:text-gray-600 lg:hidden"
          >
            <Menu size={24} />
          </button>
          <div className="ml-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              Hotel Dashboard
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user?.role)}`}>
                {user?.role}
              </span>
              <span className="text-xs text-gray-500">
                Welcome, {user?.full_name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;