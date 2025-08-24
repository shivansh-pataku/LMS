import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/utils/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions); // Get the session from NextAuth
    //NextAuth is a library for authentication in Next.js applications. It provides a way to manage user sessions and authentication flows. Solutions NextAuth provides include OAuth, email/password authentication, and JWT-based authentication. It also supports various databases for session storage and user management.
    // The getServerSession function is used to retrieve the session object on the server side. It takes the request and response objects as arguments and returns the session data if available.
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { course_code, date, attendanceData } = req.body; // basic functionaitonality of this API is to record attendance for a course on a specific date
    // Ensure all required fields are present where course_code is the unique identifier for the course, date is the date of attendance, and attendanceData is an object mapping roll numbers to their attendance status (e.g., 'P' for present, 'A' for absent).
    // Here req.body is a Json Object provided by the frontend which contains the course_code, date, and attendanceData.
    // Example: { course_code: 'CS101', date: '2023-10-01', attendanceData: { '123': 'P', '124': 'A' } }
    //The req.body property contains key-value pairs of data submitted in the request body. By default, it is undefined and is populated when you use a middleware called body-parsing such as express.urlencoded() or express.json(). 


    // Validate required fields
    if (!course_code || !date || !attendanceData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Get course details
      const courseRows = await db.query(
        'SELECT course_name, teacher_name FROM courses WHERE course_code = ?',
        [course_code]
      );

      const course = courseRows[0];

      // Insert attendance records
      for (const [roll_no, status] of Object.entries(attendanceData)) { // it is a loop that iterates over the entries of the attendanceData object. Each entry consists of a roll number and its corresponding attendance status (e.g., 'P' for present, 'A' for absent).
        await db.query(
          `INSERT INTO attendance (
            roll_no, 
            course_code, 
            attendance_date, 
            status
          ) VALUES (?, ?, ?, ?) where teacher_name = "Pradeep Chouksey"`,
          [
            roll_no,
            course_code,
            date,
            status
          ]
        );
      }

    //           await db.query(
    //       `INSERT INTO attendance (
    //         roll_no, 
    //         course_code, 
    //         course_name,
    //         teacher_name,
    //         attendance_date, 
    //         status
    //       ) VALUES (?, ?, ?, ?, ?, ?)`,
    //       [
    //         roll_no,
    //         course_code,
    //         course.course_name,
    //         session.user.name,
    //         date,
    //         status
    //       ]
    //     );
    //   }

      // Commit transaction
      await db.query('COMMIT');
      res.status(200).json({ message: 'Attendance recorded successfully' });
    } catch (error) {
      // Rollback on error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
}