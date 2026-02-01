import { Timestamp } from "firebase/firestore";
import { getTodayStart } from "./dates";
import { TEXT_PREVIEW_LENGTH } from "../constants";

/**
 * Converts a Date or Firestore Timestamp to a Date object
 */
export function toDate(date: Date | Timestamp): Date {
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  return date instanceof Date ? date : new Date(date);
}

/**
 * Formats a date relative to today (e.g., "Today", "Yesterday", "3 days ago")
 */
export function formatRelativeDate(date: Date | Timestamp): string {
  const dateObj = toDate(date);
  const today = getTodayStart();
  const entryDate = new Date(dateObj);
  entryDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - entryDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a week range (e.g., "Jan 25 - Jan 31")
 */
export function formatWeekRange(date: Date): string {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

/**
 * Gets a preview of text (first line, truncated to maxLength)
 */
export function getTextPreview(text: string, maxLength: number = TEXT_PREVIEW_LENGTH): string {
  const firstLine = text.split("\n")[0];
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.substring(0, maxLength).trim() + "...";
}
