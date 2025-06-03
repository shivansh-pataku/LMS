'use client';
import AddCourse from '../AddCourse';
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState, useRef } from "react";
import {
  AllCommunityModule,
  ModuleRegistry,
  ColDef,
  ICellRendererParams,
} from "ag-grid-community";
import { useRouter } from "next/navigation"; // npm install next/navigation
import Image from "next/image"; // Import next/image

// Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface CourseImageObject {
  type: string;
  data: number[];
}

interface Course {
  id: number;
  course_code: string;
  course_name: string;
  credit: number;
  department: string;
  semester: number;
  course_category: string;
  description: string;
  teacher_name: string;
  teacher_email: string;
  annotation?: string;
  course_start_date: string;
  course_image?: string | CourseImageObject | null;
  created_at?: string;
}

// Helper function to convert buffer-like data array to Base64 Data URI
function arrayBufferToImageSrc(
  imageData: CourseImageObject | string | null | undefined,
  mimeType: string = "image/jpeg"
): string {
  if (!imageData) return "/no-image.png";
  if (typeof imageData === "string") {
    if (imageData.startsWith("data:") || imageData.startsWith("http")) {
      return imageData;
    }
    return imageData; // For relative paths like "/no-image.png"
  }

  if (
    typeof imageData === "object" &&
    imageData.data &&
    Array.isArray(imageData.data)
  ) {
    let binary = "";
    const bytes = new Uint8Array(imageData.data);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64String = window.btoa(binary);
    return `data:${mimeType};base64,${base64String}`;
  }
  return "/no-image.png";
}

// Cell Renderer for the Course Image using next/image
const CourseImageRenderer = (params: ICellRendererParams<Course>) => {
  const imageSrc = arrayBufferToImageSrc(params.data?.course_image);
  const courseName = params.data?.course_name || "Course Image";
  const isBase64 = imageSrc.startsWith("data:");

  return (
    <div
      style={{
        width: "50px",
        height: "30px",
        position: "relative",
        marginTop: "2px",
      }}
    >
      <Image
        src={imageSrc}
        alt={courseName}
        layout="fill"
        objectFit="cover"
        className="rounded-sm"
        unoptimized={isBase64}
        onError={() => {
          // Prefixed 'e' with '_'
          console.warn(
            `Failed to load image for ${courseName}: ${imageSrc}. Check if the image exists or if the path is correct, especially for /no-image.png in the public folder.`
          );
        }}
      />
    </div>
  );
};

// Cell Renderer for the Manage button
const ManageButtonRenderer = (params: ICellRendererParams<Course>) => {
  const router = useRouter();

  const handleManageClick = () => {
    const courseData = params.data;
    if (!courseData || typeof courseData.id === "undefined") {
      console.error(
        "Course data or course ID (id) is missing from row data:",
        courseData
      );
      alert("Error: Course ID (id) is missing. Cannot proceed.");
      return;
    }
    const courseId = courseData.id;

    const queryParams = new URLSearchParams();
    for (const key in courseData) {
      if (Object.prototype.hasOwnProperty.call(courseData, key)) {
        const value = courseData[key as keyof Course];
        if (value !== null && typeof value !== "undefined") {
          if (key === "course_image") {
            let imageValueToConsider = value;
            // If it's an object, convert it first to see if it becomes Base64
            if (
              typeof value === "object" &&
              value !== null &&
              "data" in value &&
              Array.isArray((value as CourseImageObject).data)
            ) {
              imageValueToConsider = arrayBufferToImageSrc(
                value as CourseImageObject
              );
            }

            // Only append course_image if it's a string AND NOT a Base64 data URI
            if (
              typeof imageValueToConsider === "string" &&
              !imageValueToConsider.startsWith("data:")
            ) {
              queryParams.append(key, imageValueToConsider);
            } else {
              // If it's an object that converted to Base64, or already a Base64 string, skip it.
              console.warn(
                `Skipping large course_image (object or Base64 data: ${
                  typeof value === "string"
                    ? value.substring(0, 30) + "..."
                    : "object"
                }) in query parameters to prevent HTTP 431 error.`
              );
            }
          } else {
            // Append other fields
            queryParams.append(key, String(value));
          }
        }
      }
    }
    router.push(`/${courseId}?${queryParams.toString()}`);
  };

  return (
    <button
      onClick={handleManageClick}
      style={{ padding: "5px 10px", cursor: "pointer", fontSize: "12px" }}
    >
      Manage
    </button>
  );
};

