import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard';
import StaffList from './pages/Staff/StaffList';
import StaffAuditLog from './pages/Staff/StaffAuditLog';
import CustomersList from './pages/Customers/CustomersList';
import RoomsList from './pages/Rooms/RoomsList';
import BookingsList from './pages/Bookings/BookingsList';
import PaymentsList from './pages/Payments/PaymentsList';
import ServicesList from './pages/Services/ServicesList';  // ✅ NEW - Added Services import
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';

function AppContent() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <Routes>
            <Route 
                path="/login" 
                element={user ? <Navigate to="/dashboard" /> : <Login />} 
            />
            
            <Route 
                path="/" 
                element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
            />
            
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/staff" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <StaffList />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/staff/audit-log" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <StaffAuditLog />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/customers" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CustomersList />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/rooms" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <RoomsList />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/bookings" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <BookingsList />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/payments" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <PaymentsList />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            {/* ✅ NEW - Added Services Route */}
            <Route 
                path="/services" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <ServicesList />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/analytics" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <AnalyticsDashboard />
                        </Layout>
                    </ProtectedRoute>
                } 
            />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
