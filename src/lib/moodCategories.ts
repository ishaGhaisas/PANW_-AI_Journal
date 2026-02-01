export type MoodCategory = "happy" | "calm" | "anxious" | "tired" | "sad";

export type MoodCategoryConfig = {
  id: MoodCategory;
  label: string;
  color: string;
  moods: string[];
};

export const MOOD_CATEGORIES: MoodCategoryConfig[] = [
  {
    id: "happy",
    label: "Happy",
    color: "#A7F3D0",
    moods: ["Hopeful", "Content", "Grateful", "Excited"],
  },
  {
    id: "calm",
    label: "Calm",
    color: "#BFDBFE",
    moods: ["Calm", "Peaceful", "Reflective"],
  },
  {
    id: "anxious",
    label: "Anxious",
    color: "#FDE68A",
    moods: ["Stressed", "Anxious", "Overwhelmed", "Worried"],
  },
  {
    id: "tired",
    label: "Tired",
    color: "#E5E7EB",
    moods: ["Tired"],
  },
  {
    id: "sad",
    label: "Sad",
    color: "#E9D5FF",
    moods: [],
  },
];

/**
 * Gets the mood category for a given mood string
 */
export function getMoodCategory(mood: string): MoodCategory {
  const normalizedMood = mood.trim();
  for (const category of MOOD_CATEGORIES) {
    if (category.moods.some((m) => m.toLowerCase() === normalizedMood.toLowerCase())) {
      return category.id;
    }
  }
  return "calm";
}

/**
 * Gets the color associated with a mood or mood category
 */
export function getMoodColor(mood: string | MoodCategory): string {
  if (
    typeof mood === "string" &&
    ["happy", "calm", "anxious", "tired", "sad"].includes(mood)
  ) {
    const categoryConfig = MOOD_CATEGORIES.find((c) => c.id === (mood as MoodCategory));
    return categoryConfig?.color || "#E5E7EB";
  }
  const category = getMoodCategory(mood as string);
  const categoryConfig = MOOD_CATEGORIES.find((c) => c.id === category);
  return categoryConfig?.color || "#E5E7EB";
}

/**
 * Gets the full category configuration for a mood
 */
export function getMoodCategoryConfig(mood: string): MoodCategoryConfig {
  const category = getMoodCategory(mood);
  const categoryConfig = MOOD_CATEGORIES.find((c) => c.id === category);
  return categoryConfig || MOOD_CATEGORIES[1];
}
