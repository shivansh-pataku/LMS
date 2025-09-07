import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db'; // Your database utility
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

// Types (mirroring frontend or a shared types file)
type LessonStatus = "public" | "private" | "preview";
type ResourceType =
  | "pdf"
  | "video_file"
  | "youtube_link"
  | "text_content"
  | null;

interface Lesson {
  id: string;
  name: string;
  description: string | null;
  resourceType: ResourceType;
  resourceUrl: string | null;
  content: string | null;
  order: number;
  status: LessonStatus;
}

interface LessonFromDB extends RowDataPacket {
    id: string;
    section_id: string;
    course_id: number;
    name: string;
    description: string | null;
    resource_type: ResourceType;
    resource_url: string | null;
    content: string | null;
    order_val: number;
    status: LessonStatus;
    created_at: Date;
    updated_at: Date;
}

interface UpdateLessonPayload {
  name?: string;
  description?: string | null;
  resourceType?: ResourceType;
  resourceUrl?: string | null;
  content?: string | null;
  status?: LessonStatus;
  // 'order' is typically handled by a separate reordering API or backend logic
}

// Define a more specific type for the values in fieldsToUpdate
type LessonUpdateValue = string | null | ResourceType | LessonStatus;


// GET: Fetch a single lesson
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string, sectionId: string, lessonId: string } }
) {
  const { courseId, sectionId, lessonId } = params;

  if (!courseId || !sectionId || !lessonId) {
    return NextResponse.json({ message: 'Course ID, Section ID, and Lesson ID are required' }, { status: 400 });
  }
  const numericCourseId = parseInt(courseId, 10);
  if (isNaN(numericCourseId)) {
      return NextResponse.json({ message: 'Invalid Course ID format' }, { status: 400 });
  }

  try {
    const query = `
      SELECT id, name, description, resource_type, resource_url, content, order_val, status 
      FROM course_lessons 
      WHERE course_id = ? AND section_id = ? AND id = ?
    `;
    const [rows] = await db.query<LessonFromDB[]>(query, [numericCourseId, sectionId, lessonId]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }
    const lessonFromDB = rows[0];
    const lesson: Lesson = {
        id: lessonFromDB.id,
        name: lessonFromDB.name,
        description: lessonFromDB.description,
        resourceType: lessonFromDB.resource_type,
        resourceUrl: lessonFromDB.resource_url,
        content: lessonFromDB.content,
        order: lessonFromDB.order_val,
        status: lessonFromDB.status,
    };

    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch lesson:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to fetch lesson', error: errorMessage }, { status: 500 });
  }
}


