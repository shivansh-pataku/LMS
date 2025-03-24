"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  id: number;
  course_code: string;
  course_name: string;
  credit: number;
}

export default function ApprovedCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApprovedCourses = async () => {
      try {
        const response = await fetch("/api/courses/get-approved?type=approvedCourses");
        const data = await response.json();

        if (data.success) {
          setCourses(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch courses");
        }
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedCourses();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Approved Courses</h1>

      {loading && <p>Loading courses...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Course Code</th>
                <th className="border p-2">Course Name</th>
                <th className="border p-2">Credit</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border">
                  <td className="border p-2">{course.course_code}</td>
                  <td className="border p-2">{course.course_name}</td>
                  <td className="border p-2">{course.credit}</td>
                </tr>
              ))}
            </tbody>
          </table>
 
          {/* ✅ Create Course Button */}
          <div className="mt-4">
            <Link href="/dashboard/teacher/create-course">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                + Create Course
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
