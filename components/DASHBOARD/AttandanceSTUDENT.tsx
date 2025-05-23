'use client';
import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { format } from 'date-fns'
ModuleRegistry.registerModules([AllCommunityModule]);

interface Attendance { //data type for the attendance fetched from the API, defines what a single attendance object looks like.
    // course_code: string;
    course_name: string;
    // teacher_name: string;
    attendance_date: string;// modify it to take ony day and rename it to "D" + day of date : then syntax will be "D1", "D2", "D3" etc.
    status: string;
    days: string; // e.g. "P" or "A"; this field is used to determine the status of attendance for each date.
}

interface TransformedRow {  
    //data type for the transformed attendance data, defines what a single transformed attendance object looks like.
    // course_code: string;
    course_name: string;
    teacher_name: string;
    [date: string]: string; // e.g. "2024-04-01": "P" or "A"; '[date: string]: string' means that the object can have any number of additional properties with string keys and string values.
    // This allows for dynamic property names based on attendance dates.
    // where date is a string taken from the attendance_date field of the Attendance interface used to create dynamic columns in the grid.
}

export default function Attendance() {
    const [rowData, setRowData] = useState<TransformedRow[]>([]); //here transformed data is used to store the attendance data in a format suitable for the grid.
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM')); // Default to current month
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);// new
    const [columnDefs, setColumnDefs] = useState<any[]>([]); //
    const [loading, setLoading] = useState(true);


                useEffect(() => {
                const fetchAttendance = async () => {
                try {
                // const response = await fetch("/api/courses/get-dashboardSTUDENT");
                const response = await fetch(`/api/courses/get-dashboardSTUDENT?month=${selectedMonth}`);
                if (!response.ok) throw new Error("Failed to fetch attendance");
                const data = await response.json();

                const attendance: Attendance[] = data.AllAttendance || [];

                const months = Array.from(
                    new Set( attendance.map(item => format(new Date(item.attendance_date), 'yyyy-MM') ))).sort();//new date is a constructor that takes a date string and returns a date object
                    console.log("Available Months:", months);
                    setAvailableMonths(months);

                const days = Array.from(new Set(attendance.map(item => new Date(item.attendance_date).getDate()))  ).sort((a, b) => a - b);
                // ** get only day of the month from the date object
                // sort((a, b) => a - b) : means that the array is sorted in ascending order. where a and b are the two elements being compared.

                // Get all unique dates
                // item means that we are iterating over the attendance array and for each item, we are getting the attendance_date property.
                // statement to get all unique dates from the attendance data and sort them in ascending order.
                // where attendance.map (item => item.attendance_date) creates an array of attendance dates from the attendance data.
                // syntax: Array.from(new Set(array)) creates a new array with name dates that contains only the unique values from the input array and input array is attendance.map (item => item.attendance_date). 
                // Group by course_code + course_name + teacher_name
                const dates = Array.from(new Set(attendance.map(item => item.attendance_date))).sort();
                const grouped: { [key: string]: TransformedRow } = {};
                attendance.forEach(item => {
                    // const key = `${item.course_code}|${item.course_name}|${item.teacher_name}`;
                    const key = `${item.course_name}`;

                    if (!grouped[key]) {
                        grouped[key] = {course_name: item.course_name,teacher_name: "",}; }
                            // course_code: item.course_code,
                            // teacher_name: item.teacher_name || "", // Provide a default value or use item.teacher_name if available
                             // Provide a default value or use item.teacher_name if available
                        grouped[key][item.attendance_date] = item.status?.[0]?.toUpperCase() === "P" ? "P" : "A";

                });

                // Prepare row data and columns
                
                const transformedData = Object.values(grouped);

                const staticCols = [
                    // { field: "course_code", headerName: "Code", pinned: "left", minWidth: 100 },
                    { field: "course_name", headerName: "Course", pinned: "left", minWidth: 150 },
                    // { field: "teacher_name", headerName: "Teacher", pinned: "left", minWidth: 150 },
                    ];

                const dynamicCols = dates.map(date => {
                    // Get just the day number from the date
                    const dayNumber = new Date(date).getDate();
                    return {
                        field: date,  // Keep original date as field for data binding
                        headerName: `D${dayNumber}`,  // Show D1, D2, etc.
                        minWidth: 70,  // Reduced width since showing less text
                        textAlign: "center",
                        cellClass: "text-center", // Optional: Add a class for center alignment
                        valueGetter: (params: { data: Record<string, any> }) => params.data[date] || "-",
                        cellStyle: (params: { value: string }) => ({
                            color: params.value === "A" ? "red" : "green",
                            fontWeight: "bold",
                            textAlign: "center"
                        })
                    };
                });


                    // const dynamicCols = dates.map(date => { // this is function 
                    //   const dayNumber = new Date(date).getDate();
                    //   return {
                    //         field: `D${dayNumber}`,//field: date,
                    //         headerName: `D${dayNumber}`,//headerName: date,
                    //         minWidth: 100,
                    //                         valueGetter: (params: { data: Record<string, any> }) => params.data[`D${dayNumber}`] || "-",
                    //                         // valueGetter: (params: { data: Record<string, any> }) => params.data[date] || "-", // fallback if undefined
                                            
                    //                                                 cellStyle: (params: { value: string }) => ({
                    //                                                     color: params.value === "A" ? "red" : "green",
                    //                                                     fontWeight: "bold",
                    //                                                     textAlign: "center",    
                    //                                                 }),
                    //          };
                    //  });

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
                }, [selectedMonth]);// not Empty dependency array rather selectedMonth is used as a dependency to refetch data when selectedMonth changes the month. In theory this is called as a dependency array. where variable in square brackets is used as a dependency to refetch data when selectedMonth changes the month. In theory this is called as a dependency array.



                                                    useEffect(() => {
                                                    const fetchAvailableMonths = async () => {
                                                        try {
                                                            const response = await fetch('/api/courses/get-dashboardSTUDENT');
                                                            if (!response.ok) throw new Error("Failed to fetch months");
                                                            const data = await response.json();
                                                            const months = data.DoneMonths || [];// ACCEPTING month strings IN THE RESULT
                                                            console.log("Fetched Months:", months);
                                                            setAvailableMonths(months);
                                                            
                                                            if (months.length > 0 && !selectedMonth) { //if !selectedMonth turns out to be true then set the selected month to the last available month
                                                                setSelectedMonth(months[months.length + 4]);// Set initial month to the last available month //
                                                            }
                                                        } catch (err) {
                                                            console.error("Error fetching months:", err);
                                                        }
                                                    };

                                                            fetchAvailableMonths();
                                                        }); // Run once on component mount if added :  ,[setAvailableMonths] otherwise it will run on every change in selection

    if (loading) return <div>Loading Attendance...</div>;

        const getMonthLabel = (monthValue: string) => {
        const date = new Date(monthValue + '-01'); // Add day for valid date
        return format(date, 'MMMM yyyy'); // Format as "January 2024"
    };

    return (
        <>
            <h4 className="classic_heading">Attendance Overview</h4>
                <div >
                        <select className={"ibCLASSIC"} style={{ margin:"10px 0px 10px 10px"}} value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}>
                        {availableMonths.map(month => (
                                <option key={month} value={month}>
                                    {getMonthLabel(month)} {/* // Format as "January 2024" */}
                                </option>
                            ))}
                        </select>
                </div>
            


            {/* <div >

                <label htmlFor="month"> </label>
                <input
                    type="month"
                    className={"ibCLASSIC"} style={{ margin:"10px 0px 10px 10px"}}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                />
            </div>  */}

            <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={{
                        resizable: true,
                        sortable: true,
                        // filter: true,
                        minWidth: 60,
                        // maxWidth: 60,
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
