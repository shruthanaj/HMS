const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT r.*, s.full_name as staff_name 
       FROM rooms r 
       LEFT JOIN staff s ON r.staff_id = s.staff_id 
       ORDER BY room_number`
    );
    res.json(results);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET room by ID
router.get('/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const [results] = await db.execute(
      'SELECT * FROM rooms WHERE room_id = ?',
      [roomId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// CREATE new room - FIXED VERSION
router.post('/', async (req, res) => {
  try {
    const { room_number, room_type, price_per_night, max_occupancy, size, description, amenities, floor_number, staff_id } = req.body;

    console.log('Create room request data:', req.body);

    // Basic validation
    if (!room_number || !room_type || !price_per_night || !max_occupancy) {
      return res.status(400).json({ error: 'Room number, type, price, and max occupancy are required' });
    }

    // Convert to numbers
    const price = parseFloat(price_per_night);
    const maxOccupancy = parseInt(max_occupancy);
    const floorNumber = floor_number ? parseInt(floor_number) : null;
    const staffId = staff_id ? parseInt(staff_id) : null;

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Invalid price per night' });
    }

    if (isNaN(maxOccupancy) || maxOccupancy <= 0) {
      return res.status(400).json({ error: 'Invalid max occupancy' });
    }

    const [results] = await db.execute(
      'INSERT INTO rooms (room_number, room_type, price_per_night, max_occupancy, size, description, amenities, floor_number, staff_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "Available")',
      [room_number, room_type, price, maxOccupancy, size, description, amenities, floorNumber, staffId]
    );

    res.json({ 
      success: true, 
      room_id: results.insertId,
      message: 'Room created successfully'
    });
  } catch (error) {
    console.error('Create room error details:', error);
    console.error('SQL Error code:', error.code);
    console.error('SQL Error message:', error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Room number already exists' });
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({ error: 'Invalid staff ID' });
    } else {
      res.status(500).json({ 
        error: 'Failed to create room: ' + error.message,
        code: error.code
      });
    }
  }
});

// UPDATE room
router.put('/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { room_number, room_type, price_per_night, max_occupancy, size, description, amenities, status, floor_number, staff_id } = req.body;

    console.log('Update room request data:', req.body);

    if (!room_number || !room_type || !price_per_night || !max_occupancy) {
      return res.status(400).json({ error: 'Room number, type, price, and max occupancy are required' });
    }

    // Convert to numbers
    const price = parseFloat(price_per_night);
    const maxOccupancy = parseInt(max_occupancy);
    const floorNumber = floor_number ? parseInt(floor_number) : null;
    const staffId = staff_id ? parseInt(staff_id) : null;

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Invalid price per night' });
    }

    if (isNaN(maxOccupancy) || maxOccupancy <= 0) {
      return res.status(400).json({ error: 'Invalid max occupancy' });
    }

    // Check if room exists
    const [existingRoom] = await db.execute(
      'SELECT room_id FROM rooms WHERE room_id = ?',
      [roomId]
    );

    if (existingRoom.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const [results] = await db.execute(
      'UPDATE rooms SET room_number = ?, room_type = ?, price_per_night = ?, max_occupancy = ?, size = ?, description = ?, amenities = ?, status = ?, floor_number = ?, staff_id = ? WHERE room_id = ?',
      [room_number, room_type, price, maxOccupancy, size, description, amenities, status, floorNumber, staffId, roomId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found or no changes made' });
    }

    res.json({ 
      success: true, 
      message: 'Room updated successfully',
      affectedRows: results.affectedRows
    });
  } catch (error) {
    console.error('Update room error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Room number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update room: ' + error.message });
    }
  }
});

// DELETE room - UPDATED VERSION
router.delete('/:id', async (req, res) => {
  try {
    const roomId = req.params.id;

    console.log('Attempting to delete room:', roomId);

    // Check if room exists
    const [existingRoom] = await db.execute(
      'SELECT room_id FROM rooms WHERE room_id = ?',
      [roomId]
    );

    if (existingRoom.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if room has any bookings (past or present)
    const [bookings] = await db.execute(
      'SELECT COUNT(*) as booking_count FROM bookings WHERE room_id = ?',
      [roomId]
    );

    if (bookings[0].booking_count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete room. Room has existing bookings. Please delete the bookings first or set room status to "Maintenance" instead.' 
      });
    }

    const [results] = await db.execute(
      'DELETE FROM rooms WHERE room_id = ?',
      [roomId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ 
      success: true, 
      message: 'Room deleted successfully',
      affectedRows: results.affectedRows
    });
  } catch (error) {
    console.error('Delete room error details:', error);
    console.error('SQL Error code:', error.code);
    console.error('SQL Error message:', error.message);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      res.status(400).json({ 
        error: 'Cannot delete room. It is referenced in other records (bookings, etc.). Please remove those references first.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to delete room: ' + error.message,
        code: error.code
      });
    }
  }
});

// Get available rooms for dates
router.get('/availability/:check_in/:check_out', async (req, res) => {
  try {
    const { check_in, check_out } = req.params;

    const [results] = await db.execute(
      `SELECT r.* 
       FROM rooms r 
       WHERE r.room_id NOT IN (
         SELECT room_id FROM bookings 
         WHERE status IN ('Confirmed', 'Checked-in') 
         AND (check_in <= ? AND check_out >= ?)
       ) 
       AND r.status = 'Available'`,
      [check_out, check_in]
    );

    res.json(results);
  } catch (error) {
    console.error('Get available rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch available rooms' });
  }
});

module.exports = router;