const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// GET all payments with booking details
router.get('/', async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT p.*, 
              b.booking_id, b.total_amount as booking_total,
              c.first_name, c.last_name, c.email,
              r.room_number
       FROM payments p
       JOIN bookings b ON p.booking_id = b.booking_id
       JOIN customers c ON b.customer_id = c.customer_id
       JOIN rooms r ON b.room_id = r.room_id
       ORDER BY p.payment_date DESC`
    );
    res.json(results);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// GET payment by ID
router.get('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const [results] = await db.execute(
      `SELECT p.*, 
              b.booking_id, b.total_amount as booking_total,
              c.first_name, c.last_name
       FROM payments p
       JOIN bookings b ON p.booking_id = b.booking_id
       JOIN customers c ON b.customer_id = c.customer_id
       WHERE p.payment_id = ?`,
      [paymentId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// CREATE new payment
router.post('/', async (req, res) => {
  try {
    const { booking_id, amount, payment_method, transaction_id } = req.body;

    if (!booking_id || !amount || !payment_method) {
      return res.status(400).json({ error: 'Booking ID, amount, and payment method are required' });
    }

    const [results] = await db.execute(
      'INSERT INTO payments (booking_id, amount, payment_method, transaction_id, payment_status) VALUES (?, ?, ?, ?, "Completed")',
      [booking_id, amount, payment_method, transaction_id]
    );

    res.json({ 
      success: true, 
      payment_id: results.insertId,
      message: 'Payment created successfully'
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// UPDATE payment
router.put('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { amount, payment_method, transaction_id, payment_status } = req.body;

    await db.execute(
      'UPDATE payments SET amount = ?, payment_method = ?, transaction_id = ?, payment_status = ? WHERE payment_id = ?',
      [amount, payment_method, transaction_id, payment_status, paymentId]
    );

    res.json({ success: true, message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// DELETE payment
// DELETE payment
router.delete('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;

    console.log('Attempting to delete payment:', paymentId);

    // Check if payment exists
    const [existingPayment] = await db.execute(
      'SELECT payment_id FROM payments WHERE payment_id = ?',
      [paymentId]
    );

    if (existingPayment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const [results] = await db.execute(
      'DELETE FROM payments WHERE payment_id = ?',
      [paymentId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ 
      success: true, 
      message: 'Payment deleted successfully',
      affectedRows: results.affectedRows
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Failed to delete payment: ' + error.message });
  }
});
// Get payments by booking
router.get('/booking/:booking_id', async (req, res) => {
  try {
    const bookingId = req.params.booking_id;
    const [results] = await db.execute(
      'SELECT * FROM payments WHERE booking_id = ? ORDER BY payment_date DESC',
      [bookingId]
    );

    res.json(results);
  } catch (error) {
    console.error('Get payments by booking error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

module.exports = router;