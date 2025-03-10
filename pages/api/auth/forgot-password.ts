import { NextApiRequest, NextApiResponse } from "next";
import db from "@/utils/db";
import crypto from "crypto";
import transporter from "@/utils/emailTransporter";
import { RowDataPacket } from "mysql2"; // ✅ Import correct type

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // ✅ Use proper type
        const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM users WHERE email = ?", [email]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = rows[0] as { otp_attempts: number; otp_attempts_date: string | null }; // ✅ TypeScript-friendly

        const today = new Date().toISOString().split("T")[0]; // Get current date (YYYY-MM-DD)

        // ✅ Reset attempt count if it's a new day
        if (user.otp_attempts_date !== today) {
            await db.query("UPDATE users SET otp_attempts = 0, otp_attempts_date = ? WHERE email = ?", [today, email]);
        }

        // ✅ Check OTP attempt limit (Max 3 per day)
        if (user.otp_attempts >= 3) {
            return res.status(429).json({ message: "You have reached the maximum OTP requests for today." });
        }

        // ✅ Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

        // ✅ Store OTP in database & Increase attempt count
        await db.query(
            "UPDATE users SET otp = ?, otp_expires = ?, otp_attempts = otp_attempts + 1, otp_attempts_date = ? WHERE email = ?",
            [otp, otpExpires, today, email]
        );

        // ✅ Send OTP via Email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
        });

        return res.status(200).json({ message: "OTP sent successfully!" });
    } catch (error: unknown) { // ✅ Fix ESLint error
        if (error instanceof Error) {
            console.error("❌ Error:", error.message);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
