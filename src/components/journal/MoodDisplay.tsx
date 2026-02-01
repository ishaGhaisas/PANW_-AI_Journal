"use client";

import { useState } from "react";
import { MOOD_OPTIONS, type Mood } from "@/lib/moods";
import "./MoodDisplay.css";

type MoodDisplayProps = {
  suggestedMood: string;
  currentMood?: string | null;
  onMoodChange?: (mood: Mood | null) => void;
};

/**
 * Component for displaying and selecting mood with override capability
 */
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

  /**
   * Handles mood selection from dropdown
   */
  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setIsEditing(false);
    onMoodChange?.(mood);
  };

  /**
   * Clears mood override and uses suggested mood
   */
  const handleClearOverride = () => {
    setSelectedMood(null);
    setIsEditing(false);
    onMoodChange?.(null);
  };

  return (
    <div className="mood-display">
      <div className="mood-display__container">
        <span className="mood-display__label">
          {isOverridden ? "Your Mood" : "Suggested Mood"}:
        </span>
        <div className="relative">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mood-display__button"
          >
            <span>{displayMood}</span>
          </button>

          {isEditing && (
            <>
              <div
                className="mood-display__backdrop"
                onClick={() => setIsEditing(false)}
              />
              <div className="mood-display__dropdown">
                <div className="mood-display__dropdown-content">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => handleMoodSelect(mood)}
                      className={`mood-display__option ${
                        selectedMood === mood ? "mood-display__option--selected" : ""
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                  {isOverridden && (
                    <>
                      <div className="mood-display__divider" />
                      <button
                        onClick={handleClearOverride}
                        className="mood-display__clear-button"
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
        <p className="mood-display__hint">Suggested: {suggestedMood}</p>
      )}
    </div>
  );
}
