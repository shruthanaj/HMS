const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Change if needed
  password: '122333', // Add your MySQL password
  database: 'hotel_management_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create promise wrapper
const promisePool = pool.promise();

module.exports = promisePool;
