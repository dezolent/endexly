/**
 * Safe FormData extraction utilities.
 * Prevents `as string` lies — returns proper types or throws.
 */

/**
 * Extract a required string field from FormData. Throws if missing or empty.
 */
export function requireString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }
  return value.trim();
}

/**
 * Extract an optional string field. Returns undefined if missing/empty.
 */
export function optionalString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }
  return value.trim();
}

/**
 * Extract a boolean field (handles "true", "1", "on" as truthy).
 */
export function optionalBoolean(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "true" || value === "1" || value === "on";
}
