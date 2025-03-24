import { NextApiRequest, NextApiResponse } from "next";
import db from "../../../utils/db";
import transporter from "@/utils/emailTransporter";
import { RowDataPacket, ResultSetHeader } from "mysql2";

type PendingAdmin = RowDataPacket & {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string; // Keep the password as-is
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
        // ✅ Fetch the pending admin from `pending_users`
        const [rows]: [PendingAdmin[], unknown] = await db.query(
            "SELECT * FROM pending_users WHERE id = ? AND role_id = 3", // Admin role_id = 3
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Admin user not found or not pending." });
        }

        const user = rows[0];

        if (approve) {
            // ✅ Insert approved admin into `users` table (without rehashing the password)
            const [result]: [ResultSetHeader, unknown] = await db.query(
                `INSERT INTO users (first_name, last_name, email, password, contact, role_id, department, profile_image) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                [user.first_name, user.last_name, user.email, user.password, user.contact, user.role_id, user.department, user.profile_image]
            );

            if (result.affectedRows === 0) {
                return res.status(500).json({ message: "Admin approval failed." });
            }

            // ✅ Remove from `pending_users` after successful approval
            await db.query("DELETE FROM pending_users WHERE id = ?", [userId]);

            // ✅ Send Email Notification
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: "Your LMS Admin Account is Approved",
                    text: `Dear ${user.first_name},\n\nYour Admin account has been approved. You can now log in.\n\nRegards,\nLMS Team`
                });
            } catch (emailError) {
                console.error("❌ Email Sending Error:", emailError);
                return res.status(500).json({ message: "Admin approved, but email failed to send." });
            }

            return res.status(200).json({ message: "Admin approved successfully! Email sent." });
        } else {
            // ✅ Remove from `pending_users` if rejected
            await db.query("DELETE FROM pending_users WHERE id = ?", [userId]);
            return res.status(200).json({ message: "Admin rejected successfully!" });
        }
    } catch (error) {
        console.error("❌ Database Error:", error);
        return res.status(500).json({ message: "Database error", error: (error as Error).message });
    }
}
