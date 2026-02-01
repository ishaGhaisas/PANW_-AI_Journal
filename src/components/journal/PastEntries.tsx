"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserHabits } from "@/lib/firebase/userHabits";
import { getMoodColor, MOOD_CATEGORIES } from "@/lib/moodCategories";
import { formatDate, toDate, getMondayOfWeek, isSunday } from "@/lib/utils/dates";
import { formatRelativeDate, formatWeekRange, getTextPreview } from "@/lib/utils/dateFormatters";
import { getUserFriendlyError } from "@/lib/utils/errorHandler";
import { isAuthenticated } from "@/lib/utils/validation";
import { FIREBASE_COLLECTIONS, WEEKLY_REFLECTION_DAYS } from "@/lib/constants";
import { Timestamp, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Button from "@/components/ui/Button";
import type { JournalEntry } from "@/types/journal";
import "./PastEntries.css";

type EntryDetailModalProps = {
  entry: JournalEntry;
  onClose: () => void;
  userHabitLabels: Record<string, string>;
};

/**
 * Modal component displaying full details of a journal entry
 */
function EntryDetailModal({ entry, onClose, userHabitLabels }: EntryDetailModalProps) {
  const formattedDate = formatDate(entry.date);
  const displayMood = entry.moodManual || entry.moodSuggested;

  return (
    <div className="past-entries__modal-overlay" onClick={onClose}>
      <div className="past-entries__modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="past-entries__modal-close" aria-label="Close">
          ×
        </button>
        <h2 className="past-entries__modal-title">{formattedDate}</h2>
        <div className="past-entries__modal-section">
          <div>
            <h3 className="past-entries__modal-section-header">Mood</h3>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-4"
                style={{ backgroundColor: getMoodColor(displayMood) }}
              />
              <p className="text-lg font-medium text-[var(--color-text)]">{displayMood}</p>
            </div>
          </div>
          <div>
            <h3 className="past-entries__modal-section-header">Your Entry</h3>
            <p className="past-entries__modal-text">
              {entry.text}
            </p>
          </div>
          {entry.reflection && (
            <div>
              <h3 className="past-entries__modal-section-header">AI Reflection</h3>
              <p className="past-entries__modal-text">
                {entry.reflection}
              </p>
            </div>
          )}
          {entry.followUpQuestion && (
            <div>
              <h3 className="past-entries__modal-section-header">Follow-up Question</h3>
              <p className="past-entries__modal-text past-entries__modal-text--italic">
                {entry.followUpQuestion}
              </p>
              {entry.followUpResponse && (
                <div className="past-entries__modal-response">
                  <p className="past-entries__modal-response-text">
                    {entry.followUpResponse}
                  </p>
                </div>
              )}
            </div>
          )}
          {entry.habits && Object.keys(entry.habits).length > 0 && (
            <div>
              <h3 className="past-entries__modal-section-header">Habits</h3>
              <ul className="past-entries__modal-list">
                {Object.entries(entry.habits).map(([habitId, completed]) => (
                  <li key={habitId} className="past-entries__modal-list-item">
                    <span className="past-entries__modal-checkmark">{completed ? "✓" : "○"}</span>
                    <span>{userHabitLabels[habitId] || habitId}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {entry.sleepHours !== undefined && entry.sleepHours !== null && (
            <div>
              <h3 className="past-entries__modal-section-header">Sleep</h3>
              <p className="text-lg font-medium text-[var(--color-text)]">
                {entry.sleepHours} hours
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Main component displaying list of past journal entries with weekly reflection triggers
 */
export default function PastEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [userHabitLabels, setUserHabitLabels] = useState<Record<string, string>>({});
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    if (!isAuthenticated(user)) return;

    loadUserHabits();

    const q = query(
      collection(db, FIREBASE_COLLECTIONS.JOURNAL_ENTRIES),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const entriesList: JournalEntry[] = [];
        querySnapshot.forEach((doc) => {
          entriesList.push({
            id: doc.id,
            ...doc.data(),
          } as JournalEntry);
        });
        setEntries(entriesList);
        setLoading(false);
      },
      (error) => {
        getUserFriendlyError(error, "Failed to load past entries");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  /**
   * Loads user habit labels for display in entry details
   */
  const loadUserHabits = async () => {
    if (!isAuthenticated(user)) return;
    try {
      const habits = await getUserHabits(user.uid);
      const labels: Record<string, string> = {};
      habits.forEach((habit) => {
        labels[habit.id] = habit.label;
      });
      setUserHabitLabels(labels);
    } catch (error) {
      getUserFriendlyError(error, "Failed to load user habits");
    }
  };

  /**
   * Gets mood display value for an entry
   */
  const getMoodDisplay = (entry: JournalEntry): string => {
    return entry.moodManual || entry.moodSuggested || "—";
  };

  /**
   * Renders mood color dot indicator
   */
  const getMoodDot = (entry: JournalEntry) => {
    const mood = getMoodDisplay(entry);
    const color = getMoodColor(mood);
    return (
      <span
        className="past-entries__entry-mood-dot"
        style={{ backgroundColor: color }}
        title={mood}
      />
    );
  };

  /**
   * Determines if weekly reflection button should be shown after current entry
   */
  const shouldShowWeeklyReflection = (currentIndex: number, entries: JournalEntry[]): boolean => {
    if (currentIndex === 0) return false;

    const currentEntry = entries[currentIndex];
    const currentDate = toDate(currentEntry.date);
    currentDate.setHours(0, 0, 0, 0);

    const currentMonday = getMondayOfWeek(currentDate);
    const daysInWeek = new Set<string>();

    for (let i = 0; i < entries.length; i++) {
      const entryDate = toDate(entries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      const entryMonday = getMondayOfWeek(entryDate);

      if (entryMonday.getTime() === currentMonday.getTime()) {
        const dateKey = entryDate.toISOString().split("T")[0];
        daysInWeek.add(dateKey);
      }
    }

    if (daysInWeek.size < WEEKLY_REFLECTION_DAYS) return false;

    if (isSunday(currentDate)) return true;

    if (currentIndex < entries.length - 1) {
      const nextEntry = entries[currentIndex + 1];
      const nextDate = toDate(nextEntry.date);
      const nextMonday = getMondayOfWeek(nextDate);

      if (nextMonday.getTime() !== currentMonday.getTime()) {
        return true;
      }
    } else {
      return true;
    }

    return false;
  };

  if (loading) {
    return (
      <div className="past-entries">
        <h2 className="past-entries__header">PAST</h2>
        <p className="past-entries__empty">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="past-entries">
        <div className="past-entries__header-container">
          <h2 className="past-entries__header">PAST</h2>
          {entries.length > 0 && (
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="past-entries__legend-toggle"
            >
              What do the colors mean?
            </button>
          )}
        </div>

        {entries.length > 0 && showLegend && (
          <div className="mb-4 pb-4 border-b border-[var(--color-muted)] border-opacity-10">
            <div className="flex flex-wrap gap-3">
              {MOOD_CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: category.color }}
                    title={category.label}
                  />
                  <span className="text-xs text-[var(--color-text)]">{category.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <p className="past-entries__empty">No past entries yet.</p>
        ) : (
          <div className="past-entries__list max-h-[600px] overflow-y-auto">
            {entries.map((entry, index) => {
              const entryDate = toDate(entry.date);
              const showReflection = shouldShowWeeklyReflection(index, entries);

              return (
                <div key={entry.id} className="space-y-3">
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="past-entries__entry w-full text-left"
                  >
                    <div className="past-entries__entry-header">
                      {getMoodDot(entry)}
                      <span className="past-entries__entry-date uppercase">
                        {formatRelativeDate(entryDate)}
                      </span>
                    </div>
                    <p className="past-entries__entry-preview">
                      {getTextPreview(entry.text)}
                    </p>
                  </button>

                  {showReflection && (
                    <div className="my-4 pt-4 border-t border-[var(--color-muted)] border-opacity-20">
                      <div className="rounded-md bg-[var(--color-paper)] p-4 space-y-3">
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-1">
                            WEEKLY REFLECTION
                          </h3>
                          <p className="text-xs text-[var(--color-muted)] italic">
                            A pause to look back at the past 7 days
                          </p>
                        </div>
                        <Button
                          href={`/weekly-reflection?week=${formatWeekRange(entryDate)}`}
                          variant="ghost"
                          className="w-full text-xs py-2 text-[var(--color-accent)] hover:underline cursor-pointer"
                        >
                          View reflection
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedEntry && (
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          userHabitLabels={userHabitLabels}
        />
      )}
    </>
  );
}
