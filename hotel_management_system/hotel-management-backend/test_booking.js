const pool = require('./database/connection');

async function testBooking() {
  try {
    console.log('Checking status column definition...');
    const [cols] = await pool.query("SHOW COLUMNS FROM bookings LIKE 'status'");
    console.log('Status column:', JSON.stringify(cols[0], null, 2));
    
    console.log('\nTesting each ENUM value...');
    const testValues = ['Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'];
    
    for (const status of testValues) {
      try {
        console.log(`Testing "${status}"...`);
        const sql = 'INSERT INTO bookings (customer_id, room_id, check_in, check_out, number_of_guests, special_requests, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const params = [1, 8, '2025-11-05', '2025-11-06', 2, '', status];
        
        await pool.execute(sql, params);
        console.log(`✅ "${status}" works!`);
        
        // Delete the test booking
        await pool.execute('DELETE FROM bookings WHERE customer_id = 1 AND room_id = 8 AND check_in = ?', ['2025-11-05']);
        
      } catch (error) {
        console.error(`❌ "${status}" failed:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

testBooking();
