import { redis } from "./redis"

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

// In-memory fallback check
async function inMemoryCheck(
  key: string,
  identifier: string,
  maxRequests: number,
  windowMs: number
) {
  const now = Date.now()
  const store = getStore(key)
  const entry = store.get(identifier)

  if (!entry || now - entry.startTime > windowMs) {
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

export function rateLimit({ maxRequests, windowMs }: RateLimitConfig) {
  return async function check(identifier: string): Promise<{
    success: boolean
    remaining: number
    resetAt: Date
  }> {
    const configKey = `${maxRequests}-${windowMs}`

    // If Redis is enabled and connected, use Redis sliding window
    if (redis && redis.status === "ready") {
      try {
        const key = `ratelimit:${configKey}:${identifier}`
        const now = Date.now()
        const clearBefore = now - windowMs

        // Use a multi transaction to query and update the sliding window
        const results = await redis
          .multi()
          .zremrangebyscore(key, "-inf", clearBefore)
          .zadd(key, now, `${identifier}-${now}-${Math.random()}`)
          .zcard(key)
          .pexpire(key, windowMs)
          .exec()

        if (results) {
          // results[2] is the ZCARD result: [err, count]
          const count = results[2][1] as number
          const remaining = Math.max(0, maxRequests - count)
          const success = count <= maxRequests
          const resetAt = new Date(now + windowMs)

          return {
            success,
            remaining,
            resetAt,
          }
        }
      } catch (err) {
        console.warn("Redis rate limit check failed, falling back to in-memory:", err)
      }
    }

    // Fallback to in-memory rate limiter
    return inMemoryCheck(configKey, identifier, maxRequests, windowMs)
  }
}

/**
 * Cleanup old entries periodically (every 10 minutes) for in-memory fallback
 */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const store of stores.values()) {
      for (const [key, entry] of store.entries()) {
        if (now - entry.startTime > 600_000) {
          store.delete(key)
        }
      }
    }
  }, 600_000)
}
