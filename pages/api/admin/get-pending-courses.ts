import { NextApiRequest, NextApiResponse } from "next";
import db from "@/utils/db";
import { RowDataPacket } from "mysql2/promise"; // ✅ Import Required Type

// ✅ Define Course Type
interface PendingCourse extends RowDataPacket {
    id: number;
    course_code: string;
    course_name: string;
    credit: number;
    department: string;
    semester: number;
    course_category: string;
    description: string;
    teacher_name: string;
    teacher_email: string;
    course_start_date: string;
    course_end_date: string;
    status: string;
    course_image: Buffer | null; // Image stored as Binary (BLOB)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        // ✅ Fetch Courses & Ensure Proper Type
        const [rows] = await db.query<PendingCourse[]>(
            `SELECT id, course_code, course_name, credit, department, 
                    semester, course_category, description, teacher_name, 
                    teacher_email, course_start_date, course_end_date, status, 
                    course_image 
             FROM courses 
             WHERE status = 'pending'`
        ) as [PendingCourse[], unknown]; // ✅ Explicitly cast to prevent TypeScript error

        // ✅ Convert Binary Image Data to Base64 (Auto-detect MIME Type)
        const processedCourses = rows.map((course) => {
            // Check if image exists
            if (course.course_image) {
                const base64Image = course.course_image.toString("base64");

                // Detect MIME type dynamically (assumes WebP if unknown)
                const mimeType = base64Image.startsWith("/9j/") ? "image/jpeg" : "image/webp";

                return {
                    ...course,
                    course_image: `data:${mimeType};base64,${base64Image}`,
                };
            }
            return { ...course, course_image: null }; // If image is NULL, return null
        });

        return res.status(200).json(processedCourses);
    } catch (error) {
        console.error("❌ Error fetching pending courses:", error);
        return res.status(500).json({ message: "Database error", error: (error as Error).message });
    }
}
