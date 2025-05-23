import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/utils/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";


interface Course {
    id: number;
    name: string;
    description: string;
    teacher_email: string;
    status: 'pending' | 'approved';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') { 
        return res.status(405).json({ error: 'Method not allowed' });
    }

        const selectedDate = req.query.month 
            ? new Date(req.query.month + '-01')  // Add -01 to make it a valid date
            : new Date();

    try {
        const session = await getServerSession(req, res, authOptions);
        
        if (!session) { return res.status(401).json({ error: 'Unauthorized' });}


        const [rows] = await db.query(`SELECT * FROM courses where department = "mca"`,);
        const courses: Course[] = rows as Course[];  
        const pendingCourses = courses.filter(course => course.status === 'pending');
        const approvedCourses = courses.filter(course => course.status === 'approved');



        const [monthsRows] = await db.query(`SELECT DISTINCT DATE_FORMAT(attendance_date, '%Y-%m') as month FROM attendance ORDER BY month DESC`);
        const [attendance] = await db.query(`SELECT * FROM ATTENDANCE WHERE MONTH(attendance_date) = MONTH(?) AND YEAR(attendance_date) = YEAR(?) `, [selectedDate, selectedDate]);
        const [scores] = await db.query(`SELECT * FROM COURSE_SCORES`);
        const [teacherCourses ] = await db.query(`SELECT * FROM courses where department = "mca"`);

        return res.status(200).json({ 
            AllCourses: teacherCourses, 
            pendingCourses, 
            approvedCourses,
            AllAttendance: attendance,
            DoneMonths: (monthsRows as Array<{ month: string }>).map((row) => row.month), // Extracting month strings from the result
            AllScores: scores

   
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

