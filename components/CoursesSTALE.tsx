'use client';
import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';

interface Course {
    course_id: number;
    course_name: string;
    assigned_teacher: string;
    duration: string;
    status: string;
    timing: string;
    description: string;
}

export default function Courses() {
    const [allottedCourses, setAllottedCourses] = useState<Course[]>([]);
    const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedCourse, setEditedCourse] = useState<Partial<Course> | null>(null);

    const [newCourse, setNewCourse] = useState<Partial<Course>>({
        course_name: '',
        assigned_teacher: '',
        duration: '',
        status: '',
        timing: '',
        description: '',
    });
    

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('/api/courses');
                if (!response.ok) {
                    throw new Error('Failed to fetch courses');
                }
                const data = await response.json();
                setAllottedCourses(Array.isArray(data.availableCourses) ? data.availableCourses : []);
                setSuggestedCourses(Array.isArray(data.suggestedCourses) ? data.suggestedCourses : []);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setError('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleNewCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
    };
    

    const handleEdit = (course: Course) => {
        setEditingId(course.course_id);
        setEditedCourse({ ...course });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editedCourse) return;
        setEditedCourse({ ...editedCourse, [e.target.name]: e.target.value });
    };

    const handleAddCourse = () => {
        if (!newCourse.course_name || !newCourse.assigned_teacher || !newCourse.duration) {
            alert("Please fill all required fields.");
            return;
        }
    
        const newCourseEntry: Course = {
            course_id: Date.now(), // Generate a unique ID
            course_name: newCourse.course_name!,
            assigned_teacher: newCourse.assigned_teacher!,
            duration: newCourse.duration!,
            status: newCourse.status || "Pending",
            timing: newCourse.timing || "Not Scheduled",
            description: newCourse.description || "No Description",
        };
    
        setSuggestedCourses((prevCourses) => [...prevCourses, newCourseEntry]);
        setNewCourse({ course_name: '', assigned_teacher: '', duration: '', status: '', timing: '', description: '' });
    };
    

    const handleSave = () => {
        if (!editedCourse) return;

        setAllottedCourses((prevCourses) =>
            prevCourses.map((course) =>
                course.course_id === editedCourse.course_id ? { ...course, ...editedCourse } : course
            )
        );
        setSuggestedCourses((prevCourses) =>
            prevCourses.map((course) =>
                course.course_id === editedCourse.course_id ? { ...course, ...editedCourse } : course
            )
        );

        setEditingId(null);
        setEditedCourse(null);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditedCourse(null);
    };

    if (loading) return <div>Loading courses...</div>;
    if (error) return <div>Error: {error}</div>;

    const renderCourses = (courses: Course[], title: string) => (
        <div>
            <h3 className="classic_heading">{title}</h3>
            {courses.length > 0 ? (
                <div className={styles.courseGrid}>
                    <div className="row">
                            <p className="TV" id="a1">Course Name</p>
                            <p className="TV" id="a2">Teacher</p>
                            <p className="TV" id="a3">Duration</p>
                            <p className="TV" id="a4">Status</p>
                            <p className="TV" id="a5">Timing</p>
                            <p className="TV" id="a6">Description</p>
                            <p className="TV" id="a7">Edit</p>
                        </div>
                    {courses.map((course) => (
                        <div key={course.course_id} className={styles.courseCard}>
                            {editingId === course.course_id ? (
                                   <form className="row">

                                   <input id="a1" className="TVE" type="text" name="course_name" value={editedCourse?.course_name || ''} onChange={handleInputChange} />
                                   <input id="a2" className="TVE" type="text" name="assigned_teacher" value={editedCourse?.assigned_teacher || ''} onChange={handleInputChange} />
                                   <input id="a3" className="TVE" type="text" name="duration" value={editedCourse?.duration || ''} onChange={handleInputChange} />
                                   <input id="a4" className="TVE" type="text" name="status" value={editedCourse?.status || ''} onChange={handleInputChange} />
                                   <input id="a5" className="TVE" type="text" name="timing" value={editedCourse?.timing || ''} onChange={handleInputChange} />
                                   <textarea id="a6" className="TVE" name="description" value={editedCourse?.description || ''} onChange={handleInputChange} />

                                   <button className="submit" style={{ width: "60px", marginLeft: "1px" }} type="button" onClick={handleSave}>Save</button>
                                   <button className="submit" style={{ width: "60px", marginLeft: "1px" }} type="button" onClick={handleCancel}>Cancel</button>



                               </form>
                            ) : (
                                <div className="row">
                                <p className="TA" id="a1">{course.course_name}</p>
                                <p className="TA" id="a2">{course.assigned_teacher}</p>
                                <p className="TA" id="a3">{course.duration + " days"}</p>
                                <p className="TA" id="a4">{course.status}</p>
                                <p className="TA" id="a5">{course.timing}</p>
                                <p className="TA" id="a6">{course.description}</p>

                                <button className="submit" onClick={() => handleEdit(course)}>Edit</button>
                            </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No courses available</p>
            )}
        </div>
    );

    return (
        <div>
            <h4 className={styles.boxB2_headings}>Courses</h4>
            {renderCourses(allottedCourses, "Allotted Courses")}
            {renderCourses(suggestedCourses, "Suggested Courses")}

            <div>
                <h3 className="classic_heading">Suggest a New Course</h3>
                <form className="row">
                    <input id="a1" className="TVE" type="text" name="course_name" placeholder="Course Name" value={newCourse.course_name} onChange={handleNewCourseChange} />
                    <input id="a2" className="TVE" type="text" name="assigned_teacher" placeholder="Teacher" value={newCourse.assigned_teacher} onChange={handleNewCourseChange} />
                    <input id="a3" className="TVE" type="text" name="duration" placeholder="Duration" value={newCourse.duration} onChange={handleNewCourseChange} />
                    <input id="a4" className="TVE" type="text" name="status" placeholder="Status" value={newCourse.status} onChange={handleNewCourseChange} />
                    <input id="a5" className="TVE" type="text" name="timing" placeholder="Timing" value={newCourse.timing} onChange={handleNewCourseChange} />
                    <textarea id="a6" className="TVE" name="description" placeholder="Description" value={newCourse.description} onChange={handleNewCourseChange} />

                    <button className="submit" type="button" onClick={handleAddCourse}>Add</button>
                </form>
            </div>



        </div>
    );
}
