"use client";

import { useState, useEffect } from "react";
import JournalEditor from "./JournalEditor";
import AIReflection from "./AIReflection";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { saveJournalEntry, getTodayJournalEntry, updateJournalEntry } from "@/lib/firebase/journal";
import { useJournalState } from "./JournalStateContext";
import type { ReflectionResponse } from "@/types/ai";
import type { JournalEntry } from "@/types/journal";
import type { Mood } from "@/lib/moods";

export default function JournalContainer() {
  const { user } = useAuth();
  const { habits, setHabits, sleepHours, setSleepHours } = useJournalState();
  const [reflection, setReflection] = useState<ReflectionResponse | null>(null);
  const [journalText, setJournalText] = useState("");
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [manualMood, setManualMood] = useState<Mood | null>(null);
  const [saving, setSaving] = useState(false);
  const [reflecting, setReflecting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reflectError, setReflectError] = useState("");

  // Load today's entry on mount
  useEffect(() => {
    if (user) {
      loadTodayEntry();
    }
  }, [user]);

  const loadTodayEntry = async () => {
    if (!user) return;

    try {
      const entry = await getTodayJournalEntry(user.uid);
      if (entry) {
        setTodayEntry(entry);
        setJournalText(entry.text);
        // Restore manual mood if it exists
        if (entry.moodManual) {
          setManualMood(entry.moodManual as Mood);
        }
        // Restore habits if they exist
        if (entry.habits) {
          setHabits(entry.habits);
        }
        // Restore sleep hours if it exists
        if (entry.sleepHours !== undefined && entry.sleepHours !== null) {
          setSleepHours(entry.sleepHours);
        }
        // Restore reflection if it exists
        if (entry.reflection && entry.moodSuggested && entry.followUpQuestion) {
          setReflection({
            reflection: entry.reflection,
            mood: entry.moodSuggested,
            followUpQuestion: entry.followUpQuestion,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load today's entry:", error);
    }
  };

  const handleReflectionComplete = (reflectionData: ReflectionResponse) => {
    setReflection(reflectionData);
    setSaveSuccess(false); // Reset save success when new reflection is generated
    setReflectError(""); // Clear any reflect errors
    // Reset manual mood when new reflection is generated (user can override again)
    setManualMood(null);
  };

  const handleMoodChange = (mood: Mood | null) => {
    setManualMood(mood);
    setSaveSuccess(false); // Reset save success when mood changes
  };

  const handleReflectAgain = async () => {
    if (!journalText.trim()) {
      setReflectError("Please write something before reflecting");
      return;
    }

    setReflecting(true);
    setReflectError("");
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/ai/reflect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: journalText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get reflection");
      }

      const data = (await response.json()) as ReflectionResponse;
      setReflection(data);
      // Reset manual mood when new reflection is generated
      setManualMood(null);
    } catch (err: any) {
      setReflectError(err.message || "Failed to reflect. Please try again.");
    } finally {
      setReflecting(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setSaveError("You must be logged in to save");
      return;
    }

    if (!journalText.trim()) {
      setSaveError("Please write something before saving");
      return;
    }

    if (!reflection) {
      setSaveError("Please reflect on your entry before saving");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      if (todayEntry?.id) {
        // Update existing entry
        await updateJournalEntry(todayEntry.id, {
          text: journalText,
          reflection: reflection,
          moodManual: manualMood || undefined,
          habits: Object.keys(habits).length > 0 ? habits : undefined,
          sleepHours: sleepHours,
        });
      } else {
        // Create new entry
        await saveJournalEntry(user.uid, {
          text: journalText,
          reflection: reflection,
          moodManual: manualMood || undefined,
          habits: Object.keys(habits).length > 0 ? habits : undefined,
          sleepHours: sleepHours,
        });
      }

      setSaveSuccess(true);
      setReflectError(""); // Clear reflect errors on successful save
      // Reload today's entry to get the updated data
      await loadTodayEntry();
      
      // Clear reflection after saving (but keep habits and sleep)
      setReflection(null);
      setManualMood(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <JournalEditor
        value={journalText}
        onChange={setJournalText}
        onReflectionComplete={handleReflectionComplete}
      />
      <AIReflection 
        reflection={reflection} 
        currentMood={manualMood}
        onMoodChange={handleMoodChange}
      />
      
      {/* Reflect Again and Save buttons */}
      {reflection && (
        <div className="mt-6">
          {saveError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {saveError}
            </div>
          )}
          {reflectError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {reflectError}
            </div>
          )}
          {saveSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
              Entry saved successfully!
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleReflectAgain}
              variant="secondary"
              loading={reflecting}
              disabled={!journalText.trim() || reflecting || saving}
            >
              Reflect Again
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              loading={saving}
              disabled={!journalText.trim() || !reflection || reflecting || saving}
            >
              {todayEntry ? "Update Entry" : "Save Entry"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
