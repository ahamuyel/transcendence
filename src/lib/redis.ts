import Redis from "ioredis"

const redisUrl = process.env.REDIS_URL

let redis: Redis | null = null

if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: (times) => {
        // Try reconnecting, but stop if we fail too many times to prevent blocking
        if (times > 3) {
          return null
        }
        return Math.min(times * 100, 2000)
      },
    })

    redis.on("error", (err) => {
      console.warn("Redis rate-limiter client error:", err.message)
    })
  } catch (err) {
    console.error("Failed to initialize Redis rate-limiter client:", err)
  }
}

export { redis }
