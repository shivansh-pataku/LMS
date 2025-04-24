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

        const [courses] = await db.query(`SELECT * FROM courses WHERE semester = ?`, [session.user.semester]);
        const [attendance] = await db.query(`SELECT * FROM ATTENDANCE WHERE roll_no = 'CUHP23MCA30'`);
        const [scores] = await db.query(`SELECT * FROM COURSE_SCORES`);
        return res.status(200).json({ 
            AllCourses: courses,
            AllAttendance: attendance,
            AllScores: scores
   
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
