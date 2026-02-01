import { getUserFriendlyError } from "../utils/errorHandler";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

/**
 * Makes an API request and returns the parsed JSON response
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, fetchOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    throw new Error(getUserFriendlyError(error, "Failed to make request"));
  }
}

/**
 * Makes a POST request to the AI reflect endpoint
 */
export function reflectOnEntry(text: string, userId?: string) {
  return apiRequest<{ reflection: string; mood: string; followUpQuestion: string; goalMention?: string }>(
    "/api/ai/reflect",
    {
      method: "POST",
      body: { text, userId },
    }
  );
}

/**
 * Makes a POST request to the weekly reflection endpoint
 */
export function getWeeklyReflection(userId: string) {
  return apiRequest<{
    themes: string;
    moodPatterns: string;
    encouragement: string;
    goalProgress?: string;
  }>("/api/ai/weekly-reflection", {
    method: "POST",
    body: { userId },
  });
}
