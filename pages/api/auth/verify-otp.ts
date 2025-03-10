import { NextApiRequest, NextApiResponse } from "next";
import db from "@/utils/db";
import { RowDataPacket } from "mysql2"; // ✅ Import correct type

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    try {
        // ✅ Use proper type for MySQL query results
        const [users] = await db.query<RowDataPacket[]>(
            "SELECT otp, otp_expires FROM users WHERE email = ?",
            [email]
        );

        // ✅ Check if user exists
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0] as { otp: string; otp_expires: string };

        // ✅ Check if OTP matches
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // ✅ Check if OTP is expired
        const otpExpires = new Date(user.otp_expires);
        if (isNaN(otpExpires.getTime()) || otpExpires < new Date()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        return res.status(200).json({ message: "OTP verified successfully!" });
    } catch (error) {
        console.error("❌ Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
