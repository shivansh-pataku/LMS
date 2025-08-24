import { NextApiRequest, NextApiResponse } from "next";
import db from "../../../utils/db";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { RowDataPacket, ResultSetHeader } from "mysql2";

type PendingUser = RowDataPacket & {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role_id: number; 
    department: string;
    profile_image: Buffer;
    created_at: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Handle GET requests to fetch approved users
    if (req.method === "GET") {
        try {
            const [rows]: [PendingUser[], unknown] = await db.query("SELECT * FROM users");
            return res.status(200).json(rows);
        } catch (error) {
            console.error("Error fetching approved users:", error); // Log the error
            return res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
        }
    }

    // Handle POST requests to approve users
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { userId, approve } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    try {
        // Fetch user from pending_users
        const [rows]: [PendingUser[], unknown] = await db.query(
            "SELECT * FROM pending_users WHERE id = ?",
            [userId] /////////
        );

        const user = rows[0];
        if (!user) return res.status(404).json({ message: "User not found" });

        // ✅ Restrict to Students & Teachers only (role_id 1 or 2)
        if (![1, 2].includes(user.role_id)) {
            return res.status(403).json({ message: "Only Students and Teachers can be approved!" });
        }

        if (approve) {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Move approved user to `users` table
            const [result]: [ResultSetHeader, unknown] = await db.query(
                `INSERT INTO users (first_name, last_name, email, password, contact, role_id, department, profile_image) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                [user.first_name, user.last_name, user.email, hashedPassword, user.contact, user.role_id, user.department, user.profile_image]
            );

            if (result.affectedRows === 0) {
                return res.status(500).json({ message: "User approval failed." });
            }

            // ✅ Send email notification
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

            // ✅ Remove user from `pending_users` table
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