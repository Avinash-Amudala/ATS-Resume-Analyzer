// Simple in-memory rate limiter (use Redis in production for multi-instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

// Rate limit configs per plan
export const SCAN_LIMITS = {
  free: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 3 },
  pro: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10000 },
  lifetime: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10000 },
} as const;

export const OPTIMIZE_LIMITS = {
  free: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 0 },
  pro: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 100 },
  lifetime: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10000 },
} as const;

export const UPLOAD_LIMITS = {
  free: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 3 },
  pro: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 20 },
  lifetime: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10000 },
} as const;
