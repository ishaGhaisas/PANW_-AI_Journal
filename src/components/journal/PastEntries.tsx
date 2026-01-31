"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserJournalEntries } from "@/lib/firebase/journal";
import { getUserHabits } from "@/lib/firebase/userHabits";
import type { JournalEntry } from "@/types/journal";
import type { Habit } from "@/lib/habits";
import { Timestamp } from "firebase/firestore";

export default function PastEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (user) {
      loadPastEntries();
    }
  }, [user]);

  const loadPastEntries = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const allEntries = await getUserJournalEntries(user.uid);
      // Show all entries including today (users can write multiple times a day)
      setEntries(allEntries);
    } catch (error) {
      console.error("Failed to load past entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | Timestamp): string => {
    const dateObj = date instanceof Timestamp 
      ? date.toDate() 
      : new Date(date);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entryDate = new Date(dateObj);
    entryDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - entryDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    // Format as "Mon Jan 15" for older entries
    return entryDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getMoodDisplay = (entry: JournalEntry): string => {
    return entry.moodManual || entry.moodSuggested || "—";
  };

  const getTextPreview = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-[var(--color-shell)] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          PAST
        </h2>
        <p className="text-sm text-[var(--color-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg bg-[var(--color-shell)] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          PAST
        </h2>
        {entries.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No past entries yet.
          </p>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {entries.map((entry) => {
              const entryDate = entry.date instanceof Timestamp 
                ? entry.date.toDate() 
                : new Date(entry.date);
              
              return (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="w-full text-left rounded-md p-3 hover:bg-[var(--color-paper)] transition-colors border border-transparent hover:border-[var(--color-shell)]"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-[var(--color-muted)] uppercase">
                      {formatDate(entryDate)}
                    </span>
                    <span className="text-xs text-[var(--color-accent)] font-medium">
                      {getMoodDisplay(entry)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text)] line-clamp-2">
                    {getTextPreview(entry.text)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </>
  );
}

function EntryDetailModal({
  entry,
  onClose,
}: {
  entry: JournalEntry;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [userHabits, setUserHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (user && entry.habits) {
      loadUserHabits();
    }
  }, [user, entry.habits]);

  const loadUserHabits = async () => {
    if (!user) return;
    try {
      const habits = await getUserHabits(user.uid);
      setUserHabits(habits);
    } catch (error) {
      console.error("Failed to load user habits:", error);
    }
  };

  const getHabitLabel = (habitId: string): string => {
    const habit = userHabits.find((h) => h.id === habitId);
    return habit?.label || habitId;
  };

  const entryDate = entry.date instanceof Timestamp 
    ? entry.date.toDate() 
    : new Date(entry.date);

  const formattedDate = entryDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getMoodDisplay = (): string => {
    return entry.moodManual || entry.moodSuggested || "—";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-[var(--color-paper)] p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3
              className="text-lg font-journal text-[var(--color-text)] mb-1"
              style={{ fontFamily: "var(--font-journal)" }}
            >
              {formattedDate}
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[var(--color-muted)]">Mood:</span>
              <span className="text-[var(--color-accent)] font-medium">
                {getMoodDisplay()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            ×
          </button>
        </div>

        {/* Journal Text */}
        <div className="mb-6">
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Entry
          </h4>
          <p
            className="font-journal text-base leading-relaxed text-[var(--color-text)] whitespace-pre-wrap"
            style={{ fontFamily: "var(--font-journal)" }}
          >
            {entry.text}
          </p>
        </div>

        {/* AI Reflection */}
        {entry.reflection && (
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Reflection
            </h4>
            <p
              className="font-journal text-base leading-relaxed text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-journal)" }}
            >
              {entry.reflection}
            </p>
          </div>
        )}

        {/* Follow-up Question */}
        {entry.followUpQuestion && (
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Follow-up Question
            </h4>
            <p
              className="font-journal text-base leading-relaxed text-[var(--color-text)] italic"
              style={{ fontFamily: "var(--font-journal)" }}
            >
              {entry.followUpQuestion}
            </p>
          </div>
        )}

        {/* Habits */}
        {entry.habits && Object.keys(entry.habits).length > 0 && (
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Habits
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(entry.habits).map(([habitId, completed]) => (
                <span
                  key={habitId}
                  className={`text-sm px-2 py-1 rounded ${
                    completed
                      ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                      : "bg-[var(--color-shell)] text-[var(--color-muted)]"
                  }`}
                >
                  {getHabitLabel(habitId)} {completed ? "✓" : "○"}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sleep */}
        {entry.sleepHours !== undefined && entry.sleepHours !== null && (
          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Sleep
            </h4>
            <p className="text-base text-[var(--color-text)]">
              {entry.sleepHours} hours
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
