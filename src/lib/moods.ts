// Predefined mood options for AI and user selection

export const MOOD_OPTIONS = [
  "Calm",
  "Stressed",
  "Hopeful",
  "Reflective",
  "Anxious",
  "Content",
  "Grateful",
  "Overwhelmed",
  "Peaceful",
  "Tired",
  "Excited",
  "Worried",
] as const;

export type Mood = (typeof MOOD_OPTIONS)[number];
