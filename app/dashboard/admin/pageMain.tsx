"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import Image from "next/image";

// Define Pending User Type
type PendingUser = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    contact: string | null;
    department: string | null;
    role_id: number;
    profile_image: string | null;
    created_at: string;
    role_name: string;
};

// Define Pending Course Type
type PendingCourse = {
    id: number;
    course_code: string;
    course_name: string;
    department: string;
    teacher_name: string;
    teacher_email: string;
    course_category: string;
    description: string;
    course_start_date: string;
    course_end_date: string;
    created_at: string;
    credit: number;
    semester: number;
    course_image: string | null;
};

const APPROVABLE_ROLES = [1, 2];

export default function AdminDashboard() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([]);
    const [rejectionReason, setRejectionReason] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        fetchPendingUsers();
        fetchPendingCourses();
    }, []); // when the component mounts useEffect is used to call the fetchPendingUsers and fetchPendingCourses functions to fetch the pending users and courses data from the server; it is an empty array so it will only run once when the component mounts
    // useEffect is a hook that allows you to perform side effects in function components; it takes two arguments: a function and an array of dependencies; the function is executed after the component renders, and the array of dependencies determines when the effect should run again

    // Fetch Pending Users
    const fetchPendingUsers = async () => {
        try {
            const response = await axios.get<PendingUser[]>("/api/admin/get-pending-users");// axios is used to make a GET request to the API endpoint /api/admin/get-pending-users to fetch the pending users data; response is the object that contains the data returned from the API
            //pendingUsers is the state variable that stores the list of pending users; setPendingUsers is the function used to update the state of pendingUsers initially it is empty array; response.data is the array of users fetched from the API 
            console.log("Pending Users API Response:", response.data); // Log the response
            setPendingUsers(response.data.filter(user => APPROVABLE_ROLES.includes(user.role_id))); // include is used to filter the users based on their role_id; what is user here? : ans user is the object of type PendingUser used to filter the users based on their role_id it stores the filtered users in the pendingUsers state; response.data is the array of users fetched from the API eg : here the value in variable user is detatis of the pending users ie not approved and can have role_id of 1 or 2 ie student or teacher
        } catch (err) {
            console.error("Error fetching pending users:", err);
        }
    };
    
    // const fetchPendingUsers = async () => {
    //     try {
    //         const response = await axios.get<PendingUser[]>("/api/admin/get-pending-users");
    //         setPendingUsers(response.data.filter(user => APPROVABLE_ROLES.includes(user.role_id)));
    //     } catch (err) {
    //         console.error("Error fetching pending users:", err);
    //     }
    // };

    // Fetch Pending Courses
    const fetchPendingCourses = async () => { // function to fetch the pending courses data from the server
        try {
            const response = await axios.get<PendingCourse[]>("/api/admin/get-pending-courses");
            setPendingCourses(response.data);
        } catch (err) {
            console.error("Error fetching pending courses:", err);
        }
    };

    // Handle User Approval
    const handleUserApproval = async (userId: number, approve: boolean) => { // function to handle the user approval or rejection
        // userId is the id of the user to be approved or rejected; approve is a boolean value that indicates whether the user is approved or rejected
        try {
            await axios.post("/api/admin/approve-user", { userId, approve });// axios is used to make a POST request to the API endpoint /api/admin/approve-user to approve or reject the user
            // userId is the id of the user to be approved or rejected; approve is a boolean value that indicates whether the user is approved or rejected
            setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            alert(approve ? "User approved!" : "User rejected!");
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to process request.");
        }
    };

    // Handle Course Approval
    const handleCourseApproval = async (courseId: number, approve: boolean) => {
        try {
            await axios.post("/api/admin/approve-course", {
                courseId,
                approve,
                rejectionReason: !approve ? rejectionReason[courseId] || null : undefined,
            });
            setPendingCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
            alert(approve ? "Course approved!" : "Course rejected!");
        } catch (error) {
            console.error("Error updating course:", error);
            alert("Failed to process request.");
        }
    };

    return (
        <DashboardLayout role="admin">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            
            {/* ✅ User Approvals Section */}
            <h2 className="mt-4 text-xl">Pending User Approvals</h2>
            <button 
                className="mt-2 mb-4 bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={() => { fetchPendingUsers(); fetchPendingCourses(); }}
            >
                Refresh List
            </button>

            <table className="mt-4 w-full border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Profile</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Contact</th>
                        <th className="border p-2">Department</th>
                        <th className="border p-2">Role</th>
                        <th className="border p-2">Joined On</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingUsers.length > 0 ? (
                        pendingUsers.map(user => (
                            <tr key={user.id} className="border">
                                <td className="p-2">
                                    {user.profile_image ? (
                                        <Image 
                                            src={user.profile_image} 
                                            alt="Profile" 
                                            width={40} 
                                            height={40} 
                                            className="rounded-full"
                                            unoptimized
                                        />
                                    ) : (
                                        <Image 
                                            src="/no-image.png" 
                                            alt="No Profile Image" 
                                            width={40} 
                                            height={40} 
                                            className="rounded-full" 
                                        />
                                    )}
                                </td>
                                <td className="p-2">{user.first_name} {user.last_name}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2">{user.contact || "N/A"}</td>
                                <td className="p-2">{user.department || "N/A"}</td>
                                <td className="p-2">{user.role_id === 1 ? "Student" : user.role_id === 2 ? "Teacher" : "Unknown"}</td>

                                <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="p-2">
                                    <button 
                                        className="bg-green-500 text-white px-4 py-1 rounded-md mr-2"
                                        onClick={() => handleUserApproval(user.id, true)}
                                    >
                                        Approve 
                                    </button>
                                    <button 
                                        className="bg-red-500 text-white px-4 py-1 rounded-md"
                                        onClick={() => handleUserApproval(user.id, false)}
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={8} className="text-center p-4">No pending approvals.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* ✅ Course Approvals Section */}
            <h2 className="mt-4 text-xl">Pending Course Approvals</h2>
            <table className="mt-4 w-full border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Image</th>
                        <th className="border p-2">Course Code</th>
                        <th className="border p-2">Course Name</th>
                        <th className="border p-2">Department</th>
                        <th className="border p-2">Teacher</th>
                        <th className="border p-2">Category</th>
                        <th className="border p-2">Semester</th>
                        <th className="border p-2">Credits</th>
                        <th className="border p-2">Start Date</th>
                        <th className="border p-2">End Date</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingCourses.length > 0 ? (
                        pendingCourses.map(course => (
                            <tr key={course.id} className="border">
                                <td className="p-2">
                                    {course.course_image ? (
                                        <Image 
                                            src={course.course_image} 
                                            alt="Course"
                                            width={60} 
                                            height={60} 
                                            className="rounded-md"
                                        />
                                    ) : (
                                        <Image
                                            src="/no-image.png" 
                                            alt="No Image"
                                            width={60} 
                                            height={60} 
                                            className="rounded-md"
                                        />
                                    )}
                                </td>
                                <td className="p-2">{course.course_code}</td>
                                <td className="p-2">{course.course_name}</td>
                                <td className="p-2">{course.department}</td>
                                <td className="p-2">{course.teacher_name}</td>
                                <td className="p-2">{course.course_category}</td>
                                <td className="p-2">{course.semester}</td>
                                <td className="p-2">{course.credit}</td>
                                <td className="p-2">{course.course_start_date}</td>
                                <td className="p-2">{course.course_end_date}</td>
                                <td className="p-2">{course.description}</td>
                                <td className="p-2">
                                    <button 
                                        className="bg-green-500 text-white px-4 py-1 rounded-md mr-2"
                                        onClick={() => handleCourseApproval(course.id, true)}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        className="bg-red-500 text-white px-4 py-1 rounded-md"
                                        onClick={() => handleCourseApproval(course.id, false)}
                                    >
                                        Reject
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Rejection Reason"
                                        className="ml-2 px-2 py-1 border rounded-md"
                                        value={rejectionReason[course.id] || ""}
                                        onChange={(e) => setRejectionReason(prev => ({ ...prev, [course.id]: e.target.value }))}
                                    />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={12} className="text-center p-4">No pending courses.</td></tr>
                    )}
                </tbody>
            </table>
        </DashboardLayout>
    );
}
