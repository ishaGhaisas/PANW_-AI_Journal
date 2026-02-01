import { NextRequest, NextResponse } from "next/server";
import { getWeeklyReflectionPrompt } from "@/lib/ai/prompts";
import { getLastNJournalEntries } from "@/lib/firebase/journal.server";
import { getUserGoals } from "@/lib/firebase/goals.server";
import { logError } from "@/lib/utils/errorHandler";
import { WEEKLY_REFLECTION_DAYS } from "@/lib/constants";
import type { WeeklyReflectionResponse } from "@/types/ai";
import type { JournalEntry } from "@/types/journal";

const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_OUTPUT_TOKENS = 4000;

/**
 * Calls Google Gemini AI API to generate weekly reflection summary
 */
async function callAIForWeeklyReflection(
  entries: JournalEntry[],
  goals: Array<{ type: string; text: string }> = []
): Promise<WeeklyReflectionResponse> {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error("AI API key not configured");
  }

  const prompt = getWeeklyReflectionPrompt(entries, goals);

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
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
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

    let parsed: WeeklyReflectionResponse;
    try {
      parsed = JSON.parse(cleanedContent) as WeeklyReflectionResponse;
    } catch (parseError) {
      if (finishReason === "MAX_TOKENS") {
        const themesMatch = cleanedContent.match(/"themes"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
        const moodMatch = cleanedContent.match(/"moodPatterns"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
        const encouragementMatch = cleanedContent.match(/"encouragement"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);

        parsed = {
          themes:
            themesMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, "\n") ||
            "I notice some meaningful patterns in your entries this week.",
          moodPatterns:
            moodMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, "\n") ||
            "Your emotional journey this week shows natural variation.",
          encouragement:
            encouragementMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, "\n") ||
            "Thank you for taking time to reflect this week.",
        };
      } else {
        throw parseError;
      }
    }

    if (!parsed.themes || !parsed.moodPatterns || !parsed.encouragement) {
      throw new Error("Invalid AI response structure");
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
 * Returns fallback weekly reflection when AI is not configured
 */
function getFallbackWeeklyResponse(): WeeklyReflectionResponse {
  return {
    themes:
      "I notice you've been reflecting on meaningful moments and experiences this week. There's a sense of processing and growth in your entries.",
    moodPatterns:
      "Your emotional journey this week shows natural variation—some days felt more settled, while others brought different feelings. This is all part of the human experience.",
    encouragement:
      "Thank you for taking time to reflect this week. Your consistency in journaling shows care for your own well-being. Keep honoring these moments of reflection.",
  };
}

/**
 * POST endpoint for generating AI weekly reflection summary
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const entries = await getLastNJournalEntries(userId, WEEKLY_REFLECTION_DAYS);

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Not enough entries. Need at least 1 entry to generate weekly reflection." },
        { status: 400 }
      );
    }

    let goals: Array<{ type: string; text: string }> = [];
    try {
      const userGoals = await getUserGoals(userId);
      goals = userGoals
        .filter((g) => !g.isCompleted)
        .map((g) => ({ type: g.type, text: g.text }));
    } catch (error) {
      logError("Failed to fetch goals", error, { userId });
    }

    const apiKey = process.env.AI_API_KEY;
    let reflection: WeeklyReflectionResponse;

    if (apiKey) {
      reflection = await callAIForWeeklyReflection(entries, goals);
    } else {
      reflection = getFallbackWeeklyResponse();
    }

    return NextResponse.json(reflection, { status: 200 });
  } catch (error: unknown) {
    logError("Weekly reflection error", error);
    const message = error instanceof Error ? error.message : "Failed to generate weekly reflection";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
