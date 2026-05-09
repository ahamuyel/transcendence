/**
 * In-memory rate limiter for auth endpoints.
 * Uses a sliding window counter approach.
 * For production with multiple instances, consider using Redis.
 */

type RateLimitConfig = {
  maxRequests: number
  windowMs: number
}

type WindowEntry = {
  count: number
  startTime: number
}

const stores = new Map<string, Map<string, WindowEntry>>()

function getStore(key: string): Map<string, WindowEntry> {
  if (!stores.has(key)) {
    stores.set(key, new Map())
  }
  return stores.get(key)!
}

export function rateLimit({ maxRequests, windowMs }: RateLimitConfig) {
  return async function check(identifier: string): Promise<{
    success: boolean
    remaining: number
    resetAt: Date
  }> {
    const now = Date.now()
    const store = getStore(`${maxRequests}-${windowMs}`)
    const entry = store.get(identifier)

    if (!entry || now - entry.startTime > windowMs) {
      // New window
      store.set(identifier, { count: 1, startTime: now })
      return {
        success: true,
        remaining: maxRequests - 1,
        resetAt: new Date(now + windowMs),
      }
    }

    if (entry.count >= maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetAt: new Date(entry.startTime + windowMs),
      }
    }

    entry.count++
    return {
      success: true,
      remaining: maxRequests - entry.count,
      resetAt: new Date(entry.startTime + windowMs),
    }
  }
}

/**
 * Cleanup old entries periodically (every 10 minutes)
 */
setInterval(() => {
  const now = Date.now()
  for (const store of stores.values()) {
    for (const [key, entry] of store.entries()) {
      if (now - entry.startTime > 600_000) {
        // 10 min
        store.delete(key)
      }
    }
  }
}, 600_000)
