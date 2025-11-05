const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { validateEmail, validatePhone, sanitizeInput } = require('../utils/helpers');

// GET all staff (excluding passwords)
router.get('/', async (req, res) => {
  try {
    const [results] = await db.execute(
      'SELECT staff_id, username, full_name, email, phone, role, salary, hire_date, status, created_at FROM staff ORDER BY created_at DESC'
    );
    res.json(results);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// GET staff by ID
router.get('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    const [results] = await db.execute(
      'SELECT staff_id, username, full_name, email, phone, role, salary, hire_date, status FROM staff WHERE staff_id = ?',
      [staffId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// CREATE new staff
router.post('/', async (req, res) => {
  try {
    const { username, password, full_name, email, phone, role, salary } = req.body;

    // Basic validation
    if (!username || !password || !full_name || !email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const [results] = await db.execute(
      'INSERT INTO staff (username, password, full_name, email, phone, role, salary, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())',
      [sanitizeInput(username), password, sanitizeInput(full_name), email, phone, role, salary || null]
    );

    res.json({ 
      success: true, 
      staff_id: results.insertId,
      message: 'Staff created successfully'
    });
  } catch (error) {
    console.error('Create staff error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create staff: ' + error.message });
    }
  }
});

// UPDATE staff - FIXED VERSION
router.put('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    const { full_name, email, phone, role, salary, status, password } = req.body;

    console.log('Update request for staff ID:', staffId);
    console.log('Update data:', req.body);

    if (!full_name || !email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if staff exists
    const [existingStaff] = await db.execute(
      'SELECT staff_id FROM staff WHERE staff_id = ?',
      [staffId]
    );

    if (existingStaff.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Build dynamic update query based on provided fields
    let updateFields = [];
    let queryParams = [];

    updateFields.push('full_name = ?');
    queryParams.push(sanitizeInput(full_name));

    updateFields.push('email = ?');
    queryParams.push(email);

    updateFields.push('phone = ?');
    queryParams.push(phone);

    updateFields.push('role = ?');
    queryParams.push(role);

    updateFields.push('salary = ?');
    queryParams.push(salary || null);

    // Only update status if provided (for existing staff)
    if (status) {
      updateFields.push('status = ?');
      queryParams.push(status);
    }

    // Only update password if provided and not empty
    if (password && password.trim() !== '') {
      updateFields.push('password = ?');
      queryParams.push(password);
    }

    queryParams.push(staffId);

    const query = `UPDATE staff SET ${updateFields.join(', ')} WHERE staff_id = ?`;
    
    console.log('Executing query:', query);
    console.log('With parameters:', queryParams);

    const [results] = await db.execute(query, queryParams);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff member not found or no changes made' });
    }

    res.json({ 
      success: true, 
      message: 'Staff updated successfully',
      affectedRows: results.affectedRows
    });
  } catch (error) {
    console.error('Update staff error details:', error);
    console.error('SQL Error code:', error.code);
    console.error('SQL Error message:', error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ 
        error: 'Failed to update staff: ' + error.message,
        code: error.code
      });
    }
  }
});

// DELETE staff (soft delete)
// DELETE staff (soft delete) - UPDATED VERSION
router.delete('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;

    console.log('Attempting to delete staff:', staffId);

    // Check if staff exists
    const [existingStaff] = await db.execute(
      'SELECT staff_id FROM staff WHERE staff_id = ?',
      [staffId]
    );

    if (existingStaff.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Check if staff is assigned to any rooms
    const [assignedRooms] = await db.execute(
      'SELECT COUNT(*) as room_count FROM rooms WHERE staff_id = ?',
      [staffId]
    );

    if (assignedRooms[0].room_count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete staff member. They are assigned to rooms. Please reassign those rooms first.' 
      });
    }

    // Use soft delete instead of hard delete
    const [results] = await db.execute(
      'UPDATE staff SET status = "Inactive" WHERE staff_id = ?',
      [staffId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ 
      success: true, 
      message: 'Staff member deactivated successfully',
      affectedRows: results.affectedRows
    });
  } catch (error) {
    console.error('Delete staff error details:', error);
    console.error('SQL Error code:', error.code);
    console.error('SQL Error message:', error.message);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      res.status(400).json({ 
        error: 'Cannot delete staff member. They have existing records in the system. Please use deactivation instead.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to delete staff: ' + error.message,
        code: error.code
      });
    }
  }
});

module.exports = router;