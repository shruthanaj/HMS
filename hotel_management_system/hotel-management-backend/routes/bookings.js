const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { validateDate } = require('../utils/helpers');

// GET all bookings with customer and room details
router.get('/', async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT b.*, 
              c.first_name, c.last_name, c.email, c.phone,
              r.room_number, r.room_type, r.price_per_night
       FROM bookings b
       JOIN customers c ON b.customer_id = c.customer_id
       JOIN rooms r ON b.room_id = r.room_id
       ORDER BY b.created_at DESC`
    );
    res.json(results);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET booking by ID
router.get('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const [results] = await db.execute(
      `SELECT b.*, 
              c.first_name, c.last_name, c.email, c.phone, c.address,
              r.room_number, r.room_type, r.price_per_night, r.amenities
       FROM bookings b
       JOIN customers c ON b.customer_id = c.customer_id
       JOIN rooms r ON b.room_id = r.room_id
       WHERE b.booking_id = ?`,
      [bookingId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// CREATE new booking
router.post('/', async (req, res) => {
  try {
    const { customer_id, room_id, check_in, check_out, number_of_guests, special_requests } = req.body;

    console.log('Create booking request:', req.body);

    if (!customer_id || !room_id || !check_in || !check_out || !number_of_guests) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateDate(check_in) || !validateDate(check_out)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (new Date(check_in) >= new Date(check_out)) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    // Check room availability
    const [availability] = await db.execute(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE room_id = ? AND status IN ('Confirmed', 'Checked-in') 
       AND (check_in <= ? AND check_out >= ?)`,
      [room_id, check_out, check_in]
    );

    if (availability[0].count > 0) {
      return res.status(400).json({ error: 'Room not available for selected dates' });
    }

    const [results] = await db.execute(
      'INSERT INTO bookings (customer_id, room_id, check_in, check_out, number_of_guests, special_requests, status) VALUES (?, ?, ?, ?, ?, ?, "Confirmed")',
      [customer_id, room_id, check_in, check_out, number_of_guests, special_requests]
    );

    res.json({ 
      success: true, 
      booking_id: results.insertId,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking: ' + error.message });
  }
});

// UPDATE booking
router.put('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { check_in, check_out, number_of_guests, status, special_requests } = req.body;

    console.log('Update booking request:', req.body);

    if (!validateDate(check_in) || !validateDate(check_out)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (new Date(check_in) >= new Date(check_out)) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    const [results] = await db.execute(
      'UPDATE bookings SET check_in = ?, check_out = ?, number_of_guests = ?, status = ?, special_requests = ? WHERE booking_id = ?',
      [check_in, check_out, number_of_guests, status, special_requests, bookingId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ 
      success: true, 
      message: 'Booking updated successfully',
      affectedRows: results.affectedRows
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking: ' + error.message });
  }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        console.log('=== DELETE BOOKING DEBUG ===');
        console.log('Booking ID:', bookingId);

        // Check if booking exists
        const [existingBooking] = await db.execute(
            'SELECT booking_id, status FROM bookings WHERE booking_id = ?',
            [bookingId]
        );

        if (existingBooking.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = existingBooking[0];

        // Check if booking has payments
        const [payments] = await db.execute(
            'SELECT payment_id FROM payments WHERE booking_id = ?',
            [bookingId]
        );

        if (payments.length > 0) {
            return res.status(400).json({
                error: `Cannot delete booking: It has associated payments. Please delete payment(s) first. Payment ID(s): ${payments.map(p => p.payment_id).join(', ')}`
            });
        }

        // Status validation
        if (booking.status === 'Checked-in') {
            return res.status(400).json({
                error: 'Cannot delete checked-in booking. Please check out first.'
            });
        }

        // ✅ NEW: Automatically delete associated services
        console.log('Deleting associated booking services...');
        const [servicesDeleteResult] = await db.execute(
            'DELETE FROM booking_services WHERE booking_id = ?',
            [bookingId]
        );
        console.log(`Deleted ${servicesDeleteResult.affectedRows} booking services`);

        // Now delete the booking
        console.log('Deleting booking...');
        const [results] = await db.execute(
            'DELETE FROM bookings WHERE booking_id = ?',
            [bookingId]
        );

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        console.log('Booking deleted successfully');
        res.json({
            success: true,
            message: 'Booking and associated services deleted successfully',
            affectedRows: results.affectedRows
        });

    } catch (error) {
        console.error('=== DELETE BOOKING ERROR ===');
        console.error('Error details:', error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
            res.status(400).json({
                error: 'Cannot delete booking: It is referenced in other records.',
                details: error.message
            });
        } else {
            res.status(500).json({
                error: 'Failed to delete booking: ' + error.message
            });
        }
    }
});

// Create complete booking with procedure
router.post('/complete-booking', async (req, res) => {
  try {
    const { customer_id, room_id, check_in, check_out, guests, payment_method } = req.body;

    const [results] = await db.execute(
      'CALL CreateCompleteBooking(?, ?, ?, ?, ?, ?)',
      [customer_id, room_id, check_in, check_out, guests, payment_method]
    );

    res.json({ 
      success: true, 
      booking_id: results[0][0].booking_id,
      total_amount: results[0][0].total_amount
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ error: 'Failed to create complete booking: ' + error.message });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!['Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [results] = await db.execute(
      'UPDATE bookings SET status = ? WHERE booking_id = ?',
      [status, bookingId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ 
      success: true, 
      message: `Booking ${status.toLowerCase()} successfully`,
      affectedRows: results.affectedRows
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status: ' + error.message });
  }
});

module.exports = router;