import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !BUCKET_NAME) {
  console.error("AWS S3 environment variables are not fully configured.");
  // You might want to throw an error here or handle it more gracefully
  // For now, operations will likely fail if these are missing.
}

/**
 * Uploads a file to AWS S3.
 * @param file The file object to upload.
 * @param folderPath Optional path within the bucket to store the file (e.g., "courses/courseId/lessons").
 * @returns The public URL of the uploaded file.
 * @throws Error if upload fails or environment variables are missing.
 */
export async function uploadFileToS3(file: File, folderPath: string = "uploads"): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME is not defined in environment variables.");
  }
  if (!s3Client.config.region) {
    throw new Error("AWS_REGION is not defined in environment variables.");
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileExtension = path.extname(file.name);
  const uniqueFileName = `${randomUUID()}${fileExtension}`;
  
  // Ensure folderPath does not start with a slash and ends with one if not empty
  let s3KeyPrefix = folderPath.trim();
  if (s3KeyPrefix && s3KeyPrefix.startsWith('/')) {
    s3KeyPrefix = s3KeyPrefix.substring(1);
  }
  if (s3KeyPrefix && !s3KeyPrefix.endsWith('/')) {
    s3KeyPrefix += '/';
  }
  if (!s3KeyPrefix) { // If folderPath is empty or just whitespace
    s3KeyPrefix = ''; 
  }

  const s3Key = `${s3KeyPrefix}${uniqueFileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: file.type,
    // ACL: 'public-read', // Uncomment if your bucket policy doesn't grant public read by default
                           // and you want files to be publicly accessible directly.
                           // Note: It's generally better to manage access via bucket policies
                           // or use signed URLs for private content.
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Construct the public URL
    // The exact URL format can vary based on your S3 setup (e.g., virtual-hosted vs. path-style)
    // and whether you have a custom domain. This is a common format.
    const region = await s3Client.config.region();
    const url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Key}`;
    
    console.log(`File uploaded successfully to S3: ${url}`);
    return url;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Uploads a buffer to AWS S3.
 * @param buffer The buffer to upload.
 * @param fileName The desired file name for the S3 object (e.g., "my-document.pdf").
 * @param contentType The MIME type of the file (e.g., "application/pdf").
 * @param folderPath Optional path within the bucket to store the file.
 * @returns The public URL of the uploaded file.
 * @throws Error if upload fails or environment variables are missing.
 */
export async function uploadBufferToS3(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folderPath: string = "uploads"
): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME is not defined in environment variables.");
  }
   if (!s3Client.config.region) {
    throw new Error("AWS_REGION is not defined in environment variables.");
  }

  const fileExtension = path.extname(fileName);
  const baseName = path.basename(fileName, fileExtension);
  const uniqueFileName = `${baseName}-${randomUUID()}${fileExtension}`;

  let s3KeyPrefix = folderPath.trim();
  if (s3KeyPrefix && s3KeyPrefix.startsWith('/')) {
    s3KeyPrefix = s3KeyPrefix.substring(1);
  }
  if (s3KeyPrefix && !s3KeyPrefix.endsWith('/')) {
    s3KeyPrefix += '/';
  }
   if (!s3KeyPrefix) {
    s3KeyPrefix = '';
  }

  const s3Key = `${s3KeyPrefix}${uniqueFileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: buffer,
    ContentType: contentType,
    // ACL: 'public-read', // Consider bucket policy or signed URLs
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    const region = await s3Client.config.region();
    const url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Key}`;
    console.log(`Buffer uploaded successfully to S3: ${url}`);
    return url;
  } catch (error) {
    console.error("Error uploading buffer to S3:", error);
    throw new Error(`Failed to upload buffer to S3: ${error instanceof Error ? error.message : String(error)}`);
  }
}