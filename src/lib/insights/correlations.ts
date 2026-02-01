import type { JournalEntry } from "@/types/journal";
import { getMoodCategory } from "@/lib/moodCategories";
import {
  SLEEP_THRESHOLD_HOURS,
  CORRELATION_MIN_ENTRIES,
  CORRELATION_MIN_DIFFERENCE_PERCENT,
  CORRELATION_HABIT_MIN_DIFFERENCE_PERCENT,
  CORRELATION_STRONG_THRESHOLD,
  CORRELATION_HABIT_STRONG_THRESHOLD,
} from "../constants";

type Correlation = {
  statement: string;
  strength: "strong" | "moderate" | "weak";
};

/**
 * Analyzes correlations between sleep and mood
 */
export function analyzeSleepMoodCorrelation(entries: JournalEntry[]): Correlation | null {
  const entriesWithSleep = entries.filter(
    (e) => e.sleepHours !== undefined && e.sleepHours !== null && (e.moodManual || e.moodSuggested)
  );

  if (entriesWithSleep.length < CORRELATION_MIN_ENTRIES) {
    return null;
  }

  const lowSleep = entriesWithSleep.filter((e) => (e.sleepHours || 0) < SLEEP_THRESHOLD_HOURS);
  const highSleep = entriesWithSleep.filter((e) => (e.sleepHours || 0) >= SLEEP_THRESHOLD_HOURS);

  if (lowSleep.length === 0 || highSleep.length === 0) {
    return null;
  }

  const lowSleepTired = lowSleep.filter((e) => {
    const mood = e.moodManual || e.moodSuggested;
    if (!mood) return false;
    const category = getMoodCategory(mood);
    return category === "tired" || category === "anxious";
  }).length;

  const highSleepTired = highSleep.filter((e) => {
    const mood = e.moodManual || e.moodSuggested;
    if (!mood) return false;
    const category = getMoodCategory(mood);
    return category === "tired" || category === "anxious";
  }).length;

  const lowSleepTiredPct = (lowSleepTired / lowSleep.length) * 100;
  const highSleepTiredPct = (highSleepTired / highSleep.length) * 100;

  if (lowSleepTiredPct > highSleepTiredPct + CORRELATION_MIN_DIFFERENCE_PERCENT) {
    const strength =
      lowSleepTiredPct > highSleepTiredPct + CORRELATION_STRONG_THRESHOLD ? "strong" : "moderate";
    return {
      statement: "Less sleep often aligned with tired or anxious moods",
      strength,
    };
  }

  return null;
}

/**
 * Analyzes correlations between habits and mood
 */
export function analyzeHabitMoodCorrelation(entries: JournalEntry[]): Correlation[] {
  const correlations: Correlation[] = [];
  const entriesWithHabits = entries.filter(
    (e) => e.habits && Object.keys(e.habits).length > 0 && (e.moodManual || e.moodSuggested)
  );

  if (entriesWithHabits.length < CORRELATION_MIN_ENTRIES) {
    return correlations;
  }

  const withCompletedHabits = entriesWithHabits.filter((e) => {
    if (!e.habits) return false;
    return Object.values(e.habits).some((completed) => completed === true);
  });

  const withoutCompletedHabits = entriesWithHabits.filter((e) => {
    if (!e.habits) return true;
    return !Object.values(e.habits).some((completed) => completed === true);
  });

  if (withCompletedHabits.length < 2 || withoutCompletedHabits.length < 2) {
    return correlations;
  }

  const withHabitCalm = withCompletedHabits.filter((e) => {
    const mood = e.moodManual || e.moodSuggested;
    if (!mood) return false;
    const category = getMoodCategory(mood);
    return category === "calm" || category === "happy";
  }).length;

  const withoutHabitCalm = withoutCompletedHabits.filter((e) => {
    const mood = e.moodManual || e.moodSuggested;
    if (!mood) return false;
    const category = getMoodCategory(mood);
    return category === "calm" || category === "happy";
  }).length;

  const withHabitPct = (withHabitCalm / withCompletedHabits.length) * 100;
  const withoutHabitPct = (withoutHabitCalm / withoutCompletedHabits.length) * 100;

  if (withHabitPct > withoutHabitPct + CORRELATION_HABIT_MIN_DIFFERENCE_PERCENT) {
    const strength =
      withHabitPct > withoutHabitPct + CORRELATION_HABIT_STRONG_THRESHOLD ? "strong" : "moderate";
    correlations.push({
      statement: "Completed habits often appeared on calmer days",
      strength,
    });
  }

  return correlations;
}
