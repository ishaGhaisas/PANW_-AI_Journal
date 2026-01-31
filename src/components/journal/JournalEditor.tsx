"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { ReflectionResponse } from "@/types/ai";

type JournalEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  onReflectionComplete?: (reflection: ReflectionResponse) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function JournalEditor({
  value = "",
  onChange,
  onReflectionComplete,
  placeholder = "Write your thoughts here...",
  disabled = false,
}: JournalEditorProps) {
  const [text, setText] = useState(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get today's date
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    onChange?.(newValue);
    if (error) setError("");
  };

  const handleReflect = async () => {
    if (!text.trim()) {
      setError("Please write something before reflecting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // TODO: Call AI reflection API
      const response = await fetch("/api/ai/reflect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to get reflection");
      }

      const data = await response.json() as ReflectionResponse;
      onReflectionComplete?.(data);
    } catch (err: any) {
      setError(err.message || "Failed to reflect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* Date display - top left */}
      <div
        className="mb-4 text-sm text-[var(--color-muted)]"
        style={{ fontFamily: "var(--font-journal)" }}
      >
        {dateString}
      </div>

      {/* Editor area */}
      {/* TODO: Add bullet journal-style horizontal lines aligned with text baseline */}
      <div className="relative">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="font-journal w-full resize-none rounded-lg bg-[var(--color-paper)] p-6 text-lg leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            fontFamily: "var(--font-journal)",
          }}
          rows={12}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Reflect button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleReflect}
          variant="primary"
          loading={loading}
          disabled={disabled || !text.trim()}
        >
          Reflect
        </Button>
      </div>
    </div>
  );
}
