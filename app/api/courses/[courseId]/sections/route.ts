import { NextRequest, NextResponse } from 'next/server';
import  db  from '@/utils/db'; // Assuming your db utility
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'; // Ensure 'mysql2/promise' for async/await
import { randomUUID } from 'crypto'; // For generating UUIDs

// Define types similar to your frontend, but for DB interaction
interface SectionFromDB extends RowDataPacket {
  id: string;
  course_id: number;
  title: string;
  description: string | null;
  order_val: number; // 'order' is a reserved keyword in SQL
  status: 'public' | 'private';
}

interface LessonFromDB extends RowDataPacket {
  id: string;
  section_id: string;
  course_id: number;
  title: string;
  description: string | null;
  resource_type: string | null;
  resource_url: string | null;
  content: string | null;
  order_val: number;
  status: 'public' | 'private' | 'preview';
}

// Frontend Section and Lesson types (for mapping)
type SectionStatusFE = "public" | "private";
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

interface SectionFE {
  id: string;
  name: string;
  description: string;
  lessons: LessonFE[];
  status: SectionStatusFE;
  order: number;
}


// GET: Fetch all sections and their lessons for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = await params;
  const numericCourseId = parseInt(courseId, 10);

  if (isNaN(numericCourseId)) {
    return NextResponse.json({ message: 'Invalid Course ID' }, { status: 400 });
  }

  try {
    const [sectionsFromDb] = await db.query<SectionFromDB[]>(
      'SELECT id, title, description, order_val, status FROM course_sections WHERE course_id = ? ORDER BY order_val ASC',
      [numericCourseId]
    );

    const sectionsWithLessons: SectionFE[] = [];

    for (const section of sectionsFromDb) {
      const [lessonsFromDb] = await db.query<LessonFromDB[]>(
        'SELECT id, title, description, resource_type, resource_url, content, order_val, status FROM course_lessons WHERE section_id = ? AND course_id = ? ORDER BY order_val ASC',
        [section.id, numericCourseId]
      );

      const lessonsFE: LessonFE[] = lessonsFromDb.map(l => ({
        id: l.id,
        name: l.title,
        description: l.description,
        resourceType: l.resource_type as ResourceTypeFE,
        resourceUrl: l.resource_url,
        content: l.content,
        order: l.order_val,
        status: l.status as LessonStatusFE,
      }));
      
      sectionsWithLessons.push({
        id: section.id,
        name: section.title,
        description: section.description || '', // Ensure description is not null
        lessons: lessonsFE,
        status: section.status,
        order: section.order_val,
      });
    }

    return NextResponse.json(sectionsWithLessons, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch sections:', error);
    return NextResponse.json({ message: 'Failed to fetch sections', error: (error as Error).message }, { status: 500 });
  }
}

// POST: Create a new section
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = await params;
  const numericCourseId = parseInt(courseId, 10);

  if (isNaN(numericCourseId)) {
    return NextResponse.json({ message: 'Invalid Course ID' }, { status: 400 });
  }

  let newSectionId = ''; // Define here to be accessible in catch block if needed

  try {
    const body = await request.json();
    // Only expect name and description from the client for a new section
    const { name, description } = body as { name?: string; description?: string };

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Section name is required' }, { status: 400 });
    }

    // Generate new ID
    newSectionId = randomUUID();
    
    // Determine the order for the new section
    const [countResult] = await db.query<RowDataPacket[]>(
      'SELECT COUNT(*) as sectionCount FROM course_sections WHERE course_id = ?',
      [numericCourseId]
    );
    const newOrder = (countResult[0]?.sectionCount || 0); // Order is 0-indexed

    // Set default status
    const defaultStatus: SectionStatusFE = 'private';

    const insertQuery = `
      INSERT INTO course_sections (id, course_id, name, description, order_val, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const values = [newSectionId, numericCourseId, name.trim(), description || null, newOrder, defaultStatus];

    const [result] = await db.query<ResultSetHeader>(insertQuery, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Failed to create section' }, { status: 500 });
    }
    
    const newSection: SectionFE = {
        id: newSectionId,
        name: name.trim(),
        description: description || '',
        lessons: [], // New section has no lessons initially
        status: defaultStatus,
        order: newOrder,
    };

    return NextResponse.json(newSection, { status: 201 });

  } catch (error) {
    console.error('Failed to create section:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Check for duplicate entry for the generated UUID (highly unlikely but good practice)
    if (newSectionId && errorMessage.includes('Duplicate entry') && errorMessage.includes(newSectionId)) { 
        return NextResponse.json({ message: 'A section with the generated ID already exists. Please try again.', error: errorMessage }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create section', error: errorMessage }, { status: 500 });
  }
}