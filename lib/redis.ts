import { Redis } from '@upstash/redis'

// Graceful fallback when Redis env vars are missing or invalid (development)
let redisClient: any = null

const redisUrl = process.env.UPSTASH_REDIS_URL
const redisToken = process.env.UPSTASH_REDIS_TOKEN

// Check if Redis URL is valid (not a placeholder)
const isValidRedisUrl = redisUrl && 
  redisUrl.startsWith('http') && 
  !redisUrl.includes('your-redis-url') &&
  !redisUrl.includes('placeholder')

if (isValidRedisUrl && redisToken && !redisToken.includes('your_redis') && !redisToken.includes('placeholder')) {
  try {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    })
  } catch (err) {
    console.warn('[Redis] Failed to initialize Redis client, using mock client')
    redisClient = createMockRedisClient()
  }
} else {
  // Mocked client for local/dev to avoid crashes
  redisClient = createMockRedisClient()
}

function createMockRedisClient() {
  return {
    hgetall: async () => ({}),
    pipeline() {
      const ops: any[] = []
      return {
        hset: (...args: any[]) => ops.push(['hset', ...args]),
        hdel: (...args: any[]) => ops.push(['hdel', ...args]),
        expire: () => {},
        exec: async () => [],
      }
    },
  }
}

export const redis = redisClient

