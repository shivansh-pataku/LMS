import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/utils/db';
import { getSession } from 'next-auth/react';

// ✅ Define Course type
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

    const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const [rows] = await db.query(`SELECT * FROM courses where department = "mca"`,);
        const courses: Course[] = rows as Course[];  
        const pendingCourses = courses.filter(course => course.status === 'pending');
        const approvedCourses = courses.filter(course => course.status === 'approved');

        return res.status(200).json({ pendingCourses, approvedCourses });

    } catch (error) {
        console.error('Error fetching courses:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
