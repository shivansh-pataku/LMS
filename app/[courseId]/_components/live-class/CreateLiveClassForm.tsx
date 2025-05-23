"use client";

import React, { useState } from "react";
import { LiveClass } from "@/types/live-class"; // Ensure this path is correct

interface CreateLiveClassFormProps {
  courseId: string;
  onClassCreated: (newClass: LiveClass) => void;
}

const CreateLiveClassForm: React.FC<CreateLiveClassFormProps> = ({
  courseId,
  onClassCreated,
}) => {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState(""); // New state for scheduled time
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!topic.trim()) {
      setError("Topic is required.");
      setIsSubmitting(false);
      return;
    }

    // Ensure scheduledAt is either a valid ISO string or null
    const payloadScheduledAt = scheduledAt
      ? new Date(scheduledAt).toISOString()
      : null;

    try {
      const response = await fetch(`/api/courses/${courseId}/live-class`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          description,
          scheduledAt: payloadScheduledAt, // Send scheduledAt in the payload
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message: "Failed to create live class and parse error response.",
          }));
        throw new Error(errorData.message || "Failed to create live class");
      }

      const newClass: LiveClass = await response.json();
      onClassCreated(newClass);
      setTopic("");
      setDescription("");
      setScheduledAt(""); // Reset scheduledAt field
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: "20px",
        padding: "15px",
        border: "1px solid #eee",
        borderRadius: "5px",
      }}
    >
      <h4>Create New Live Class</h4>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div style={{ marginBottom: "10px" }}>
        <label
          htmlFor="topic"
          style={{ display: "block", marginBottom: "5px" }}
        >
          Topic:
        </label>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label
          htmlFor="description"
          style={{ display: "block", marginBottom: "5px" }}
        >
          Description (Optional):
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label
          htmlFor="scheduledAt"
          style={{ display: "block", marginBottom: "5px" }}
        >
          Schedule Date & Time (Optional):
        </label>
        <input
          type="datetime-local" // HTML5 input for date and time
          id="scheduledAt"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        style={{ padding: "10px 15px", cursor: "pointer" }}
      >
        {isSubmitting ? "Creating..." : "Create Class"}
      </button>
    </form>
  );
};

export default CreateLiveClassForm;
