"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import Image from "next/image";

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

const APPROVABLE_ROLES = [1, 2]; // Replace hardcoded role IDs

export default function AdminDashboard() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const response = await axios.get<PendingUser[]>("/api/admin/get-pending-users");
            setPendingUsers(response.data.filter(user => APPROVABLE_ROLES.includes(user.role_id)));
        } catch (err) {
            console.error("Error fetching pending users:", err);
        }
    };

    const handleApproval = async (userId: number, approve: boolean) => {
        try {
            await axios.post("/api/admin/approve-user", { userId, approve });
            setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            alert(approve ? "User approved!" : "User rejected!");
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to process request.");
        }
    };

    return (
        <DashboardLayout role="admin">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <h2 className="mt-4 text-xl">Pending Approvals</h2>
            <button 
                className="mt-2 mb-4 bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={fetchPendingUsers}
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
                                            unoptimized // Allows Base64 images to work
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
                                <td className="p-2">{user.role_name}</td>
                                <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="p-2">
                                    <button 
                                        className="bg-green-500 text-white px-4 py-1 rounded-md mr-2"
                                        onClick={() => handleApproval(user.id, true)}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        className="bg-red-500 text-white px-4 py-1 rounded-md"
                                        onClick={() => handleApproval(user.id, false)}
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
        </DashboardLayout>
    );
}
