/**
 * A/B Testing Utilities
 * Handles variant selection for homepage hero A/B test
 */

export type HeroVariant = "A" | "B";

const STORAGE_KEY = "hero-variant";

/**
 * Pick hero variant based on URL query parameter or localStorage
 * @param search - URL search string (e.g., "?v=b")
 * @returns "A" or "B"
 */
export function pickVariant(search: string): HeroVariant {
  // Check URL parameter first (?v=b or ?v=B forces variant B)
  const params = new URLSearchParams(search);
  const urlVariant = params.get("v");

  if (urlVariant === "b" || urlVariant === "B") {
    // Store selection for sticky behavior
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "B");
    }
    return "B";
  }

  if (urlVariant === "a" || urlVariant === "A") {
    // Explicitly set to A
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "A");
    }
    return "A";
  }

  // Check localStorage for sticky preference
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "A" || stored === "B") {
      return stored;
    }
  }

  // Default to variant A
  return "A";
}

/**
 * Get the current stored variant preference
 * @returns "A" or "B" or null if not set
 */
export function getStoredVariant(): HeroVariant | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "A" || stored === "B") return stored;
  return null;
}

/**
 * Clear the stored variant preference
 */
export function clearVariantPreference(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
