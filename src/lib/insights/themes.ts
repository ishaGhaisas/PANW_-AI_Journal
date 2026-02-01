// Theme vocabularies for local text analysis
// Each theme has keywords that indicate its presence in journal entries

export type Theme = "work" | "family" | "health" | "relationships" | "self" | "routine";

export type ThemeConfig = {
  id: Theme;
  label: string;
  keywords: string[];
};

export const THEME_VOCABULARIES: ThemeConfig[] = [
  {
    id: "work",
    label: "Work",
    keywords: [
      "work", "office", "meeting", "deadline", "project", "manager", "boss", "colleague",
      "presentation", "task", "assignment", "career", "job", "workplace", "client",
      "email", "report", "conference", "team", "workload"
    ],
  },
  {
    id: "family",
    label: "Family",
    keywords: [
      "family", "mom", "dad", "mother", "father", "parent", "sibling", "brother", "sister",
      "home", "household", "relative", "grandma", "grandpa", "aunt", "uncle", "cousin"
    ],
  },
  {
    id: "health",
    label: "Health",
    keywords: [
      "health", "sleep", "tired", "exhausted", "headache", "pain", "exercise", "walk",
      "run", "workout", "gym", "doctor", "medication", "illness", "sick", "wellness",
      "energy", "fatigue", "rest", "recovery"
    ],
  },
  {
    id: "relationships",
    label: "Relationships",
    keywords: [
      "friend", "friendship", "partner", "relationship", "dating", "love", "conversation",
      "talk", "discussion", "connection", "social", "party", "gathering", "support",
      "understanding", "conflict", "argument", "reconciliation"
    ],
  },
  {
    id: "self",
    label: "Self",
    keywords: [
      "reflection", "growth", "learning", "insight", "awareness", "mindfulness",
      "meditation", "journal", "thought", "feeling", "emotion", "mood", "self-care",
      "personal", "development", "goals", "aspiration", "dream"
    ],
  },
  {
    id: "routine",
    label: "Routine",
    keywords: [
      "routine", "habit", "schedule", "morning", "evening", "daily", "regular",
      "pattern", "ritual", "consistency", "discipline", "practice"
    ],
  },
];

/**
 * Detect themes in a text string using keyword matching
 */
export function detectThemes(text: string): Theme[] {
  const lowerText = text.toLowerCase();
  const detectedThemes: Theme[] = [];

  for (const theme of THEME_VOCABULARIES) {
    const hasTheme = theme.keywords.some((keyword) => lowerText.includes(keyword));
    if (hasTheme) {
      detectedThemes.push(theme.id);
    }
  }

  return detectedThemes;
}

/**
 * Count theme occurrences across multiple entries
 */
export function countThemeOccurrences(
  entries: Array<{ text: string }>
): Record<Theme, number> {
  const counts: Record<Theme, number> = {
    work: 0,
    family: 0,
    health: 0,
    relationships: 0,
    self: 0,
    routine: 0,
  };

  for (const entry of entries) {
    const themes = detectThemes(entry.text);
    for (const theme of themes) {
      counts[theme]++;
    }
  }

  return counts;
}

/**
 * Get most frequent themes (top N)
 */
export function getTopThemes(
  entries: Array<{ text: string }>,
  limit: number = 3
): ThemeConfig[] {
  const counts = countThemeOccurrences(entries);
  const sorted = THEME_VOCABULARIES.sort((a, b) => counts[b.id] - counts[a.id]);
  return sorted.filter((theme) => counts[theme.id] > 0).slice(0, limit);
}
