"use client";

import React, { useState } from "react";
import { LiveClass } from "@/types/live-class"; // Ensure this path is correct
import styles from './CreateLiveClassForm.module.css';

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
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h4 className={styles.title}>Create New Live Class</h4>
      {error && <p className={styles.errorMessage}>Error: {error}</p>}
      
      <div className={styles.formGroup}>
        <label htmlFor="topic" className={styles.label}>
          Topic:
        </label>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Description (Optional):
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={styles.textarea}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="scheduledAt" className={styles.label}>
          Schedule Date & Time (Optional):
        </label>
        <input
          type="datetime-local"
          id="scheduledAt"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className={styles.datetimeInput}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={styles.submitButton}
      >
        {isSubmitting ? "Creating..." : "Create Class"}
      </button>
    </form>
  );
};

export default CreateLiveClassForm;
