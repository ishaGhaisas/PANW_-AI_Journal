/**
 * Validates that a string is not empty after trimming
 */
export function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validates that a user is authenticated
 */
export function isAuthenticated(user: unknown): user is { uid: string } {
  return typeof user === "object" && user !== null && "uid" in user;
}

/**
 * Validates that a value is defined and not null
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Validates that an object has at least one key
 */
export function hasKeys(obj: Record<string, unknown> | undefined | null): boolean {
  return obj !== undefined && obj !== null && Object.keys(obj).length > 0;
}
