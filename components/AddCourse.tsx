// import { useState } from "react";
import styles from '../styles/DialogueBox.module.css';
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
// import { useRouter } from "next/navigation";
import axios from "axios";

const semesters = Array.from({ length: 10 }, (_, i) => i + 1);
const courseCategories = [
  "Major", "Elective Specialization", "Minor", "Vocational & Skill Courses",
  "Bridge", "Indian Knowledge System", "Review of Literature & Research Proposal",
  "Dissertation and Viva-Voce"
];
type SessionData = { department: string; email: string; first_name: string;last_name: string };
type CourseTemplate = { course_code: string; course_name: string; credit: number };

//export default function CreateCourse() {
    // const router = useRouter();

    // ✅ Fetch session on mount
    // const [session, setSession] = useState<SessionData | null>(null);

    // useEffect(() => {
    //     axios.get<SessionData>("/api/auth/get-session")
    //         .then(res => {
    //             console.log("✅ Session Data:", res.data);
    //             setSession(res.data);
    //         })
    //         .catch(err => console.error("❌ Session fetch error:", err));
    // }, []);

const Scores = () => {
    // State for modal visibility
    const [isOpen, setIsOpen] = useState(false);
<<<<<<< HEAD

=======
    const [session, setSession] = useState<SessionData | null>(null);

    useEffect(() => {
        axios.get<SessionData>("/api/auth/get-session")
            .then(res => {
                setSession(res.data);
            })
            .catch(err => console.error("❌ Session fetch error:", err));
    }, []);
    
>>>>>>> c3bd82a02d3de72cd6aba0d8fefc10d8147b67de
    // State for form data
    // const [formData, setFormData] = useState({
    //     course_name: "",
    //     description: "",
    //     duration: "",
    //     instructor_id: "",
    //     profileImage: null as File | null
    // });
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

    // Open the modal
    const openModal = () => setIsOpen(true);

    // Close the modal
    const closeModal = () => setIsOpen(false);

    // Handle input changes
    // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //     setFormData({ ...formData, [e.target.name]: e.target.value });
    // };
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


    // Handle form submission
    // const handleSubmit = async (e) => {
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const semesterNumber = parseInt(formData.semester, 10);
        if (isNaN(semesterNumber)) {
            alert("Please select a valid semester.");
            return;
        }

        // Ensure image is valid
        const imageToSend = formData.course_image || "";


         try {
            const response = await axios.post("/api/courses/create-course", {
                ...formData,
                semester: semesterNumber,
                course_image: imageToSend,
            });

            if (response.status === 201) {
                console.log("Course added successfully");
                closeModal();
            } else {
                console.error("Failed to add course");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div>
            {/* Button to open form */}
            <button className={styles.textButton}
                onClick={openModal}
            >
                Add New Course
            </button>

            {/* Modal (Form Popup) */}
            {isOpen && (
                <div className={styles.DiBOX}>
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-semibold mb-4">Add Course</h2>

                        {/* Form Inside Modal */}
                        {session ? (
                        <form onSubmit={handleSubmit} className={styles.formDibox}>
<<<<<<< HEAD
                            <input
                                type="text"
                                name="course_name"
                                placeholder="Course Name"
                                value={formData.course_name}
                                onChange={handleChange}
                                className={styles.ib}
                            />

                            <input
                                type="text"
                                name="sem"  // Make sure "sem" exists in formData state
                                placeholder="Semester"
                                value={formData.sem}
                                onChange={handleChange}
                                className={styles.ib}
                            />

                            <input
                                type="text"
                                name="category"
                                placeholder="Category"
                                value={formData.category}
                                onChange={handleChange}
                                className={styles.ib}
                            />

                            <input
                                type="text"
                                name="credits"
                                placeholder="Credits"
                                value={formData.credits}
                                onChange={handleChange}
                                className={styles.ib}
                            />

                            <input
                                type="date"
                                name="start_date" // Removed space
                                placeholder="Start Date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className={styles.ib}
                            />

                            <input
                                type="date"
                                name="end_date" // Removed space
                                placeholder="End Date"
                                value={formData.end_date}
                                onChange={handleChange}
                                className={styles.ib}
                            />

                            <input
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleChange}
                                className={styles.ib}
                                style={{ width: "514px" }}
                            />

                            <div style={{ height: "40px", width: "250px" }}>
                                {/* className={styles.ib} */}<input
                                    type="file"
                                    accept="image/*"
                                    // onChange={handleImageChange}
                                    className="ib"
                                    id="profile-image"
                                    style={{ display: 'none' }}
                                />

                                <label
                                    htmlFor="profile-image"
                                    className={styles.ib}
                                    style={{
                                        display: 'flex',
                                        color: 'green',
                                        cursor: 'pointer'

                                    }}
                                >
                                    {formData.profileImage ? 'Image Selected ✓' : 'Upload Class Cover'}
                                </label>
                            </div>
=======
                        
                        {/* Department (Auto-filled) */}
                    <input className="input" type="text" name="department" value={formData.department} readOnly />


                        <select 
                            name="semester" 
                            // placeholder="Semester" 
                            value={formData.semester} 
                            onChange={handleChange}
                            className={styles.ib}>
                            <option value="">Select Semester</option>
                        {semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                    </select>

                    {/* Teacher Email */}
                    <input className="input" type="email" name="teacher_email" value={formData.teacher_email} readOnly />
                    {/* Teacher Name */}
                    <input className="input" type="text" name="teacher_name" value={formData.teacher_name} onChange={handleChange} placeholder="Enter your name" required readOnly={!!formData.teacher_name} />

                        <select
                            name="course_category" 
                            value={formData.course_category} 
                            onChange={handleChange}
                            className={styles.ib}
                        >
                        <option value="">Select Course Category</option>
                        {courseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>

                         <select
                            name="course_code" 
                            value={formData.course_code} 
                            onChange={handleChange}
                            className={styles.ib}
                        >
                            <option value="">Select Course Code</option>
                        {courseCodes.map(course => (
                            <option key={course.course_code} value={course.course_code}>{course.course_code}</option>
                        ))}
                    </select>

                        <input 
                            type="text" 
                            name="course_name" 
                            placeholder="Course Name" 
                            value={formData.course_name} 
                            onChange={handleChange}
                            className={styles.ib}
                            readOnly
                        />

                        <input 
                            type="text" 
                            name="credit" 
                            placeholder="Credit" 
                            value={formData.credit} 
                            onChange={handleChange}
                            className={styles.ib}
                            readOnly
                        />

                        <input 
                            type="date" 
                            name="course_start_date" // Removed space
                            placeholder="Start Date" 
                            value={formData.course_start_date} 
                            onChange={handleChange}
                            className={styles.ib}
                            required
                        />

                        <input 
                            type="date" 
                            name="course_end_date" // Removed space
                            placeholder="End Date" 
                            value={formData.course_end_date} 
                            onChange={handleChange}
                            className={styles.ib}
                            required
                        />

                        <input 
                            name="description" 
                            placeholder="Description" 
                            value={formData.description} 
                            onChange={handleChange}
                            className={styles.ib}
                            style={{  width:"514px"}}
                            required
                        />

                                    <div style={{ height: "40px", width:"250px"}}>
                                        {/* className={styles.ib} */}<input 
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="ib"
                                            id="profile-image"
                                            style={{ display: 'none' }}
                                        />

                                        <label 
                                            htmlFor="profile-image" 
                                            className={styles.ib} 
                                            style={{
                                                display: 'flex',
                                                color: 'green',
                                                cursor: 'pointer'
                                    
                                            }}
                                        >
                                            {formData.course_image ? 'Image Selected ✓' : 'Upload Class Cover'}
                                        </label>
                                    </div>
>>>>>>> c3bd82a02d3de72cd6aba0d8fefc10d8147b67de



                            <br />
                            {/* Buttons */}
                            <div className={styles.DiBUTTONdiv}>
<<<<<<< HEAD
                                <button className
                                    type="button"
                                    onClick={closeModal}
=======
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
>>>>>>> c3bd82a02d3de72cd6aba0d8fefc10d8147b67de
                                    className={styles.DiBUTTON}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.DiBUTTON}
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                        ) : (
                            <p>Loading session...</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Scores;
