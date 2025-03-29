"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const semesters = Array.from({ length: 10 }, (_, i) => i + 1);
const courseCategories = [
  "Major", "Elective Specialization", "Minor", "Vocational & Skill Courses",
  "Bridge", "Indian Knowledge System", "Review of Literature & Research Proposal",
  "Dissertation and Viva-Voce"
];

type SessionData = { department: string; email: string; first_name: string;last_name: string };
type CourseTemplate = { course_code: string; course_name: string; credit: number };

export default function CreateCourse() {
    const router = useRouter();

    // ✅ Fetch session on mount
    const [session, setSession] = useState<SessionData | null>(null);

    useEffect(() => {
        axios.get<SessionData>("/api/auth/get-session")
            .then(res => {
                console.log("✅ Session Data:", res.data);
                setSession(res.data);
            })
            .catch(err => console.error("❌ Session fetch error:", err));
    }, []);

    // ✅ Form State
    const [formData, setFormData] = useState({
        department: "",
        semester: "",
        teacher_name: "",
        teacher_email: "",
        course_start_date: "",
        course_end_date: "",
        course_image: null as File | string | null,
        description: "",
        course_category: "",
        course_code: "",
        course_name: "",
        credit: ""
    });

    const [courseCodes, setCourseCodes] = useState<CourseTemplate[]>([]);

   
    // ✅ Auto-fill department, email, and teacher_name once session is available
    useEffect(() => {
        if (session) {
            console.log("✅ Session found, updating formData...");
            setFormData(prev => ({
                ...prev,
                department: session.department || "",
                teacher_email: session.email || "",
                teacher_name: `${session.first_name} ${session.last_name}`.trim() || "",
            }));
        }
    }, [session]);
    

    // ✅ Fetch course codes based on department & category
    useEffect(() => {
        if (formData.department && formData.course_category) {
            axios.get(`/api/courses/get-course-templates?department=${encodeURIComponent(formData.department)}&category=${encodeURIComponent(formData.course_category)}`)
                .then(res => {
                    console.log("✅ Course Templates:", res.data);
                    setCourseCodes(res.data as CourseTemplate[]);
                })
                .catch(err => console.error("❌ Error fetching course templates:", err));
        }
    }, [formData.department, formData.course_category]);

    // ✅ Auto-fill course_name & credit when course_code is selected
    useEffect(() => {
        const selectedCourse = courseCodes.find(course => course.course_code === formData.course_code);
        if (selectedCourse) {
            setFormData(prev => ({
                ...prev,
                course_name: selectedCourse.course_name,
                credit: selectedCourse.credit.toString()
            }));
        }
    }, [formData.course_code, courseCodes]);

    // ✅ Handle Form Changes
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ✅ Handle Image Upload (Convert to Base64)
    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size should be less than 5MB");
                return;
            }

            const base64 = await convertToBase64(file);
            console.log("✅ Image Converted to Base64:", base64);
            setFormData(prev => ({ ...prev, course_image: base64 }));
        }
    };

    // ✅ Convert File to Base64
    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    // ✅ Handle Form Submission
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Ensure semester is a number
        const semesterNumber = parseInt(formData.semester, 10);
        if (isNaN(semesterNumber)) {
            alert("Please select a valid semester.");
            return;
        }

        // Ensure image is valid
        const imageToSend = formData.course_image || "";

        // 🔍 Debug: Check the final data before sending
        console.log("🚀 Form Data to Send:", { ...formData, semester: semesterNumber, course_image: imageToSend });

        try {
            const response = await axios.post("/api/courses/create-course", {
                ...formData,
                semester: semesterNumber,
                course_image: imageToSend,
            });

            console.log("✅ API Response:", response.data);
            if (response.status === 201) {
                alert("Course created successfully! Awaiting approval.");
                router.push("/dashboard/teacher");
            } else {
                alert("Failed to create course.");
            }
        } catch (error) {
            console.error("❌ Error creating course:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Create a New Course</h1>
            {session ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Department (Auto-filled) */}
                    <input className="input" type="text" name="department" value={formData.department} readOnly />

                    {/* Semester */}
                    <select name="semester" value={formData.semester} onChange={handleChange} className="input">
                        <option value="">Select Semester</option>
                        {semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                    </select>

                    {/* Teacher Name */}
                    <input className="input" type="text" name="teacher_name" value={formData.teacher_name} onChange={handleChange} placeholder="Enter your name" required readOnly={!!formData.teacher_name} />


                    {/* Teacher Email */}
                    <input className="input" type="email" name="teacher_email" value={formData.teacher_email} readOnly />

                    {/* Course Category */}
                    <select name="course_category" value={formData.course_category} onChange={handleChange} className="input">
                        <option value="">Select Course Category</option>
                        {courseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>

                    {/* Course Code */}
                    <select name="course_code" value={formData.course_code} onChange={handleChange} className="input">
                        <option value="">Select Course Code</option>
                        {courseCodes.map(course => (
                            <option key={course.course_code} value={course.course_code}>{course.course_code}</option>
                        ))}
                    </select>

                    {/* Course Name (Auto-filled) */}
                    <input className="input" type="text" name="course_name" value={formData.course_name} readOnly />

                    {/* Credit (Auto-filled) */}
                    <input className="input" type="text" name="credit" value={formData.credit} readOnly />

                    {/* Course Start Date */}
                    <input className="input" type="date" name="course_start_date" value={formData.course_start_date} onChange={handleChange} required />

                    {/* Course End Date */}
                    <input className="input" type="date" name="course_end_date" value={formData.course_end_date} onChange={handleChange} required />

                    {/* Course Image Upload */}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="input" />

                    {/* Description */}
                    <textarea className="input" name="description" value={formData.description} onChange={handleChange} placeholder="Enter course description" required />

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary">Create Course</button>
                </form>
            ) : (
                <p>Loading session...</p>
            )}
        </div>
    );
}
