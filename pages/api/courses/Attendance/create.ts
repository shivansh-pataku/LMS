import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/utils/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions); // Get the session from NextAuth which is a library for authentication in Next.js applications getting session data generated in the auth/[...nextauth] file
    // The session contains user information like name, email, etc. which is used to identify the teacher recording attendance.


    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { course_code, course_name, date, attendanceData } = req.body;
    if (!course_code || !course_name || !date || !attendanceData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert attendance records
    for (const [roll_no, status] of Object.entries(attendanceData)) {
      await db.query(
        `INSERT INTO attendance (roll_no, course_code, course_name, teacher_name, attendance_date, status) VALUES (?, ?, ?, ?, ?, ?)`,
       
       
        [roll_no, course_code, course_name, session.user.name, date, status]
      );
    }

    return res.status(200).json({ message: 'Attendance recorded successfully' });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to record attendance' });
  }
}