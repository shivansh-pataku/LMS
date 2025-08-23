'use client';
import { useEffect, useState, useRef, use } from "react";

import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { ColDef } from "ag-grid-community";
import { CellValueChangedEvent } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]); // Register AG Grid Modules


interface Scores {
    course_code: string;            
    // course_NAME: string;           
    ROLL_NO: string;                
    internal : number;                 
    midterm: number;                 
    endterm: number;                 
    total: number;         
  }


//   rowData: [ // Sample row data for the grid
//     { make: "Tesla", model: "Model Y", price: 64950, electric: true },
//     { make: "Ford", model: "F-Series", price: 33850, electric: false },
//     { make: "Toyota", model: "Corolla", price: 29600, electric: false },
//     { make: "Mercedes", model: "EQA", price: 48890, electric: true },
//     { make: "Fiat", model: "500", price: 15774, electric: false },
//     { make: "Nissan", model: "Juke", price: 20675, electric: false },
//   ],

//   columnDefs: [ // Sample column definitions for the grid
// Columns to be displayed (Should match rowData properties)

// const columnDefs: ColDef<Scores>[] = [

const UpdateButtonRenderer = (props: any) => {
  const handleUpdate = async () => {
    const data = props.node.data;
    try {
      const response = await fetch('/api/courses/update-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ROLL_NO: data.ROLL_NO,
          course_code: data.course_code,
          internal: data.internal,
          midterm: data.midterm,
          endterm: data.endterm,
          total: data.internal + data.midterm + data.endterm
        }),
      });

      if (!response.ok) throw new Error('Failed to update score');
      alert('Scores updated successfully!');
    } catch (error) {
      console.error('Error updating scores:', error);
      alert('Failed to update scores');
    }
  };

  return (
    <button 
      onClick={handleUpdate}
    //   className="GridButtons"
      style={{
        backgroundColor: '#14c125',
        color: 'white',
        padding: '8px 15px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '12px'
      }}
    >
      Update
    </button>
  );
};


// const columnDefs = [
//     // { field: "course_code", headerName : "Code",    sortable: true, filter: true, headerClass: "custom-header",}, //minWidth: 0, maxWidth: 90
//     // { field: "course_NAME", headerName : "Course",  sortable: true, filter: true, headerClass: "custom-header",}, // minWidth: 0, maxWidth: 90},
//     { field: "ROLL_NO",     headerName : "RollNo",  sortable: true, filter: true, headerClass: "custom-header",}, // minWidth: 0, maxWidth: 90},
//     { field: "internal",    headerName : "Internal",sortable: true, filter: true, headerClass: "custom-header", editable: true }, // minWidth: 0, maxWidth: 90},
//     { field: "midterm",     headerName : "Midterm", sortable: true, filter: true, headerClass: "custom-header", editable: true }, // minWidth: 0, maxWidth: 90},
//     { field: "endterm",     headerName : "Endterm", sortable: true, filter: true, headerClass: "custom-header", editable: true }, // minWidth: 0, maxWidth: 90},
//     { field: "total",       headerName : "Total",   sortable: true, filter: true, headerClass: "custom-header",}  // minWidth: 0, maxWidth: 90}
//   ]


const columnDefs = [
    { 
        field: "ROLL_NO",     
        headerName: "RollNo",  
        sortable: true, 
        filter: true, 
        headerClass: "custom-header"
    },
    { 
        field: "internal",    
        headerName: "Internal",
        sortable: true, 
        filter: true, 
        headerClass: "custom-header", 
        editable: true,
        valueParser: (params: any) => Number(params.newValue),
        valueSetter: (params: any)  => {
            const value = Number(params.newValue);
            if (value >= 0 && value <= 20) {
                params.data.internal = value;
                return true;
            }
            return false;
        }
    },
    { 
        field: "midterm",     
        headerName: "Midterm", 
        sortable: true, 
        filter: true, 
        headerClass: "custom-header", 
        editable: true,
        valueParser: (params: any)  => Number(params.newValue),
        valueSetter: (params: any)  => {
            const value = Number(params.newValue);
            if (value >= 0 && value <= 30) {
                params.data.midterm = value;
                return true;
            }
            return false;
        }
    },
    { 
        field: "endterm",     
        headerName: "Endterm", 
        sortable: true, 
        filter: true, 
        headerClass: "custom-header", 
        editable: true,
        valueParser: (params: any)  => Number(params.newValue),
        valueSetter: (params: any) => {
            const value = Number(params.newValue);
            if (value >= 0 && value <= 50) {
                params.data.endterm = value;
                return true;
            }
            return false;
        }
    },
    { 
        field: "total",       
        headerName: "Total",   
        sortable: true, 
        filter: true, 
        headerClass: "custom-header",
        valueGetter: (params: any)  => {
            return (params.data.internal || 0) + 
                   (params.data.midterm || 0) + 
                   (params.data.endterm || 0);
        }
    },
    {
        headerName: "Actions",
        cellRenderer: UpdateButtonRenderer,
        width: 100,
        sortable: false,
        filter: false,
        resizable: false
    }
];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function ScoresTEACHER() {

    const [scores, setScores] = useState<Scores[]>([]); // State to hold scores data of type scores as defined in interface but initially as an empty array 
    const [loading, setLoading] = useState(true); // State to manage loading state
    const gridRefAllotted = useRef<AgGridReact>(null); // Define gridRefAllotted using useRef
    const courseOptions = Array.from(new Set(scores.map(s => s.course_code))); // if course_code exists in the data
    const [selectedCourse, setSelectedCourse] = useState<string>(""); // State to hold the selected course

    useEffect(() => {

    const fetchCourses = async () => { // Function to fetch scores data from the API
                try{     
                        const response = await fetch("/api/courses/get-dashboardADMIN"); // Fetching data from the API endpoint
                        if (!response.ok) throw new Error("Failed to fetch scores"); // Check if the response is ok, if not throw an error}
                        
                        const data = await response.json(); // Convert the response to JSON and store in data
                        console.log("Fetched data:", data); // Log the fetched data for debugging

                        setScores(data.AllScores); // Update the scores state with the data from the API where AllScores is 
                        setLoading(false); // Set loading to false after data is fetched
                        }
                catch (error) {
                    console.error("Error fetching scores:", error); // Log the error if any occurs during fetch
                        }

        }

    fetchCourses(); // Call the function to fetch scores data

    }, []); // Empty dependency array means this effect runs once when the component mounts
    


return (
    <>

        <h4 className="classic_heading">Score Records & Management</h4>

        <select className="ibCLASSIC" style={{ margin: "10px 0px 10px 10px"}} value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
        <option value="">Select Course</option>
        {courseOptions.map((code) => (
            <option key={code} value={code}>{code}</option>
        ))}
        </select>


        
        <div className="ag-theme-alpine" style={{ height: 350, width: "100%" }}>
            <AgGridReact

                    ref={gridRefAllotted}
                    rowData={selectedCourse ? scores.filter(s => s.course_code === selectedCourse) : []}// rowData={scores} || Set the row data for the grid
                    columnDefs={columnDefs}
                    headerHeight={40}
                    pagination={true}
                    paginationPageSize={10}
                    // domLayout="autoHeight"
                    rowHeight={40} // Set row height to 50px

                    defaultColDef={{
                        flex: 1,
                        minWidth: 100,
                        resizable: true
                    }}
                    
            />
        </div>
    
    </>
)



}







