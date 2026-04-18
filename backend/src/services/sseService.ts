import IORedis from 'ioredis';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const CHANNEL_PREFIX = 'cv-status:';

/**
 * Create a Redis client for Pub/Sub
 * Separate from BullMQ connection to avoid blocking
 */
const createPubSubClient = () => {
  const client = new IORedis(config.redis.url, {
    maxRetriesPerRequest: null,
  });

  client.on('error', (err) => {
    logger.error('❌ Redis Pub/Sub error:', err);
  });

  return client;
};

// Singleton pub/sub clients (separate connections!)
let pubClient: IORedis | null = null;
let subClient: IORedis | null = null;

// Client for publishing messages
export const getPubSubClient = (): IORedis => {
  if (!pubClient) {
    pubClient = createPubSubClient();
  }
  return pubClient;
};

// Client for subscribing to messages
const getSubClient = (): IORedis => {
  if (!subClient) {
    subClient = createPubSubClient();
    // Switch to subscriber mode
    subClient.on('ready', () => {
      logger.info('📡 Redis subscriber client ready');
    });
  }
  return subClient;
};

/**
 * Subscribe to CV status updates via Redis Pub/Sub
 * Returns async iterator for consumption
 */
export const subscribeToCVStatus = (cvId: string) => {
  const client = getSubClient();
  const channel = `${CHANNEL_PREFIX}${cvId}`;

  // Create a simple event emitter wrapper
  const handlers: Set<(data: CVStatusMessage) => void> = new Set();

  client.subscribe(channel, () => {
    logger.info(`📡 Subscribed to ${channel}`);
  });

  client.on('message', (ch, message) => {
    if (ch === channel) {
      try {
        const data = JSON.parse(message) as CVStatusMessage;
        handlers.forEach((handler) => handler(data));
      } catch (err) {
        logger.error('❌ Failed to parse SSE message:', err);
      }
    }
  });

  return {
    onMessage: (handler: (data: CVStatusMessage) => void) => {
      handlers.add(handler);
    },
    unsubscribe: () => {
      client.unsubscribe(channel);
      handlers.clear();
    },
  };
};

/**
 * Publish CV status update to Redis Pub/Sub
 * Called by AI worker when job completes/fails
 */
export const publishCVStatus = async (cvId: string, status: CVStatusMessage) => {
  const client = getPubSubClient();
  const channel = `${CHANNEL_PREFIX}${cvId}`;

  try {
    await client.publish(channel, JSON.stringify(status));
    logger.info(`📤 Published ${status.status} to ${channel}`);
  } catch (err) {
    logger.error('❌ Failed to publish CV status:', err);
  }
};

/**
 * Clean up pub/sub connections on shutdown
 */
export const closePubSub = async () => {
  if (pubClient) {
    await pubClient.quit();
    pubClient = null;
    logger.info('🔌 Redis pub client closed');
  }
  if (subClient) {
    await subClient.quit();
    subClient = null;
    logger.info('🔌 Redis sub client closed');
  }
};

// Types
export interface CVStatusMessage {
  cvId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  message?: string;
  analysisResult?: any;
  improvedPdfUrl?: string;
  improvedJson?: any;
}