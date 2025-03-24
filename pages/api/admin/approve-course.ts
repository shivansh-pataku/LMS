import { NextApiRequest, NextApiResponse } from "next";
import db from "@/utils/db";
import { ResultSetHeader } from "mysql2"; // ✅ Correct type for SQL UPDATE queries

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { courseId, approve, rejection_reason } = req.body;

    if (!courseId || approve === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    let query: string;
    let values: (string | number | null)[]; // ✅ Explicitly define allowed types

    if (approve) {
        // ✅ Approve course
        query = `UPDATE courses SET status = 'approved', rejection_reason = NULL WHERE id = ?`;
        values = [courseId];
    } else {
        // ❌ Reject course
        query = `UPDATE courses SET status = 'rejected',rejection_reason = ? WHERE id = ?`;
        values = [rejection_reason || "No reason provided", courseId];
    }

    try {
        // ✅ Use correct TypeScript type
        const [result] = await db.query<ResultSetHeader>(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.status(200).json({ message: approve ? "Course approved" : "Course rejected" });
    } catch (error) {
        console.error("❌ Error updating course:", error);
        return res.status(500).json({ message: "Database error", error: (error as Error).message });
    }
}
