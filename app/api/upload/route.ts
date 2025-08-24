import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToS3 } from '@/utils/s3-upload'; // Adjust path if needed

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const courseId = formData.get('courseId') as string | null; // Example: get courseId
  const lessonId = formData.get('lessonId') as string | null; // Example: get lessonId

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  try {
    // Example: Define a dynamic folder path
    let s3FolderPath = 'general-uploads';
    if (courseId && lessonId) {
      s3FolderPath = `courses/${courseId}/lessons/${lessonId}/resources`;
    } else if (courseId) {
      s3FolderPath = `courses/${courseId}/general`;
    }
    
    const resourceUrl = await uploadFileToS3(file, s3FolderPath);
    return NextResponse.json({ success: true, resourceUrl });
  } catch (error) {
    console.error('Upload API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}