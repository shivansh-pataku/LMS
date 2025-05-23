import { NextApiRequest, NextApiResponse } from "next";
import db from "@/utils/db"; // Assuming your db utility is here
import { RowDataPacket, ResultSetHeader } from "mysql2/promise"; // Or from 'mysql2' if not using promise wrapper

interface UpdatePayload {
  description?: string;
  course_image?: string | null; // Base64 string or null
}

// Define a type for the course data as it comes from the DB
interface CourseFromDB extends RowDataPacket {
  id: number;
  course_name: string | null;
  description: string | null;
  course_code: string | null;
  teacher_name: string | null;
  course_start_date: string | null; // Formatted as YYYY-MM-DD
  course_end_date: string | null;   // Formatted as YYYY-MM-DD
  course_image: Buffer | string | null;
}

// Define a type for the course data as it will be sent in the API response
interface CourseResponseData {
  id: number;
  course_name: string | null;
  description: string | null;
  course_code: string | null;
  teacher_name: string | null;
  course_start_date: string | null;
  course_end_date: string | null;
  course_image: string | null; // In response, image is always string (Base64/URL) or null
}

// DBUpdateResult can be directly ResultSetHeader if no additional fields are needed
// type DBUpdateResult = ResultSetHeader; // This is an alias if you prefer

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CourseResponseData | { message: string; error?: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { courseId } = req.query;

  if (!courseId || typeof courseId !== "string" || isNaN(parseInt(courseId))) {
    return res.status(400).json({ message: "Invalid or missing Course ID." });
  }

  const numericCourseId = parseInt(courseId);

  try {
    const payload = req.body as UpdatePayload;
    const { description, course_image } = payload;

    const updateFields: string[] = [];
    const updateValues: (string | Buffer | null | number)[] = [];

    if (description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(description);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'course_image')) {
      if (course_image === null) {
        updateFields.push("course_image = ?");
        updateValues.push(null);
      } else if (typeof course_image === "string") {
        const base64Data = course_image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");
        updateFields.push("course_image = ?");
        updateValues.push(imageBuffer);
      }
    }

    if (updateFields.length === 0) {
      const [currentCourseRows] = await db.query<CourseFromDB[]>(
        "SELECT id, course_name, description, course_code, teacher_name, DATE_FORMAT(course_start_date, '%Y-%m-%d') as course_start_date, DATE_FORMAT(course_end_date, '%Y-%m-%d') as course_end_date, course_image FROM courses WHERE id = ?",
        [numericCourseId]
      );
       if (!currentCourseRows || currentCourseRows.length === 0) {
        return res.status(404).json({ message: "Course not found." });
      }
      const dbCourse = currentCourseRows[0];
      const courseToReturn: CourseResponseData = {
        ...dbCourse,
        course_image: dbCourse.course_image instanceof Buffer
          ? `data:image/jpeg;base64,${dbCourse.course_image.toString('base64')}`
          : typeof dbCourse.course_image === 'string'
          ? dbCourse.course_image
          : null,
      };
      return res.status(200).json(courseToReturn);
    }

    updateValues.push(numericCourseId);

    const updateQuery = `UPDATE courses SET ${updateFields.join(
      ", "
    )} WHERE id = ?`;

    const [updateResult] = await db.query<ResultSetHeader>(updateQuery, updateValues); // Use ResultSetHeader directly

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "Course not found or no changes made." });
    }

    const [updatedCourseRows] = await db.query<CourseFromDB[]>(
      "SELECT id, course_name, description, course_code, teacher_name, DATE_FORMAT(course_start_date, '%Y-%m-%d') as course_start_date, DATE_FORMAT(course_end_date, '%Y-%m-%d') as course_end_date, course_image FROM courses WHERE id = ?",
      [numericCourseId]
    );

    if (!updatedCourseRows || updatedCourseRows.length === 0) {
      return res.status(404).json({ message: "Updated course not found." });
    }

    const dbUpdatedCourse = updatedCourseRows[0];
    const responseData: CourseResponseData = {
        ...dbUpdatedCourse,
        course_image: dbUpdatedCourse.course_image instanceof Buffer
          ? `data:image/jpeg;base64,${dbUpdatedCourse.course_image.toString('base64')}`
          : typeof dbUpdatedCourse.course_image === 'string'
          ? dbUpdatedCourse.course_image
          : null,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error updating course details:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ message: "Database error", error: errorMessage });
  }
}