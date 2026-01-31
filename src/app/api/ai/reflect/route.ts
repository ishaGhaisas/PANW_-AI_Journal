import { NextRequest, NextResponse } from "next/server";
import { getReflectionPrompt } from "@/lib/ai/prompts";
import { MOOD_OPTIONS } from "@/lib/moods";
import type { ReflectionResponse } from "@/types/ai";

// TODO: Configure your AI service
// Options: OpenAI, Anthropic Claude, Google Gemini, etc.
// Set API key in .env.local as: NEXT_PUBLIC_AI_API_KEY or AI_API_KEY

async function callAI(journalText: string): Promise<ReflectionResponse> {
  // Get AI API key from environment
  const apiKey = process.env.AI_API_KEY;
  
  if (!apiKey) {
    throw new Error("AI API key not configured");
  }

  // Get prompt from prompts utility
  const prompt = getReflectionPrompt(journalText);

  try {
    // Google Gemini API call
    // Using gemini-2.5-flash (stable, free tier, supports generateContent)
    // Other options: gemini-2.0-flash-001, gemini-flash-latest, gemini-2.5-flash-lite
    const model = "gemini-2.5-flash"; // Stable version, free tier
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
            maxOutputTokens: 4000, // Increased significantly to account for thinking tokens (~1000) + actual output
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    
    // Check if response was cut off due to token limit
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === "MAX_TOKENS") {
      console.warn("AI response was cut off due to token limit. Increasing tokens or using fallback.");
      // We'll try to parse what we have, but may need to retry with more tokens
    }
    
    // Extract content from Gemini response
    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("No content in response. Full response:", JSON.stringify(data, null, 2));
      throw new Error("No response from AI");
    }

    // Parse JSON response
    // Gemini sometimes wraps JSON in markdown code blocks, so we need to clean it
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    }

    // Try to parse JSON, handle incomplete responses
    let parsed: ReflectionResponse;
    try {
      parsed = JSON.parse(cleanedContent) as ReflectionResponse;
    } catch (parseError) {
      // If JSON is incomplete (due to MAX_TOKENS), try to extract what we can
      if (finishReason === "MAX_TOKENS") {
        console.warn("JSON parsing failed due to incomplete response. Attempting partial recovery...");
        
        // Try to extract partial data using regex
        const reflectionMatch = cleanedContent.match(/"reflection"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
        const moodMatch = cleanedContent.match(/"mood"\s*:\s*"([^"]+)"/);
        const questionMatch = cleanedContent.match(/"followUpQuestion"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
        
        if (reflectionMatch && moodMatch) {
          parsed = {
            reflection: reflectionMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') || "Thank you for sharing your thoughts.",
            mood: moodMatch[1] || "Reflective",
            followUpQuestion: questionMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || "What would you like to explore more deeply?",
          };
        } else {
          throw new Error("AI response was incomplete and could not be recovered");
        }
      } else {
        throw parseError;
      }
    }
    
    // Validate response structure
    if (
      !parsed.reflection ||
      !parsed.mood ||
      !parsed.followUpQuestion
    ) {
      throw new Error("Invalid AI response structure");
    }

    // Validate mood is from predefined list
    // Normalize mood (trim whitespace, capitalize first letter)
    const normalizedMood = parsed.mood.trim();
    const validMood = MOOD_OPTIONS.find(
      (mood) => mood.toLowerCase() === normalizedMood.toLowerCase()
    );
    
    if (!validMood) {
      // If AI returns invalid mood, default to "Reflective" and log warning
      console.warn(
        `AI returned invalid mood: "${parsed.mood}". Defaulting to "Reflective".`
      );
      parsed.mood = "Reflective";
    } else {
      // Use the exact mood from the list (ensures consistent casing)
      parsed.mood = validMood;
    }

    return parsed;
  } catch (error: any) {
    // If it's a JSON parse error, provide fallback
    if (error instanceof SyntaxError) {
      throw new Error("AI returned invalid JSON format");
    }
    throw error;
  }
}

// Fallback response for demo/testing when AI is not configured
function getFallbackResponse(journalText: string): ReflectionResponse {
  return {
    reflection:
      "Thank you for sharing your thoughts. It takes courage to reflect on your experiences. I notice you're processing some meaningful moments today.",
    mood: "Reflective", // Must be from MOOD_OPTIONS
    followUpQuestion:
      "What would you like to explore more deeply about this experience?",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Journal text is required" },
        { status: 400 }
      );
    }

    // Validate text length (prevent abuse)
    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Journal entry is too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    // Check if AI is configured
    const apiKey = process.env.AI_API_KEY;
    
    let reflection: ReflectionResponse;
    
    if (apiKey) {
      // Call actual AI service
      reflection = await callAI(text.trim());
    } else {
      // Use fallback for demo/development
      console.warn("AI API key not configured. Using fallback response.");
      reflection = getFallbackResponse(text.trim());
    }

    return NextResponse.json(reflection, { status: 200 });
  } catch (error: any) {
    console.error("AI reflection error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate reflection",
      },
      { status: 500 }
    );
  }
}
