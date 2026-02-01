import { getAdminFirestore } from "./admin";
import { FIREBASE_COLLECTIONS } from "../constants";
import type { JournalEntry } from "@/types/journal";
import type { Timestamp as AdminTimestamp } from "firebase-admin/firestore";

const JOURNAL_ENTRIES_COLLECTION = FIREBASE_COLLECTIONS.JOURNAL_ENTRIES;

/**
 * Converts Admin SDK Timestamp to Date
 */
function adminTimestampToDate(timestamp: AdminTimestamp | Date | unknown): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
    return (timestamp as AdminTimestamp).toDate();
  }
  return new Date();
}

/**
 * Converts Firestore document to JournalEntry (server-side)
 */
function docToJournalEntry(docId: string, data: FirebaseFirestore.DocumentData): JournalEntry {
  return {
    id: docId,
    userId: data.userId as string,
    date: adminTimestampToDate(data.date),
    text: data.text as string,
    moodSuggested: data.moodSuggested as string,
    moodManual: data.moodManual as string | undefined,
    reflection: data.reflection as string,
    followUpQuestion: data.followUpQuestion as string,
    followUpResponse: data.followUpResponse as string | undefined,
    habits: data.habits as Record<string, boolean> | undefined,
    sleepHours: data.sleepHours as number | undefined,
    createdAt: adminTimestampToDate(data.createdAt),
    updatedAt: adminTimestampToDate(data.updatedAt),
  };
}

/**
 * Gets the last N journal entries for a user (server-side using Admin SDK)
 */
export async function getLastNJournalEntries(
  userId: string,
  limit: number = 7
): Promise<JournalEntry[]> {
  try {
    const db = getAdminFirestore();
    const q = db
      .collection(JOURNAL_ENTRIES_COLLECTION)
      .where("userId", "==", userId)
      .orderBy("date", "desc")
      .limit(limit);

    const querySnapshot = await q.get();
    const entries: JournalEntry[] = [];

    querySnapshot.forEach((doc) => {
      entries.push(docToJournalEntry(doc.id, doc.data()));
    });

    return entries;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get last ${limit} journal entries: ${message}`);
  }
}
