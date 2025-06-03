"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { LiveClass } from "@/types/live-class"; // Ensure this path is correct
import CreateLiveClassForm from "./CreateLiveClassForm";
import JitsiMeetEmbed from "./JitsiMeetEmbed";
import styles from './LiveClassDashboard.module.css';
import AddAttendance from "@/components/AddAttendance";



const LiveClassDashboard = () => {
  const params = useParams();
  const courseId =
    typeof params?.courseId === "string" ? params.courseId : undefined;

  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const fetchLiveClasses = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      setError("Course ID is not available to fetch live classes.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/courses/${courseId}/live-class`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to fetch live classes and parse error response.",
        }));
        throw new Error(errorData.message || "Failed to fetch live classes");
      }
      const data = await response.json();
      setLiveClasses(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchLiveClasses();
    }
  }, [fetchLiveClasses, courseId]);

  const handleClassCreated = (newClass: LiveClass) => {
    setLiveClasses((prevClasses) => [newClass, ...prevClasses]);
    setSelectedRoom(newClass.roomName); // Auto-join new class
  };
 if (!courseId) {
    return <p className={styles.errorMessage}>Course ID not found. Cannot load live class features.</p>;
  }

  if (loading) return <p className={styles.loadingMessage}>Loading live classes...</p>;
  if (error) return <p className={styles.errorMessage}>Error loading live classes: {error}</p>;

  if (selectedRoom) {
    return (
      <div className={styles.container}>
        <button
          onClick={() => setSelectedRoom(null)}
          className={styles.backButton}
        >
          Back to Classes List
        </button>
        <JitsiMeetEmbed roomName={selectedRoom} displayName={"User"} />
        <AddAttendance />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Live Classes</h3>
      <CreateLiveClassForm
        courseId={courseId}
        onClassCreated={handleClassCreated}
      />
      <hr className={styles.divider} />
      <h4 className={styles.subtitle}>Scheduled/Existing Classes:</h4>
      {liveClasses.length === 0 ? (
        <p className={styles.emptyMessage}>No live classes scheduled yet.</p>
      ) : (
        <ul className={styles.classList}>
          {liveClasses.map((cls) => (
            <li key={cls.id} className={styles.classCard}>
              <h5 className={styles.classTopic}>{cls.topic}</h5>
              {cls.description && (
                <p className={styles.classDescription}>{cls.description}</p>
              )}
              <p className={styles.classInfo}>Room: {cls.roomName}</p>
              {cls.scheduledAt && (
                <p className={styles.classInfo}>
                  Scheduled: {new Date(cls.scheduledAt).toLocaleString()}
                </p>
              )}
              <button
                onClick={() => setSelectedRoom(cls.roomName)}
                className={styles.joinButton}
              >
                Join Class
              </button>
              <p className={styles.timestamp}>
                Created: {new Date(cls.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveClassDashboard;