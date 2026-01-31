"use client";

import { useState, useEffect } from "react";
import { useJournalState } from "./JournalStateContext";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserHabits, saveUserHabits, generateHabitId } from "@/lib/firebase/userHabits";
import type { Habit, UserHabits } from "@/lib/habits";

export default function HabitsTracker() {
  const { user } = useAuth();
  const { habits, setHabits } = useJournalState();
  const [userHabits, setUserHabits] = useState<UserHabits>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitLabel, setNewHabitLabel] = useState("");
  const [loading, setLoading] = useState(true);

  // Load user's habit list
  useEffect(() => {
    if (user) {
      loadUserHabits();
    }
  }, [user]);

  const loadUserHabits = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const habits = await getUserHabits(user.uid);
      setUserHabits(habits);
    } catch (error) {
      console.error("Failed to load user habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (habitId: string) => {
    const newHabits = {
      ...habits,
      [habitId]: !habits[habitId],
    };
    setHabits(newHabits);
  };

  const handleAddHabit = async () => {
    if (!user || !newHabitLabel.trim()) return;

    const newHabit: Habit = {
      id: generateHabitId(),
      label: newHabitLabel.trim(),
    };

    const updatedHabits = [...userHabits, newHabit];
    setUserHabits(updatedHabits);
    setNewHabitLabel("");
    setIsAdding(false);

    try {
      await saveUserHabits(user.uid, updatedHabits);
    } catch (error) {
      console.error("Failed to save habit:", error);
      // Revert on error
      setUserHabits(userHabits);
    }
  };

  const handleRemoveHabit = async (habitId: string) => {
    if (!user) return;

    const updatedHabits = userHabits.filter((h) => h.id !== habitId);
    setUserHabits(updatedHabits);

    // Remove from daily habits tracking too
    const newHabits = { ...habits };
    delete newHabits[habitId];
    setHabits(newHabits);

    try {
      await saveUserHabits(user.uid, updatedHabits);
    } catch (error) {
      console.error("Failed to remove habit:", error);
      // Revert on error
      setUserHabits(userHabits);
    }
  };

  const handleEditHabit = async (habitId: string, newLabel: string) => {
    if (!user || !newLabel.trim()) return;

    const updatedHabits = userHabits.map((h) =>
      h.id === habitId ? { ...h, label: newLabel.trim() } : h
    );
    setUserHabits(updatedHabits);

    try {
      await saveUserHabits(user.uid, updatedHabits);
    } catch (error) {
      console.error("Failed to update habit:", error);
      // Revert on error
      setUserHabits(userHabits);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-[var(--color-shell)] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          HABITS
        </h2>
        <p className="text-sm text-[var(--color-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[var(--color-shell)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          HABITS
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            + Add
          </button>
        )}
      </div>

      <div className="space-y-3">
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
          <div className="flex items-center gap-2">
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
              className="flex-1 rounded-md border border-[var(--color-shell)] bg-[var(--color-paper)] px-2 py-1 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none"
            />
            <button
              onClick={handleAddHabit}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewHabitLabel("");
              }}
              className="text-sm text-[var(--color-muted)] hover:underline"
            >
              Cancel
            </button>
          </div>
        )}

        {userHabits.length === 0 && !isAdding && (
          <p className="text-sm text-[var(--color-muted)]">
            No habits yet. Click "+ Add" to create one.
          </p>
        )}
      </div>
    </div>
  );
}

function HabitItem({
  habit,
  isChecked,
  onToggle,
  onRemove,
  onEdit,
}: {
  habit: Habit;
  isChecked: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onEdit: (newLabel: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(habit.label);

  const handleSaveEdit = () => {
    if (editLabel.trim() && editLabel !== habit.label) {
      onEdit(editLabel);
    }
    setIsEditing(false);
  };

  return (
    <div className="group flex items-center gap-2">
      <label className="flex flex-1 cursor-pointer items-center gap-3 text-base text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)]">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
          className="h-5 w-5 cursor-pointer rounded border-[var(--color-shell)] text-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
          style={{
            accentColor: "var(--color-accent)",
          }}
        />
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
            autoFocus
            className="flex-1 rounded border border-[var(--color-accent)] bg-[var(--color-paper)] px-2 py-1 text-sm focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="select-none"
            onDoubleClick={() => setIsEditing(true)}
          >
            {habit.label}
          </span>
        )}
      </label>
      <button
        onClick={onRemove}
        className="opacity-0 text-sm text-[var(--color-muted)] hover:text-red-600 group-hover:opacity-100 transition-opacity"
        title="Remove habit"
      >
        ×
      </button>
    </div>
  );
}
