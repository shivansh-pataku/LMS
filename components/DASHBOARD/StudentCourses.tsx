"use client";

import { useEffect, useState, Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Youtube,
  Video,
  Loader2,
  GripVertical,
  // Megaphone, // Commented out as announcements are disabled
} from "lucide-react";
import styles from "@/app/[courseId]/page.module.css"; // Adjust if styles are generic

import LiveClassDashboard from "@/app/[courseId]/_components/live-class/LiveClassDashboard";

export interface Course {
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
}

type SectionStatus = "public" | "private";
type LessonStatus = "public" | "private" | "preview";
type ResourceType =
  | "pdf"
  | "video_file"
  | "youtube_link"
  | "text_content"
  | null;

const resourceTypeOptions: Array<{ value: ResourceType; label: string }> = [
  { value: null, label: "None" },
  { value: "pdf", label: "PDF" },
  { value: "video_file", label: "Video File" },
  { value: "youtube_link", label: "YouTube Link" },
  { value: "text_content", label: "Text Content" },
];

interface Lesson {
  id: string;
  name: string;
  description: string | null;
  resourceType: ResourceType;
  resourceUrl: string | null;
  content: string | null;
  order: number;
  status: LessonStatus;
}

interface Section {
  id: string;
  name: string;
  description: string;
  lessons: Lesson[];
  status: SectionStatus;
  order: number;
}

// Commented out Announcement Type as it's not being used
// interface Announcement {
//   id: string;
//   title: string;
//   content: string;
//   createdAt: string; // Assuming ISO date string
//   updatedAt: string;
//   courseId: string;
//   userId: string; // User who created it
// }

interface StudentCoursesProps {
  course: Course;
}

