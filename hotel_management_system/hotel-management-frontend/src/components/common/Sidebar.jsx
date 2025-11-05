import { X, Home, Users, User, Bed, Calendar, CreditCard, BarChart3, LogOut, Shield, Coffee } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open, setOpen }) => {
    const location = useLocation();
    const { hasPermission, user, logout } = useAuth();

    // Base menu items with permissions
    const menuItems = [
        { 
            path: '/dashboard', 
            icon: Home, 
            label: 'Dashboard', 
            permission: true 
        },
        { 
            path: '/staff', 
            icon: Users, 
            label: 'Staff Management', 
            permission: hasPermission('canManageStaff') 
        },
        { 
            path: '/customers', 
            icon: User, 
            label: 'Customer Management', 
            permission: hasPermission('canManageCustomers') 
        },
        { 
            path: '/rooms', 
            icon: Bed, 
            label: 'Room Management', 
            permission: hasPermission('canManageRooms') 
        },
        { 
            path: '/bookings', 
            icon: Calendar, 
            label: 'Bookings', 
            permission: hasPermission('canManageBookings') 
        },
        { 
            path: '/payments', 
            icon: CreditCard, 
            label: 'Payments', 
            permission: hasPermission('canManagePayments') 
        },
        { 
            path: '/analytics', 
            icon: BarChart3, 
            label: 'Analytics', 
            permission: hasPermission('canViewAnalytics') 
        },
        { 
            path: '/services', 
            icon: Coffee, 
            label: 'Services', 
            permission: hasPermission('canManageServices') 
        },
    ];

    const filteredMenuItems = menuItems.filter(item => item.permission);

    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`
                    fixed top-0 left-0 z-50 h-screen w-64 bg-gray-900 text-white
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:static lg:z-auto
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center space-x-2">
                        <Shield className="w-8 h-8 text-blue-500" />
                        <span className="text-xl font-bold">Hotel MS</span>
                    </div>
                    <button 
                        onClick={() => setOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{user?.full_name}</p>
                            <p className="text-xs text-gray-400">{user?.role}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {filteredMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setOpen(false)}
                                className={`
                                    flex items-center space-x-3 px-4 py-3 rounded-lg
                                    transition-colors duration-200
                                    ${isActive(item.path)
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800">
                    <button 
                        onClick={logout}
                        className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
