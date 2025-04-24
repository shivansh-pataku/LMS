import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.localhost,  // Add these in .env file
    user: process.env.root,
    // password: process.env.DB_PASSWORD,
    database: process.env.univ,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
