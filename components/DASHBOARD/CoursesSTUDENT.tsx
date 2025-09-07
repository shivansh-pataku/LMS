"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import styles from "../HOME/Container_Classes.module.css";
import Image from "next/image";
import StudentCourses from "./StudentCourses"; // Verify this path and filename are correct
import {
  processImageSrc,
  CourseImageObject as UtilCourseImageObject,
} from "@/utils/imageUtils"; // Added import

// Type for image data that might come as an object (e.g., from a buffer)
// Use the imported CourseImageObject type
type CourseImageObject = UtilCourseImageObject;

// Type for the raw course object directly from the API
type CourseFromAPI = {
  id?: string;
  course_code: string;
  course_name: string;
  credit: number;
  department: string;
  course_category: string;
  description: string;
  teacher_name: string;
  course_start_date?: string;
  course_end_date?: string;
  course_image?: string | CourseImageObject | null; // Updated type
};

// Final Course type used within this component
export type Course = {
  id: string;
  course_code: string;
  course_name: string;
  credit: number;
  department: string;
  course_category: string;
  description: string;
  teacher_name: string;
  course_start_date?: string;
  course_end_date?: string;
  course_image?: string | CourseImageObject | null; // Updated type
};

export default function Container_Classes() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses/get-dashboardSTUDENT");
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        const data: { AllCourses: CourseFromAPI[] } = await response.json();

        if (!data.AllCourses) {
          console.warn("API response did not contain AllCourses array:", data);
          setAllCourses([]);
          throw new Error("Fetched data is not in the expected format.");
        }

        const coursesWithId: Course[] = data.AllCourses.map(
          (apiCourse: CourseFromAPI) => ({
            id: apiCourse.id || apiCourse.course_code, // Ensure ID
            course_code: apiCourse.course_code,
            course_name: apiCourse.course_name,
            credit: apiCourse.credit,
            department: apiCourse.department,
            course_category: apiCourse.course_category,
            description: apiCourse.description,
            teacher_name: apiCourse.teacher_name,
            course_start_date: apiCourse.course_start_date,
            course_end_date: apiCourse.course_end_date,
            course_image: apiCourse.course_image, // Keep as is, will be processed in render
          })
        );
        setAllCourses(coursesWithId);
        console.log("Newly fetched courses data (with IDs):", coursesWithId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(`Failed to fetch courses: ${errorMessage}`);
        console.error("Error fetching courses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleBackToList = () => {
    setSelectedCourse(null);
  };

  if (isLoading)
    return <div style={{ padding: "20px" }}>Loading courses...</div>;
  if (error)
    return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;

  if (selectedCourse) {
    return (
      <div>
        <button
          type="button"
          onClick={handleBackToList}
          style={{
            margin: "20px",
            padding: "10px 15px",
            cursor: "pointer",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f8f9fa",
          }}
        >
          &larr; Back to Courses
        </button>
        <StudentCourses course={selectedCourse} />
      </div>
    );
  }

  if (!allCourses.length)
    return <div style={{ padding: "20px" }}>No courses available.</div>;

  return (
    <>
      <h4
        className="classic_heading"
        style={{
          position: "sticky",
          top: 0,
          background: "white",
          zIndex: 1,
          padding: "15px 20px",
          margin: 0,
          borderBottom: "1px solid #eee",
        }}
      >
        Your Courses
      </h4>
      <div className={styles.Container_Classes}>
        {allCourses.map((course) => {
          // Process the course_image using the helper function
          const imageSrcForComponent = processImageSrc(course.course_image); // Use imported utility

          return (
            <div key={course.id} className={styles.item}>
              <div className={styles.image}>
                <ImageWithFallback
                  src={imageSrcForComponent}
                  fallbackSrc="/default.jpg" // Ultimate fallback for ImageWithFallback
                  alt={`Image for ${course.course_name}`}
                  width={200}
                  height={120}
                />
              </div>
              <div className={styles.descriptionBOX}>
                <span
                  className={styles.description}
                  style={{
                    fontWeight: "400",
                    fontSize: "17px",
                    color: "black",
                  }}
                >
                  {course.teacher_name}
                </span>
                <span
                  className={styles.description}
                  style={{
                    fontWeight: "400",
                    fontSize: "15px",
                    color: "grey",
                    width: "auto",
                    minWidth: "60px",
                    textAlign: "right",
                    marginLeft: "auto",
                  }}
                >
                  {course.course_code}
                </span>
                <span
                  className={styles.description}
                  style={{
                    fontWeight: "700",
                    fontSize: "22px",
                    color: "black",
                    height: "auto",
                    marginTop: "8px",
                    cursor: "pointer",
                    textDecoration: "underline", // MAKE IT BETTER
                    display: "block",
                  }}
                  onClick={() => handleCourseClick(course)}
                >
                  {course.course_name}
                </span>
                <p
                  className={styles.description}
                  style={{
                    fontWeight: "500",
                    fontSize: "17px",
                    color: "grey",
                    height: "auto",
                    marginTop: "3px",
                  }}
                >
                  {course.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

interface ImageWithFallbackProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  width: number;
  height: number;
  [key: string]: unknown;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  width,
  height,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    // If the src prop is empty or evaluates to a path that should use fallback (e.g. "/no-image.png" if that's a convention)
    // set it to that src first. If it's truly empty or meant to be fallback, set to fallbackSrc.
    // The primary src (after processing by processCourseImage) is attempted first.
    // If processCourseImage already returned a fallback like "/no-image.png", that will be 'src' here.
    if (src && src.trim() !== "" && src !== "/no-image.png") {
      // Avoid directly setting to fallback if src is a valid attempt
      setImgSrc(src);
    } else {
      setImgSrc(fallbackSrc); // If src is empty, or is the placeholder from processCourseImage, use ultimate fallback
    }
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
      style={{ objectFit: "cover" }}
      unoptimized={imgSrc.startsWith("data:")} // Add unoptimized for base64 images
    />
  );
};

