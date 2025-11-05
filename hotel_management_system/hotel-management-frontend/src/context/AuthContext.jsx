import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create context
const AuthContext = createContext(null);

// Role-based permissions
const rolePermissions = {
  'Super Admin': {
    canManageStaff: true,
    canManageCustomers: true,
    canManageRooms: true,
    canManageBookings: true,
    canManagePayments: true,
    canViewAnalytics: true,
    canManageServices: true,
    canDeleteRecords: true,
    canEditAllRecords: true
  },
  'Admin': {
    canManageStaff: true,
    canManageCustomers: true,
    canManageRooms: true,
    canManageBookings: true,
    canManagePayments: true,
    canViewAnalytics: true,
    canManageServices: true,
    canDeleteRecords: true,
    canEditAllRecords: true
  },
  'Manager': {
    canManageStaff: false,
    canManageCustomers: true,
    canManageRooms: true,
    canManageBookings: true,
    canManagePayments: true,
    canViewAnalytics: true,
    canManageServices: true,
    canDeleteRecords: false,
    canEditAllRecords: true
  },
  'Receptionist': {
    canManageStaff: false,
    canManageCustomers: true,
    canManageRooms: false,
    canManageBookings: true,
    canManagePayments: true,
    canViewAnalytics: false,
    canManageServices: true,
    canDeleteRecords: false,
    canEditAllRecords: false
  }
};

// Custom hook - must be named useAuth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setPermissions(rolePermissions[userObj.role] || {});
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user } = response.data;
      
      localStorage.setItem('token', 'dummy-token');
      localStorage.setItem('staffId', user.staff_id);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setPermissions(rolePermissions[user.role] || {});
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('staffId');
    localStorage.removeItem('user');
    setUser(null);
    setPermissions({});
  };

  const hasPermission = (permission) => {
    return permissions[permission] || false;
  };

  const value = {
    user,
    permissions,
    login,
    logout,
    loading,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;