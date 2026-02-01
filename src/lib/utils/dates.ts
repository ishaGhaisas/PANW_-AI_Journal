import { Timestamp } from "firebase/firestore";
import { DATE_FORMAT_OPTIONS } from "../constants";

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
 * Formats a date to a readable string (e.g., "Monday, January 31, 2026")
 */
export function formatDate(date: Date | Timestamp): string {
  const dateObj = toDate(date);
  return dateObj.toLocaleDateString("en-US", DATE_FORMAT_OPTIONS);
}

/**
 * Gets today's date at midnight (00:00:00)
 */
export function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Gets tomorrow's date at midnight (00:00:00)
 */
export function getTomorrowStart(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Gets the Monday of the week for a given date
 */
export function getMondayOfWeek(date: Date): Date {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Checks if a date is a Sunday
 */
export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}
