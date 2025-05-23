import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../auth/[...nextauth]";
import db from '@/utils/db';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // try {
    //     const session = await getServerSession(req, res, authOptions);
        
    //     if (!session) {
    //         return res.status(401).json({ error: 'Unauthorized' });
    //     }

        const [rows] = await db.query('SELECT course_code, course_name, credit, department, course_category, description, teacher_name FROM courses');
        
        return res.status(200).json({ 
            AllCourses: rows 
        });

    // } catch (error) {
    //     console.error('API Error:', error);
    //     return res.status(500).json({ error: 'Internal Server Error' });
    // }
}