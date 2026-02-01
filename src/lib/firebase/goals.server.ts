import { getAdminFirestore } from "./admin";
import { FIREBASE_COLLECTIONS } from "../constants";
import type { Goal } from "@/types/goals";
import type { Timestamp as AdminTimestamp } from "firebase-admin/firestore";

const GOALS_COLLECTION = FIREBASE_COLLECTIONS.GOALS;

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
 * Gets all goals for a user (server-side using Admin SDK)
 */
export async function getUserGoals(
  userId: string,
  type?: "weekly" | "monthly"
): Promise<Goal[]> {
  try {
    const db = getAdminFirestore();
    let q = db
      .collection(GOALS_COLLECTION)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc");

    if (type) {
      q = q.where("type", "==", type) as FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;
    }

    const querySnapshot = await q.get();
    const goals: Goal[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.isDeleted) {
        goals.push({
          id: doc.id,
          userId: data.userId as string,
          type: data.type as "weekly" | "monthly",
          text: data.text as string,
          isCompleted: data.isCompleted as boolean,
          createdAt: adminTimestampToDate(data.createdAt),
          updatedAt: adminTimestampToDate(data.updatedAt),
          isDeleted: data.isDeleted as boolean | undefined,
        });
      }
    });

    return goals;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get user goals: ${message}`);
  }
}
