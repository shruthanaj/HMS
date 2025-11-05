import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const staffId = localStorage.getItem('staffId');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (staffId) {
    config.headers['staff-id'] = staffId;
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('staffId');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Staff API
export const staffAPI = {
  getAll: () => api.get('/staff'),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

// Customers API
export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getLoyaltyPoints: (id) => api.get(`/customers/${id}/loyalty-points`),
};

// Rooms API
export const roomsAPI = {
  getAll: () => api.get('/rooms'),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  getAvailability: (checkIn, checkOut) => api.get(`/rooms/availability/${checkIn}/${checkOut}`),
};

// Bookings API
export const bookingsAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  completeBooking: (data) => api.post('/bookings/complete-booking', data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

// Payments API
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  getByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
};

// Services API
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  addToBooking: (bookingId, data) => api.post(`/services/bookings/${bookingId}/services`, data),
  getByBooking: (bookingId) => api.get(`/services/bookings/${bookingId}/services`),
};

// Analytics API
export const analyticsAPI = {
  revenueByRoomType: () => api.get('/analytics/revenue-by-room-type'),
  occupancyRate: () => api.get('/analytics/occupancy-rate'),
  monthlyRevenue: () => api.get('/analytics/monthly-revenue'),
  customerDemographics: () => api.get('/analytics/customer-demographics'),
  popularServices: () => api.get('/analytics/popular-services'),
  premiumCustomers: () => api.get('/analytics/premium-customers'),
  detailedBookings: () => api.get('/analytics/detailed-bookings'),
};

// Procedures API (Using Stored Procedures)
export const proceduresAPI = {
  getAvailableRooms: (checkIn, checkOut, roomType) => 
    api.get('/procedures/available-rooms', { params: { check_in: checkIn, check_out: checkOut, room_type: roomType } }),
  calculateRevenue: (startDate, endDate) => 
    api.get('/procedures/revenue', { params: { start_date: startDate, end_date: endDate } }),
  getCustomerHistory: (customerId) => 
    api.get(`/procedures/customer-history/${customerId}`),
  getOccupancyRate: (startDate, endDate) => 
    api.get('/procedures/occupancy-rate', { params: { start_date: startDate, end_date: endDate } }),
  getTopCustomers: (limit = 10) => 
    api.get('/procedures/top-customers', { params: { limit } }),
  checkRoomAvailability: (roomId, checkIn, checkOut) => 
    api.get('/procedures/check-availability', { params: { room_id: roomId, check_in: checkIn, check_out: checkOut } }),
  getStaffAuditLog: () => 
    api.get('/procedures/staff-audit-log'),
};

// Add to the existing API exports
export const bookingServicesAPI = {
  getAll: () => api.get('/booking-services'),
  delete: (id) => api.delete(`/booking-services/${id}`),
};

export default api;