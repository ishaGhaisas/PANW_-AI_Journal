import type { Timestamp } from "firebase/firestore";
import type { ReflectionResponse } from "./ai";
import type { Habits } from "@/lib/habits";

export type JournalEntry = {
  id?: string; // Firestore document ID
  userId: string;
  date: Date | Timestamp; // Date of the entry
  text: string; // Original journal entry text
  moodSuggested: string; // AI-suggested mood
  moodManual?: string; // User's manual mood override (optional)
  reflection: string; // AI reflection text
  followUpQuestion: string; // AI follow-up question
  habits?: Habits; // Daily habits tracking (e.g., { walk: true, water: false, read: true })
  sleepHours?: number; // Hours slept (0-12, optional)
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

export type JournalEntryInput = {
  text: string;
  reflection: ReflectionResponse;
  moodManual?: string;
  habits?: Habits;
  sleepHours?: number;
};
