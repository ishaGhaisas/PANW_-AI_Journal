import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/utils/errorHandler";

/**
 * GET endpoint to list available Google Gemini models
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Failed to fetch models: ${error}` }, { status: response.status });
    }

    const data = await response.json();

    const availableModels =
      data.models
        ?.filter((model: { supportedGenerationMethods?: string[] }) =>
          model.supportedGenerationMethods?.includes("generateContent")
        )
        .map((model: { name: string; displayName: string; description: string }) => ({
          name: model.name,
          displayName: model.displayName,
          description: model.description,
        })) || [];

    return NextResponse.json(
      {
        models: availableModels,
        allModels: data.models,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    logError("Error listing models", error);
    const message = error instanceof Error ? error.message : "Failed to list models";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
