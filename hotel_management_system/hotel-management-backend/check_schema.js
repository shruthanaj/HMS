const pool = require('./database/connection');

async function checkSchema() {
  try {
    console.log('Checking bookings table...');
    const [bookings] = await pool.execute('DESCRIBE bookings');
    console.log('\nBookings table structure:');
    bookings.forEach(col => {
      console.log(`${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key} ${col.Default ? 'DEFAULT ' + col.Default : ''}`);
    });

    console.log('\n\nChecking rooms table...');
    const [rooms] = await pool.execute('DESCRIBE rooms');
    console.log('\nRooms table structure:');
    rooms.forEach(col => {
      console.log(`${col.Field}: ${col.Type}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkSchema();
