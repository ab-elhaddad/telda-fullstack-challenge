import rateLimit from 'express-rate-limit';
import config from '@config/index';

/**
 * Global rate limiter middleware configuration
 */
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: 'Too many requests, please try again later.',
  },
});

/**
 * Stricter rate limiter for authentication routes
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: 'Too many login attempts, please try again later.',
  },
});
