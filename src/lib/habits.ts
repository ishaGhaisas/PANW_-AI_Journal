// User-customizable habits system

export type Habit = {
  id: string; // Unique ID for the habit
  label: string; // Display name
};

export type UserHabits = Habit[]; // List of habits the user wants to track

export type Habits = {
  [habitId: string]: boolean; // Daily completion status: { habitId: true/false }
};
