"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserGoals, saveGoal, updateGoal, deleteGoal } from "@/lib/firebase/goals";
import { getUserFriendlyError, logError } from "@/lib/utils/errorHandler";
import { isAuthenticated, isNonEmptyString } from "@/lib/utils/validation";
import type { Goal } from "@/types/goals";
import "./GoalsTracker.css";

type GoalSectionProps = {
  goals: Goal[];
  type: "weekly" | "monthly";
  addingType: "weekly" | "monthly" | null;
  editingId: string | null;
  editText: string;
  newGoalText: string;
  onAddGoal: (type: "weekly" | "monthly") => void;
  onEditStart: (goal: Goal) => void;
  onEditSave: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onSetAddingType: (type: "weekly" | "monthly" | null) => void;
  onSetNewGoalText: (text: string) => void;
  onSetEditText: (text: string) => void;
  onSetEditingId: (id: string | null) => void;
};

/**
 * Renders a goal section (weekly or monthly)
 */
function GoalSection({
  goals,
  type,
  addingType,
  editingId,
  editText,
  newGoalText,
  onAddGoal,
  onEditStart,
  onEditSave,
  onDelete,
  onSetAddingType,
  onSetNewGoalText,
  onSetEditText,
  onSetEditingId,
}: GoalSectionProps) {
  const isAdding = addingType === type;
  const sectionTitle = type === "weekly" ? "THIS WEEK" : "THIS MONTH";
  const placeholder = type === "weekly" ? "Focus for this week…" : "Focus for this month…";

  return (
    <div className="goals-tracker__section">
      <h3 className="goals-tracker__section-title">{sectionTitle}</h3>
      {goals.length > 0 && (
        <ul className="goals-tracker__list">
          {goals.map((goal) => (
            <li key={goal.id} className="goals-tracker__item group">
              <span className="goals-tracker__item-bullet">•</span>
              {editingId === goal.id ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => onSetEditText(e.target.value)}
                  onBlur={() => onEditSave(goal.id!)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onEditSave(goal.id!);
                    } else if (e.key === "Escape") {
                      onSetEditingId(null);
                      onSetEditText("");
                    }
                  }}
                  className="goals-tracker__item-edit-input"
                  autoFocus
                />
              ) : (
                <>
                  <span
                    className="goals-tracker__item-text"
                    onClick={() => onEditStart(goal)}
                  >
                    {goal.text}
                  </span>
                  <button
                    onClick={() => onDelete(goal.id!)}
                    className="goals-tracker__item-remove"
                    title="Remove"
                  >
                    ×
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {isAdding ? (
        <input
          type="text"
          value={newGoalText}
          onChange={(e) => onSetNewGoalText(e.target.value)}
          onBlur={() => onAddGoal(type)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAddGoal(type);
            } else if (e.key === "Escape") {
              onSetAddingType(null);
              onSetNewGoalText("");
            }
          }}
          placeholder={placeholder}
          className="goals-tracker__add-input"
          autoFocus
        />
      ) : (
        <button
          onClick={() => {
            onSetAddingType(type);
            onSetNewGoalText("");
          }}
          className="goals-tracker__add-trigger"
        >
          + jot a goal
        </button>
      )}
    </div>
  );
}

/**
 * Component for tracking weekly and monthly goals
 */
export default function GoalsTracker() {
  const { user } = useAuth();
  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [addingType, setAddingType] = useState<"weekly" | "monthly" | null>(null);
  const [newGoalText, setNewGoalText] = useState("");

  useEffect(() => {
    if (isAuthenticated(user)) {
      loadGoals();
    }
  }, [user]);

  /**
   * Loads user goals from Firestore
   */
  const loadGoals = async () => {
    if (!isAuthenticated(user)) return;
    try {
      setLoading(true);
      const allGoals = await getUserGoals(user.uid);
      setWeeklyGoals(allGoals.filter((g) => g.type === "weekly" && !g.isCompleted && !g.isDeleted));
      setMonthlyGoals(allGoals.filter((g) => g.type === "monthly" && !g.isCompleted && !g.isDeleted));
    } catch (error) {
      logError("Failed to load goals", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adds a new goal
   */
  const handleAddGoal = async (type: "weekly" | "monthly") => {
    if (!isAuthenticated(user) || !isNonEmptyString(newGoalText)) {
      setAddingType(null);
      setNewGoalText("");
      return;
    }

    try {
      await saveGoal(user.uid, {
        type,
        text: newGoalText.trim(),
      });
      setNewGoalText("");
      setAddingType(null);
      await loadGoals();
    } catch (error) {
      logError("Failed to add goal", error);
    }
  };

  /**
   * Starts editing a goal
   */
  const handleEditStart = (goal: Goal) => {
    setEditingId(goal.id!);
    setEditText(goal.text);
  };

  /**
   * Saves edited goal
   */
  const handleEditSave = async (goalId: string) => {
    if (!isNonEmptyString(editText)) {
      setEditingId(null);
      setEditText("");
      return;
    }

    try {
      await updateGoal(goalId, { text: editText.trim() });
      setEditingId(null);
      setEditText("");
      await loadGoals();
    } catch (error) {
      logError("Failed to update goal", error);
    }
  };

  /**
   * Deletes a goal
   */
  const handleDelete = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      await loadGoals();
    } catch (error) {
      logError("Failed to delete goal", error);
    }
  };

  if (loading) {
    return (
      <div className="goals-tracker">
        <h2 className="goals-tracker__header">GOALS</h2>
        <p className="text-xs text-[var(--color-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="goals-tracker">
      <h2 className="goals-tracker__header">GOALS</h2>
      <div className="goals-tracker__sections">
        <GoalSection
          goals={weeklyGoals}
          type="weekly"
          addingType={addingType}
          editingId={editingId}
          editText={editText}
          newGoalText={newGoalText}
          onAddGoal={handleAddGoal}
          onEditStart={handleEditStart}
          onEditSave={handleEditSave}
          onDelete={handleDelete}
          onSetAddingType={setAddingType}
          onSetNewGoalText={setNewGoalText}
          onSetEditText={setEditText}
          onSetEditingId={setEditingId}
        />
        <GoalSection
          goals={monthlyGoals}
          type="monthly"
          addingType={addingType}
          editingId={editingId}
          editText={editText}
          newGoalText={newGoalText}
          onAddGoal={handleAddGoal}
          onEditStart={handleEditStart}
          onEditSave={handleEditSave}
          onDelete={handleDelete}
          onSetAddingType={setAddingType}
          onSetNewGoalText={setNewGoalText}
          onSetEditText={setEditText}
          onSetEditingId={setEditingId}
        />
      </div>
    </div>
  );
}
