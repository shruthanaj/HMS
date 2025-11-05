import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// Named export for the component
export function ProtectedRoute({ children, permission, fallback = null }) {
  const { user, hasPermission, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="md" />;
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return fallback || (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-6xl text-gray-300 mb-4">🚫</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to access this page.</p>
      </div>
    );
  }

  return children;
}

// Default export for backward compatibility
export default ProtectedRoute;