import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";

export async function POST(request: NextRequest) {
  try {
    const {
      ROLL_NO,
      course_code,
      course_NAME,
      internal,
      midterm,
      endterm,
      teacher_name,
      sem
    } = await request.json();

    const query = `
      INSERT INTO course_scores
        (ROLL_NO, course_code, course_NAME, internal, midterm, endterm, teacher_name, sem)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        internal = VALUES(internal),
        midterm = VALUES(midterm),
        endterm = VALUES(endterm),
        teacher_name = VALUES(teacher_name),
        sem = VALUES(sem)
    `;

    await db.query(query, [
      ROLL_NO,
      course_code,
      course_NAME,
      internal,
      midterm,
      endterm,
      teacher_name,
      sem
    ]);

    return NextResponse.json({ message: "Score updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating score:", error);
    return NextResponse.json({ message: "Failed to update score" }, { status: 500 });
  }
}