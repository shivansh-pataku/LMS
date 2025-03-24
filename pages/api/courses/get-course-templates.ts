import { NextApiRequest, NextApiResponse } from "next";
import db from "@/utils/db"; // ✅ MySQL connection
import { RowDataPacket } from "mysql2"; // ✅ Now used correctly

// ✅ Define CourseTemplate Type
type CourseTemplate = RowDataPacket & {
    course_code: string;
    course_name: string;
    credit: number;
};

// ✅ API Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { department, category } = req.query;

    if (!department || !category) {
        return res.status(400).json({ message: "Missing department or category" });
    }

    try {
        // ✅ Fetch courses based on department & category
        const [rows] = await db.query<CourseTemplate[]>(
            `SELECT course_code, course_name, credit FROM course_templates 
             WHERE department = ? AND category = ?`,
            [department, category]
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Error fetching course templates:", error);
        return res.status(500).json({ message: "Database error", error: (error as Error).message });
    }
}
