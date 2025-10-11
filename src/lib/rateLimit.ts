type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

export function rateLimit(key: string, { windowMs, max }: { windowMs: number; max: number }): boolean {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt < now) {
    // No entry or expired entry - create new one
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count < max) {
    // Under limit - increment count
    entry.count += 1;
    return true;
  }

  // Over limit
  return false;
}
