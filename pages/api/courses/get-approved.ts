import { NextApiRequest, NextApiResponse } from "next";
import db from "@/utils/db"; // ✅ MySQL connection
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { RowDataPacket } from "mysql2"; // ✅ Fix Type Error

// ✅ Define Course Type
interface Course extends RowDataPacket {
    id?: number;
    course_code: string;
    course_name: string;
    credit: number;
}

// ✅ API Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    // ✅ Get session
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // ✅ Fetch only approved courses for the logged-in teacher
        const query = `SELECT id, course_code, course_name, credit 
                       FROM courses 
                       WHERE teacher_email = ? AND status = 'approved'`;
        const params = [session.user.email];

        // ✅ Execute query
        const [results] = await db.query<Course[] & RowDataPacket[]>(query, params);

        return res.status(200).json({ success: true, data: results.length > 0 ? results : [] });
    } catch (error) {
        console.error("❌ Error fetching approved courses:", error);
        return res.status(500).json({ message: "Database error", error: (error as Error).message });
    }
}
