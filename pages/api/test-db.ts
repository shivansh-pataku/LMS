import { NextApiRequest, NextApiResponse } from "next";
import db from "../../utils/db";
import { RowDataPacket } from "mysql2";

type UserCountResult = RowDataPacket & {
    count: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const [rows]: [UserCountResult[], unknown] = await db.query("SELECT COUNT(*) as count FROM users");
        
        return res.status(200).json({ 
            message: "Database connected successfully!", 
            user_count: rows[0]?.count || 0 
        });
    } catch (error) {
        console.error("Database Connection Error:", error);
        return res.status(500).json({ message: "Database connection failed", error: (error as Error).message });
    }
} 