function StudentCourseContent({ course }: StudentCoursesProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsError, setSectionsError] = useState<string | null>(null);

  // State for Announcements - Commented out
  // const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  // const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  // const [announcementsError, setAnnouncementsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      if (!course || !course.id) {
        setSectionsError("Course ID is missing to fetch sections.");
        return;
      }
      setSectionsLoading(true);
      setSectionsError(null);
      try {
        const response = await fetch(`/api/courses/${course.id}/sections`);
        if (!response.ok) {
          let message = `API error fetching sections: ${response.status} ${response.statusText}`;
          try {
            const errorBody = await response.json();
            message = errorBody.message || errorBody.error || message;
          } catch {
            console.warn(
              "Could not parse error response body as JSON for fetching sections."
            );
          }
          throw new Error(message);
        }
        const data: Section[] = await response.json();
        const studentViewSections = data
          .filter((section) => section.status === "public")
          .map((sectionItem) => ({
            ...sectionItem,
            lessons: sectionItem.lessons.filter(
              (lesson) =>
                lesson.status === "public" || lesson.status === "preview"
            ),
          }))
          .sort((a, b) => a.order - b.order);
        setSections(studentViewSections);
      } catch (err) {
        console.error("Error fetching sections:", err);
        setSectionsError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching sections."
        );
      } finally {
        setSectionsLoading(false);
      }
    };

    if (course?.id) {
      fetchSections();
    }
  }, [course]);

  // useEffect to fetch announcements - Commented out
  // useEffect(() => {
  //   const fetchAnnouncements = async () => {
  //     if (!course || !course.id) {
  //       // setAnnouncementsError("Course ID is missing to fetch announcements.");
  //       return;
  //     }
  //     // setAnnouncementsLoading(true);
  //     // setAnnouncementsError(null);
  //     try {
  //       const response = await fetch(`/api/courses/${course.id}/announcements`);
  //       if (!response.ok) {
  //         let message = `API error fetching announcements: ${response.status} ${response.statusText}`;
  //         try {
  //           const errorBody = await response.json();
  //           message = errorBody.message || errorBody.error || message;
  //         } catch {
  //           console.warn("Could not parse error response body as JSON for fetching announcements.");
  //         }
  //         throw new Error(message);
  //       }
  //       const data: Announcement[] = await response.json();
  //       data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  //       // setAnnouncements(data);
  //     } catch (err) {
  //       console.error("Error fetching announcements:", err);
  //       // setAnnouncementsError(
  //       //   err instanceof Error
  //       //     ? err.message
  //       //     : "An unknown error occurred while fetching announcements."
  //       // );
  //     } finally {
  //       // setAnnouncementsLoading(false);
  //     }
  //   };

  //   if (course?.id) {
  //     fetchAnnouncements();
  //   }
  // }, [course]);

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case "pdf":
        return <FileText size={16} className="mr-1" />;
      case "youtube_link":
        return <Youtube size={16} className="mr-1" />;
      case "video_file":
        return <Video size={16} className="mr-1" />;
      case "text_content":
        return <FileText size={16} className="mr-1" />;
      default:
        return null;
    }
  };

  if (!course) {
    return (
      <div
        className={styles.pageContainer}
        style={{ padding: "20px", textAlign: "center" }}
      >
        Course data not provided.
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>{course.course_name || "Course"}</h1>
      <Tabs defaultValue="lessons" className="w-full">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="announcement">Announcement</TabsTrigger>
          <TabsTrigger value="live_class">Live Class</TabsTrigger>
        </TabsList>

        {/* Lessons Tab Content - This section remains active and functional */}
        <TabsContent value="lessons" className={styles.tabsContent}>
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Course Content</h2>
            </div>
            {sectionsLoading && (
              <div
                className={styles.loadingText}
                style={{ padding: "20px", textAlign: "center" }}
              >
                <Loader2 className="mr-2 h-5 w-5 animate-spin inline-block" />{" "}
                Loading sections...
              </div>
            )}
            {sectionsError && (
              <p
                className={styles.errorText}
                style={{ padding: "20px", color: "red" }}
              >
                Error loading sections: {sectionsError}
              </p>
            )}
            {!sectionsLoading && !sectionsError && sections.length === 0 && (
              <p className={styles.emptyStateText} style={{ padding: "20px" }}>
                No lessons available in this course yet.
              </p>
            )}
            {!sectionsLoading &&
              !sectionsError &&
              sections.map((section) => (
                <div key={section.id} className={styles.sectionContainer}>
                  <div
                    className={styles.listItem}
                    style={{
                      backgroundColor: "#f0f0f0",
                      borderBottom: "1px solid #e0e0e0",
                      padding: "10px 15px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flexGrow: 1 }}>
                      <div
                        className={styles.listItemContent}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: section.description ? "5px" : "0",
                        }}
                      >
                        <GripVertical
                          className={styles.gripIcon}
                          style={{
                            marginRight: "8px",
                            flexShrink: 0,
                            cursor: "default",
                          }}
                        />
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: "1.1em",
                            marginRight: "10px",
                          }}
                        >
                          {section.name}
                        </span>
                      </div>
                      {section.description && (
                        <p
                          style={{
                            fontSize: "0.9em",
                            color: "#555",
                            marginLeft: "28px",
                            marginTop: "0px",
                          }}
                        >
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      paddingLeft: "20px",
                      marginTop: "10px",
                      marginBottom: "20px",
                    }}
                  >
                    {section.lessons.length === 0 && (
                      <p
                        className={styles.emptyStateTextSmall}
                        style={{
                          marginLeft: "20px",
                          fontSize: "0.9em",
                          color: "#666",
                        }}
                      >
                        No lessons in this section.
                      </p>
                    )}
                    {section.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={styles.lessonItemContainer}
                      >
                        <div
                          className={styles.listItem}
                          style={{
                            marginLeft: "20px",
                            borderBottom: "1px solid #f5f5f5",
                            padding: "10px 0",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ flexGrow: 1 }}>
                            <div
                              className={styles.listItemContent}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom:
                                  lesson.description || lesson.resourceType
                                    ? "5px"
                                    : "0",
                              }}
                            >
                              <GripVertical
                                className={styles.gripIcon}
                                style={{
                                  marginRight: "8px",
                                  flexShrink: 0,
                                  cursor: "default",
                                }}
                              />
                              <span
                                style={{
                                  fontWeight: "bold",
                                  marginRight: "10px",
                                }}
                              >
                                {lesson.name}
                              </span>
                            </div>
                            {lesson.description && (
                              <p
                                style={{
                                  fontSize: "0.85em",
                                  color: "#666",
                                  marginLeft: "28px",
                                  marginTop: "2px",
                                }}
                              >
                                {lesson.description}
                              </p>
                            )}
                            {lesson.resourceType && (
                              <div
                                style={{
                                  fontSize: "0.85em",
                                  color: "#444",
                                  marginLeft: "28px",
                                  marginTop: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {getResourceIcon(lesson.resourceType)}
                                <span>
                                  Type:{" "}
                                  {
                                    resourceTypeOptions.find(
                                      (o) => o.value === lesson.resourceType
                                    )?.label
                                  }
                                </span>
                                {lesson.resourceUrl &&
                                  (lesson.resourceType === "pdf" ||
                                    lesson.resourceType === "video_file" ||
                                    lesson.resourceType === "youtube_link") && (
                                    <a
                                      href={lesson.resourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles.viewResourceLink}
                                      style={{
                                        marginLeft: "10px",
                                        color: "#007bff",
                                        textDecoration: "underline",
                                      }}
                                    >
                                      View Resource
                                    </a>
                                  )}
                              </div>
                            )}
                            {lesson.resourceType === "text_content" &&
                              lesson.content && (
                                <div
                                  style={{
                                    fontSize: "0.85em",
                                    color: "#333",
                                    marginLeft: "28px",
                                    marginTop: "4px",
                                    border: "1px solid #eee",
                                    padding: "10px",
                                    background: "#fdfdfd",
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  <strong
                                    style={{
                                      display: "block",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    Content:
                                  </strong>
                                  <div>{lesson.content}</div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </Card>
        </TabsContent>

        {/* Details Tab Content */}
        <TabsContent value="details" className={styles.detailsTabContent}>
          <h2 className={styles.detailsTitle}>Course Details</h2>
          <div className={styles.form}>
            <div className={styles.formField}>
              <label className={styles.label}>Course Name</label>
              <div className={styles.readOnlyField}>
                {course.course_name || "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Course Code</label>
              <div className={styles.readOnlyField}>
                {course.course_code || "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Teacher Name</label>
              <div className={styles.readOnlyField}>
                {course.teacher_name || "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Credit</label>
              <div className={styles.readOnlyField}>
                {course.credit ?? "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Department</label>
              <div className={styles.readOnlyField}>
                {course.department || "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Category</label>
              <div className={styles.readOnlyField}>
                {course.course_category || "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Course Start Date</label>
              <div className={styles.readOnlyField}>
                {course.course_start_date
                  ? new Date(course.course_start_date).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Course End Date</label>
              <div className={styles.readOnlyField}>
                {course.course_end_date
                  ? new Date(course.course_end_date).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Description</label>
              <div
                className={styles.readOnlyField}
                style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}
              >
                {course.description || "No description provided."}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Announcement Tab Content - Disabled */}
        <TabsContent value="announcement" className={styles.tabsContent}>
          <Card className={styles.card}>
            <div
              className={styles.cardHeader}
              style={{ display: "flex", alignItems: "center" }}
            >
              {/* <Megaphone size={24} className="mr-2" /> */}
              <h2 className={styles.cardTitle}>Announcements</h2>
            </div>
            <div style={{ padding: "20px" }}>
              <p>Announcements are currently unavailable.</p>
              {/* 
              {announcementsLoading && (
                <div style={{ textAlign: "center" }}>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin inline-block" />{" "}
                  Loading announcements...
                </div>
              )}
              {announcementsError && (
                <p style={{ color: "red" }}>
                  Error loading announcements: {announcementsError}
                </p>
              )}
              {!announcementsLoading && !announcementsError && announcements.length === 0 && (
                <p>No announcements at this time.</p>
              )}
              {!announcementsLoading && !announcementsError && announcements.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {announcements.map((announcement) => (
                    <li
                      key={announcement.id}
                      style={{
                        marginBottom: "20px",
                        paddingBottom: "15px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <h4 style={{ marginBottom: "5px", fontSize: "1.1em" }}>{announcement.title}</h4>
                      <p
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          color: "#333",
                          marginBottom: "8px",
                          fontSize: "0.95em"
                        }}
                      >
                        {announcement.content}
                      </p>
                      <small style={{ color: "#777", fontSize: "0.8em" }}>
                        Posted on: {new Date(announcement.createdAt).toLocaleString()}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
              */}
            </div>
          </Card>
        </TabsContent>

        {/* Live Class Tab Content */}
        <TabsContent value="live_class" className={styles.detailsTabContent}>
          <h2 className={styles.detailsTitle}>Live Classes</h2>
          {course.id ? (
            <LiveClassDashboard courseId={course.id} isStudentView={true} />
          ) : (
            <p>Course ID not found. Cannot load live class features.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function StudentCourses({ course }: StudentCoursesProps) {
  return (
    <Suspense
      fallback={
        <div
          className={styles.pageContainer}
          style={{ padding: "20px", textAlign: "center" }}
        >
          <Loader2 className="mr-2 h-8 w-8 animate-spin inline-block" /> Loading
          course...
        </div>
      }
    >
      <StudentCourseContent course={course} />
    </Suspense>
  );
}
