'use client';
import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { format } from 'date-fns';

import AddAttendance from "../AddAttendance";
ModuleRegistry.registerModules([AllCommunityModule]);
interface Attendance {
    course_name: string;
    roll_no: string;
    attendance_date: string;
    status: string;
}

interface TransformedRow {
    roll_no: string;
    [day: string]: string; // For D1, D2, etc.
}

export default function Attendance() {
    const [rowData, setRowData] = useState<TransformedRow[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);
    const [courseOptions, setCourseOptions] = useState<string[]>([]);
    const [columnDefs, setColumnDefs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

        // Add new useEffect to fetch available months
    useEffect(() => {
        const fetchMonths = async () => {
            try {
                const response = await fetch('/api/courses/get-dashboardTEACHER');
                if (!response.ok) throw new Error("Failed to fetch months");
                const data = await response.json();
                
                // Set available months from API response
                if (data.DoneMonths && Array.isArray(data.DoneMonths)) {
                    setAvailableMonths(data.DoneMonths);
                    // Set first month as default if none selected
                    if (data.DoneMonths.length > 0 && !selectedMonth) {
                        setSelectedMonth(data.DoneMonths[0]);
                    }
                    
                }
            } catch (err) {
                console.error("Error fetching months:", err);
            }
        };

        fetchMonths();
    }, []); // Run once on component mount

useEffect(() => {
    const fetchAttendance = async () => {
        if (!selectedMonth) return; // Don't fetch if no month selected

        try {
            setLoading(true);
            console.log('Fetching data for month:', selectedMonth); // Debug log

            // Update URL to include month parameter properly
            const response = await fetch(`/api/courses/get-dashboardTEACHER?month=${selectedMonth}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received data:', data); // Debug log

            const attendance: Attendance[] = data.AllAttendance || [];
            
            // Filter attendance data for selected month
            const filteredAttendance = attendance.filter(item => {
                const itemMonth = format(new Date(item.attendance_date), 'yyyy-MM');
                return itemMonth === selectedMonth;
            });

            // Get unique courses from filtered data
            const courses = Array.from(new Set(filteredAttendance.map(item => item.course_name)));
            setCourseOptions(courses);

            // Only process data if course is selected
            if (selectedCourse) {
                const rollNumbers = Array.from(new Set(filteredAttendance
                    .filter(item => item.course_name === selectedCourse)
                    .map(item => item.roll_no)))
                    .sort();

                const daysSet = new Set(filteredAttendance
                    .filter(item => item.course_name === selectedCourse)
                    .map(item => new Date(item.attendance_date).getDate()));
                const days = Array.from(daysSet).sort((a, b) => a - b);
                    
                    

                       if (courses.length > 0) {
                            setSelectedCourse(courses[0]);
                        }

                // Transform data for grid
                const transformed = rollNumbers.map(roll => {
                    const rowData: TransformedRow = { roll_no: roll };
                    days.forEach(day => {
                        const record = filteredAttendance.find(item => 
                            item.roll_no === roll && 
                            item.course_name === selectedCourse &&
                            new Date(item.attendance_date).getDate() === day
                        );
                        rowData[`D${day}`] = record?.status?.[0]?.toUpperCase() === "P" ? "P" : "A";
                    });
                    return rowData;
                });

                setColumnDefs([
                    { 
                        field: "roll_no", 
                        headerName: "Roll No", 
                        pinned: "left",
                        minWidth: 120 
                    },
                    ...days.map(day => ({
                        field: `D${day}`,
                        headerName: `D${day}`,
                        minWidth: 60,
                        cellStyle: (params: { value: string }) => ({
                            color: params.value === "A" ? "red" : "green",
                            fontWeight: "bold",
                            textAlign: "center"
                        })
                    }))
                ]);
                setRowData(transformed);
            } else {
                setRowData([]);
                setColumnDefs([]);
            }
        } catch (err) {
            console.error("Error fetching attendance:", err);
            setRowData([]);
            setColumnDefs([]);
        } finally {
            setLoading(false);
        }
    };

    fetchAttendance();
}, [selectedMonth, selectedCourse]); // Dependencies array includes both month and course

                return (
        <>
            <h4 className="classic_heading">Attendance Overview</h4> 
            <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
                {availableMonths.length > 0 ? (
                    <select 
                        className="ibCLASSIC"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {availableMonths.map(month => (
                            <option key={month} value={month}>
                                {format(new Date(month + '-01'), 'MMMM yyyy')}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div>No months available</div>
                )}

                <select 
                    className="ibCLASSIC"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                >
                    <option value="">{selectedCourse ? selectedCourse : "Select Course"}</option>
                    {courseOptions.map(course => (
                        <option key={course} value={course}>{course}</option>
                    ))}
                </select>
            </div>

            <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={{
                        resizable: true,
                        sortable: true,
                        flex: 1
                    }}
                    pagination={false}
                    headerHeight={40}
                    rowHeight={35}
                />
            </div>

            <AddAttendance />

        </>
    );
}