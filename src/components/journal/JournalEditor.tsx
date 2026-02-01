"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { reflectOnEntry } from "@/lib/api/client";
import { isNonEmptyString } from "@/lib/utils/validation";
import { formatDate, getTodayStart } from "@/lib/utils/dates";
import { getUserFriendlyError } from "@/lib/utils/errorHandler";
import type { ReflectionResponse } from "@/types/ai";
import "./JournalEditor.css";

type JournalEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  onReflectionComplete?: (reflection: ReflectionResponse) => void;
  placeholder?: string;
  disabled?: boolean;
  userId?: string;
};

/**
 * Main journal entry editor component with bullet journal-style dots
 */
export default function JournalEditor({
  value = "",
  onChange,
  onReflectionComplete,
  placeholder = "Write your thoughts here...",
  disabled = false,
  userId,
}: JournalEditorProps) {
  const [text, setText] = useState(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dateString = formatDate(getTodayStart());

  /**
   * Handles textarea value changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    onChange?.(newValue);
    if (error) setError("");
  };

  /**
   * Calls AI API to generate reflection on journal entry
   */
  const handleReflect = async () => {
    if (!isNonEmptyString(text)) {
      setError("Please write something before reflecting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await reflectOnEntry(text, userId);
      onReflectionComplete?.(data as ReflectionResponse);
    } catch (err: unknown) {
      setError(getUserFriendlyError(err, "Failed to reflect. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="journal-editor">
      <div className="journal-editor__date">{dateString}</div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled || loading}
        rows={14}
        className="journal-editor__textarea journal-editor__textarea--with-dots"
      />
      {error && <div className="journal-editor__error">{error}</div>}
      <div className="journal-editor__button-container">
        <Button
          onClick={handleReflect}
          variant="primary"
          loading={loading}
          disabled={disabled || !isNonEmptyString(text)}
        >
          Reflect
        </Button>
      </div>
    </div>
  );
}
