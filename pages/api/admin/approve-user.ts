import { NextApiRequest, NextApiResponse } from "next";
import db from "../../../utils/db";
import nodemailer from "nodemailer";
import { RowDataPacket, ResultSetHeader } from "mysql2";

type PendingUser = RowDataPacket & {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    contact: string | null;
    department: string | null;
    profile_image: Buffer | null;
    created_at: string;
    role_id: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { userId, approve } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    try {
        // ✅ Fetch user from pending_users
        const [rows]: [PendingUser[], unknown] = await db.query(
            "SELECT * FROM pending_users WHERE id = ?",
            [userId]
        );

        const user = rows[0];
        if (!user) return res.status(404).json({ message: "User not found" });

        if (approve) {
            // ✅ Insert user into `users` table
            const [result]: [ResultSetHeader, unknown] = await db.query(
                `INSERT INTO users (first_name, last_name, email, password, contact, role_id, department, profile_image) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                    user.first_name,
                    user.last_name,
                    user.email,
                    user.password, // Already hashed during signup
                    user.contact,
                    user.role_id, // ✅ Use role_id directly
                    user.department,
                    user.profile_image,
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(500).json({ message: "User approval failed." });
            }

            // ✅ Send approval email
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Your LMS Account is Approved",
                text: `Dear ${user.first_name},\n\nYour account has been approved. You can now log in with your email.\n\nRegards, LMS Team`,
            });

            // ✅ Remove approved user from pending_users
            await db.query("DELETE FROM pending_users WHERE id = ?", [userId]);

            return res.status(200).json({ message: "User approved successfully!" });
        } else {
            // ✅ Reject user (delete from pending_users)
            await db.query("DELETE FROM pending_users WHERE id = ?", [userId]);
            return res.status(200).json({ message: "User rejected successfully!" });
        }
    } catch (error) {
        console.error("Error approving user:", error);
        return res.status(500).json({ message: "Database error", error: (error as Error).message });
    }
}
