const mysql = require('mysql2/promise');

async function updateServicesTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '122333',
    database: 'hotel_management_system'
  });

  try {
    console.log('🔄 Updating services table...');

    // Add category column if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE services 
        ADD COLUMN category VARCHAR(50) DEFAULT 'Other'
      `);
      console.log('✅ Added category column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Category column already exists');
      } else {
        throw error;
      }
    }

    // Update existing services with appropriate categories
    await connection.execute(`
      UPDATE services SET category = 'Food' 
      WHERE service_name LIKE '%Room Service%' OR service_name LIKE '%Restaurant%' OR service_name LIKE '%Buffet%' OR service_name LIKE '%Dinner%' OR service_name LIKE '%Lunch%'
    `);
    await connection.execute(`
      UPDATE services SET category = 'Laundry' 
      WHERE service_name LIKE '%Laundry%'
    `);
    await connection.execute(`
      UPDATE services SET category = 'Spa' 
      WHERE service_name LIKE '%Spa%' OR service_name LIKE '%Fitness%'
    `);
    await connection.execute(`
      UPDATE services SET category = 'Transport' 
      WHERE service_name LIKE '%Airport%' OR service_name LIKE '%Transfer%' OR service_name LIKE '%Tour%'
    `);
    await connection.execute(`
      UPDATE services SET category = 'Other' 
      WHERE service_name LIKE '%Business%' OR service_name LIKE '%Center%'
    `);
    console.log('✅ Updated categories for existing services');

    // Update the ENUM values in status column
    await connection.execute(`
      ALTER TABLE services 
      MODIFY COLUMN status ENUM('Available', 'Unavailable', 'Active', 'Inactive') DEFAULT 'Available'
    `);
    console.log('✅ Expanded status ENUM values');

    // Update existing status values
    await connection.execute(`
      UPDATE services SET status = 'Available' WHERE status = 'Active'
    `);
    console.log('✅ Updated Active to Available');

    await connection.execute(`
      UPDATE services SET status = 'Unavailable' WHERE status = 'Inactive'
    `);
    console.log('✅ Updated Inactive to Unavailable');

    // Now alter to only have the new values
    await connection.execute(`
      ALTER TABLE services 
      MODIFY COLUMN status ENUM('Available', 'Unavailable') DEFAULT 'Available'
    `);
    console.log('✅ Finalized status ENUM to Available/Unavailable');

    console.log('✅ Services table updated successfully!');
  } catch (error) {
    console.error('❌ Error updating services table:', error);
  } finally {
    await connection.end();
  }
}

updateServicesTable();
