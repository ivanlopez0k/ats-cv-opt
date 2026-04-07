import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

// ============================================================
// In-memory store for development (no Redis required)
// ============================================================
interface RateEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateEntry>();

function cleanupMemoryStore() {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}

// Clean up expired entries every 5 minutes
setInterval(cleanupMemoryStore, 5 * 60 * 1000).unref();

function getMemoryEntry(key: string, windowMs: number): RateEntry {
  const now = Date.now();
  let entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    memoryStore.set(key, entry);
  }

  return entry;
}

// ============================================================
// Redis store (lazy-loaded)
// ============================================================
let redisClient: any = null;

async function getRedisClient() {
  if (redisClient) return redisClient;

  try {
    const Redis = (await import('ioredis')).default;
    redisClient = new Redis(config.redis.url);
    return redisClient;
  } catch {
    // Redis not available — fall back to memory
    return null;
  }
}

async function getRedisEntry(key: string, windowMs: number): Promise<RateEntry | null> {
  try {
    const client = await getRedisClient();
    if (!client) return null;

    const multi = client.multi();
    multi.incr(key);
    multi.pttl(key);
    const results = await multi.exec();

    const count = results?.[0]?.[1] as number;
    const pttl = results?.[1]?.[1] as number;

    if (count === 1) {
      await client.pexpire(key, windowMs);
    }

    return { count, resetAt: Date.now() + Math.max(pttl, 0) };
  } catch {
    return null;
  }
}

// ============================================================
// Rate limit middleware factory
// ============================================================
export interface RateLimitOptions {
  max: number;
  windowMs: number;
  message?: string;
  statusCode?: number;
}

export function createRateLimit(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip if rate limiting is disabled
    if (!config.security.rateLimitEnabled) {
      return next();
    }

    const key = `ratelimit:${req.ip || 'unknown'}:${req.path}`;

    // Try Redis first, fall back to memory store
    let entry = await getRedisEntry(key, options.windowMs);

    if (!entry) {
      entry = getMemoryEntry(key, options.windowMs);
    }

    entry.count++;

    const retryAfter = Math.ceil((entry.resetAt - Date.now()) / 1000);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', String(options.max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, options.max - entry.count)));
    res.setHeader('X-RateLimit-Reset', String(entry.resetAt));

    if (entry.count > options.max) {
      res.setHeader('Retry-After', String(retryAfter));
      res.status(options.statusCode || 429).json({
        success: false,
        error: options.message || `Too many requests, please try again in ${retryAfter}s`,
      });
      return;
    }

    next();
  };
}

// ============================================================
// Pre-configured rate limits for auth endpoints
// ============================================================
export const authRateLimit = createRateLimit({
  max: config.rateLimits.auth.max,
  windowMs: config.rateLimits.auth.windowMs,
  message: 'Demasiados intentos. Espera un momento antes de intentar de nuevo.',
  statusCode: 429,
});

export const uploadRateLimit = createRateLimit({
  max: config.rateLimits.upload.max,
  windowMs: config.rateLimits.upload.windowMs,
  message: 'Has subido demasiados archivos. Intenta de nuevo más tarde.',
  statusCode: 429,
});

export const aiRateLimit = createRateLimit({
  max: config.rateLimits.ai.max,
  windowMs: config.rateLimits.ai.windowMs,
  message: 'Has alcanzado el límite de análisis de IA. Intenta de nuevo más tarde.',
  statusCode: 429,
});

export const voteRateLimit = createRateLimit({
  max: config.rateLimits.vote.max,
  windowMs: config.rateLimits.vote.windowMs,
  message: 'Has votado demasiadas veces. Intenta de nuevo mañana.',
  statusCode: 429,
});
