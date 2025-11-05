const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Revenue by room type
router.get('/revenue-by-room-type', async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT 
        r.room_type,
        COUNT(b.booking_id) as total_bookings,
        SUM(b.total_amount) as total_revenue,
        AVG(b.total_amount) as avg_revenue_per_booking
      FROM rooms r
      LEFT JOIN bookings b ON r.room_id = b.room_id AND b.status = 'Checked-out'
      GROUP BY r.room_type`
    );
    res.json(results);
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// Occupancy rate
router.get('/occupancy-rate', async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT 
        COUNT(*) as total_rooms,
        SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied_rooms,
        ROUND((SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as occupancy_rate
      FROM rooms`
    );
    res.json(results[0]);
  } catch (error) {
    console.error('Occupancy rate error:', error);
    res.status(500).json({ error: 'Failed to fetch occupancy rate' });
  }
});

// Monthly revenue
router.get('/monthly-revenue', async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT 
        DATE_FORMAT(b.check_in, '%Y-%m') as month,
        SUM(b.total_amount) as revenue,
        COUNT(b.booking_id) as bookings
      FROM bookings b
      WHERE b.status = 'Checked-out'
      GROUP BY DATE_FORMAT(b.check_in, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12`
    );
    res.json(results);
  } catch (error) {
    console.error('Monthly revenue error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly revenue' });
  }
});

// Customer demographics
router.get('/customer-demographics', async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT 
        COUNT(*) as total_customers,
        AVG(TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())) as avg_age,
        COUNT(DISTINCT id_proof_type) as id_types_used
      FROM customers`
    );
    res.json(results[0]);
  } catch (error) {
    console.error('Customer demographics error:', error);
    res.status(500).json({ error: 'Failed to fetch customer demographics' });
  }
});

// Popular services
router.get('/popular-services', async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT 
        s.service_name,
        s.category,
        COUNT(bs.booking_service_id) as times_booked,
        SUM(bs.quantity) as total_quantity,
        SUM(bs.total_price) as total_revenue
      FROM services s
      LEFT JOIN booking_services bs ON s.service_id = bs.service_id
      GROUP BY s.service_id, s.service_name, s.category
      ORDER BY times_booked DESC`
    );
    res.json(results);
  } catch (error) {
    console.error('Popular services error:', error);
    res.status(500).json({ error: 'Failed to fetch popular services' });
  }
});

// Premium customers (nested query)
router.get('/premium-customers', async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT * FROM customers 
      WHERE customer_id IN (
        SELECT DISTINCT customer_id FROM bookings 
        WHERE room_id IN (
          SELECT room_id FROM rooms 
          WHERE price_per_night = (SELECT MAX(price_per_night) FROM rooms)
        )
      )`
    );
    res.json(results);
  } catch (error) {
    console.error('Premium customers error:', error);
    res.status(500).json({ error: 'Failed to fetch premium customers' });
  }
});

// Detailed bookings (join query)
router.get('/detailed-bookings', async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT 
        b.booking_id,
        c.first_name, 
        c.last_name,
        c.email,
        r.room_number,
        r.room_type,
        b.check_in,
        b.check_out,
        b.total_nights,
        b.total_amount,
        b.status as booking_status,
        p.payment_method,
        p.payment_status
      FROM bookings b
      JOIN customers c ON b.customer_id = c.customer_id
      JOIN rooms r ON b.room_id = r.room_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      ORDER BY b.created_at DESC`
    );
    res.json(results);
  } catch (error) {
    console.error('Detailed bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch detailed bookings' });
  }
});

module.exports = router;