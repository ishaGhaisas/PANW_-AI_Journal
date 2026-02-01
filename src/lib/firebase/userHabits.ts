import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./config";
import { FIREBASE_COLLECTIONS } from "../constants";
import type { UserHabits, Habit } from "@/lib/habits";

const USER_HABITS_COLLECTION = FIREBASE_COLLECTIONS.USER_HABITS;

/**
 * Gets user's habit list from Firestore
 */
export async function getUserHabits(userId: string): Promise<UserHabits> {
  try {
    const userHabitsRef = doc(db, USER_HABITS_COLLECTION, userId);
    const userHabitsSnap = await getDoc(userHabitsRef);

    if (!userHabitsSnap.exists()) {
      return [];
    }

    const data = userHabitsSnap.data();
    return (data.habits || []) as UserHabits;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get user habits: ${message}`);
  }
}

/**
 * Saves user's habit list to Firestore
 */
export async function saveUserHabits(userId: string, habits: UserHabits): Promise<void> {
  try {
    const userHabitsRef = doc(db, USER_HABITS_COLLECTION, userId);
    await setDoc(
      userHabitsRef,
      {
        habits,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to save user habits: ${message}`);
  }
}

/**
 * Generates a unique ID for a new habit
 */
export function generateHabitId(): string {
  return `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
