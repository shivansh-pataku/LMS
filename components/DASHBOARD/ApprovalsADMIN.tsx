"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AgGridReact } from 'ag-grid-react';
 

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

// Properly type the params for cell renderers
interface ImageCellRendererParams {
    value: string | null;
}

interface ActionsCellRendererParams {
    data: { id: number };
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
}

// Ensure cell renderers handle null values properly
const ImageCellRenderer = (params: ImageCellRendererParams) => {
    const imageUrl = params.value || '/no-image.png';
    return (
        <img 
            src={imageUrl} 
            alt="Profile" 
            style={{ width: '80px', height: '80px', borderRadius: '10px', margin: '5px' }}
        />
    );
};

const ActionsCellRenderer = (params: ActionsCellRendererParams) => {
    if (!params.data) return null;
    
    return (
        <div>
            <button 
                className="GridButtons"
                onClick={() => params.onApprove(params.data.id)}
            >
                Approve
            </button>
            <button 
                className="GridButtons"
                onClick={() => params.onReject(params.data.id)}
            >
                Reject
            </button>
        </div>
    );
};

export default function AdminDashboard() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([]);
    const [rejectionReason, setRejectionReason] = useState<{ [key: number]: string }>({});
    
    // Define column definitions outside of render to prevent re-creation on each render
    const [userColumnDefs] = useState([
        { 
            field: 'profile_image', 
            headerName: 'Profile', 
            cellRenderer: ImageCellRenderer,
            width: 80,
            sortable: false,
            filter: false,
            suppressMenu: true,
        },
        { 
            field: 'name', 
            headerName: 'Name',
            valueGetter: (params: any) => {
                if (!params.data) return '';
                return `${params.data.first_name} ${params.data.last_name}`;
            },
            flex: 1
        },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'contact', headerName: 'Contact', flex: 1 },
        { field: 'department', headerName: 'Department', flex: 1 },
        { 
            field: 'role_id', 
            headerName: 'Role',
            valueGetter: (params: any) => {
                if (!params.data) return '';
                return params.data.role_id === 1 ? "Student" : "Teacher";
            },
            flex: 1
        },
        { 
            field: 'created_at', 
            headerName: 'Joined On',
            valueFormatter: (params: any) => {
                if (!params.value) return '';
                return new Date(params.value).toLocaleDateString();
            },
            flex: 1
        },
        {
            headerName: 'Actions',
            cellRenderer: ActionsCellRenderer,
            cellRendererParams: {
                onApprove: (id: number) => handleUserApproval(id, true),
                onReject: (id: number) => handleUserApproval(id, false)
            },
            minWidth: 200
        }
    ]);

    // Courses Grid Column Definitions
    const [courseColumnDefs] = useState([
        {
            field: 'course_image',
            headerName: 'Image',
            cellRenderer: ImageCellRenderer,
            width: 80
        },
        { field: 'course_code', headerName: 'Code', flex: 1 },
        { field: 'course_name', headerName: 'Name', flex: 1 },
        { field: 'department', headerName: 'Department', flex: 1 },
        { field: 'teacher_name', headerName: 'Teacher', flex: 1 },
        { field: 'course_category', headerName: 'Category', flex: 1 },
        { field: 'semester', headerName: 'Semester', width: 100 },
        { field: 'credit', headerName: 'Credits', width: 100 },
        { 
            field: 'course_start_date', 
            headerName: 'Start Date',
            valueFormatter: (params: any) => {
                if (!params.value) return '';
                return new Date(params.value).toLocaleDateString();
            },
            flex: 1
        },
        {
            headerName: 'Actions',
            cellRenderer: ActionsCellRenderer,
            cellRendererParams: {
                onApprove: (id: number) => handleCourseApproval(id, true),
                onReject: (id: number) => handleCourseApproval(id, false)
            },
            minWidth: 200
        }
    ]);

    useEffect(() => {
        fetchPendingUsers();
        fetchPendingCourses();
    }, []);

    // Fetch Pending Users
    const fetchPendingUsers = async () => {
        try {
            const response = await axios.get<PendingUser[]>("/api/admin/get-pending-users");
            console.log("Pending Users API Response:", response.data);
            setPendingUsers(response.data.filter(user => APPROVABLE_ROLES.includes(user.role_id)));
        } catch (err) {
            console.error("Error fetching pending users:", err);
        }
    };

    // Fetch Pending Courses
    const fetchPendingCourses = async () => {
        try {
            const response = await axios.get<PendingCourse[]>("/api/admin/get-pending-courses");
            setPendingCourses(response.data);
        } catch (err) {
            console.error("Error fetching pending courses:", err);
        }
    };

    // Handle User Approval
    const handleUserApproval = async (userId: number, approve: boolean) => {
        try {
            await axios.post("/api/admin/approve-user", { userId, approve });
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
        // < DashboardLayout role="admin">
        <>
        
                    <h4 className="classic_heading" style={{ position: "sticky" }}>Approve Users and  Courses</h4>
            <button 
                className="JUSTbutton"
                onClick={() => { fetchPendingUsers(); fetchPendingCourses(); }}
            >
                Refresh List
            </button>

            <h4 className="classic_SUBheading" style={{ position: "sticky" }}>Pending User Approvals</h4>
            <div className="ag-theme-quartz" style={{ height: 500, width: '100%' }}>
 
                    <AgGridReact
                        rowData={pendingUsers}
                        columnDefs={userColumnDefs}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true,
                            // maxWidth: 200,
                            minWidth: 100,
                            cellStyle: { display: 'flex', justifyContent: 'left', alignItems: 'center', padding:"10px", innerHeight:"100px", fontSize:"14px" },
                        }}
                        rowHeight={100}
                        suppressCellFocus={true}
                    />
 
            </div>
 
            <h4 className="classic_SUBheading" style={{ position: "sticky" }}>Pending Course Approvals</h4>
            <div className="ag-theme-quartz" style={{ height: 500, width: '100%' }}>
 
                    <AgGridReact
                        rowData={pendingCourses}
                        columnDefs={courseColumnDefs}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true,
                            // maxWidth: 200,
                            minWidth: 100,
                             cellStyle: { display: 'flex', justifyContent: 'left', alignItems: 'center', padding:"10px", padding:"10px", innerHeight:"100px" },
     
                        }}
                        rowHeight={100}
                        suppressCellFocus={true}
                    />
 
            </div>
             {/* </DashboardLayout> */} 
    </>
    );
}