import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { FIREBASE_COLLECTIONS } from "../constants";
import type { Goal, GoalInput } from "@/types/goals";

const GOALS_COLLECTION = FIREBASE_COLLECTIONS.GOALS;

/**
 * Saves a new goal to Firestore
 */
export async function saveGoal(userId: string, goalData: GoalInput): Promise<string> {
  try {
    const now = Timestamp.now();

    const goal: Record<string, unknown> = {
      userId,
      type: goalData.type,
      text: goalData.text.trim(),
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, GOALS_COLLECTION), goal);
    return docRef.id;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to save goal: ${message}`);
  }
}

/**
 * Updates an existing goal
 */
export async function updateGoal(
  goalId: string,
  updates: Partial<GoalInput & { isCompleted?: boolean }>
): Promise<void> {
  try {
    const goalRef = doc(db, GOALS_COLLECTION, goalId);
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (updates.text !== undefined) updateData.text = updates.text.trim();
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.isCompleted !== undefined) {
      updateData.isCompleted = updates.isCompleted;
      if (updates.isCompleted) {
        updateData.completedAt = Timestamp.now();
      } else {
        updateData.completedAt = null;
      }
    }

    await updateDoc(goalRef, updateData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to update goal: ${message}`);
  }
}

/**
 * Gets all goals for a user, optionally filtered by type
 */
export async function getUserGoals(
  userId: string,
  type?: "weekly" | "monthly"
): Promise<Goal[]> {
  try {
    let q;
    if (type) {
      q = query(
        collection(db, GOALS_COLLECTION),
        where("userId", "==", userId),
        where("type", "==", type),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, GOALS_COLLECTION),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const goals: Goal[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.isDeleted) {
        goals.push({
          id: doc.id,
          ...data,
        } as Goal);
      }
    });

    return goals;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get user goals: ${message}`);
  }
}

/**
 * Deletes a goal (soft delete)
 */
export async function deleteGoal(goalId: string): Promise<void> {
  try {
    const goalRef = doc(db, GOALS_COLLECTION, goalId);
    await updateDoc(goalRef, {
      updatedAt: Timestamp.now(),
      isDeleted: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to delete goal: ${message}`);
  }
}
