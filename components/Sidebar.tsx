"use client";

import React from "react";
import Link from "next/link";
import { Role } from "@/types"; // Import Role type

// Define role-based navigation links
const roles: Record<Role, { name: string; path: string }[]> = {
    student: [{ name: "Student Dashboard", path: "/dashboard/student" }],
    teacher: [{ name: "Teacher Dashboard", path: "/dashboard/teacher" }],
    admin: [
        { name: "Admin Dashboard", path: "/dashboard/admin" },
        { name: "Manage Users", path: "/dashboard/admin/manage-users" }
    ],
    "master-admin": [ // Use "master-admin" as the key
        { name: "Master Admin Dashboard", path: "/dashboard/master-admin" },
        { name: "Approve Admins", path: "/dashboard/master-admin/approve-admins" }
    ],
};

// Sidebar component
const Sidebar: React.FC<{ role: Role }> = ({ role }) => {
    return (
        <div className="sidebar p-4 bg-gray-800 text-white min-h-screen">
            <h2 className="text-xl font-bold mb-4">
                {role.replace("-", " ").charAt(0).toUpperCase() + role.slice(1)} Dashboard
            </h2>
            <nav>
                {roles[role]?.map(link => (
                    <div key={link.name} className="mb-2">
                        <Link href={link.path} className="text-white hover:text-gray-300">
                            {link.name}
                        </Link>
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;