import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/utils/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { course } = req.query;
    if (!course) {
      return res.status(400).json({ error: 'Course code is required' });
    }

    const [rows]: [any[], any] = await db.query(
      `SELECT DISTINCT roll_no 
       FROM attendance 
       WHERE course_code = ?
       ORDER BY roll_no`,
      [course]
    );

    return res.status(200).json(rows.map((row: any) => row.roll_no));
  } catch (error) {
    console.error('Failed to fetch roll numbers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}