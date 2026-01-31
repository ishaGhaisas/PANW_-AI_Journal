"use client";

import { useState, useEffect } from "react";
import { useJournalState } from "./JournalStateContext";

export default function SleepTracker() {
  const { sleepHours, setSleepHours } = useJournalState();
  const [localValue, setLocalValue] = useState<string>(
    sleepHours?.toString() || ""
  );

  // Sync local value when sleepHours changes externally
  useEffect(() => {
    if (sleepHours !== undefined && sleepHours !== null) {
      setLocalValue(sleepHours.toString());
    } else {
      setLocalValue("");
    }
  }, [sleepHours]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);

    // Parse the value
    if (value === "" || value === undefined) {
      setSleepHours(undefined);
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 12) {
      setSleepHours(numValue);
    } else if (value === "") {
      setSleepHours(undefined);
    }
  };

  const handleBlur = () => {
    // Validate on blur
    if (localValue === "" || localValue === undefined) {
      setSleepHours(undefined);
      return;
    }

    const numValue = parseFloat(localValue);
    if (isNaN(numValue) || numValue < 0) {
      setLocalValue("");
      setSleepHours(undefined);
    } else if (numValue > 12) {
      setLocalValue("12");
      setSleepHours(12);
    } else {
      setLocalValue(numValue.toString());
      setSleepHours(numValue);
    }
  };

  return (
    <div className="rounded-lg bg-[var(--color-shell)] p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        SLEEP
      </h2>
      <div>
        <label
          htmlFor="sleep-hours"
          className="mb-2 block text-sm text-[var(--color-muted)]"
        >
          Hours slept
        </label>
        <input
          id="sleep-hours"
          type="number"
          min="0"
          max="12"
          step="0.5"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="—"
          className="w-full rounded-md border border-[var(--color-shell)] bg-[var(--color-paper)] px-3 py-2 text-base text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
        />
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Optional — leave blank if you don't remember
        </p>
      </div>
    </div>
  );
}
