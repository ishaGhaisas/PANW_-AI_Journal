import type { Timestamp } from "firebase/firestore";

export type Goal = {
  id?: string; // Firestore document ID
  userId: string;
  type: "weekly" | "monthly";
  text: string; // Goal description
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  completedAt?: Date | Timestamp; // When goal was marked complete
  isCompleted: boolean;
  isDeleted?: boolean; // Soft delete flag
};

export type GoalInput = {
  type: "weekly" | "monthly";
  text: string;
};
