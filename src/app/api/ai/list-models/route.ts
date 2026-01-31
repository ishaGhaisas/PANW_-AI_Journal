import { NextRequest, NextResponse } from "next/server";

// Helper endpoint to list available Gemini models
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key not configured" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: `Failed to fetch models: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Filter models that support generateContent
    const availableModels = data.models
      ?.filter((model: any) => 
        model.supportedGenerationMethods?.includes("generateContent")
      )
      .map((model: any) => ({
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
  } catch (error: any) {
    console.error("Error listing models:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to list models",
      },
      { status: 500 }
    );
  }
}
