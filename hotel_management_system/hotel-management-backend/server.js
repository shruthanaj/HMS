const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const staffRoutes = require('./routes/staff');
const customerRoutes = require('./routes/customers');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const serviceRoutes = require('./routes/services');
const analyticsRoutes = require('./routes/analytics');
const proceduresRoutes = require('./routes/procedures');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/procedures', proceduresRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../hotel-management-frontend/dist')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../hotel-management-frontend/dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ API Base: http://localhost:${PORT}/api`);
});