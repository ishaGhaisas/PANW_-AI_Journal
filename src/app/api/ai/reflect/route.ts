import { NextRequest, NextResponse } from "next/server";
import { getReflectionPrompt } from "@/lib/ai/prompts";
import { MOOD_OPTIONS } from "@/lib/moods";
import { getUserGoals } from "@/lib/firebase/goals.server";
import { getLastNJournalEntries } from "@/lib/firebase/journal.server";
import { logError } from "@/lib/utils/errorHandler";
import { RECENT_ENTRIES_CONTEXT_LIMIT } from "@/lib/constants";
import type { ReflectionResponse } from "@/types/ai";

const MAX_JOURNAL_LENGTH = 5000;
const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_OUTPUT_TOKENS = 4000;

/**
 * Calls Google Gemini AI API to generate reflection on journal entry
 */
async function callAI(
  journalText: string,
  goals: Array<{ type: string; text: string }> = [],
  recentEntries: Array<{ text: string; mood?: string }> = []
): Promise<ReflectionResponse> {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error("AI API key not configured");
  }

  const prompt = getReflectionPrompt(journalText, goals, recentEntries);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
          },
        }),
      }
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const errorText = await response.text();
        errorData = { error: errorText };
      }
      throw new Error(`AI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const finishReason = data.candidates?.[0]?.finishReason;
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No response from AI");
    }

    let cleanedContent = content.trim();

    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    }

    let parsed: ReflectionResponse;
    try {
      parsed = JSON.parse(cleanedContent) as ReflectionResponse;
    } catch (parseError) {
      if (finishReason === "MAX_TOKENS") {
        const reflectionMatch = cleanedContent.match(/"reflection"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
        const moodMatch = cleanedContent.match(/"mood"\s*:\s*"([^"]+)"/);
        const questionMatch = cleanedContent.match(/"followUpQuestion"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);

        if (reflectionMatch && moodMatch) {
          parsed = {
            reflection:
              reflectionMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n") ||
              "Thank you for sharing your thoughts.",
            mood: moodMatch[1] || "Reflective",
            followUpQuestion:
              questionMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, "\n") ||
              "What would you like to explore more deeply?",
          };
        } else {
          throw new Error("AI response was incomplete and could not be recovered");
        }
      } else {
        throw parseError;
      }
    }

    if (!parsed.reflection || !parsed.mood || !parsed.followUpQuestion) {
      throw new Error("Invalid AI response structure");
    }

    const normalizedMood = parsed.mood.trim();
    const validMood = MOOD_OPTIONS.find(
      (mood) => mood.toLowerCase() === normalizedMood.toLowerCase()
    );

    if (!validMood) {
      parsed.mood = "Reflective";
    } else {
      parsed.mood = validMood;
    }

    return parsed;
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      throw new Error("AI returned invalid JSON format");
    }
    throw error;
  }
}

/**
 * Returns fallback response when AI is not configured
 */
function getFallbackResponse(journalText: string): ReflectionResponse {
  return {
    reflection:
      "Thank you for sharing your thoughts. It takes courage to reflect on your experiences. I notice you're processing some meaningful moments today.",
    mood: "Reflective",
    followUpQuestion: "What would you like to explore more deeply about this experience?",
  };
}

/**
 * POST endpoint for generating AI reflection on journal entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, userId } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Journal text is required" }, { status: 400 });
    }

    if (text.length > MAX_JOURNAL_LENGTH) {
      return NextResponse.json(
        { error: `Journal entry is too long (max ${MAX_JOURNAL_LENGTH} characters)` },
        { status: 400 }
      );
    }

    let goals: Array<{ type: string; text: string }> = [];
    if (userId) {
      try {
        const userGoals = await getUserGoals(userId);
        goals = userGoals
          .filter((g) => !g.isCompleted)
          .map((g) => ({ type: g.type, text: g.text }));
      } catch (error) {
        logError("Failed to fetch goals", error, { userId });
      }
    }

    let recentEntries: Array<{ text: string; mood?: string }> = [];
    if (userId) {
      try {
        const recent = await getLastNJournalEntries(userId, RECENT_ENTRIES_CONTEXT_LIMIT);
        recentEntries = recent
          .filter((e) => e.text !== text.trim())
          .map((e) => ({
            text: e.text,
            mood: e.moodManual || e.moodSuggested,
          }));
      } catch (error) {
        logError("Failed to fetch recent entries", error, { userId });
      }
    }

    const apiKey = process.env.AI_API_KEY;
    let reflection: ReflectionResponse;

    if (apiKey) {
      reflection = await callAI(text.trim(), goals, recentEntries);
    } else {
      reflection = getFallbackResponse(text.trim());
    }

    return NextResponse.json(reflection, { status: 200 });
  } catch (error: unknown) {
    logError("AI reflection error", error);
    const message = error instanceof Error ? error.message : "Failed to generate reflection";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
