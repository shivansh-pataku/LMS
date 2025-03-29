import { NextApiRequest, NextApiResponse } from "next";
import db from "@/utils/db";
import formidable, { File } from "formidable";
import fs from "fs";

export const config = {
    api: {
        bodyParser: false, // ✅ Disable default body parser for file uploads
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ message: "File upload error", error: err.message });
        }

        try {
            console.log("📩 Parsed Form Data:", fields);

            // ✅ Extract Fields
            const course_code = fields.course_code?.toString() || "";
            const course_name = fields.course_name?.toString() || "";
            const credit = fields.credit?.toString() || "";
            const department = fields.department?.toString() || "";
            const semester = fields.semester?.toString() || ""; 
            const teacher_email = fields.teacher_email?.toString() || "";
            const teacher_name = fields.teacher_name?.toString() || "";
            const course_category = fields.course_category?.toString() || "";
            const description = fields.description?.toString() || "";
            const course_start_date = fields.course_start_date?.toString() || "";
            const course_end_date = fields.course_end_date?.toString() || "";

            // ✅ Validate Required Fields
            if (!course_code || !teacher_email || !department || !semester || !course_start_date || !course_end_date) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            // ✅ Handle Course Image (File Upload or Base64)
            let imageBuffer: Buffer | null = null;

            if (files.courseImage && Array.isArray(files.courseImage)) {
                // ✅ Handle file upload
                const imageFile = files.courseImage[0] as File;
                imageBuffer = fs.readFileSync(imageFile.filepath);
            } else {
                // ✅ Handle Base64 Image
                const courseImage = fields.course_image as string | string[] | undefined;

                if (courseImage) {
                    const base64Data = Array.isArray(courseImage) 
                        ? courseImage[0].replace(/^data:image\/\w+;base64,/, "") 
                        : courseImage.replace(/^data:image\/\w+;base64,/, "");
                    
                    imageBuffer = Buffer.from(base64Data, "base64");
                }
            }

            // ✅ Insert into MySQL
            await db.query(
                `INSERT INTO courses 
                (course_code, course_name, credit, department, semester, teacher_email, teacher_name, course_category, description, course_start_date, course_end_date, course_image, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending');`,
                [
                    course_code, course_name, credit, department, semester,
                    teacher_email, teacher_name, course_category, 
                    description, course_start_date, course_end_date, 
                    imageBuffer
                ]
            );

            return res.status(201).json({ message: "Course submitted for approval." });
        } catch (error) {
            console.error("❌ Error creating course:", error);
            return res.status(500).json({ message: "Database error", error: (error as Error).message });
        }
    });
}
