"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { LiveClass } from "@/types/live-class"; // Ensure this path is correct
import CreateLiveClassForm from "./CreateLiveClassForm";
import JitsiMeetEmbed from "./JitsiMeetEmbed";

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
    return <p>Course ID not found. Cannot load live class features.</p>;
  }

  if (loading) return <p>Loading live classes...</p>;
  if (error) return <p>Error loading live classes: {error}</p>;

  if (selectedRoom) {
    // const userName = "User"; // Replace with actual user name if available
    return (
      <>
        <button
          onClick={() => setSelectedRoom(null)}
          style={{
            marginBottom: "10px",
            padding: "8px 12px",
            cursor: "pointer",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          Back to Classes List
        </button>
        <JitsiMeetEmbed roomName={selectedRoom} displayName={"User"} />
      </>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: "20px" }}>Live Classes</h3>
      <CreateLiveClassForm
        courseId={courseId}
        onClassCreated={handleClassCreated}
      />
      <hr style={{ margin: "20px 0" }} />
      <h4>Scheduled/Existing Classes:</h4>
      {liveClasses.length === 0 ? (
        <p>No live classes scheduled yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {liveClasses.map((cls) => (
            <li
              key={cls.id}
              style={{
                marginBottom: "15px",
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <strong>{cls.topic}</strong>
              {cls.description && (
                <p style={{ margin: "5px 0" }}>{cls.description}</p>
              )}
              <p style={{ margin: "5px 0" }}>Room: {cls.roomName}</p>
              {cls.scheduledAt && (
                <p style={{ margin: "5px 0" }}>
                  Scheduled: {new Date(cls.scheduledAt).toLocaleString()}
                </p>
              )}
              <button
                onClick={() => setSelectedRoom(cls.roomName)}
                style={{
                  marginTop: "10px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Join Class
              </button>
              <p
                style={{ marginTop: "10px", fontSize: "0.8em", color: "#555" }}
              >
                <small>
                  Created: {new Date(cls.createdAt).toLocaleString()}
                </small>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveClassDashboard;
