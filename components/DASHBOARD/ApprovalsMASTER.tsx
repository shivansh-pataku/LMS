"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AgGridReact } from 'ag-grid-react';

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

interface ImageCellRendererParams {
    value: string | null;
}

interface ActionsCellRendererParams {
    data: { id: number };
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
}

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

export default function MasterAdminDashboard() {
    const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
    
    const [adminColumnDefs] = useState([
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
        { field: 'role_name', headerName: 'Role', flex: 1 },
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
                onApprove: (id: number) => handleApproval(id, true),
                onReject: (id: number) => handleApproval(id, false)
            },
            minWidth: 200
        }
    ]);

    useEffect(() => {
        fetchPendingAdmins();
    }, []);

    const fetchPendingAdmins = async () => {
        try {
            const response = await axios.get<PendingAdmin[]>("/api/admin/get-pending-users");
            setPendingAdmins(response.data);
        } catch (err) {
            console.error("Error fetching pending admins:", err);
        }
    };

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
        <>
            <h4 className="classic_heading" style={{ position: "sticky" }}>
                Approve Administrators
            </h4>
            
            <button 
                className="JUSTbutton"
                onClick={fetchPendingAdmins}
            >
                Refresh List
            </button>

            <h4 className="classic_SUBheading" style={{ position: "sticky" }}>
                Pending Admin Approvals
            </h4>
            
            <div className="ag-theme-quartz" style={{ height: 500, width: '100%' }}>
                <AgGridReact
                    rowData={pendingAdmins}
                    columnDefs={adminColumnDefs}
                    defaultColDef={{
                        sortable: true,
                        filter: true,
                        resizable: true,
                        minWidth: 100,
                        cellStyle: { 
                            display: 'flex', 
                            justifyContent: 'left', 
                            alignItems: 'center', 
                            padding: "10px", 
                            innerHeight: "100px", 
                            fontSize: "14px" 
                        },
                    }}
                    rowHeight={100}
                    suppressCellFocus={true}
                />
            </div>
        </>
    );
}