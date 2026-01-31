import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./config";
import type { UserHabits, Habit } from "@/lib/habits";

const USER_HABITS_COLLECTION = "userHabits";

/**
 * Get user's habit list
 */
export async function getUserHabits(userId: string): Promise<UserHabits> {
  try {
    const userHabitsRef = doc(db, USER_HABITS_COLLECTION, userId);
    const userHabitsSnap = await getDoc(userHabitsRef);

    if (!userHabitsSnap.exists()) {
      // Return empty array if user hasn't set up habits yet
      return [];
    }

    const data = userHabitsSnap.data();
    return (data.habits || []) as UserHabits;
  } catch (error: any) {
    throw new Error(`Failed to get user habits: ${error.message}`);
  }
}

/**
 * Save user's habit list
 */
export async function saveUserHabits(
  userId: string,
  habits: UserHabits
): Promise<void> {
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
  } catch (error: any) {
    throw new Error(`Failed to save user habits: ${error.message}`);
  }
}

/**
 * Generate a unique ID for a new habit
 */
export function generateHabitId(): string {
  return `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
