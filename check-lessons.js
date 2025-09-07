// Check course_lessons table structure
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'univ',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function checkLessonsTable() {
    try {
        console.log('Checking course_lessons table structure...');
        
        const connection = await db.getConnection();
        
        // Check table structure
        const [columns] = await connection.query("DESCRIBE course_lessons");
        console.log('📋 course_lessons columns:', columns.map(c => c.Field));
        
        connection.release();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await db.end();
    }
}

checkLessonsTable();
