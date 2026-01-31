"use client";

import { useState } from "react";

type JournalEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function JournalEditor({
  value = "",
  onChange,
  placeholder = "Write your thoughts here...",
  disabled = false,
}: JournalEditorProps) {
  const [text, setText] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="w-full">
      <textarea
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="font-journal w-full resize-none rounded-lg bg-[var(--color-shell)] p-6 text-lg leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ fontFamily: "var(--font-journal)" }}
        rows={12}
      />
    </div>
  );
}
