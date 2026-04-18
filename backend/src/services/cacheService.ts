/**
 * Redis caching service for API responses
 * Reduces database load for frequently accessed data
 */
import IORedis from 'ioredis';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// Create separate Redis connection for caching
const cacheClient = new IORedis(config.redis.url, {
  maxRetriesPerRequest: null,
});

cacheClient.on('error', (err) => {
  logger.error('❌ Cache Redis error:', err);
});

// Default cache TTL (time to live)
const DEFAULT_TTL = 60 * 5; // 5 minutes

/**
 * Get cached value
 */
export const getCache = async (key: string): Promise<string | null> => {
  try {
    const value = await cacheClient.get(key);
    return value;
  } catch (err) {
    logger.error('Cache get error:', err);
    return null;
  }
};

/**
 * Set cached value with TTL
 */
export const setCache = async (key: string, value: string, ttl: number = DEFAULT_TTL): Promise<void> => {
  try {
    await cacheClient.setex(key, ttl, value);
  } catch (err) {
    logger.error('Cache set error:', err);
  }
};

/**
 * Delete cached value
 */
export const deleteCache = async (key: string): Promise<void> => {
  try {
    await cacheClient.del(key);
  } catch (err) {
    logger.error('Cache delete error:', err);
  }
};

/**
 * Delete all keys matching a pattern
 */
export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await cacheClient.keys(pattern);
    if (keys.length > 0) {
      await cacheClient.del(...keys);
      logger.info(`🗑️ Cleared ${keys.length} cache keys matching ${pattern}`);
    }
  } catch (err) {
    logger.error('Cache pattern delete error:', err);
  }
};

/**
 * Generate cache key from request parameters
 */
export const generateCacheKey = (prefix: string, params: Record<string, any>): string => {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join(':');
  return `${prefix}:${sorted}`;
};

/**
 * Close cache connection
 */
export const closeCache = async (): Promise<void> => {
  await cacheClient.quit();
};

/**
 * Cache wrapper for async functions
 * If cached, return cached value. Otherwise, call function and cache result.
 */
export const cached = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> => {
  // Try to get from cache
  const cached = await getCache(key);
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      // If parse fails, ignore and compute
    }
  }

  // Compute value
  const value = await fn();

  // Cache the result
  try {
    await setCache(key, JSON.stringify(value), ttl);
  } catch (err) {
    logger.error('Cache fn error:', err);
  }

  return value;
};