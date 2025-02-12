require('dotenv').config();
const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test the connection
pool.connect((err) => {
    if (err) {
        console.error('Database connection failed!', err);
    } else {
        console.log('Database connected successfully!');
    }
});

module.exports = pool;
