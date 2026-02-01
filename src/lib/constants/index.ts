/**
 * Application-wide constants
 */

export const SLEEP_THRESHOLD_HOURS = 7;
export const CORRELATION_MIN_ENTRIES = 3;
export const CORRELATION_MIN_DIFFERENCE_PERCENT = 20;
export const CORRELATION_HABIT_MIN_DIFFERENCE_PERCENT = 15;
export const CORRELATION_STRONG_THRESHOLD = 30;
export const CORRELATION_HABIT_STRONG_THRESHOLD = 25;
export const WEEKLY_REFLECTION_DAYS = 7;
export const SUCCESS_MESSAGE_DURATION = 3000;
export const TEXT_PREVIEW_LENGTH = 120;
export const RECENT_ENTRIES_CONTEXT_LIMIT = 3;
export const RECENT_ENTRY_TEXT_PREVIEW = 150;

export const FIREBASE_COLLECTIONS = {
  JOURNAL_ENTRIES: "journalEntries",
  USER_HABITS: "userHabits",
  GOALS: "goals",
} as const;

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
