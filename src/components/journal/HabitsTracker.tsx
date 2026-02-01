"use client";

import { useState, useEffect } from "react";
import { useJournalState } from "./JournalStateContext";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserHabits, saveUserHabits, generateHabitId } from "@/lib/firebase/userHabits";
import { getUserFriendlyError, logError } from "@/lib/utils/errorHandler";
import { isAuthenticated, isNonEmptyString } from "@/lib/utils/validation";
import type { Habit, UserHabits } from "@/lib/habits";
import "./HabitsTracker.css";

type HabitItemProps = {
  habit: Habit;
  isChecked: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onEdit: (newLabel: string) => void;
};

/**
 * Individual habit item component with toggle, edit, and remove functionality
 */
function HabitItem({ habit, isChecked, onToggle, onRemove, onEdit }: HabitItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(habit.label);

  /**
   * Saves edited habit label
   */
  const handleSaveEdit = () => {
    if (isNonEmptyString(editLabel) && editLabel !== habit.label) {
      onEdit(editLabel);
    }
    setIsEditing(false);
  };

  return (
    <div className="habits-tracker__item group">
      <button onClick={onToggle} className="habits-tracker__item-toggle">
        <span className="habits-tracker__item-dot">{isChecked ? "●" : "○"}</span>
        {isEditing ? (
          <input
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveEdit();
              } else if (e.key === "Escape") {
                setIsEditing(false);
                setEditLabel(habit.label);
              }
            }}
            onBlur={handleSaveEdit}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            className="habits-tracker__item-edit-input"
          />
        ) : (
          <span
            className="habits-tracker__item-label"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {habit.label}
          </span>
        )}
      </button>
      <button
        onClick={onRemove}
        className="habits-tracker__item-remove"
        title="Remove habit"
      >
        ×
      </button>
    </div>
  );
}

/**
 * Component for tracking daily habits with bullet journal-style dots
 */
export default function HabitsTracker() {
  const { user } = useAuth();
  const { habits, setHabits } = useJournalState();
  const [userHabits, setUserHabits] = useState<UserHabits>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitLabel, setNewHabitLabel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated(user)) {
      loadUserHabits();
    }
  }, [user]);

  /**
   * Loads user's habit list from Firestore
   */
  const loadUserHabits = async () => {
    if (!isAuthenticated(user)) return;
    try {
      setLoading(true);
      const habitsList = await getUserHabits(user.uid);
      setUserHabits(habitsList);
    } catch (error) {
      logError("Failed to load user habits", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles habit completion status for today
   */
  const handleToggle = (habitId: string) => {
    const newHabits = {
      ...habits,
      [habitId]: !habits[habitId],
    };
    setHabits(newHabits);
  };

  /**
   * Adds a new habit to user's habit list
   */
  const handleAddHabit = async () => {
    if (!isAuthenticated(user) || !isNonEmptyString(newHabitLabel)) return;

    const newHabit: Habit = {
      id: generateHabitId(),
      label: newHabitLabel.trim(),
    };

    const updatedHabits = [...userHabits, newHabit];
    const previousHabits = userHabits;
    setUserHabits(updatedHabits);
    setNewHabitLabel("");
    setIsAdding(false);

    try {
      await saveUserHabits(user.uid, updatedHabits);
    } catch (error) {
      logError("Failed to save habit", error);
      setUserHabits(previousHabits);
    }
  };

  /**
   * Removes a habit from user's habit list
   */
  const handleRemoveHabit = async (habitId: string) => {
    if (!isAuthenticated(user)) return;

    const updatedHabits = userHabits.filter((h) => h.id !== habitId);
    const previousHabits = userHabits;
    setUserHabits(updatedHabits);

    const newHabits = { ...habits };
    delete newHabits[habitId];
    setHabits(newHabits);

    try {
      await saveUserHabits(user.uid, updatedHabits);
    } catch (error) {
      logError("Failed to remove habit", error);
      setUserHabits(previousHabits);
    }
  };

  /**
   * Updates habit label
   */
  const handleEditHabit = async (habitId: string, newLabel: string) => {
    if (!isAuthenticated(user) || !isNonEmptyString(newLabel)) return;

    const updatedHabits = userHabits.map((h) =>
      h.id === habitId ? { ...h, label: newLabel.trim() } : h
    );
    const previousHabits = userHabits;
    setUserHabits(updatedHabits);

    try {
      await saveUserHabits(user.uid, updatedHabits);
    } catch (error) {
      logError("Failed to update habit", error);
      setUserHabits(previousHabits);
    }
  };

  if (loading) {
    return (
      <div className="habits-tracker">
        <h2 className="habits-tracker__header">HABITS</h2>
        <p className="text-sm text-[var(--color-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="habits-tracker">
      <h2 className="habits-tracker__header">HABITS</h2>
      <div className="habits-tracker__list">
        {userHabits.map((habit) => {
          const isChecked = habits[habit.id] === true;
          return (
            <HabitItem
              key={habit.id}
              habit={habit}
              isChecked={isChecked}
              onToggle={() => handleToggle(habit.id)}
              onRemove={() => handleRemoveHabit(habit.id)}
              onEdit={(newLabel) => handleEditHabit(habit.id, newLabel)}
            />
          );
        })}

        {isAdding && (
          <div className="habits-tracker__add-container">
            <input
              type="text"
              value={newHabitLabel}
              onChange={(e) => setNewHabitLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddHabit();
                } else if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewHabitLabel("");
                }
              }}
              placeholder="Habit name..."
              autoFocus
              className="habits-tracker__add-input"
            />
            <div className="habits-tracker__add-buttons">
              <button
                onClick={handleAddHabit}
                disabled={!isNonEmptyString(newHabitLabel)}
                className="habits-tracker__add-button"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewHabitLabel("");
                }}
                className="habits-tracker__cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="habits-tracker__add-trigger"
          >
            + Add habit
          </button>
        )}

        {userHabits.length === 0 && !isAdding && (
          <p className="habits-tracker__empty">No habits yet.</p>
        )}
      </div>
    </div>
  );
}
