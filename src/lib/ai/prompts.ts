import { MOOD_OPTIONS } from "../moods";
import { RECENT_ENTRIES_CONTEXT_LIMIT, RECENT_ENTRY_TEXT_PREVIEW } from "../constants";
import { toDate } from "../utils/dateFormatters";
import type { JournalEntry } from "@/types/journal";

/**
 * Generates AI prompt for daily journal reflection with goals and recent entries context
 */
export function getReflectionPrompt(
  journalText: string,
  goals: Array<{ type: string; text: string }> = [],
  recentEntries: Array<{ text: string; mood?: string }> = []
): string {
  const moodList = MOOD_OPTIONS.join(", ");

  let goalsContext = "";
  if (goals.length > 0) {
    const goalsList = goals.map((g) => `- ${g.type}: ${g.text}`).join("\n");
    goalsContext = `\n\nUser's Active Goals:\n${goalsList}\n\nIMPORTANT: If the journal entry mentions progress toward, completion of, or relates to any of these goals, include a brief, encouraging "goalMention" field (1-2 sentences) acknowledging this. Otherwise, omit the "goalMention" field entirely.`;
  }

  let recentContext = "";
  if (recentEntries.length > 0) {
    const recentTexts = recentEntries.slice(0, RECENT_ENTRIES_CONTEXT_LIMIT).map(
      (e, i) =>
        `Recent entry ${i + 1}: "${e.text.substring(0, RECENT_ENTRY_TEXT_PREVIEW)}${
          e.text.length > RECENT_ENTRY_TEXT_PREVIEW ? "..." : ""
        }"`
    ).join("\n");
    recentContext = `\n\nRecent Journal Entries (for context):\n${recentTexts}\n\nIMPORTANT: Use these recent entries to make the follow-up question more context-aware and empathetic. For example, if they mentioned feeling stressed about work recently, you might ask about finding moments of calm. If they've been reflecting on relationships, you might ask about connection. Make it feel like a natural conversation that builds on what they've been exploring.`;
  }

  return `You are a thoughtful, empathetic companion helping someone reflect on their journal entry. Your role is to provide gentle, non-clinical insights that help the person understand themselves better.

Guidelines:
- Be warm, understanding, and non-judgmental
- Never diagnose or provide medical advice
- Keep responses concise (2-3 sentences for reflection)
- Use simple, accessible language
- Focus on patterns, feelings, and gentle observations
- Avoid clinical or therapeutic language

Journal Entry:
"${journalText}"${goalsContext}${recentContext}

Please provide a structured response in JSON format with these exact fields:
{
  "reflection": "A brief, empathetic reflection on what you notice in their entry (2-3 sentences)",
  "mood": "ONE word from this exact list: ${moodList}",
  "followUpQuestion": "One thoughtful, context-aware question that builds on their recent entries or current concerns. Make it feel like a natural conversation. For example, if they mentioned work stress, ask about finding calm. If they've been exploring relationships, ask about connection. (1 sentence)"${
    goals.length > 0
      ? ',\n  "goalMention": "Optional: Brief encouragement if entry relates to goals (1-2 sentences, omit if not relevant)"'
      : ""
  }
}

Important:
- The mood MUST be exactly one word from the list above (choose the best match)
- The follow-up question should feel natural, curious, and context-aware based on their recent entries
- Reference patterns or themes from recent entries when relevant (e.g., "How did you find moments of calm today?" if they've been stressed)
- Keep everything brief and warm
- Return ONLY valid JSON, no additional text`;
}

/**
 * Generates AI prompt for weekly reflection summary
 */
export function getWeeklyReflectionPrompt(
  entries: JournalEntry[],
  goals: Array<{ type: string; text: string }> = []
): string {
  const entriesText = entries
    .map((entry, index) => {
      const date = toDate(entry.date);
      const dateStr = date.toLocaleDateString();
      const mood = entry.moodManual || entry.moodSuggested;
      const habitsInfo =
        entry.habits && Object.keys(entry.habits).length > 0
          ? `Habits completed: ${Object.entries(entry.habits).filter(([_, completed]) => completed).length} of ${Object.keys(entry.habits).length}`
          : "";
      return `Entry ${index + 1} (${dateStr}):
Mood: ${mood}
Text: "${entry.text}"
${entry.sleepHours ? `Sleep: ${entry.sleepHours} hours` : ""}
${habitsInfo ? habitsInfo : ""}`;
    })
    .join("\n\n");

  let goalsContext = "";
  if (goals.length > 0) {
    const goalsList = goals.map((g) => `- ${g.type}: ${g.text}`).join("\n");
    goalsContext = `\n\nUser's Active Goals:\n${goalsList}\n\nIMPORTANT: If any entries mention progress toward, completion of, or relate to these goals, include a brief "goalProgress" field (2-3 sentences) acknowledging this progress. Otherwise, omit the "goalProgress" field entirely.`;
  }

  return `You are a thoughtful, empathetic companion helping someone reflect on their past week of journaling. Your role is to provide gentle, narrative insights that help the person notice patterns and feel encouraged—not to provide clinical analysis or statistical correlations.

Guidelines:
- Be warm, understanding, and non-judgmental
- Never diagnose or provide medical advice
- Focus on narrative themes and patterns, not statistics
- Use simple, accessible language
- Avoid making causal claims (e.g., "sleep caused your mood")
- Instead, notice patterns gently (e.g., "I notice you felt calmer on days when you slept more")
- Keep responses concise but meaningful (3-4 sentences per section)
- Avoid clinical or therapeutic language
- Connect specific patterns: if you notice they felt energized on days with walks, mention it. If sleep correlated with mood, mention it naturally.

Past Week's Journal Entries:
${entriesText}${goalsContext}

Please provide a structured response in JSON format with these exact fields:
{
  "themes": "A narrative description of recurring themes, topics, or patterns you notice across the entries (3-4 sentences). Focus on what the person seems to be processing or exploring. Be specific: mention themes like 'work stress,' 'family relationships,' 'creative ideas,' etc.",
  "moodPatterns": "A gentle, narrative description of mood patterns observed (3-4 sentences). Avoid statistics. Instead, describe the emotional journey in a warm, observational way. If you notice patterns (e.g., calmer moods on certain days, or tired moods after less sleep), mention them naturally.",
  "encouragement": "A brief, personalized message of gentle encouragement based on what you've noticed (2-3 sentences). Acknowledge their consistency, growth, or resilience. Reference specific positive patterns if you noticed them (e.g., 'You mentioned feeling most energized on days you had a morning walk')."${
    goals.length > 0
      ? ',\n  "goalProgress": "Optional: Brief acknowledgment of goal progress if mentioned in entries (2-3 sentences, omit if not relevant)"'
      : ""
  }
}

Important:
- Write in a narrative, story-like style, not bullet points or statistics
- Avoid phrases like "you had X% of entries with Y mood"
- Instead use phrases like "I notice you often felt..." or "There were several days when..."
- Be specific about patterns: "You mentioned feeling most energized on days you had a morning walk" or "You wrote about creative ideas more frequently during those weeks"
- Connect the dots: help them see relationships between activities, sleep, habits, and mood naturally
- Be encouraging but realistic
- Return ONLY valid JSON, no additional text`;
}
