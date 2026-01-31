"use client";

import type { ReflectionResponse } from "@/types/ai";
import MoodDisplay from "./MoodDisplay";
import type { Mood } from "@/lib/moods";

type AIReflectionProps = {
  reflection: ReflectionResponse | null;
  currentMood?: string | null;
  onMoodChange?: (mood: Mood | null) => void;
};

export default function AIReflection({ 
  reflection, 
  currentMood,
  onMoodChange 
}: AIReflectionProps) {
  if (!reflection) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6 rounded-lg bg-[var(--color-paper)] p-6 border border-[var(--color-shell)]">
      {/* Reflection */}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Reflection
        </h3>
        <p
          className="font-journal text-base leading-relaxed text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-journal)" }}
        >
          {reflection.reflection}
        </p>
      </div>

      {/* Mood */}
      <div>
        <MoodDisplay
          suggestedMood={reflection.mood}
          currentMood={currentMood}
          onMoodChange={onMoodChange}
        />
      </div>

      {/* Follow-up Question */}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Follow-up Question
        </h3>
        <p
          className="font-journal text-base leading-relaxed text-[var(--color-text)] italic"
          style={{ fontFamily: "var(--font-journal)" }}
        >
          {reflection.followUpQuestion}
        </p>
      </div>
    </div>
  );
}
