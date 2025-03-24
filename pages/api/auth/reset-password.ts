import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import db from "@/utils/db";
import { ResultSetHeader, FieldPacket } from "mysql2"; // ✅ Import FieldPacket

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and new password are required" });
    }

    try {
        // ✅ Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Update password in the database
        const [result]: [ResultSetHeader, FieldPacket[]] = await db.query(
            "UPDATE users SET password = ?, otp = NULL, otp_expires = NULL WHERE email = ?",
            [hashedPassword, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found or OTP expired" });
        }

        return res.status(200).json({ message: "Password reset successfully!" });
    } catch (error) {
        console.error("❌ Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
