import { RateLimiterRedis } from "rate-limiter-flexible";
import redisClient from "../config/redis.js";
import dotenv from "dotenv";

dotenv.config();

// Rate limiter for per-second limit
const perSecondLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "ratelimit_sec",
  points: parseInt(process.env.RATE_LIMIT_POINTS, 10), // 1 request
  duration: parseInt(process.env.RATE_LIMIT_DURATION, 10), // per 1 second
});

// Rate limiter for per-minute limit
const perMinuteLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "ratelimit_min",
  points: parseInt(process.env.RATE_LIMIT_POINTS_MINUTE, 10), // 20 requests
  duration: parseInt(process.env.RATE_LIMIT_DURATION_MINUTE, 10), // per 60 seconds
});

export const checkRateLimit = async (userId) => {
  try {
    // Check both rate limits
    await Promise.all([
      perSecondLimiter.consume(userId),
      perMinuteLimiter.consume(userId),
    ]);
    return { success: true };
  } catch (error) {
    // If rate limit is exceeded, return the time to wait
    const msBeforeNext = Math.max(
      error.msBeforeNext || 0,
      error.msBeforeNext || 0
    );
    return {
      success: false,
      msBeforeNext,
      message: "Rate limit exceeded",
    };
  }
};

export default {
  checkRateLimit,
};