export default function Courses() {
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [allottedCourses, setAllottedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const gridRefAllotted = useRef<AgGridReact<Course>>(null);
  const gridRefSuggested = useRef<AgGridReact<Course>>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses/get-courses");
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        console.log("Data from /api/courses/get-courses:", data);
        setAllottedCourses(data.approvedCourses || []);
        setSuggestedCourses(data.pendingCourses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Explicitly type the elements of initialBaseCols to include optional sortable/filter
  type BaseColDefType = Omit<ColDef<Course>, "sortable" | "filter"> & {
    sortable?: boolean;
    filter?: boolean;
  };

  const initialBaseCols: readonly BaseColDefType[] = [
    {
      field: "id",
      headerName: "Sr.",
      minWidth: 80,
      maxWidth: 80,
      cellClass: "course-id-cell",
      sortable: true, // Explicitly define
      filter: true, // Explicitly define
    },
    {
      field: "course_image",
      headerName: "Image",
      cellRenderer: CourseImageRenderer,
      minWidth: 80,
      maxWidth: 100,
      autoHeight: true,
      sortable: false, // Already defined, but good for consistency
      filter: false, // Already defined
    },
    {
      field: "course_code",
      headerName: "Code",
      minWidth: 120,
      maxWidth: 120,
      sortable: true,
      filter: true,
    },
    {
      field: "course_name",
      headerName: "Course Name",
      minWidth: 200,
      sortable: true,
      filter: true,
    },
    {
      field: "semester",
      headerName: "Sem",
      minWidth: 90,
      maxWidth: 90,
      sortable: true,
      filter: true,
    },
    {
      field: "teacher_name",
      headerName: "Teacher Assigned",
      minWidth: 220,
      sortable: true,
      filter: true,
    },
    {
      field: "description",
      headerName: "Description",
      editable: true,
      minWidth: 180,
      sortable: true,
      filter: true,
    },
    {
      field: "course_category",
      headerName: "Category",
      minWidth: 140,
      sortable: true,
      filter: true,
    },
    {
      field: "credit",
      headerName: "Credit",
      minWidth: 130,
      maxWidth: 130,
      sortable: true,
      filter: true,
    },
    {
      field: "course_start_date",
      headerName: "Start Date",
      minWidth: 150,
      sortable: true,
      filter: true,
    },
    {
      field: "created_at",
      headerName: "Created On",
      sort: "desc" as "asc" | "desc" | undefined,
      minWidth: 150,
      valueFormatter: (params: { value: string | undefined }) =>
        params.value ? new Date(params.value).toLocaleDateString() : "",
      sortable: true, // Default sort is 'desc', but it's still sortable
      filter: true,
    },
  ] as const;

  const baseColumnDefs: ColDef<Course>[] = initialBaseCols.map((col) => ({
    // Removed explicit type for col here as initialBaseCols is now more consistently typed
    ...col,
    // Default sortable/filter are now directly from col, or true if undefined (though they should be defined now)
    sortable: col.sortable !== undefined ? col.sortable : true,
    filter: col.filter !== undefined ? col.filter : true,
    headerClass: "custom-header",
  }));

  const allottedColumnDefs: ColDef<Course>[] = [
    ...baseColumnDefs,
    {
      headerName: "Manage",
      cellRenderer: ManageButtonRenderer,
      minWidth: 100,
      maxWidth: 120,
      sortable: false,
      filter: false,
      resizable: false,
    },
  ];

  const suggestedColumnDefs: ColDef<Course>[] = [...baseColumnDefs];

  if (loading) return <div>Loading courses...</div>;

  return (
    <>
      <h3>Courses</h3> <AddCourse />
      <h4 className="classic_heading">Allotted Courses</h4>
      <div className="ag-theme-alpine" style={{ height: 350, width: "100%" }}>
        <AgGridReact<Course>
          ref={gridRefAllotted}
          rowData={allottedCourses}
          columnDefs={allottedColumnDefs}
          headerHeight={40}
          pagination={true}
          paginationPageSize={10}
          rowHeight={40}
          defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
        />
      </div>
      <h4 className="classic_heading">Suggested Courses</h4>
      <div className="ag-theme-alpine" style={{ height: 350, width: "100%" }}>
        <AgGridReact<Course>
          ref={gridRefSuggested}
          rowData={suggestedCourses}
          columnDefs={suggestedColumnDefs}
          headerHeight={40}
          pagination={false}
          paginationPageSize={10}
          domLayout="autoHeight"
          rowHeight={40}
          defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
        />
      </div>
    </>
  );
}
