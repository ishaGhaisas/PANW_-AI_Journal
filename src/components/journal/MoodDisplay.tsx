"use client";

import { useState } from "react";
import { MOOD_OPTIONS, type Mood } from "@/lib/moods";

type MoodDisplayProps = {
  suggestedMood: string;
  currentMood?: string | null;
  onMoodChange?: (mood: Mood | null) => void;
};

export default function MoodDisplay({
  suggestedMood,
  currentMood,
  onMoodChange,
}: MoodDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(
    (currentMood as Mood) || null
  );

  const displayMood = selectedMood || suggestedMood;
  const isOverridden = selectedMood !== null;

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setIsEditing(false);
    onMoodChange?.(mood);
  };

  const handleClearOverride = () => {
    setSelectedMood(null);
    setIsEditing(false);
    onMoodChange?.(null);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {isOverridden ? "Your Mood" : "Suggested Mood"}:
        </span>
        <div className="relative">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 rounded-lg border border-[var(--color-shell)] bg-[var(--color-paper)] px-4 py-2 text-base font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-shell)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
          >
            <span>{displayMood}</span>
            <span className="text-[var(--color-muted)]">✏️</span>
          </button>

          {isEditing && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsEditing(false)}
              />
              
              {/* Dropdown menu */}
              <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-lg border border-[var(--color-shell)] bg-[var(--color-paper)] shadow-lg">
                <div className="max-h-64 overflow-y-auto p-2">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => handleMoodSelect(mood)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        selectedMood === mood
                          ? "bg-[var(--color-accent)] text-white"
                          : "text-[var(--color-text)] hover:bg-[var(--color-shell)]"
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                  
                  {isOverridden && (
                    <>
                      <div className="my-2 border-t border-[var(--color-shell)]" />
                      <button
                        onClick={handleClearOverride}
                        className="w-full rounded-md px-3 py-2 text-left text-sm text-[var(--color-muted)] hover:bg-[var(--color-shell)]"
                      >
                        Use suggested: {suggestedMood}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {isOverridden && (
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Suggested: {suggestedMood}
        </p>
      )}
    </div>
  );
}
