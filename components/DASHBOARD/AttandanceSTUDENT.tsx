'use client';
import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

interface Attendance {
    course_code: string;
    course_name: string;
    teacher_name: string;
    attendance_date: string;
    status: string;
}

interface TransformedRow {
    course_code: string;
    course_name: string;
    teacher_name: string;
    [date: string]: string; // e.g. "2024-04-01": "P" or "A"
}

export default function Attendance() {
    const [rowData, setRowData] = useState<TransformedRow[]>([]);
    const [columnDefs, setColumnDefs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await fetch("/api/courses/get-dashboardSTUDENT");
                if (!response.ok) throw new Error("Failed to fetch attendance");
                const data = await response.json();

                const attendance: Attendance[] = data.AllAttendance || [];

                // Get all unique dates
                const dates = Array.from(new Set(attendance.map(item => item.attendance_date))).sort();

                // Group by course_code + course_name + teacher_name
                const grouped: { [key: string]: TransformedRow } = {};
                attendance.forEach(item => {
                    const key = `${item.course_code}|${item.course_name}|${item.teacher_name}`;
                    if (!grouped[key]) {
                        grouped[key] = {
                            course_code: item.course_code,
                            course_name: item.course_name,
                            teacher_name: item.teacher_name
                        };
                    }
                    // grouped[key][item.attendance_date] = item.status.startsWith("P") ? "P" : "A";
                    // grouped[key][item.attendance_date] = item.status?.startsWith("P") ? "P" : "A";
                    grouped[key][item.attendance_date] = item.status?.[0]?.toUpperCase() === "P" ? "P" : "A";
                    


                });

                // Prepare row data and columns
                
                const transformedData = Object.values(grouped);

                const staticCols = [
                    { field: "course_code", headerName: "Code", pinned: "left", minWidth: 100 },
                    { field: "course_name", headerName: "Course", pinned: "left", minWidth: 150 },
                    { field: "teacher_name", headerName: "Teacher", pinned: "left", minWidth: 150 },
                ];

                const dynamicCols = dates.map(date => ({
                    field: date,
                    headerName: date,
                    minWidth: 100,
                    valueGetter: (params: { data: Record<string, any> }) => params.data[date] || "-", // fallback if undefined
                    cellStyle: (params: { value: string }) => ({
                        color: params.value === "A" ? "red" : "green",
                        fontWeight: "bold",
                        textAlign: "center"
                    })
                }));

                setColumnDefs([...staticCols, ...dynamicCols]);
                console.log("Transformed Row Data:", transformedData);

                setRowData(transformedData);
            } catch (err) {
                console.error("Error fetching attendance:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    if (loading) return <div>Loading Attendance...</div>;

    return (
        <>
            <h3>Attendance Overview</h3>
            <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={{
                        resizable: true,
                        sortable: true,
                        filter: true,
                        minWidth: 100,
                        flex: 1
                    }}
                    pagination={false}
                    headerHeight={40}
                    rowHeight={35}
                />
            </div>
        </>
    );
}
