import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

// Frontend Section type (mirroring what's in page.tsx or a shared types file)
type SectionStatusFE = "public" | "private";
interface LessonFE { // Assuming LessonFE is defined elsewhere or simplified here if not directly used
  id: string;
  name: string;
  order: number;
  status: "public" | "private" | "preview";
  // ... other lesson properties
}

interface SectionFE {
  id: string;
  name: string;
  description: string;
  lessons: LessonFE[]; // Or handle lessons separately
  status: SectionStatusFE;
  order: number;
}

// Payload expected from the client for updating a section
interface UpdateSectionPayload {
  name?: string;
  description?: string;
  status?: SectionStatusFE;
  // order_val could be handled by a separate reordering API if complex
}

// Interface for Section from DB
interface SectionFromDB extends RowDataPacket {
  id: string;
  course_id: number;
  name: string;
  description: string | null;
  order_val: number;
  status: 'public' | 'private';
}


// PUT: Update an existing section
export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string; sectionId: string } }
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
    const body = await request.json() as UpdateSectionPayload;
    const { name, description, status } = body;

    if (!name && description === undefined && !status) {
      return NextResponse.json({ message: 'No update fields provided' }, { status: 400 });
    }
    if (name !== undefined && !name.trim()) {
        return NextResponse.json({ message: 'Section name cannot be empty' }, { status: 400 });
    }
    if (status && !['public', 'private'].includes(status)) {
        return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
    }

    // Check if the section exists
    const [existingSections] = await db.query<SectionFromDB[]>(
      'SELECT id, name, description, status, order_val FROM course_sections WHERE id = ? AND course_id = ?',
      [sectionId, numericCourseId]
    );

    if (existingSections.length === 0) {
      return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }
    const currentSection = existingSections[0];

    // Build the update query dynamically
    const updateFields: string[] = [];
    const values: (string | number | null)[] = [];

    if (name !== undefined && name.trim() !== currentSection.name) {
      updateFields.push('name = ?');
      values.push(name.trim());
    }
    if (description !== undefined && description !== currentSection.description) {
      updateFields.push('description = ?');
      values.push(description);
    }
    if (status !== undefined && status !== currentSection.status) {
      updateFields.push('status = ?');
      values.push(status);
    }

    if (updateFields.length === 0) {
      // No actual changes to be made, return current data or a specific message
      const responseSection: Omit<SectionFE, 'lessons'> = {
        id: currentSection.id,
        name: currentSection.name,
        description: currentSection.description || '',
        status: currentSection.status,
        order: currentSection.order_val
      };
      return NextResponse.json(responseSection, { status: 200 });
    }

    const updateQuery = `
      UPDATE course_sections 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND course_id = ?
    `;
    values.push(sectionId, numericCourseId);

    const [updateResult] = await db.query<ResultSetHeader>(updateQuery, values);

    if (updateResult.affectedRows === 0) {
      // This might happen if the record was deleted between the SELECT and UPDATE, or if values didn't actually change (though we check above)
      return NextResponse.json({ message: 'Failed to update section or no changes made' }, { status: 404 });
    }

    // Fetch the updated section to return it
    const [updatedSections] = await db.query<SectionFromDB[]>(
      'SELECT id, name, description, status, order_val FROM course_sections WHERE id = ? AND course_id = ?',
      [sectionId, numericCourseId]
    );
    
    if (updatedSections.length === 0) {
        // Should not happen if update was successful
        return NextResponse.json({ message: 'Failed to retrieve updated section' }, { status: 500 });
    }

    const updatedSectionData = updatedSections[0];

    // Map to SectionFE, lessons would typically be fetched separately or if this API also handles lesson re-association
    const responseSection: Omit<SectionFE, 'lessons'> = {
        id: updatedSectionData.id,
        name: updatedSectionData.name,
        description: updatedSectionData.description || '',
        status: updatedSectionData.status,
        order: updatedSectionData.order_val
    };


    return NextResponse.json(responseSection, { status: 200 });

  } catch (error) {
    console.error('Failed to update section:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Failed to update section', error: errorMessage }, { status: 500 });
  }
}

// GET: Fetch a single section by ID (placeholder)
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; sectionId: string } }
) {
  const { courseId, sectionId } = params;
  // TODO: Implementation to fetch and return a single section
  // For now, returning the existing placeholder
  const numericCourseId = parseInt(courseId, 10);
  if (isNaN(numericCourseId)) {
    return NextResponse.json({ message: 'Invalid Course ID format' }, { status: 400 });
  }
  try {
    const [rows] = await db.query<SectionFromDB[]>(
        'SELECT id, name, description, status, order_val FROM course_sections WHERE id = ? AND course_id = ?',
        [sectionId, numericCourseId]
    );
    if (rows.length === 0) {
        return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }
    const sectionData = rows[0];
    // Map to SectionFE, lessons would typically be fetched separately
    const responseSection: Omit<SectionFE, 'lessons'> = {
        id: sectionData.id,
        name: sectionData.name,
        description: sectionData.description || '',
        status: sectionData.status,
        order: sectionData.order_val
    };
    return NextResponse.json(responseSection, { status: 200 });

  } catch (error) {
    console.error(`Failed to fetch section ${sectionId} for course ${courseId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Failed to fetch section`, error: errorMessage }, { status: 500 });
  }
}

// DELETE: Delete a section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; sectionId: string } }
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
    // First, check if the section exists
    const [existingSections] = await db.query<SectionFromDB[]>(
      'SELECT id FROM course_sections WHERE id = ? AND course_id = ?',
      [sectionId, numericCourseId]
    );

    if (existingSections.length === 0) {
      return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }

    // Delete the section. If ON DELETE CASCADE is set for lessons, they will be deleted too.
    const [deleteResult] = await db.query<ResultSetHeader>(
      'DELETE FROM course_sections WHERE id = ? AND course_id = ?',
      [sectionId, numericCourseId]
    );

    if (deleteResult.affectedRows === 0) {
      // Should not happen if we found it above, but as a safeguard
      return NextResponse.json({ message: 'Failed to delete section or section not found' }, { status: 404 });
    }

    // After deleting a section, you might need to re-order the remaining sections in that course.
    // This is a common practice but adds complexity. For now, we'll just delete.
    // Example re-ordering logic (simplified):
    // const [remainingSections] = await db.query<SectionFromDB[]>('SELECT id FROM course_sections WHERE course_id = ? ORDER BY order_val ASC', [numericCourseId]);
    // for (let i = 0; i < remainingSections.length; i++) {
    //   await db.query('UPDATE course_sections SET order_val = ? WHERE id = ?', [i, remainingSections[i].id]);
    // }

    return NextResponse.json({ message: 'Section deleted successfully' }, { status: 200 }); // Or 204 No Content

  } catch (error) {
    console.error('Failed to delete section:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Failed to delete section', error: errorMessage }, { status: 500 });
  }
}