const pool = require('./database/connection');

async function fixProcedure() {
  try {
    console.log('Dropping GetAvailableRooms...');
    await pool.query('DROP PROCEDURE IF EXISTS GetAvailableRooms');
    
    console.log('Creating GetAvailableRooms with correct columns...');
    const createSQL = `
    CREATE PROCEDURE GetAvailableRooms(
        IN p_check_in DATE,
        IN p_check_out DATE,
        IN p_room_type VARCHAR(50)
    )
    BEGIN
        SELECT 
            r.room_id,
            r.room_number,
            r.room_type,
            r.price_per_night,
            r.floor_number,
            r.description,
            r.status
        FROM rooms r
        WHERE r.status = 'Available'
        AND (p_room_type IS NULL OR r.room_type = p_room_type)
        AND r.room_id NOT IN (
            SELECT room_id 
            FROM bookings 
            WHERE status IN ('Confirmed', 'Checked-in')
            AND (
                (check_in <= p_check_in AND check_out > p_check_in)
                OR (check_in < p_check_out AND check_out >= p_check_out)
                OR (check_in >= p_check_in AND check_out <= p_check_out)
            )
        )
        ORDER BY r.price_per_night;
    END
    `;
    
    await pool.query(createSQL);
    console.log('✅ GetAvailableRooms created successfully!');
    
    // Test it
    console.log('\nTesting procedure...');
    const [rows] = await pool.execute('CALL GetAvailableRooms(?, ?, ?)', ['2025-12-25', '2025-12-28', null]);
    console.log(`Found ${rows[0].length} available rooms`);
    if (rows[0].length > 0) {
      console.log('Sample room:', rows[0][0]);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

fixProcedure();
