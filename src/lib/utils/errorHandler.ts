/**
 * Logs an error with context
 */
export function logError(message: string, error: unknown, context?: Record<string, unknown>): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorDetails = {
    message,
    error: errorMessage,
    ...(context && { context }),
  };
  
  if (process.env.NODE_ENV === "development") {
    console.error("[Error]", errorDetails);
  }
}

/**
 * Creates a user-friendly error message from an error
 */
export function getUserFriendlyError(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  return defaultMessage;
}
