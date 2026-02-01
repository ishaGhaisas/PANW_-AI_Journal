"use client";

import { useState, useEffect } from "react";
import JournalEditor from "./JournalEditor";
import AIReflection from "./AIReflection";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { saveJournalEntry, getTodayJournalEntry, updateJournalEntry } from "@/lib/firebase/journal";
import { useJournalState } from "./JournalStateContext";
import { reflectOnEntry } from "@/lib/api/client";
import { isNonEmptyString, isAuthenticated } from "@/lib/utils/validation";
import { getUserFriendlyError } from "@/lib/utils/errorHandler";
import { SUCCESS_MESSAGE_DURATION } from "@/lib/constants";
import type { ReflectionResponse } from "@/types/ai";
import type { JournalEntry } from "@/types/journal";
import type { Mood } from "@/lib/moods";
import "./JournalContainer.css";

export default function JournalContainer() {
  const { user } = useAuth();
  const {
    habits,
    setHabits,
    sleepHours,
    setSleepHours,
    setJournalText: setContextJournalText,
    setReflection: setContextReflection,
  } = useJournalState();
  const [reflection, setReflection] = useState<ReflectionResponse | null>(null);
  const [journalText, setJournalText] = useState("");
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [manualMood, setManualMood] = useState<Mood | null>(null);
  const [followUpResponse, setFollowUpResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [reflecting, setReflecting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reflectError, setReflectError] = useState("");

  useEffect(() => {
    setContextJournalText(journalText);
  }, [journalText, setContextJournalText]);

  useEffect(() => {
    setContextReflection(reflection);
  }, [reflection, setContextReflection]);

  useEffect(() => {
    if (user) {
      loadTodayEntry();
    }
  }, [user]);

  /**
   * Loads today's journal entry and restores state
   */
  const loadTodayEntry = async () => {
    if (!isAuthenticated(user)) return;

    try {
      const entry = await getTodayJournalEntry(user.uid);
      if (entry) {
        setTodayEntry(entry);
        if (journalText === "") {
          setJournalText(entry.text);
        }
        if (entry.reflection && entry.moodSuggested && entry.followUpQuestion) {
          setReflection({
            reflection: entry.reflection,
            mood: entry.moodSuggested,
            followUpQuestion: entry.followUpQuestion,
          });
        }
        if (entry.moodManual) {
          setManualMood(entry.moodManual as Mood);
        }
        if (entry.habits) {
          setHabits(entry.habits);
        }
        if (entry.sleepHours !== undefined && entry.sleepHours !== null) {
          setSleepHours(entry.sleepHours);
        }
        if (entry.followUpResponse) {
          setFollowUpResponse(entry.followUpResponse);
        }
      }
    } catch (error) {
      getUserFriendlyError(error, "Failed to load today's entry");
    }
  };

  /**
   * Handles completion of AI reflection
   */
  const handleReflectionComplete = (reflectionData: ReflectionResponse) => {
    setReflection(reflectionData);
    setSaveSuccess(false);
    setReflectError("");
    setManualMood(null);
    setFollowUpResponse("");
  };

  /**
   * Handles manual mood change
   */
  const handleMoodChange = (mood: Mood | null) => {
    setManualMood(mood);
    setSaveSuccess(false);
  };

  /**
   * Builds entry data for saving/updating
   */
  const buildEntryData = () => ({
    text: journalText,
    reflection: reflection!,
    moodManual: manualMood || undefined,
    habits: Object.keys(habits).length > 0 ? habits : undefined,
    sleepHours: sleepHours,
    followUpResponse: isNonEmptyString(followUpResponse) ? followUpResponse.trim() : undefined,
  });

  /**
   * Calls AI API to reflect again on updated journal text
   */
  const handleReflectAgain = async () => {
    if (!isNonEmptyString(journalText)) {
      setReflectError("Please write something before reflecting");
      return;
    }

    setReflecting(true);
    setReflectError("");
    setSaveSuccess(false);

    try {
      const data = await reflectOnEntry(journalText, user?.uid);
      setReflection(data as ReflectionResponse);
      setManualMood(null);
      setFollowUpResponse("");
    } catch (err: unknown) {
      setReflectError(getUserFriendlyError(err, "Failed to reflect. Please try again."));
    } finally {
      setReflecting(false);
    }
  };

  /**
   * Saves or updates the journal entry
   */
  const handleSave = async () => {
    if (!isAuthenticated(user)) {
      setSaveError("You must be logged in to save");
      return;
    }

    if (!isNonEmptyString(journalText)) {
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
      const entryData = buildEntryData();

      if (todayEntry?.id) {
        await updateJournalEntry(todayEntry.id, entryData);
        setTodayEntry({
          ...todayEntry,
          text: entryData.text,
          moodManual: entryData.moodManual,
          habits: entryData.habits,
          sleepHours: entryData.sleepHours,
          followUpResponse: entryData.followUpResponse,
          reflection: reflection.reflection,
          moodSuggested: reflection.mood,
          followUpQuestion: reflection.followUpQuestion,
        });
      } else {
        await saveJournalEntry(user.uid, entryData);
        const newEntry = await getTodayJournalEntry(user.uid);
        if (newEntry) {
          setTodayEntry(newEntry);
        }
      }

      setSaveSuccess(true);
      setReflectError("");
      
      setJournalText("");
      setReflection(null);
      setManualMood(null);
      setFollowUpResponse("");
      setHabits({});
      setSleepHours(undefined);
      
      setTimeout(() => setSaveSuccess(false), SUCCESS_MESSAGE_DURATION);
    } catch (err: unknown) {
      setSaveError(getUserFriendlyError(err, "Failed to save entry"));
    } finally {
      setSaving(false);
    }
  };

  const shouldShowReflection = reflection !== null;
  const hasReflection = !!reflection;

  return (
    <div>
      <JournalEditor
        value={journalText}
        onChange={setJournalText}
        onReflectionComplete={handleReflectionComplete}
        userId={user?.uid}
      />
      {shouldShowReflection && (
        <AIReflection
          reflection={reflection}
          currentMood={manualMood}
          onMoodChange={handleMoodChange}
          followUpResponse={followUpResponse}
          onFollowUpResponseChange={setFollowUpResponse}
        />
      )}
      {hasReflection && (
        <div className="journal-container__buttons">
          {saveError && <div className="journal-container__error">{saveError}</div>}
          {reflectError && <div className="journal-container__error">{reflectError}</div>}
          {saveSuccess && <div className="journal-container__message journal-container__message--success">Entry saved successfully!</div>}
          <div className="journal-container__buttons-wrapper">
            <Button
              onClick={handleReflectAgain}
              variant="secondary"
              loading={reflecting}
              disabled={!isNonEmptyString(journalText) || reflecting || saving}
            >
              Reflect Again
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              loading={saving}
              disabled={!isNonEmptyString(journalText) || !reflection || reflecting || saving}
            >
              {todayEntry ? "Update Entry" : "Save Entry"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
