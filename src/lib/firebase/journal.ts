import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { FIREBASE_COLLECTIONS } from "../constants";
import { isDefined, hasKeys } from "../utils/validation";
import { getTodayStart, getTomorrowStart, toDate } from "../utils/dates";
import type { JournalEntry, JournalEntryInput } from "@/types/journal";

const JOURNAL_ENTRIES_COLLECTION = FIREBASE_COLLECTIONS.JOURNAL_ENTRIES;

/**
 * Builds Firestore entry data from JournalEntryInput, excluding undefined/null values
 */
function buildEntryData(entryData: JournalEntryInput, now: Timestamp, today: Date): Record<string, unknown> {
  const entry: Record<string, unknown> = {
    text: entryData.text,
    moodSuggested: entryData.reflection.mood,
    reflection: entryData.reflection.reflection,
    followUpQuestion: entryData.reflection.followUpQuestion,
    createdAt: now,
    updatedAt: now,
    date: Timestamp.fromDate(today),
  };

  if (isDefined(entryData.moodManual)) {
    entry.moodManual = entryData.moodManual;
  }

  if (hasKeys(entryData.habits)) {
    entry.habits = entryData.habits;
  }

  if (isDefined(entryData.sleepHours)) {
    entry.sleepHours = entryData.sleepHours;
  }

  if (isDefined(entryData.followUpResponse) && entryData.followUpResponse.trim()) {
    entry.followUpResponse = entryData.followUpResponse.trim();
  }

  return entry;
}

/**
 * Builds update data for Firestore, excluding undefined/null values
 */
function buildUpdateData(updates: Partial<JournalEntryInput>): Record<string, unknown> {
  const updateData: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  if (updates.text !== undefined) {
    updateData.text = updates.text;
  }

  if (isDefined(updates.moodManual)) {
    updateData.moodManual = updates.moodManual;
  }

  if (updates.reflection) {
    updateData.reflection = updates.reflection.reflection;
    updateData.moodSuggested = updates.reflection.mood;
    updateData.followUpQuestion = updates.reflection.followUpQuestion;
  }

  if (updates.habits !== undefined) {
    updateData.habits = hasKeys(updates.habits) ? updates.habits : null;
  }

  if (updates.sleepHours !== undefined) {
    updateData.sleepHours = updates.sleepHours;
  }

  if (updates.followUpResponse !== undefined) {
    updateData.followUpResponse = isDefined(updates.followUpResponse) && updates.followUpResponse.trim()
      ? updates.followUpResponse.trim()
      : null;
  }

  return updateData;
}

/**
 * Converts Firestore document to JournalEntry
 */
function docToJournalEntry(docId: string, data: Record<string, unknown>): JournalEntry {
  return {
    id: docId,
    ...data,
  } as JournalEntry;
}

/**
 * Saves a new journal entry to Firestore
 */
export async function saveJournalEntry(
  userId: string,
  entryData: JournalEntryInput
): Promise<string> {
  try {
    const now = Timestamp.now();
    const today = getTodayStart();
    const entry = buildEntryData(entryData, now, today);
    entry.userId = userId;

    const docRef = await addDoc(collection(db, JOURNAL_ENTRIES_COLLECTION), entry);
    return docRef.id;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to save journal entry: ${message}`);
  }
}

/**
 * Updates an existing journal entry
 */
export async function updateJournalEntry(
  entryId: string,
  updates: Partial<JournalEntryInput>
): Promise<void> {
  try {
    const entryRef = doc(db, JOURNAL_ENTRIES_COLLECTION, entryId);
    const updateData = buildUpdateData(updates);
    await updateDoc(entryRef, updateData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to update journal entry: ${message}`);
  }
}

/**
 * Gets a journal entry by ID
 */
export async function getJournalEntry(entryId: string): Promise<JournalEntry | null> {
  try {
    const entryRef = doc(db, JOURNAL_ENTRIES_COLLECTION, entryId);
    const entrySnap = await getDoc(entryRef);

    if (!entrySnap.exists()) {
      return null;
    }

    return docToJournalEntry(entrySnap.id, entrySnap.data());
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get journal entry: ${message}`);
  }
}

/**
 * Gets all journal entries for a user, ordered by date (newest first)
 */
export async function getUserJournalEntries(userId: string): Promise<JournalEntry[]> {
  try {
    const q = query(
      collection(db, JOURNAL_ENTRIES_COLLECTION),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];

    querySnapshot.forEach((doc) => {
      entries.push(docToJournalEntry(doc.id, doc.data()));
    });

    return entries;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get journal entries: ${message}`);
  }
}

/**
 * Gets today's journal entry for a user (if exists)
 */
export async function getTodayJournalEntry(userId: string): Promise<JournalEntry | null> {
  try {
    const q = query(
      collection(db, JOURNAL_ENTRIES_COLLECTION),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const todayStart = Timestamp.fromDate(getTodayStart());
    const tomorrowStart = Timestamp.fromDate(getTomorrowStart());

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const entryDate = data.date as Timestamp;

      if (entryDate >= todayStart && entryDate < tomorrowStart) {
        return docToJournalEntry(doc.id, data);
      }
    }

    return null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get today's journal entry: ${message}`);
  }
}

/**
 * Gets the last N journal entries for a user
 */
export async function getLastNJournalEntries(
  userId: string,
  limit: number = 7
): Promise<JournalEntry[]> {
  try {
    const q = query(
      collection(db, JOURNAL_ENTRIES_COLLECTION),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];

    let count = 0;
    querySnapshot.forEach((doc) => {
      if (count < limit) {
        entries.push(docToJournalEntry(doc.id, doc.data()));
        count++;
      }
    });

    return entries;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get last ${limit} journal entries: ${message}`);
  }
}
