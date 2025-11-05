const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// GET all services
router.get('/', async (req, res) => {
  try {
    const [results] = await db.execute(
      'SELECT service_id, service_name, description, price, category, status as availability_status, created_at FROM services ORDER BY service_name'
    );
    res.json(results);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET service by ID
router.get('/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    const [results] = await db.execute(
      'SELECT service_id, service_name, description, price, category, status as availability_status, created_at FROM services WHERE service_id = ?',
      [serviceId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// CREATE new service
router.post('/', async (req, res) => {
  try {
    const { service_name, description, price, category, availability_status } = req.body;

    if (!service_name || !price || !category) {
      return res.status(400).json({ error: 'Service name, price, and category are required' });
    }

    const [results] = await db.execute(
      'INSERT INTO services (service_name, description, price, category, status) VALUES (?, ?, ?, ?, ?)',
      [service_name, description, price, category, availability_status || 'Available']
    );

    res.json({ 
      success: true, 
      service_id: results.insertId,
      message: 'Service created successfully'
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// UPDATE service
router.put('/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { service_name, description, price, category, availability_status } = req.body;

    await db.execute(
      'UPDATE services SET service_name = ?, description = ?, price = ?, category = ?, status = ? WHERE service_id = ?',
      [service_name, description, price, category, availability_status, serviceId]
    );

    res.json({ success: true, message: 'Service updated successfully' });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// DELETE service
router.delete('/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Check if service has bookings
    const [bookings] = await db.execute(
      'SELECT COUNT(*) as booking_count FROM booking_services WHERE service_id = ?',
      [serviceId]
    );

    if (bookings[0].booking_count > 0) {
      return res.status(400).json({ error: 'Cannot delete service with existing bookings' });
    }

    await db.execute(
      'DELETE FROM services WHERE service_id = ?',
      [serviceId]
    );

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// BOOKING SERVICES ROUTES

// Add service to booking
router.post('/bookings/:booking_id/services', async (req, res) => {
  try {
    const bookingId = req.params.booking_id;
    const { service_id, quantity, service_date } = req.body;

    if (!service_id || !quantity) {
      return res.status(400).json({ error: 'Service ID and quantity are required' });
    }

    // Get service price
    const [service] = await db.execute(
      'SELECT price FROM services WHERE service_id = ?',
      [service_id]
    );

    if (service.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const total_price = service[0].price * quantity;

    const [results] = await db.execute(
      'INSERT INTO booking_services (booking_id, service_id, quantity, total_price, service_date) VALUES (?, ?, ?, ?, ?)',
      [bookingId, service_id, quantity, total_price, service_date]
    );

    res.json({ 
      success: true, 
      booking_service_id: results.insertId,
      message: 'Service added to booking successfully'
    });
  } catch (error) {
    console.error('Add service to booking error:', error);
    res.status(500).json({ error: 'Failed to add service to booking' });
  }
});

// Get services for a booking
router.get('/bookings/:booking_id/services', async (req, res) => {
  try {
    const bookingId = req.params.booking_id;
    const [results] = await db.execute(
      `SELECT bs.*, s.service_name, s.category, s.price as unit_price
       FROM booking_services bs
       JOIN services s ON bs.service_id = s.service_id
       WHERE bs.booking_id = ?`,
      [bookingId]
    );

    res.json(results);
  } catch (error) {
    console.error('Get booking services error:', error);
    res.status(500).json({ error: 'Failed to fetch booking services' });
  }
});

module.exports = router;