const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// =====================================================
// Call: GetAvailableRooms Procedure
// =====================================================
router.get('/available-rooms', async (req, res) => {
  try {
    const { check_in, check_out, room_type } = req.query;
    
    const [results] = await db.execute(
      'CALL GetAvailableRooms(?, ?, ?)',
      [check_in, check_out, room_type || null]
    );
    
    res.json({ success: true, rooms: results[0] });
  } catch (error) {
    console.error('GetAvailableRooms error:', error);
    res.status(500).json({ error: 'Failed to get available rooms' });
  }
});

// =====================================================
// Call: CalculateRevenue Procedure
// =====================================================
router.get('/revenue', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const [results] = await db.execute(
      'CALL CalculateRevenue(?, ?)',
      [start_date, end_date]
    );
    
    res.json({ success: true, revenue: results[0] });
  } catch (error) {
    console.error('CalculateRevenue error:', error);
    res.status(500).json({ error: 'Failed to calculate revenue' });
  }
});

// =====================================================
// Call: GetCustomerBookingHistory Procedure
// =====================================================
router.get('/customer-history/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const [results] = await db.execute(
      'CALL GetCustomerBookingHistory(?)',
      [customerId]
    );
    
    res.json({ success: true, bookings: results[0] });
  } catch (error) {
    console.error('GetCustomerBookingHistory error:', error);
    res.status(500).json({ error: 'Failed to get customer history' });
  }
});

// =====================================================
// Call: GetRoomOccupancyRate Procedure
// =====================================================
router.get('/occupancy-rate', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const [results] = await db.execute(
      'CALL GetRoomOccupancyRate(?, ?)',
      [start_date, end_date]
    );
    
    res.json({ success: true, occupancy: results[0] });
  } catch (error) {
    console.error('GetRoomOccupancyRate error:', error);
    res.status(500).json({ error: 'Failed to get occupancy rate' });
  }
});

// =====================================================
// Call: GetTopCustomers Procedure
// =====================================================
router.get('/top-customers', async (req, res) => {
  try {
    const { limit } = req.query;
    
    const [results] = await db.execute(
      'CALL GetTopCustomers(?)',
      [limit || 10]
    );
    
    res.json({ success: true, customers: results[0] });
  } catch (error) {
    console.error('GetTopCustomers error:', error);
    res.status(500).json({ error: 'Failed to get top customers' });
  }
});

// =====================================================
// Call: CheckRoomAvailability Procedure
// =====================================================
router.get('/check-availability', async (req, res) => {
  try {
    const { room_id, check_in, check_out } = req.query;
    
    const [results] = await db.execute(
      'CALL CheckRoomAvailability(?, ?, ?)',
      [room_id, check_in, check_out]
    );
    
    res.json({ success: true, availability: results[0][0] });
  } catch (error) {
    console.error('CheckRoomAvailability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// =====================================================
// Get Staff Audit Log (Shows trigger activity)
// =====================================================
router.get('/staff-audit-log', async (req, res) => {
  try {
    const [results] = await db.execute(`
      SELECT 
        sal.audit_id,
        sal.staff_id,
        sal.action_type,
        sal.old_values,
        sal.new_values,
        sal.changed_by,
        sal.changed_at,
        s.full_name as staff_name
      FROM staff_audit_log sal
      LEFT JOIN staff s ON sal.staff_id = s.staff_id
      ORDER BY sal.changed_at DESC
      LIMIT 50
    `);
    
    res.json({ success: true, logs: results });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ error: 'Failed to get audit log' });
  }
});

module.exports = router;
