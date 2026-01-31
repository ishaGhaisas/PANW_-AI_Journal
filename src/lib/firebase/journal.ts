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
import type { JournalEntry, JournalEntryInput } from "@/types/journal";

const JOURNAL_ENTRIES_COLLECTION = "journalEntries";

/**
 * Save a new journal entry to Firestore
 */
export async function saveJournalEntry(
  userId: string,
  entryData: JournalEntryInput
): Promise<string> {
  try {
    const now = Timestamp.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const entry: any = {
      userId,
      date: Timestamp.fromDate(today),
      text: entryData.text,
      moodSuggested: entryData.reflection.mood,
      reflection: entryData.reflection.reflection,
      followUpQuestion: entryData.reflection.followUpQuestion,
      createdAt: now,
      updatedAt: now,
    };

    if (entryData.moodManual !== undefined && entryData.moodManual !== null) {
      entry.moodManual = entryData.moodManual;
    }

    // Only include habits if it's defined and has at least one key
    if (entryData.habits && Object.keys(entryData.habits).length > 0) {
      entry.habits = entryData.habits;
    }

    // Only include sleepHours if it's defined and not null
    if (entryData.sleepHours !== undefined && entryData.sleepHours !== null) {
      entry.sleepHours = entryData.sleepHours;
    }

    const docRef = await addDoc(collection(db, JOURNAL_ENTRIES_COLLECTION), entry);
    return docRef.id;
  } catch (error: any) {
    throw new Error(`Failed to save journal entry: ${error.message}`);
  }
}

/**
 * Update an existing journal entry
 */
export async function updateJournalEntry(
  entryId: string,
  updates: Partial<JournalEntryInput>
): Promise<void> {
  try {
    const entryRef = doc(db, JOURNAL_ENTRIES_COLLECTION, entryId);
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (updates.text !== undefined) updateData.text = updates.text;
    // Only add moodManual if it's defined and not null
    if (updates.moodManual !== undefined && updates.moodManual !== null) {
      updateData.moodManual = updates.moodManual;
    }
    if (updates.reflection) {
      updateData.reflection = updates.reflection.reflection;
      updateData.moodSuggested = updates.reflection.mood;
      updateData.followUpQuestion = updates.reflection.followUpQuestion;
    }
    // Only include habits if it's defined and has at least one key
    if (updates.habits !== undefined) {
      if (updates.habits && Object.keys(updates.habits).length > 0) {
        updateData.habits = updates.habits;
      } else {
        // If habits is empty object, remove it from document
        updateData.habits = null;
      }
    }
    // Only include sleepHours if it's defined and not null
    if (updates.sleepHours !== undefined) {
      if (updates.sleepHours !== null) {
        updateData.sleepHours = updates.sleepHours;
      } else {
        // If sleepHours is null, remove it from document
        updateData.sleepHours = null;
      }
    }

    await updateDoc(entryRef, updateData);
  } catch (error: any) {
    throw new Error(`Failed to update journal entry: ${error.message}`);
  }
}

/**
 * Get journal entry by ID
 */
export async function getJournalEntry(entryId: string): Promise<JournalEntry | null> {
  try {
    const entryRef = doc(db, JOURNAL_ENTRIES_COLLECTION, entryId);
    const entrySnap = await getDoc(entryRef);

    if (!entrySnap.exists()) {
      return null;
    }

    return {
      id: entrySnap.id,
      ...entrySnap.data(),
    } as JournalEntry;
  } catch (error: any) {
    throw new Error(`Failed to get journal entry: ${error.message}`);
  }
}

/**
 * Get all journal entries for a user, ordered by date (newest first)
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
      entries.push({
        id: doc.id,
        ...doc.data(),
      } as JournalEntry);
    });

    return entries;
  } catch (error: any) {
    throw new Error(`Failed to get journal entries: ${error.message}`);
  }
}

/**
 * Get today's journal entry for a user (if exists)
 */
export async function getTodayJournalEntry(userId: string): Promise<JournalEntry | null> {
  try {
    // Get all user entries and filter client-side to avoid compound query index requirement
    const q = query(
      collection(db, JOURNAL_ENTRIES_COLLECTION),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    // Find today's entry
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = Timestamp.fromDate(today);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = Timestamp.fromDate(tomorrow);

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const entryDate = data.date as Timestamp;
      
      if (entryDate >= todayStart && entryDate < tomorrowStart) {
        return {
          id: doc.id,
          ...data,
        } as JournalEntry;
      }
    }

    return null;
  } catch (error: any) {
    throw new Error(`Failed to get today's journal entry: ${error.message}`);
  }
}
