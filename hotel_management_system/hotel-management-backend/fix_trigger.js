const pool = require('./database/connection');

async function fixTrigger() {
  try {
    console.log('Dropping old trigger...');
    await pool.query('DROP TRIGGER IF EXISTS update_room_status_on_booking');
    console.log('✅ Dropped');
    
    console.log('\nCreating new trigger with correct room status...');
    const createSQL = `
    CREATE TRIGGER update_room_status_on_booking
    AFTER INSERT ON bookings
    FOR EACH ROW
    BEGIN
        -- Update room status to 'Occupied' when a new booking is created
        IF NEW.status = 'Confirmed' THEN
            UPDATE rooms 
            SET status = 'Occupied' 
            WHERE room_id = NEW.room_id;
        END IF;
        
        -- If booking is immediately checked in
        IF NEW.status = 'Checked-in' THEN
            UPDATE rooms 
            SET status = 'Occupied' 
            WHERE room_id = NEW.room_id;
        END IF;
    END
    `;
    
    await pool.query(createSQL);
    console.log('✅ Trigger created successfully!');
    
    // Test it
    console.log('\nTesting booking creation with Confirmed status...');
    const sql = 'INSERT INTO bookings (customer_id, room_id, check_in, check_out, number_of_guests, special_requests, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [1, 8, '2025-11-05', '2025-11-06', 2, '', 'Confirmed'];
    
    await pool.execute(sql, params);
    console.log('✅ Booking created successfully!');
    
    // Clean up test booking
    await pool.execute('DELETE FROM bookings WHERE customer_id = 1 AND room_id = 8 AND check_in = ?', ['2025-11-05']);
    console.log('✅ Test booking cleaned up');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

fixTrigger();
