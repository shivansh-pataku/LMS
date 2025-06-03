"use client";
                              // Add New Lesson to &quot;{section.name}&quot;
import {
  useEffect,
  useState,
  Suspense,
  ChangeEvent,
  useRef,
  FormEvent,
} from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash,
  Pencil,
  Plus,
  GripVertical,
  UploadCloud,
  Eye,
  EyeOff,
  FileText,
  Youtube,
  Video,
  Save,
  XCircle,
  Loader2,
} from "lucide-react";
import styles from "./page.module.css";
import Image from "next/image";
import LiveClassDashboard from "./_components/live-class/LiveClassDashboard";
import Navbar from "@/components/Navbar";
import Navbar_Comon from "@/components/Navbar_Common";
// Interfaces
interface CourseData {
  id: number;
  course_name: string;
  description: string;
  course_code: string;
  teacher_name: string;
  course_start_date: string;
  course_end_date?: string;
  course_image?: string | null;
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

const initialNewSectionData = { name: "", description: "" };
const initialNewLessonData = {
  name: "",
  description: null,
  resourceType: null,
  resourceUrl: null,
  content: null,
  resourceFile: null as File | null, // Added for client-side file handling
};

function CourseDetailsPageContent() {
  const pathParams = useParams();
  const courseIdFromPath = pathParams?.courseId as string | undefined;
  const searchParams = useSearchParams();

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editableDescription, setEditableDescription] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsError, setSectionsError] = useState<string | null>(null);

  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    lesson: Lesson;
    sectionId: string;
  } | null>(null);
  const [editingLessonFile, setEditingLessonFile] = useState<File | null>(null); // For handling file in edit mode

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionData, setNewSectionData] = useState(initialNewSectionData);
  const [addingLessonToSectionId, setAddingLessonToSectionId] = useState<
    string | null
  >(null);
  const [newLessonData, setNewLessonData] = useState<
    Omit<Lesson, "id" | "order" | "status"> & { resourceFile: File | null }
  >(initialNewLessonData);

  const [isSubmittingSection, setIsSubmittingSection] = useState(false);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
  const [isSubmittingSectionEdit, setIsSubmittingSectionEdit] = useState(false);
  const [isSubmittingLessonEdit, setIsSubmittingLessonEdit] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setImagePreview(null);
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    const currentCourseId = courseIdFromPath;
    if (currentCourseId && searchParams) {
      const idFromQuery = searchParams.get("id");
      const courseNameFromQuery = searchParams.get("course_name");
      const descriptionFromQuery = searchParams.get("description");
      const imageFromQuery = searchParams.get("course_image");
      if (
        idFromQuery === currentCourseId &&
        courseNameFromQuery &&
        searchParams.get("course_code") &&
        searchParams.get("teacher_name") &&
        searchParams.get("course_start_date")
      ) {
        const dataFromQuery: CourseData = {
          id: parseInt(currentCourseId, 10),
          course_name: courseNameFromQuery,
          description: descriptionFromQuery || "",
          course_code: searchParams.get("course_code")!,
          teacher_name: searchParams.get("teacher_name")!,
          course_start_date: searchParams.get("course_start_date")!,
          course_end_date: searchParams.get("course_end_date") || undefined,
          course_image: imageFromQuery || null,
        };
        setCourseData(dataFromQuery);
        setEditableDescription(dataFromQuery.description || "");
        setImagePreview(dataFromQuery.course_image || null);
        setError(null);
      } else {
        setCourseData(null);
        setEditableDescription("");
        setError("Failed to load complete course details from URL parameters.");
      }
    } else if (!currentCourseId) {
      setCourseData(null);
      setEditableDescription("");
      setError("Course ID is missing from path.");
    } else {
      setCourseData(null);
      setEditableDescription("");
      setError("Required parameters for loading course data are missing.");
    }
    setLoading(false);
  }, [searchParams, courseIdFromPath]);

  useEffect(() => {
    const fetchSections = async () => {
      if (!courseIdFromPath) return;
      setSectionsLoading(true);
      setSectionsError(null);
      try {
        const response = await fetch(
          `/api/courses/${courseIdFromPath}/sections`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Failed to fetch sections: ${response.statusText}`
          );
        }
        const data: Section[] = await response.json();
        setSections(data);
      } catch (err) {
        console.error("Error fetching sections:", err);
        setSectionsError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setSectionsLoading(false);
      }
    };

    fetchSections();
  }, [courseIdFromPath]);

  const handleImageFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB.");
        setSelectedImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setImagePreview(courseData?.course_image || null);
        return;
      }
      setSelectedImageFile(file);
      const base64Preview = await convertToBase64(file);
      setImagePreview(base64Preview);
    } else {
      setSelectedImageFile(null);
      setImagePreview(courseData?.course_image || null);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDetailsSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!courseIdFromPath || !courseData) {
      alert("Course ID or data is missing, cannot update details.");
      return;
    }
    setIsSubmittingDetails(true);
    let imageToSubmit: string | null | undefined = undefined;

    if (selectedImageFile) {
      try {
        imageToSubmit = await convertToBase64(selectedImageFile);
      } catch (err) {
        console.error("Error converting image to Base64:", err);
        alert("Error processing image. Please try again.");
        setIsSubmittingDetails(false);
        return;
      }
    } else if (imagePreview === null && courseData.course_image !== null) {
      imageToSubmit = null;
    }

    const payload: { description: string; course_image?: string | null } = {
      description: editableDescription,
    };

    if (imageToSubmit !== undefined) {
      payload.course_image = imageToSubmit;
    }

    try {
      const response = await fetch(
        `/api/courses/${courseIdFromPath}/update-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to update details: ${response.statusText}. Server: ${errorData}`
        );
      }
      const updatedCourse: CourseData = await response.json();
      setCourseData(updatedCourse);
      setEditableDescription(updatedCourse.description || "");
      setImagePreview(updatedCourse.course_image || null);
      setSelectedImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Details updated successfully!");
    } catch (err: unknown) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      console.error("Error updating details:", err);
    } finally {
      setIsSubmittingDetails(false);
    }
  };

  const handleOpenAddSectionForm = () => {
    setIsAddingSection(true);
    setNewSectionData(initialNewSectionData);
    setEditingSection(null);
    setEditingLesson(null);
    setAddingLessonToSectionId(null);
    setEditingLessonFile(null);
  };

  const handleNewSectionFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewSectionData({ ...newSectionData, [e.target.name]: e.target.value });
  };

  const handleSaveNewSection = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseIdFromPath) {
      alert("Course ID is missing. Cannot save section.");
      return;
    }
    if (!newSectionData.name.trim()) {
      alert("Section name cannot be empty.");
      return;
    }
    setIsSubmittingSection(true);

    const sectionToSave: Omit<
      Section,
      "lessons" | "id" | "order" | "status"
    > & { name: string; description: string } = {
      name: newSectionData.name,
      description: newSectionData.description,
    };

    try {
      const response = await fetch(
        `/api/courses/${courseIdFromPath}/sections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sectionToSave),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to save section: ${response.statusText}`
        );
      }
      const savedSection: Section = await response.json();

      setSections((prevSections) =>
        [...prevSections, savedSection].sort((a, b) => a.order - b.order)
      );
      setIsAddingSection(false);
      setNewSectionData(initialNewSectionData);
      alert("Section saved successfully!");
    } catch (err) {
      console.error("Error saving section:", err);
      alert(
        `Error saving section: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmittingSection(false);
    }
  };

  const handleOpenAddLessonForm = (sectionId: string) => {
    setAddingLessonToSectionId(sectionId);
    setNewLessonData(initialNewLessonData); // This will reset resourceFile too
    setEditingSection(null);
    setEditingLesson(null);
    setEditingLessonFile(null); // Reset editing file
    setIsAddingSection(false);
  };

  const handleNewLessonFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewLessonData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNewLessonFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewLessonData((prev) => ({
      ...prev,
      resourceFile: file,
    }));
  };

  const handleNewLessonResourceTypeChange = (value: string) => {
    const newResourceType = value === "null" ? null : (value as ResourceType);
    setNewLessonData((prev) => ({
      ...prev,
      resourceType: newResourceType,
      resourceUrl:
        newResourceType &&
        ["pdf", "video_file", "youtube_link"].includes(newResourceType)
          ? prev.resourceUrl
          : null,
      content: newResourceType === "text_content" ? prev.content : null,
      resourceFile:
        newResourceType === "pdf" || newResourceType === "video_file"
          ? prev.resourceFile
          : null,
    }));
  };

  const handleSaveNewLesson = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !courseIdFromPath ||
      !addingLessonToSectionId ||
      !newLessonData.name.trim()
    ) {
      alert("Course ID, Section ID, or Lesson name is missing or invalid.");
      return;
    }

    setIsSubmittingLesson(true);

    let finalResourceUrl = newLessonData.resourceUrl || null;

    if (
      newLessonData.resourceFile &&
      (newLessonData.resourceType === "pdf" ||
        newLessonData.resourceType === "video_file")
    ) {
      const fileFormData = new FormData();
      fileFormData.append("file", newLessonData.resourceFile);
      if (courseIdFromPath) fileFormData.append("courseId", courseIdFromPath);
      if (addingLessonToSectionId)
        fileFormData.append("sectionId", addingLessonToSectionId);

      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: fileFormData,
        });
        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(
            uploadResult.error || "File upload failed for new lesson."
          );
        }
        finalResourceUrl = uploadResult.resourceUrl;
      } catch (uploadError) {
        console.error("Upload failed for new lesson:", uploadError);
        alert(
          `File upload failed: ${
            uploadError instanceof Error ? uploadError.message : "Unknown error"
          }`
        );
        setIsSubmittingLesson(false);
        return;
      }
    }

    const payload = {
      name: newLessonData.name,
      description: newLessonData.description || null,
      resourceType: newLessonData.resourceType,
      resourceUrl: finalResourceUrl,
      content: newLessonData.content || null,
    };

    try {
      const response = await fetch(
        `/api/courses/${courseIdFromPath}/sections/${addingLessonToSectionId}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to save lesson: ${response.statusText}`
        );
      }

      const savedLesson: Lesson = await response.json();

      setSections((prevSections) =>
        prevSections.map((s) =>
          s.id === addingLessonToSectionId
            ? {
                ...s,
                lessons: [...s.lessons, savedLesson].sort(
                  (a, b) => a.order - b.order
                ),
              }
            : s
        )
      );
      setAddingLessonToSectionId(null);
      setNewLessonData(initialNewLessonData);
      alert("New lesson saved successfully!");
    } catch (err) {
      console.error("Error saving lesson:", err);
      alert(
        `Error saving lesson: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  const handleOpenEditSectionForm = (section: Section) => {
    setEditingSection({ ...section });
    setEditingLesson(null);
    setIsAddingSection(false);
    setAddingLessonToSectionId(null);
    setEditingLessonFile(null);
  };

  const handleSectionFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editingSection) return;
    setEditingSection({ ...editingSection, [e.target.name]: e.target.value });
  };

  const handleSaveSectionEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSection || !courseIdFromPath) {
      alert("No section is being edited or Course ID is missing.");
      return;
    }
    if (!editingSection.name.trim()) {
      alert("Section name cannot be empty.");
      return;
    }

    setIsSubmittingSectionEdit(true);

    const payload: { name?: string; description?: string } = {
      name: editingSection.name,
      description: editingSection.description,
    };

    try {
      const response = await fetch(
        `/api/courses/${courseIdFromPath}/sections/${editingSection.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to update section: ${response.statusText}`
        );
      }

      const updatedSectionFromServer: Omit<Section, "lessons"> =
        await response.json();

      setSections((prevSections) =>
        prevSections.map((s) =>
          s.id === editingSection.id
            ? {
                ...s,
                name: updatedSectionFromServer.name,
                description: updatedSectionFromServer.description,
                status: updatedSectionFromServer.status,
                order: updatedSectionFromServer.order,
              }
            : s
        )
      );
      setEditingSection(null);
      alert("Section updated successfully!");
    } catch (err) {
      console.error("Error updating section:", err);
      alert(
        `Error updating section: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmittingSectionEdit(false);
    }
  };

  const handleOpenEditLessonForm = (lesson: Lesson, sectionId: string) => {
    setEditingLesson({ lesson: { ...lesson }, sectionId });
    setEditingLessonFile(null); // Reset file when opening edit form
    setEditingSection(null);
    setIsAddingSection(false);
    setAddingLessonToSectionId(null);
  };

  const handleLessonFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editingLesson) return;
    setEditingLesson((prev) =>
      prev
        ? {
            ...prev,
            lesson: { ...prev.lesson, [e.target.name]: e.target.value },
          }
        : null
    );
  };

  const handleEditingLessonFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditingLessonFile(file);
    if (file && editingLesson) {
      setEditingLesson((prev) =>
        prev
          ? {
              ...prev,
              lesson: {
                ...prev.lesson,
              },
            }
          : null
      );
    }
  };

  const handleLessonResourceTypeChange = (value: string) => {
    if (!editingLesson) return;
    const newResourceType = value === "null" ? null : (value as ResourceType);
    setEditingLesson((prev) =>
      prev
        ? {
            ...prev,
            lesson: {
              ...prev.lesson,
              resourceType: newResourceType,
              resourceUrl:
                newResourceType &&
                ["pdf", "video_file", "youtube_link"].includes(newResourceType)
                  ? prev.lesson.resourceUrl
                  : null,
              content:
                newResourceType === "text_content" ? prev.lesson.content : null,
            },
          }
        : null
    );
    if (newResourceType !== "pdf" && newResourceType !== "video_file") {
      setEditingLessonFile(null);
    }
  };

  const handleSaveLessonEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !courseIdFromPath || !editingLesson.sectionId) {
      alert("Lesson data, Course ID, or Section ID is missing.");
      return;
    }
    if (!editingLesson.lesson.name.trim()) {
      alert("Lesson name cannot be empty.");
      return;
    }

    setIsSubmittingLessonEdit(true);
    let finalResourceUrl = editingLesson.lesson.resourceUrl || null;

    if (
      editingLessonFile &&
      (editingLesson.lesson.resourceType === "pdf" ||
        editingLesson.lesson.resourceType === "video_file")
    ) {
      const fileFormData = new FormData();
      fileFormData.append("file", editingLessonFile);
      if (courseIdFromPath) fileFormData.append("courseId", courseIdFromPath);
      if (editingLesson.sectionId)
        fileFormData.append("sectionId", editingLesson.sectionId);
      if (editingLesson.lesson.id)
        fileFormData.append("lessonId", editingLesson.lesson.id);

      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: fileFormData,
        });
        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(
            uploadResult.error || "File upload failed for editing lesson."
          );
        }
        finalResourceUrl = uploadResult.resourceUrl;
      } catch (uploadError) {
        console.error("Upload failed for editing lesson:", uploadError);
        alert(
          `File upload failed: ${
            uploadError instanceof Error ? uploadError.message : "Unknown error"
          }`
        );
        setIsSubmittingLessonEdit(false);
        return;
      }
    }

    const payload: Omit<Lesson, "order" | "id"> & { name: string } = {
      name: editingLesson.lesson.name.trim(),
      description: editingLesson.lesson.description || null,
      resourceType: editingLesson.lesson.resourceType,
      resourceUrl: finalResourceUrl,
      content: editingLesson.lesson.content || null,
      status: editingLesson.lesson.status,
    };

    try {
      const response = await fetch(
        `/api/courses/${courseIdFromPath}/sections/${editingLesson.sectionId}/lessons/${editingLesson.lesson.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to update lesson: ${response.statusText}`
        );
      }

      const updatedLessonFromServer: Lesson = await response.json();

      setSections((prevSections) =>
        prevSections.map((s) =>
          s.id === editingLesson.sectionId
            ? {
                ...s,
                lessons: s.lessons
                  .map((l) =>
                    l.id === updatedLessonFromServer.id
                      ? updatedLessonFromServer
                      : l
                  )
                  .sort((a, b) => a.order - b.order),
              }
            : s
        )
      );
      setEditingLesson(null);
      setEditingLessonFile(null);
      alert("Lesson updated successfully!");
    } catch (err) {
      console.error("Error updating lesson:", err);
      alert(
        `Error updating lesson: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmittingLessonEdit(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!courseIdFromPath) return;
    if (
      window.confirm(
        "Are you sure you want to delete this section and all its lessons? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(
          `/api/courses/${courseIdFromPath}/sections/${sectionId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Failed to delete section: ${response.statusText}`
          );
        }
        setSections((prevSections) =>
          prevSections.filter((s) => s.id !== sectionId)
        );
        if (editingSection?.id === sectionId) setEditingSection(null);
        alert("Section deleted successfully.");
      } catch (err) {
        console.error("Error deleting section:", err);
        alert(
          `Error deleting section: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
    }
  };

  const handleToggleSectionStatus = async (
    sectionId: string,
    currentStatus: SectionStatus
  ) => {
    if (!courseIdFromPath) return;

    const newStatus = currentStatus === "private" ? "public" : "private";
    const originalSections = sections;
    setSections((prevSections) =>
      prevSections.map((s) =>
        s.id === sectionId ? { ...s, status: newStatus } : s
      )
    );

    try {
      const response = await fetch(
        `/api/courses/${courseIdFromPath}/sections/${sectionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setSections(originalSections);
        throw new Error(
          errorData.message ||
            `Failed to toggle section status: ${response.statusText}`
        );
      }
      const updatedSectionFromServer: Omit<Section, "lessons"> =
        await response.json();
      setSections((prevSections) =>
        prevSections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                name: updatedSectionFromServer.name,
                description: updatedSectionFromServer.description,
                status: updatedSectionFromServer.status,
                order: updatedSectionFromServer.order,
              }
            : s
        )
      );
    } catch (err) {
      console.error("Error toggling section status:", err);
      setSections(originalSections);
      alert(
        `Error toggling section status: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!courseIdFromPath) return;
    if (
      window.confirm(
        "Are you sure you want to delete this lesson? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(
          `/api/courses/${courseIdFromPath}/sections/${sectionId}/lessons/${lessonId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Failed to delete lesson: ${response.statusText}`
          );
        }
        setSections((prevSections) =>
          prevSections.map((s) => {
            if (s.id === sectionId) {
              return {
                ...s,
                lessons: s.lessons.filter((l) => l.id !== lessonId),
              };
            }
            return s;
          })
        );
        if (editingLesson?.lesson.id === lessonId) setEditingLesson(null);
        alert("Lesson deleted successfully.");
      } catch (err) {
        console.error("Error deleting lesson:", err);
        alert(
          `Error deleting lesson: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
    }
  };

  const handleToggleLessonStatus = async (
    sectionId: string,
    lessonId: string,
    currentStatus: LessonStatus
  ) => {
    if (!courseIdFromPath) return;

    const statuses: LessonStatus[] = ["private", "public", "preview"];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    const originalSections = sections;
    setSections((prevSections) =>
      prevSections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            lessons: s.lessons.map((l) => {
              if (l.id === lessonId) {
                return { ...l, status: newStatus };
              }
              return l;
            }),
          };
        }
        return s;
      })
    );

    try {
      const response = await fetch(
        `/api/courses/${courseIdFromPath}/sections/${sectionId}/lessons/${lessonId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setSections(originalSections);
        throw new Error(
          errorData.message ||
            `Failed to toggle lesson status: ${response.statusText}`
        );
      }
      const updatedLessonFromServer: Lesson = await response.json();
      setSections((prevSections) =>
        prevSections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                lessons: s.lessons
                  .map((l) =>
                    l.id === updatedLessonFromServer.id
                      ? updatedLessonFromServer
                      : l
                  )
                  .sort((a, b) => a.order - b.order),
              }
            : s
        )
      );
    } catch (err) {
      console.error("Error toggling lesson status:", err);
      setSections(originalSections);
      alert(
        `Error toggling lesson status: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

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

  const isAnyFormActive =
    !!editingSection ||
    !!editingLesson ||
    isAddingSection ||
    !!addingLessonToSectionId;

  if (loading)
    return (
      <div className={styles.pageContainer}>Loading course content...</div>
    );
  if (error) return <div className={styles.pageContainer}>Error: {error}</div>;
  if (!courseData)
    return (
      <div className={styles.pageContainer}>Course data not available.</div>
    );

  return (
    <><Navbar_Comon/>
    <div className={styles.pageContainer}> 
      <h1 className={styles.pageTitle}>
        {courseData.course_name || "Course Details"}
      </h1>
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="Announcement">Announcement</TabsTrigger>
          <TabsTrigger value="Live_class">Live Class</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className={styles.tabsContent}>
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Course Sections</h2>
              {!isAddingSection && (
                <Button
                  size="sm"
                  onClick={handleOpenAddSectionForm}
                  disabled={
                    isAnyFormActive || isSubmittingSection || sectionsLoading
                  }
                >
                  <Plus className={styles.iconButton} /> New Section
                </Button>
              )}
            </div>

            {isAddingSection && (
              <form
                onSubmit={handleSaveNewSection}
                className={styles.editForm}
                style={{ marginBottom: "20px", margin:"50px", padding:"50px"}}
              >
                <h3 className={styles.formTitle}>Add New Section</h3>
                <div className={styles.formFieldInline}>
                  <label htmlFor="newSectionName">Name:</label>
                  <Input
                    // id="newSectionName"
                    className={styles.newSectionName}
                    name="name"
                    value={newSectionData.name}
                    onChange={handleNewSectionFormChange}
                    disabled={isSubmittingSection}
                    required
                  />
                </div>
                <div className={styles.formFieldInline}>
                  <label htmlFor="newSectionDesc">Description:</label>
                  <Textarea
                    // id="newSectionDesc"
                    className={styles.newSectionDesc}
                    name="description"
                    value={newSectionData.description}
                    onChange={handleNewSectionFormChange}
                    disabled={isSubmittingSection}
                    rows={2}
                  />
                </div>
                <div className={styles.formActions}>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingSection}
                  >
                    {isSubmittingSection ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save size={16} className="mr-1" />
                    )}
                    {isSubmittingSection ? "Saving..." : "Save Section"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingSection(false)}
                    disabled={isSubmittingSection}
                  >
                    <XCircle size={16} className="mr-1" /> Cancel
                  </Button>
                </div>
              </form>
            )}

            {sectionsLoading && (
              <div className={styles.loadingText}>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading
                sections...
              </div>
            )}
            {sectionsError && (
              <p className={styles.errorText}>
                Error loading sections: {sectionsError}
              </p>
            )}

            {!sectionsLoading &&
              !sectionsError &&
              sections.length === 0 &&
              !isAddingSection && (
                <p className={styles.emptyStateText}>
                  No sections created yet. Click &quot;New Section&quot; to
                  begin.
                </p>
              )}

            {!sectionsLoading &&
              !sectionsError &&
              sections.map((section) => (
                <div key={section.id} className={styles.sectionContainer}>
                  {editingSection?.id === section.id ? (
                    <form
                      onSubmit={handleSaveSectionEdit}
                      className={styles.editForm}
                    >
                      <h3 className={styles.formTitle}>Edit Section</h3>
                      <div className={styles.formFieldInline}>
                        <label htmlFor={`sectionName-${section.id}`}>
                          Name:
                        </label>
                        <Input
                          id={`sectionName-${section.id}`}
                          name="name"
                          value={editingSection.name}
                          onChange={handleSectionFormChange}
                          disabled={isSubmittingSectionEdit}
                          required
                        />
                      </div>
                      <div className={styles.formFieldInline}>
                        <label htmlFor={`sectionDesc-${section.id}`}>
                          Description:
                        </label>
                        <Textarea
                          id={`sectionDesc-${section.id}`}
                          name="description"
                          value={editingSection.description}
                          onChange={handleSectionFormChange}
                          disabled={isSubmittingSectionEdit}
                          rows={2}
                        />
                      </div>
                      <div className={styles.formActions}>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmittingSectionEdit}
                        >
                          {isSubmittingSectionEdit ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save size={16} className="mr-1" />
                          )}
                          {isSubmittingSectionEdit
                            ? "Saving..."
                            : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingSection(null)}
                          disabled={isSubmittingSectionEdit}
                        >
                          <XCircle size={16} className="mr-1" /> Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
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
                            style={{ marginRight: "8px", flexShrink: 0 }}
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
                          <span
                            className={
                              section.status === "public"
                                ? styles.statusPublic
                                : styles.statusPrivate
                            }
                            style={{
                              fontSize: "0.8em",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              color: "white",
                              backgroundColor:
                                section.status === "public" ? "green" : "gray",
                              flexShrink: 0,
                            }}
                          >
                            {section.status}
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
                      {!isAnyFormActive && (
                        <div
                          className={styles.buttonGroup}
                          style={{ flexShrink: 0, marginLeft: "10px" }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleSectionStatus(
                                section.id,
                                section.status
                              )
                            }
                            disabled={
                              isAnyFormActive || isSubmittingSectionEdit
                            }
                            title={
                              section.status === "private"
                                ? "Make Public"
                                : "Make Private"
                            }
                          >
                            {section.status === "private" ? (
                              <EyeOff className={styles.iconOnlyButton} />
                            ) : (
                              <Eye className={styles.iconOnlyButton} />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditSectionForm(section)}
                            disabled={
                              isAnyFormActive || isSubmittingSectionEdit
                            }
                          >
                            <Pencil className={styles.iconOnlyButton} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSection(section.id)}
                            disabled={isAnyFormActive}
                          >
                            <Trash className={styles.iconOnlyButton} />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {(!editingSection || editingSection.id !== section.id) &&
                    !isAddingSection && (
                      <div
                        style={{
                          paddingLeft: "20px",
                          marginTop: "10px",
                          marginBottom: "20px",
                        }}
                      >
                        <div
                          className={styles.cardHeader}
                          style={{
                            justifyContent: "flex-end",
                            paddingBottom: "10px",
                            borderBottom: "1px dashed #eee",
                            marginBottom: "10px",
                          }}
                        >
                          {addingLessonToSectionId !== section.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleOpenAddLessonForm(section.id)
                              }
                              disabled={isAnyFormActive || isSubmittingLesson}
                            >
                              <Plus className={styles.iconButton} /> New Lesson
                            </Button>
                          )}
                        </div>

                        {addingLessonToSectionId === section.id && (
                          <form
                            onSubmit={handleSaveNewLesson}
                            className={styles.editForm}
                            style={{
                              marginLeft: "20px",
                              padding: "10px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              marginTop: "5px",
                              marginBottom: "15px",
                            }}
                          >
                            <h3 className={styles.formTitle}>
                              Add New Lesson to &quot;{section.name}&quot;
                            </h3>
                            <div className={styles.formFieldInline}>
                              <label htmlFor={`newLessonName-${section.id}`}>
                                Name:
                              </label>
                              <Input
                                id={`newLessonName-${section.id}`}
                                name="name"
                                value={newLessonData.name}
                                onChange={handleNewLessonFormChange}
                                required
                                disabled={isSubmittingLesson}
                              />
                            </div>
                            <div className={styles.formFieldInline}>
                              <label htmlFor={`newLessonDesc-${section.id}`}>
                                Description:
                              </label>
                              <Textarea
                                id={`newLessonDesc-${section.id}`}
                                name="description"
                                value={newLessonData.description || ""}
                                onChange={handleNewLessonFormChange}
                                rows={2}
                                disabled={isSubmittingLesson}
                              />
                            </div>
                            <div className={styles.formFieldInline}>
                              <label
                                htmlFor={`newLessonResourceType-${section.id}`}
                              >
                                Resource Type:
                              </label>
                              <Select
                                value={newLessonData.resourceType || "null"}
                                onValueChange={
                                  handleNewLessonResourceTypeChange
                                }
                              >
                                <SelectTrigger disabled={isSubmittingLesson}>
                                  <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {resourceTypeOptions.map((opt) => (
                                    <SelectItem
                                      key={opt.label}
                                      value={opt.value || "null"}
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {(newLessonData.resourceType === "pdf" ||
                              newLessonData.resourceType === "video_file") && (
                              <div className={styles.formFieldInline}>
                                <label
                                  htmlFor={`newLessonResourceFile-${section.id}`}
                                >
                                  {newLessonData.resourceFile
                                    ? `Selected: ${newLessonData.resourceFile.name}`
                                    : "Upload File:"}
                                </label>
                                <Input
                                  id={`newLessonResourceFile-${section.id}`}
                                  type="file"
                                  accept={
                                    newLessonData.resourceType === "pdf"
                                      ? ".pdf"
                                      : "video/*"
                                  }
                                  onChange={handleNewLessonFileChange}
                                  disabled={isSubmittingLesson}
                                />
                              </div>
                            )}

                            {newLessonData.resourceType &&
                              ["pdf", "video_file", "youtube_link"].includes(
                                newLessonData.resourceType
                              ) && (
                                <div className={styles.formFieldInline}>
                                  <label
                                    htmlFor={`newLessonResourceUrl-${section.id}`}
                                  >
                                    Resource URL{" "}
                                    {newLessonData.resourceFile &&
                                    (newLessonData.resourceType === "pdf" ||
                                      newLessonData.resourceType ===
                                        "video_file")
                                      ? "(Auto from upload)"
                                      : ""}
                                    :
                                  </label>
                                  <Input
                                    id={`newLessonResourceUrl-${section.id}`}
                                    name="resourceUrl"
                                    value={newLessonData.resourceUrl || ""}
                                    onChange={handleNewLessonFormChange}
                                    disabled={
                                      isSubmittingLesson ||
                                      (!!newLessonData.resourceFile &&
                                        (newLessonData.resourceType === "pdf" ||
                                          newLessonData.resourceType ===
                                            "video_file"))
                                    }
                                    placeholder={
                                      newLessonData.resourceType === "pdf" ||
                                      newLessonData.resourceType ===
                                        "video_file"
                                        ? "Or enter external URL if not uploading"
                                        : "Enter URL"
                                    }
                                  />
                                </div>
                              )}
                            {newLessonData.resourceType === "text_content" && (
                              <div className={styles.formFieldInline}>
                                <label
                                  htmlFor={`newLessonContent-${section.id}`}
                                >
                                  Content:
                                </label>
                                <Textarea
                                  id={`newLessonContent-${section.id}`}
                                  name="content"
                                  value={newLessonData.content || ""}
                                  onChange={handleNewLessonFormChange}
                                  rows={3}
                                  disabled={isSubmittingLesson}
                                />
                              </div>
                            )}
                            <div className={styles.formActions}>
                              <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmittingLesson}
                              >
                                {isSubmittingLesson ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Save size={16} className="mr-1" />
                                )}
                                {isSubmittingLesson
                                  ? "Saving..."
                                  : "Save Lesson"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAddingLessonToSectionId(null);
                                  setNewLessonData(initialNewLessonData); // Reset form including file
                                }}
                                disabled={isSubmittingLesson}
                              >
                                <XCircle size={16} className="mr-1" /> Cancel
                              </Button>
                            </div>
                          </form>
                        )}

                        {section.lessons.length === 0 &&
                          addingLessonToSectionId !== section.id && (
                            <p className={styles.emptyStateTextSmall}>
                              No lessons in this section.
                            </p>
                          )}
                        {section.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={styles.lessonItemContainer}
                          >
                            {editingLesson?.lesson.id === lesson.id &&
                            editingLesson?.sectionId === section.id ? (
                              <form
                                onSubmit={handleSaveLessonEdit}
                                className={styles.editForm}
                                style={{
                                  marginLeft: "20px",
                                  padding: "10px",
                                  border: "1px solid #ccc",
                                  borderRadius: "4px",
                                  marginTop: "5px",
                                }}
                              >
                                <h3 className={styles.formTitle}>
                                  Edit Lesson
                                </h3>
                                <div className={styles.formFieldInline}>
                                  <label style={{
    fontFamily: "jost",
    color: "#000",
    marginBottom: "5px",
    fontSize: "50px",
    fontWeight: 500,
    display: "block"
}} htmlFor={`lessonName-${lesson.id}`}>
                                    Name:
                                  </label>
                                  <Input
                                    id={`lessonName-${lesson.id}`}
                                    name="name"
                                    value={editingLesson.lesson.name}
                                    onChange={handleLessonFormChange}
                                    required
                                    disabled={isSubmittingLessonEdit}
                                  />
                                </div>
                                <div className={styles.formFieldInline}>
                                  <label htmlFor={`lessonDesc-${lesson.id}`}>
                                    Description:
                                  </label>
                                  <Textarea
                                    id={`lessonDesc-${lesson.id}`}
                                    name="description"
                                    value={
                                      editingLesson.lesson.description || ""
                                    }
                                    onChange={handleLessonFormChange}
                                    rows={2}
                                    disabled={isSubmittingLessonEdit}
                                  />
                                </div>
                                <div className={styles.formFieldInline}>
                                  <label
                                    htmlFor={`lessonResourceType-${lesson.id}`}
                                  >
                                    Resource Type:
                                  </label>
                                  <Select
                                    value={
                                      editingLesson.lesson.resourceType ||
                                      "null"
                                    }
                                    onValueChange={
                                      handleLessonResourceTypeChange
                                    }
                                  >
                                    <SelectTrigger
                                      disabled={isSubmittingLessonEdit}
                                    >
                                      <SelectValue placeholder="Select type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {resourceTypeOptions.map((opt) => (
                                        <SelectItem
                                          key={opt.label}
                                          value={opt.value || "null"}
                                        >
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {(editingLesson.lesson.resourceType === "pdf" ||
                                  editingLesson.lesson.resourceType ===
                                    "video_file") && (
                                  <div className={styles.formFieldInline}>
                                    <label
                                      htmlFor={`editingLessonResourceFile-${lesson.id}`}
                                    >
                                      {editingLessonFile
                                        ? `New File: ${editingLessonFile.name}`
                                        : "Upload New File (Optional):"}
                                    </label>
                                    <Input
                                      id={`editingLessonResourceFile-${lesson.id}`}
                                      type="file"
                                      accept={
                                        editingLesson.lesson.resourceType ===
                                        "pdf"
                                          ? ".pdf"
                                          : "video/*"
                                      }
                                      onChange={handleEditingLessonFileChange}
                                      disabled={isSubmittingLessonEdit}
                                    />
                                    {editingLessonFile && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          setEditingLessonFile(null)
                                        }
                                        disabled={isSubmittingLessonEdit}
                                      >
                                        Clear selection
                                      </Button>
                                    )}
                                  </div>
                                )}

                                {editingLesson.lesson.resourceType &&
                                  [
                                    "pdf",
                                    "video_file",
                                    "youtube_link",
                                  ].includes(
                                    editingLesson.lesson.resourceType
                                  ) && (
                                    <div className={styles.formFieldInline}>
                                      <label
                                        htmlFor={`lessonResourceUrl-${lesson.id}`}
                                      >
                                        Resource URL{" "}
                                        {editingLessonFile &&
                                        (editingLesson.lesson.resourceType ===
                                          "pdf" ||
                                          editingLesson.lesson.resourceType ===
                                            "video_file")
                                          ? "(Auto from upload)"
                                          : ""}
                                        :
                                      </label>
                                      <Input
                                        id={`lessonResourceUrl-${lesson.id}`}
                                        name="resourceUrl"
                                        value={
                                          editingLesson.lesson.resourceUrl || ""
                                        }
                                        onChange={handleLessonFormChange}
                                        disabled={
                                          isSubmittingLessonEdit ||
                                          (!!editingLessonFile &&
                                            (editingLesson.lesson
                                              .resourceType === "pdf" ||
                                              editingLesson.lesson
                                                .resourceType === "video_file"))
                                        }
                                        placeholder={
                                          editingLesson.lesson.resourceType ===
                                            "pdf" ||
                                          editingLesson.lesson.resourceType ===
                                            "video_file"
                                            ? "Or enter external URL / will use existing if no new file"
                                            : "Enter URL"
                                        }
                                      />
                                    </div>
                                  )}
                                {editingLesson.lesson.resourceType ===
                                  "text_content" && (
                                  <div className={styles.formFieldInline}>
                                    <label
                                      htmlFor={`lessonContent-${lesson.id}`}
                                    >
                                      Content:
                                    </label>
                                    <Textarea
                                      id={`lessonContent-${lesson.id}`}
                                      name="content"
                                      value={editingLesson.lesson.content || ""}
                                      onChange={handleLessonFormChange}
                                      rows={3}
                                      disabled={isSubmittingLessonEdit}
                                    />
                                  </div>
                                )}
                                <div className={styles.formActions}>
                                  <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSubmittingLessonEdit}
                                  >
                                    {isSubmittingLessonEdit ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Save size={16} className="mr-1" />
                                    )}
                                    {isSubmittingLessonEdit
                                      ? "Saving..."
                                      : "Save Changes"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingLesson(null);
                                      setEditingLessonFile(null); // Reset file on cancel
                                    }}
                                    disabled={isSubmittingLessonEdit}
                                  >
                                    <XCircle size={16} className="mr-1" />{" "}
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            ) : (
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
                                        lesson.description ||
                                        lesson.resourceType
                                          ? "5px"
                                          : "0",
                                    }}
                                  >
                                    <GripVertical
                                      className={styles.gripIcon}
                                      style={{
                                        marginRight: "8px",
                                        flexShrink: 0,
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
                                    <span
                                      style={{
                                        fontSize: "0.8em",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        color: "white",
                                        backgroundColor:
                                          lesson.status === "public"
                                            ? "green"
                                            : lesson.status === "preview"
                                            ? "orange"
                                            : "gray",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {lesson.status}
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
                                            (o) =>
                                              o.value === lesson.resourceType
                                          )?.label
                                        }
                                      </span>
                                      {lesson.resourceUrl &&
                                        (lesson.resourceType === "pdf" ||
                                          lesson.resourceType ===
                                            "video_file" ||
                                          lesson.resourceType ===
                                            "youtube_link") && (
                                          <a
                                            href={lesson.resourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
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
                                          padding: "5px",
                                          background: "#fdfdfd",
                                        }}
                                      >
                                        <strong
                                          style={{
                                            display: "block",
                                            marginBottom: "3px",
                                          }}
                                        >
                                          Content:
                                        </strong>
                                        <pre
                                          style={{
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-all",
                                          }}
                                        >
                                          {lesson.content.substring(0, 150)}
                                          {lesson.content.length > 150
                                            ? "..."
                                            : ""}
                                        </pre>
                                      </div>
                                    )}
                                </div>
                                {!isAnyFormActive && (
                                  <div
                                    className={styles.buttonGroup}
                                    style={{
                                      flexShrink: 0,
                                      marginLeft: "10px",
                                      paddingTop: "5px",
                                    }}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleToggleLessonStatus(
                                          section.id,
                                          lesson.id,
                                          lesson.status
                                        )
                                      }
                                      title={`Cycle Status (current: ${lesson.status})`}
                                      disabled={
                                        isAnyFormActive ||
                                        isSubmittingLessonEdit
                                      }
                                    >
                                      {lesson.status === "private" ? (
                                        <EyeOff size={16} />
                                      ) : lesson.status === "public" ? (
                                        <Eye size={16} />
                                      ) : (
                                        <Eye size={16} color="orange" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleOpenEditLessonForm(
                                          lesson,
                                          section.id
                                        )
                                      }
                                      disabled={
                                        isAnyFormActive ||
                                        isSubmittingLessonEdit
                                      }
                                    >
                                      <Pencil
                                        className={styles.iconOnlyButton}
                                      />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteLesson(
                                          section.id,
                                          lesson.id
                                        )
                                      }
                                      disabled={isAnyFormActive}
                                    >
                                      <Trash
                                        className={styles.iconOnlyButton}
                                      />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
          </Card>
        </TabsContent>

        <TabsContent value="details" className={styles.detailsTabContent}>
    <h2 className={styles.detailsTitle} style={{
    color: "#6483f2",
    backgroundColor: "#1c1c1c",
    borderBottom: "4px solid #8fa6fc",
    borderRadius: "4px",
    marginBottom: "24px",
    padding: "16px",
    fontFamily: "montserrat",
    fontSize: "2rem",
    fontWeight: 800
}}>Course Details</h2>
          <form className={styles.form} onSubmit={handleDetailsSubmit}>
            <div className={styles.formField}>
              <label className={styles.label}>Course Name</label>
              <div className={styles.readOnlyField}>
                {courseData.course_name || "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Course Code</label>
              <div className={styles.readOnlyField}>
                {courseData.course_code || "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Teacher Name</label>
              <div className={styles.readOnlyField}>
                {courseData.teacher_name || "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Course Start Date</label>
              <div className={styles.readOnlyField}>
                {courseData.course_start_date
                  ? new Date(courseData.course_start_date).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Course End Date</label>
              <div className={styles.readOnlyField}>
                {courseData.course_end_date
                  ? new Date(courseData.course_end_date).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
            <div className={styles.formField}>
              <label htmlFor="description" className={styles.label}>
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Enter course description"
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
                className={styles.textareaField}
                rows={4}
                disabled={isSubmittingDetails}
              />
            </div>
            <div className={styles.formField}>
              <label
                htmlFor="course_image_upload_input"
                className={styles.label}
              >
                Course Image
              </label>
              <div className={styles.imagePreviewContainer}>
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Course Preview"
                    width={200}
                    height={120}
                    className={styles.imagePreview}
                    unoptimized={imagePreview.startsWith("data:")} // Added for base64 previews
                  />
                ) : (
                  <div className={styles.noImagePlaceholder}>
                    No Image Uploaded
                  </div>
                )}
              </div>
              <Input
                id="course_image_upload_input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className={styles.fileInput}
                style={{ display: "none" }}
                disabled={isSubmittingDetails}
              />
              <label
                htmlFor="course_image_upload_input"
                className={styles.uploadButtonLabel}
              >
                <Button
                  type="button"
                  asChild
                  variant="outline"
                  size="sm"
                  disabled={isSubmittingDetails}
                >
                  <span>
                    <UploadCloud size={16} style={{ marginRight: "8px" }} />
                    {selectedImageFile
                      ? "Change Image"
                      : imagePreview
                      ? "Change Image"
                      : "Upload Image"}
                  </span>
                </Button>
              </label>
              {selectedImageFile && (
                <span className={styles.fileName}>
                  {selectedImageFile.name}
                </span>
              )}
              {imagePreview &&
                !selectedImageFile && ( // Show remove only if there's a preview and no new file selected
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className={styles.removeImageButton}
                    disabled={isSubmittingDetails}
                  >
                    Remove Image
                  </Button>
                )}
            </div>
            <Button type="submit" disabled={isSubmittingDetails}>
              {isSubmittingDetails ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmittingDetails ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="Live_class" className={styles.detailsTabContent}>
          {courseIdFromPath ? (
            <LiveClassDashboard />
          ) : (
            <p>Course ID not found. Cannot load live class features.</p>
          )}
        </TabsContent>
      </Tabs>
    </div> </>
  );
}

export default function CourseContentPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.pageContainer}>Loading page details...</div>
      }
    >
      <CourseDetailsPageContent />
    </Suspense>
  );
}
