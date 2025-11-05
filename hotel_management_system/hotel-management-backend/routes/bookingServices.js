const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// GET all booking services with details
router.get('/', async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT 
        bs.booking_service_id,
        bs.booking_id,
        bs.service_id,
        bs.quantity,
        bs.total_price,
        bs.service_date,
        bs.created_at,
        s.service_name,
        s.category,
        s.price as service_price,
        b.check_in,
        b.check_out,
        c.first_name,
        c.last_name,
        r.room_number
       FROM booking_services bs
       JOIN services s ON bs.service_id = s.service_id
       JOIN bookings b ON bs.booking_id = b.booking_id
       JOIN customers c ON b.customer_id = c.customer_id
       JOIN rooms r ON b.room_id = r.room_id
       ORDER BY bs.created_at DESC`
    );
    res.json(results);
  } catch (error) {
    console.error('Get booking services error:', error);
    res.status(500).json({ error: 'Failed to fetch booking services' });
  }
});

// DELETE booking service
router.delete('/:id', async (req, res) => {
  try {
    const bookingServiceId = req.params.id;

    // Check if booking service exists
    const [existingService] = await db.execute(
      'SELECT booking_service_id FROM booking_services WHERE booking_service_id = ?',
      [bookingServiceId]
    );

    if (existingService.length === 0) {
      return res.status(404).json({ error: 'Service booking not found' });
    }

    const [results] = await db.execute(
      'DELETE FROM booking_services WHERE booking_service_id = ?',
      [bookingServiceId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Service booking not found' });
    }

    res.json({ 
      success: true, 
      message: 'Service booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking service error:', error);
    res.status(500).json({ error: 'Failed to delete service booking' });
  }
});

module.exports = router;