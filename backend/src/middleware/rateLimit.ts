import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix: string; // Redis key prefix
}

/**
 * Rate limiting middleware using Redis
 * Uses a sliding window approach
 */
export function rateLimit(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get identifier (IP address or API key)
      const identifier = req.headers.authorization?.split(' ')[1] || req.ip || 'unknown';
      const key = `${options.keyPrefix}:${identifier}`;

      // Get current count
      const current = await redis.get<number>(key);
      const count = current ? parseInt(String(current)) : 0;

      // Check if limit exceeded
      if (count >= options.maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again later.`,
        });
      }

      // Increment counter
      if (count === 0) {
        // First request in window - set with expiration
        await redis.set(key, 1, { px: options.windowMs });
      } else {
        // Increment existing counter
        await redis.incr(key);
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - count - 1));

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // If Redis fails, allow the request (fail open)
      next();
    }
  };
}

// Predefined rate limiters

/**
 * Strict rate limit for registration (1 per IP per day)
 */
export const registrationRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 1,
  keyPrefix: 'ratelimit:register',
});

/**
 * Standard rate limit for authenticated endpoints (100 per hour)
 */
export const standardRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100,
  keyPrefix: 'ratelimit:standard',
});

/**
 * Generous rate limit for read operations (1000 per hour)
 */
export const readRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000,
  keyPrefix: 'ratelimit:read',
});

/**
 * Strict rate limit for write operations (30 per hour)
 */
export const writeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 30,
  keyPrefix: 'ratelimit:write',
});
