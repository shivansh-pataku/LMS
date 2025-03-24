import { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import db from "@/utils/db";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";

export const config = {
    api: {
        bodyParser: false, // ✅ Disable Next.js default body parser for file uploads
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    // ✅ Parse FormData using formidable
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ message: "File upload error", error: err.message });
        }

        try {
            console.log("📩 Parsed Form Data:", fields); // ✅ Debugging log

            // ✅ Extract fields (fixing `string[]` issue)
            const firstName = fields.firstName?.toString() || "";
            const lastName = fields.lastName?.toString() || "";
            const email = fields.email?.toString() || "";
            const password = fields.password?.toString() || "";
            const contact = fields.contact?.toString() || null;
            const department = fields.department?.toString() || null;
            const role = fields.role?.toString() || "";

            if (!firstName || !lastName || !email || !password || !role) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            // ✅ Check if user already exists
            const [existingUsers]: [RowDataPacket[], unknown] = await db.query(
                "SELECT email FROM users WHERE email = ?",
                [email]
            );
            if (existingUsers.length > 0) {
                return res.status(400).json({ message: "User already exists" });
            }

            // ✅ Get role_id from `roles` table
            const [roleResult]: [RowDataPacket[], unknown] = await db.query(
                "SELECT id FROM roles WHERE role_name = ?",
                [role]
            );

            if (roleResult.length === 0) {
                return res.status(400).json({ message: "Invalid role selected" });
            }

            const role_id = roleResult[0].id;

            // ✅ Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // ✅ Handle profile image (fixing `File[]` issue)
            let imageBuffer: Buffer | null = null;
            if (files.profileImage && Array.isArray(files.profileImage)) {
                const imageFile = files.profileImage[0] as File; // Extract first file
                imageBuffer = fs.readFileSync(imageFile.filepath);
            }

            // ✅ Insert into `pending_users` table
            await db.query(
                `INSERT INTO pending_users 
                (first_name, last_name, email, password, contact, department, role_id, profile_image) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                [firstName, lastName, email, hashedPassword, contact, department, role_id, imageBuffer]
            );

            return res.status(201).json({ message: "Signup successful! Awaiting approval." });
        } catch (error) {
            console.error("❌ Signup Error:", error);
            return res.status(500).json({ message: "Database error", error: (error as Error).message });
        }
    });
}
