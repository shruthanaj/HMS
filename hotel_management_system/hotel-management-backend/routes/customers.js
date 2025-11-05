const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { validateEmail, validatePhone, sanitizeInput, validateDate } = require('../utils/helpers');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const [results] = await db.execute(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    res.json(results);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const [results] = await db.execute(
      'SELECT * FROM customers WHERE customer_id = ?',
      [customerId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// CREATE new customer
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address, id_proof_type, id_proof_number, date_of_birth } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const [results] = await db.execute(
      'INSERT INTO customers (first_name, last_name, email, phone, address, id_proof_type, id_proof_number, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [sanitizeInput(first_name), sanitizeInput(last_name), email, phone, address, id_proof_type, id_proof_number, date_of_birth]
    );

    res.json({ 
      success: true, 
      customer_id: results.insertId,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Create customer error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create customer: ' + error.message });
    }
  }
});

// UPDATE customer - FIXED VERSION
router.put('/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const { first_name, last_name, email, phone, address, id_proof_type, id_proof_number, date_of_birth } = req.body;

    console.log('Update request for customer ID:', customerId);
    console.log('Update data:', req.body);

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if customer exists
    const [existingCustomer] = await db.execute(
      'SELECT customer_id FROM customers WHERE customer_id = ?',
      [customerId]
    );

    if (existingCustomer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const [results] = await db.execute(
      'UPDATE customers SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, id_proof_type = ?, id_proof_number = ?, date_of_birth = ? WHERE customer_id = ?',
      [sanitizeInput(first_name), sanitizeInput(last_name), email, phone, address, id_proof_type, id_proof_number, date_of_birth, customerId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found or no changes made' });
    }

    res.json({ 
      success: true, 
      message: 'Customer updated successfully',
      affectedRows: results.affectedRows
    });
  } catch (error) {
    console.error('Update customer error details:', error);
    console.error('SQL Error code:', error.code);
    console.error('SQL Error message:', error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already exists' });
    } else if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD format.' });
    } else {
      res.status(500).json({ 
        error: 'Failed to update customer: ' + error.message,
        code: error.code
      });
    }
  }
});

// DELETE customer
// DELETE customer - UPDATED VERSION
router.delete('/:id', async (req, res) => {
  try {
    const customerId = req.params.id;

    console.log('Attempting to delete customer:', customerId);

    // Check if customer exists
    const [existingCustomer] = await db.execute(
      'SELECT customer_id FROM customers WHERE customer_id = ?',
      [customerId]
    );

    if (existingCustomer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if customer has bookings
    const [bookings] = await db.execute(
      'SELECT COUNT(*) as booking_count FROM bookings WHERE customer_id = ?',
      [customerId]
    );

    if (bookings[0].booking_count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with existing bookings. Please delete the bookings first or set the customer as inactive.' 
      });
    }

    const [results] = await db.execute(
      'DELETE FROM customers WHERE customer_id = ?',
      [customerId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ 
      success: true, 
      message: 'Customer deleted successfully',
      affectedRows: results.affectedRows
    });
  } catch (error) {
    console.error('Delete customer error details:', error);
    console.error('SQL Error code:', error.code);
    console.error('SQL Error message:', error.message);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      res.status(400).json({ 
        error: 'Cannot delete customer. Customer has existing records in the system. Please remove all associated records first.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to delete customer: ' + error.message,
        code: error.code
      });
    }
  }
});

// Get customer loyalty points
router.get('/:id/loyalty-points', async (req, res) => {
  try {
    const customerId = req.params.id;
    
    const [results] = await db.execute(
      'SELECT CalculateLoyaltyPoints(?) as loyalty_points',
      [customerId]
    );

    res.json({ loyalty_points: results[0].loyalty_points });
  } catch (error) {
    console.error('Get loyalty points error:', error);
    res.status(500).json({ error: 'Failed to get loyalty points' });
  }
});

module.exports = router;