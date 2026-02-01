import type { JournalEntry } from "@/types/journal";
import { Timestamp } from "firebase/firestore";
import { getMoodCategory } from "@/lib/moodCategories";
import type { MoodCategory } from "@/lib/moodCategories";

type MoodCount = {
  category: MoodCategory;
  count: number;
};

type MoodTrend = {
  category: MoodCategory;
  label: string;
  count: number;
  percentage: number;
};

/**
 * Analyze mood trends from journal entries
 */
export function analyzeMoodTrends(entries: JournalEntry[]): MoodTrend[] {
  const moodCounts: Record<MoodCategory, number> = {
    happy: 0,
    calm: 0,
    anxious: 0,
    tired: 0,
    sad: 0,
  };

  // Count moods from entries
  for (const entry of entries) {
    const mood = entry.moodManual || entry.moodSuggested;
    if (mood) {
      const category = getMoodCategory(mood);
      moodCounts[category]++;
    }
  }

  const total = entries.length;
  if (total === 0) return [];

  const categoryLabels: Record<MoodCategory, string> = {
    happy: "Happy",
    calm: "Calm",
    anxious: "Anxious",
    tired: "Tired",
    sad: "Sad",
  };

  // Convert to trend array
  const trends: MoodTrend[] = Object.entries(moodCounts)
    .map(([category, count]) => ({
      category: category as MoodCategory,
      label: categoryLabels[category as MoodCategory],
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .filter((trend) => trend.count > 0)
    .sort((a, b) => b.count - a.count);

  return trends;
}

/**
 * Get mood trend description
 */
export function getMoodTrendDescription(trends: MoodTrend[]): string {
  if (trends.length === 0) return "Not enough data yet.";

  const topMood = trends[0];
  const total = trends.reduce((sum, t) => sum + t.count, 0);

  if (topMood.count === total) {
    return `Mostly ${topMood.label.toLowerCase()} days`;
  }

  const topTwo = trends.slice(0, 2);
  if (topTwo.length === 2 && topTwo[0].count === topTwo[1].count) {
    return `Mix of ${topTwo[0].label.toLowerCase()} and ${topTwo[1].label.toLowerCase()} days`;
  }

  return `More ${topMood.label.toLowerCase()} days`;
}
