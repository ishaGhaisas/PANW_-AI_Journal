"use client";

import { useState, useEffect } from "react";
import { useJournalState } from "./JournalStateContext";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getTodayJournalEntry, updateJournalEntry } from "@/lib/firebase/journal";
import { getUserFriendlyError, logError } from "@/lib/utils/errorHandler";
import { isAuthenticated } from "@/lib/utils/validation";
import "./SleepTracker.css";

const MAX_SLEEP_HOURS = 12;

/**
 * Component for tracking sleep hours with auto-save functionality
 */
export default function SleepTracker() {
  const { user } = useAuth();
  const { sleepHours, setSleepHours } = useJournalState();
  const [localValue, setLocalValue] = useState<string>(
    sleepHours?.toString() || ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sleepHours !== undefined && sleepHours !== null) {
      setLocalValue(sleepHours.toString());
    } else {
      setLocalValue("");
    }
  }, [sleepHours]);

  /**
   * Handles input value changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);

    if (value === "" || value === undefined) {
      setSleepHours(undefined);
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= MAX_SLEEP_HOURS) {
      setSleepHours(numValue);
    } else if (value === "") {
      setSleepHours(undefined);
    }
  };

  /**
   * Validates and auto-saves sleep hours on blur
   */
  const handleBlur = async () => {
    let finalValue: number | undefined = undefined;

    if (localValue === "" || localValue === undefined) {
      setSleepHours(undefined);
      finalValue = undefined;
    } else {
      const numValue = parseFloat(localValue);
      if (isNaN(numValue) || numValue < 0) {
        setLocalValue("");
        setSleepHours(undefined);
        finalValue = undefined;
      } else if (numValue > MAX_SLEEP_HOURS) {
        setLocalValue(MAX_SLEEP_HOURS.toString());
        setSleepHours(MAX_SLEEP_HOURS);
        finalValue = MAX_SLEEP_HOURS;
      } else {
        setLocalValue(numValue.toString());
        setSleepHours(numValue);
        finalValue = numValue;
      }
    }

    if (isAuthenticated(user)) {
      try {
        setSaving(true);
        const todayEntry = await getTodayJournalEntry(user.uid);

        if (todayEntry?.id) {
          await updateJournalEntry(todayEntry.id, {
            sleepHours: finalValue,
          });
        }
      } catch (error) {
        logError("Failed to auto-save sleep", error);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="sleep-tracker">
      <h2 className="sleep-tracker__header">SLEEP</h2>
      <div>
        <label htmlFor="sleep-hours" className="sleep-tracker__label">
          Hours slept
        </label>
        <input
          id="sleep-hours"
          type="number"
          min="0"
          max={MAX_SLEEP_HOURS}
          step="0.5"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="—"
          disabled={saving}
          className="sleep-tracker__input"
        />
        <p className="sleep-tracker__hint">
          {saving ? "Saving..." : "Optional — auto-saves when journal entry exists"}
        </p>
      </div>
    </div>
  );
}
