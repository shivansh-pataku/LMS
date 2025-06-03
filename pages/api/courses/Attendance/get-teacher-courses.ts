import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/utils/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { RowDataPacket } from 'mysql2';

interface CourseRow extends RowDataPacket {
  code: string;
  name: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Update the query to alias the column names
    const [rows] = await db.query<CourseRow[]>(
      `SELECT DISTINCT
      course_code AS code,
      course_name AS name
      FROM Courses 
      ORDER BY course_code;
      `
    );

    console.log('Fetched courses:', rows); // Debug log

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
