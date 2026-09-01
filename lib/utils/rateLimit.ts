// Vercel-friendly token bucket in-memory rate limiter with automatic stale key eviction
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60000
): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Periodic memory cleanup (if cache exceeds 5000 entries)
  if (rateLimitMap.size > 5000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}
