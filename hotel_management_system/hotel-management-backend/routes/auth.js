const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Simple login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const [results] = await db.execute(
      'SELECT staff_id, username, full_name, email, phone, role, status FROM staff WHERE username = ? AND password = ? AND status = "Active"',
      [username, password]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const staffId = req.headers['staff-id'];
    
    if (!staffId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const [results] = await db.execute(
      'SELECT staff_id, username, full_name, email, phone, role, status FROM staff WHERE staff_id = ?',
      [staffId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: results[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;