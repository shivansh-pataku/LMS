import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';
import { CreateLiveClassPayload, LiveClass as LiveClassType } from '@/types/live-class';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// Extended interface for SELECT result rows
interface LiveClassFromDB extends LiveClassType, RowDataPacket {}

// Specific MySQL error typing
interface MySQLError extends Error {
  code?: string;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
}

const SELECT_FIELDS = `
  id, course_id AS courseId, topic, description, 
  room_name AS roomName, scheduled_at AS scheduledAt, created_at AS createdAt
`;

// Type guard for MySQL errors
function isMySQLError(error: unknown): error is MySQLError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('code' in error || 'errno' in error)
  );
}

// GET: Fetch all live classes for a given course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = params;

  if (!courseId) {
    return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
  }

  const numericCourseId = parseInt(courseId, 10);
  if (isNaN(numericCourseId)) {
    return NextResponse.json({ message: 'Invalid Course ID format' }, { status: 400 });
  }

  try {
    const query = `SELECT ${SELECT_FIELDS} FROM live_classes WHERE course_id = ? ORDER BY created_at DESC`;
    const [liveClasses] = await db.query<LiveClassFromDB[]>(query, [numericCourseId]);

    return NextResponse.json(liveClasses);
  } catch (error) {
    console.error('Error fetching live classes:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ message: 'Error fetching live classes', error: message }, { status: 500 });
  }
}

// POST: Create a new live class
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = params;

  if (!courseId) {
    return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
  }

  const numericCourseId = parseInt(courseId, 10);
  if (isNaN(numericCourseId)) {
    return NextResponse.json({ message: 'Invalid Course ID format' }, { status: 400 });
  }

  try {
    const body = await request.json() as CreateLiveClassPayload;
    const { topic, description, scheduledAt } = body;

    if (!topic?.trim()) {
      return NextResponse.json({ message: 'Topic is required' }, { status: 400 });
    }

    const roomName = `${topic.replace(/\s+/g, '-')}-${uuidv4().slice(0, 8)}`;
    const newLiveClassId = uuidv4();

    const insertQuery = `
      INSERT INTO live_classes (id, course_id, topic, description, room_name, scheduled_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      newLiveClassId,
      numericCourseId,
      topic,
      description || null,
      roomName,
      scheduledAt ? new Date(scheduledAt) : null,
    ];

    const [insertResult] = await db.query<ResultSetHeader>(insertQuery, values);

    if (insertResult.affectedRows === 0) {
      return NextResponse.json({ message: 'Failed to create live class' }, { status: 500 });
    }

    const [newClassResult] = await db.query<LiveClassFromDB[]>(
      `SELECT ${SELECT_FIELDS} FROM live_classes WHERE id = ?`,
      [newLiveClassId]
    );

    const newLiveClass = newClassResult[0];
    if (!newLiveClass) {
      return NextResponse.json({ message: 'Live class created but not retrievable' }, { status: 500 });
    }

    return NextResponse.json(newLiveClass, { status: 201 });

  } catch (error) {
    console.error('Error creating live class:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }

    if (isMySQLError(error) && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
      return NextResponse.json(
        { message: 'A similar live class already exists. Please choose a different topic.' },
        { status: 409 }
      );
    }

    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ message: 'Error creating live class', error: message }, { status: 500 });
  }
}
