import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lsm',
    waitForConnections: true,
    connectionLimit: 10,
});

export async function POST(request: Request) {  // FIX: Added request parameter
    let connection;
    try {
        // Get a connection from the pool
        console.log("connection");
        connection = await pool.getConnection();

        // Execute the queries
        const [alloted] = await connection.query("SELECT * FROM courses WHERE status IN ('active', 'inactive')");
        const [suggested] = await connection.query("SELECT * FROM courses WHERE status IN ('suggested', 'rejected')");

        // Return the results
        return NextResponse.json({ alloted, suggested }, { status: 200 });  // FIX: Correct response format

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
    } finally {
        // Release the connection back to the pool
        if (connection) {
            connection.release();
        }
    }
}