// PUT: Update an existing lesson (including status toggle)
export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string, sectionId: string, lessonId: string } }
) {
  const { courseId, sectionId, lessonId } = params;

  if (!courseId || !sectionId || !lessonId) {
    return NextResponse.json({ message: 'Course ID, Section ID, and Lesson ID are required' }, { status: 400 });
  }
  const numericCourseId = parseInt(courseId, 10);
   if (isNaN(numericCourseId)) {
      return NextResponse.json({ message: 'Invalid Course ID format' }, { status: 400 });
  }

  try {
    const body = await request.json() as UpdateLessonPayload;

    const fieldsToUpdate: { [key: string]: LessonUpdateValue } = {}; // Corrected type here
    const allowedFields: (keyof UpdateLessonPayload)[] = ['name', 'description', 'resourceType', 'resourceUrl', 'content', 'status'];

    let hasUpdate = false;
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Map frontend field names to DB column names if different
        const dbField = field === 'resourceType' ? 'resource_type' : field === 'resourceUrl' ? 'resource_url' : field;
        fieldsToUpdate[dbField] = body[field] as LessonUpdateValue; // Added assertion for clarity
        hasUpdate = true;
      }
    }

    if (!hasUpdate) {
      return NextResponse.json({ message: 'No fields to update provided' }, { status: 400 });
    }
    if (fieldsToUpdate.name !== undefined && (fieldsToUpdate.name === null || String(fieldsToUpdate.name).trim() === '')) {
        return NextResponse.json({ message: 'Lesson name cannot be empty' }, { status: 400 });
    }


    const setClauses = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fieldsToUpdate), numericCourseId, sectionId, lessonId];

    const updateQuery = `
      UPDATE course_lessons 
      SET ${setClauses}, updated_at = CURRENT_TIMESTAMP 
      WHERE course_id = ? AND section_id = ? AND id = ?
    `;

    const [updateResult] = await db.query<ResultSetHeader>(updateQuery, values);

    if (updateResult.affectedRows === 0) {
      return NextResponse.json({ message: 'Lesson not found or no changes made' }, { status: 404 });
    }

    // Fetch the updated lesson to return it
    const [rows] = await db.query<LessonFromDB[]>(
      'SELECT id, name, description, resource_type, resource_url, content, order_val, status FROM course_lessons WHERE id = ? AND section_id = ? AND course_id = ?',
      [lessonId, sectionId, numericCourseId]
    );
    
    if (rows.length === 0) {
        // Should not happen if update was successful, but as a safeguard
        return NextResponse.json({ message: 'Failed to retrieve updated lesson' }, { status: 500 });
    }

    const updatedLessonFromDB = rows[0];
    const updatedLesson: Lesson = {
        id: updatedLessonFromDB.id,
        name: updatedLessonFromDB.name,
        description: updatedLessonFromDB.description,
        resourceType: updatedLessonFromDB.resource_type,
        resourceUrl: updatedLessonFromDB.resource_url,
        content: updatedLessonFromDB.content,
        order: updatedLessonFromDB.order_val,
        status: updatedLessonFromDB.status,
    };

    return NextResponse.json(updatedLesson, { status: 200 });

  } catch (error) {
    console.error('Failed to update lesson:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to update lesson', error: errorMessage }, { status: 500 });
  }
}

// DELETE: Delete a lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string, sectionId: string, lessonId: string } }
) {
  const { courseId, sectionId, lessonId } = params;

  if (!courseId || !sectionId || !lessonId) {
    return NextResponse.json({ message: 'Course ID, Section ID, and Lesson ID are required' }, { status: 400 });
  }
  const numericCourseId = parseInt(courseId, 10);
  if (isNaN(numericCourseId)) {
      return NextResponse.json({ message: 'Invalid Course ID format' }, { status: 400 });
  }

  try {
    // Check if lesson exists before attempting delete
    const [lessonCheck] = await db.query<LessonFromDB[]>(
      'SELECT id FROM course_lessons WHERE id = ? AND section_id = ? AND course_id = ?',
      [lessonId, sectionId, numericCourseId]
    );
    if (lessonCheck.length === 0) {
        return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }

    const deleteQuery = 'DELETE FROM course_lessons WHERE id = ? AND section_id = ? AND course_id = ?';
    const [deleteResult] = await db.query<ResultSetHeader>(deleteQuery, [lessonId, sectionId, numericCourseId]);

    if (deleteResult.affectedRows === 0) {
      // This case might be redundant if we check existence first
      return NextResponse.json({ message: 'Lesson not found or already deleted' }, { status: 404 });
    }
    
    // After deleting a lesson, you might need to re-order the remaining lessons in that section.
    // This is a common practice but adds complexity. For now, we'll just delete.
    // Example re-ordering logic (simplified):
    // const [remainingLessons] = await db.query<LessonFromDB[]>('SELECT id FROM course_lessons WHERE section_id = ? AND course_id = ? ORDER BY order_val ASC', [sectionId, numericCourseId]);
    // for (let i = 0; i < remainingLessons.length; i++) {
    //   await db.query('UPDATE course_lessons SET order_val = ? WHERE id = ?', [i, remainingLessons[i].id]);
    // }


    return NextResponse.json({ message: 'Lesson deleted successfully' }, { status: 200 }); // Or 204 No Content

  } catch (error) {
    console.error('Failed to delete lesson:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to delete lesson', error: errorMessage }, { status: 500 });
  }
}