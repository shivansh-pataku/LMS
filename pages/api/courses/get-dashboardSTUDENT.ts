import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/utils/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const selectedDate = req.query.month 
            ? new Date(req.query.month + '-01')  // Add -01 to make it a valid date
            : new Date();


        const [monthsRows] = await db.query(`SELECT DISTINCT DATE_FORMAT(attendance_date, '%Y-%m') as month FROM attendance ORDER BY month DESC`);

        const [courses] = await db.query(`SELECT * FROM COURSES WHERE semester = ?`, [session.user.semester]);
        const [attendance] = await db.query(`SELECT * FROM ATTENDANCE WHERE MONTH(attendance_date) = MONTH(?) AND YEAR(attendance_date) = YEAR(?)`, [selectedDate, selectedDate]);
        const [scores] = await db.query(`SELECT * FROM COURSE_SCORES WHERE roll_no = 'CUHP23MCA30'`);
        return res.status(200).json({ 
            AllCourses: courses,
            AllAttendance: attendance,
            AllScores: scores,
            DoneMonths: (monthsRows as Array<{ month: string }>).map((row) => row.month) // Extracting month strings from the result
   
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
