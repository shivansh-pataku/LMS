import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

// Frontend Lesson and Resource types (mirroring what's in page.tsx or a shared types file)
type LessonStatusFE = "public" | "private" | "preview";
type ResourceTypeFE =
  | "pdf"
  | "video_file"
  | "youtube_link"
  | "text_content"
  | null;

interface LessonFE {
  id: string;
  name: string;
  description: string | null;
  resourceType: ResourceTypeFE;
  resourceUrl: string | null;
  content: string | null;
  order: number;
  status: LessonStatusFE;
}

// Payload expected from the client for creating a new lesson
interface CreateLessonPayload {
  name: string;
  description?: string | null;
  resourceType?: ResourceTypeFE;
  resourceUrl?: string | null;
  content?: string | null;
  // `id`, `order`, and `status` will be handled by the API
}

// POST: Create a new lesson in a section
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string, sectionId: string } }
) {
  const { courseId, sectionId } = params;

  if (!courseId || !sectionId) {
    return NextResponse.json({ message: 'Course ID and Section ID are required' }, { status: 400 });
  }

  const numericCourseId = parseInt(courseId, 10);
  if (isNaN(numericCourseId)) {
    return NextResponse.json({ message: 'Invalid Course ID format' }, { status: 400 });
  }

  try {
    const body = await request.json() as CreateLessonPayload;
    const {
      name,
      description = null,
      resourceType = null,
      resourceUrl = null,
      content = null,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Lesson name is required' }, { status: 400 });
    }

    // Generate a new UUID for the lesson
    const newLessonId = uuidv4();
    const defaultStatus: LessonStatusFE = 'private';

    // Determine the order for the new lesson
    // This typically means finding the current max order in this section and adding 1
    const [countResult] = await db.query<RowDataPacket[]>(
      'SELECT COUNT(*) as lessonCount FROM course_lessons WHERE section_id = ? AND course_id = ?',
      [sectionId, numericCourseId]
    );
    const lessonOrder = (countResult[0]?.lessonCount as number | undefined || 0);


    const insertQuery = `
      INSERT INTO course_lessons 
        (id, section_id, course_id, name, description, resource_type, resource_url, content, order_val, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      newLessonId,
      sectionId,
      numericCourseId,
      name.trim(),
      description,
      resourceType,
      resourceUrl,
      content,
      lessonOrder,
      defaultStatus,
    ];

    const [insertResult] = await db.query<ResultSetHeader>(insertQuery, values);

    if (insertResult.affectedRows === 0) {
      return NextResponse.json({ message: 'Failed to create lesson' }, { status: 500 });
    }

    // Construct the lesson object to return, matching frontend expectations
    const newLesson: LessonFE = {
      id: newLessonId,
      name: name.trim(),
      description,
      resourceType,
      resourceUrl,
      content,
      order: lessonOrder,
      status: defaultStatus,
    };

    return NextResponse.json(newLesson, { status: 201 });

  } catch (error) {
    console.error('Failed to create lesson:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    // Check for specific MySQL errors if needed, e.g., foreign key constraint
    // if (isMySQLError(error) && error.code === 'ER_NO_REFERENCED_ROW_2') {
    //   return NextResponse.json({ message: 'Invalid section or course ID provided.' }, { status: 400 });
    // }
    return NextResponse.json({ message: 'Failed to create lesson', error: errorMessage }, { status: 500 });
  }
}