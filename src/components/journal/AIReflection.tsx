"use client";

import type { ReflectionResponse } from "@/types/ai";
import MoodDisplay from "./MoodDisplay";
import type { Mood } from "@/lib/moods";
import "./AIReflection.css";

type AIReflectionProps = {
  reflection: ReflectionResponse | null;
  currentMood?: string | null;
  onMoodChange?: (mood: Mood | null) => void;
  followUpResponse?: string;
  onFollowUpResponseChange?: (response: string) => void;
};

/**
 * Component displaying AI-generated reflection, mood suggestion, and follow-up question
 */
export default function AIReflection({
  reflection,
  currentMood,
  onMoodChange,
  followUpResponse = "",
  onFollowUpResponseChange,
}: AIReflectionProps) {
  if (!reflection) {
    return null;
  }

  return (
    <div className="ai-reflection">
      <div className="ai-reflection__section">
        <h3 className="ai-reflection__section-header">Reflection</h3>
        <p className="ai-reflection__text">{reflection.reflection}</p>
      </div>

      <div className="ai-reflection__section">
        <MoodDisplay
          suggestedMood={reflection.mood}
          currentMood={currentMood}
          onMoodChange={onMoodChange}
        />
      </div>

      <div className="ai-reflection__section">
        <h3 className="ai-reflection__section-header">Follow-up Question</h3>
        <p className="ai-reflection__question">{reflection.followUpQuestion}</p>
        <div className="ai-reflection__response-container">
          <textarea
            value={followUpResponse}
            onChange={(e) => onFollowUpResponseChange?.(e.target.value)}
            placeholder="You can jot a response here (optional)"
            rows={2}
            className="ai-reflection__response-textarea"
          />
        </div>
      </div>

      {reflection.goalMention && (
        <div className="ai-reflection__goal-mention">
          <h3 className="ai-reflection__goal-mention-header">Goal Progress</h3>
          <p className="ai-reflection__goal-mention-text">{reflection.goalMention}</p>
        </div>
      )}

      <div className="ai-reflection__disclaimer">
        <p className="ai-reflection__disclaimer-text">
          AI reflection is for self-reflection assistance only. Not a substitute for professional mental health care or diagnosis. Your journal entries are encrypted and stored securely.
        </p>
      </div>
    </div>
  );
}
