"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import Image from 'next/image';

type PendingAdmin = {
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

export default function MasterAdminDashboard() {
    const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingAdmins = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get<PendingAdmin[]>("/api/admin/get-pending-users");
            setPendingAdmins(response.data);
        } catch (err) {
            console.error("Error fetching pending admins:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingAdmins();
    }, [fetchPendingAdmins]);

    const handleApproval = async (userId: number, approve: boolean) => {
        try {
            await axios.post("/api/master-admin/approve-admin", { userId, approve });
            setPendingAdmins((prev) => prev.filter(user => user.id !== userId));
            alert(approve ? "Admin approved!" : "Admin rejected!");
        } catch (error) {
            console.error("Error updating admin:", error);
            alert("Failed to process request.");
        }
    };

    return (
        <DashboardLayout role="master-admin">
            <h1 className="text-2xl font-bold">Master Admin Dashboard</h1>
            <h2 className="mt-4 text-xl">Pending Admin Approvals</h2>

            {loading ? (
                <p className="mt-4 text-gray-600">Loading pending admins...</p>
            ) : pendingAdmins.length === 0 ? (
                <p className="mt-4 text-gray-600">No pending admins to approve.</p>
            ) : (
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
                        {pendingAdmins.map(user => (
                            <tr key={user.id} className="border">
                                <td className="p-2">
                                    {user.profile_image ? (
                                        <Image src={user.profile_image} alt="Profile" width={40} height={40} className="rounded-full" />
                                    ) : (
                                        <Image src="/no-image.png" alt="No Profile Image" width={40} height={40} className="rounded-full" />
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
                                        className="bg-green-500 text-white px-4 py-1 mr-2"
                                        onClick={() => handleApproval(user.id, true)}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        className="bg-red-500 text-white px-4 py-1"
                                        onClick={() => handleApproval(user.id, false)}
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </DashboardLayout>
    );
}
