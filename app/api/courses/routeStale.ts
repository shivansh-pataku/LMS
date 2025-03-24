import { NextResponse } from 'next/server';
import mysql, { ResultSetHeader } from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lsm',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function GET(req: Request) {
    try {
        // Fetch active and inactive courses
        const [availableCourses] = await pool.query(
            "SELECT * FROM courses WHERE status = 'active' OR status = 'inactive';"
        );

        // Fetch suggested courses
        const [suggestedCourses] = await pool.query(
            "SELECT * FROM courses WHERE status = 'suggested';"
        );

        // Return both datasets
        return NextResponse.json({
            availableCourses: Array.isArray(availableCourses) ? availableCourses : [],
            suggestedCourses: Array.isArray(suggestedCourses) ? suggestedCourses : []
        });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// export async function GET(req: Request) {
//     try {

//         // Ensure we return an array even if no results
//         return NextResponse.json(Array.isArray(rows) ? rows : []);
//     } catch (error) {
//         console.error('Database error:', error);
//         return NextResponse.json(
//             { error: 'Failed to fetch courses' },
//             { status: 500 }
//         );
//     }
// }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function POST(req: Request) {
    try {
        const { course_name, assigned_teacher, duration, status, timing, description } = await req.json();
        
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO courses (course_name, assigned_teacher, duration, status, timing, description) VALUES (?, ?, ?, ?, ?, ?)',
            [course_name, assigned_teacher, duration, status, timing, description]
        );
        
        return NextResponse.json({ 
            message: 'Course added successfully',
            course_id: result.insertId
        });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to add course' },
            { status: 500 }
        );
    }
}