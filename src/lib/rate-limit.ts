// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetAt < now) rateLimitMap.delete(k)
    }
  }

  if (!record || record.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs })
    return { success: true, remaining: config.maxRequests - 1, resetIn: config.windowMs }
  }

  if (record.count >= config.maxRequests) {
    return { success: false, remaining: 0, resetIn: record.resetAt - now }
  }

  record.count++
  return { success: true, remaining: config.maxRequests - record.count, resetIn: record.resetAt - now }
}

// Pre-configured rate limiters for portal
export const RATE_LIMITS = {
  magicLink: { maxRequests: 3, windowMs: 15 * 60 * 1000 }, // 3 per 15 min
  chat: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 per min
  notifications: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per min
  calendar: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 per min
}
