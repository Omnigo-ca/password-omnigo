/**
 * Rate limiting utilities using Upstash Redis
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create rate limiter for password copy operations
// 10 requests per minute per user
export const copyRateLimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'password-copy',
    })
  : new Ratelimit({
      redis: new Map() as unknown as Redis, // Use in-memory Map for development
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: false, // Disable analytics for development
      prefix: 'password-copy',
    })

/**
 * Check rate limit for a user
 * @param userId - The user's ID
 * @returns Rate limit result
 */
export async function checkCopyRateLimit(userId: string) {
  return await copyRateLimit.limit(userId)
} 