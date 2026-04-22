import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/index.js';
import { requestLogger, logger } from './utils/logger.js';
import path from 'path';
import { createServer, Server } from 'http';

// Import AI worker to start processing jobs (optional in production)
let aiWorker: any;
let aiQueue: any;
let prisma: any;
try {
  // Only import if Redis is properly configured
  if (config.redis.url && config.redis.url.includes('upstash')) {
    const { aiWorker: worker } = await import('./workers/aiWorker.js');
    const { aiQueue: queue } = await import('./services/cvService.js');
    aiWorker = worker;
    aiQueue = queue;
  }
} catch (error) {
  logger.debug('AI worker not initialized (Redis not available)');
}

try {
  // Import Prisma client
  const { prisma: prismaClient } = await import('../services/userService.js');
  prisma = prismaClient;
} catch (error) {
  logger.error('Failed to import Prisma:', error);
}

const app = express();
const server: Server = createServer(app);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: '*', // Allow all for debug
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (generates requestId, logs all requests)
app.use(requestLogger);

// API Version header
app.use((req, res, next) => {
  res.setHeader('X-API-Version', 'v1');
  next();
});

// Only serve static uploads if not in production (Cloudinary handles files in prod)
if (!config.isProd) {
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
}

// Mount API routes with version prefix
app.use('/api/v1', routes);

app.use(errorHandler);

const PORT = config.port;

const httpServer = server.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 API: http://localhost:${PORT}/api`);
  logger.info(`🤖 AI Worker connected to Redis`);
  logger.info(`📦 Environment: ${config.nodeEnv}`);

  // Clean stale jobs from previous test runs (development only)
  if (!config.isProd && aiQueue) {
    try {
      const waitingJobs = await aiQueue.getWaiting();
      const delayedJobs = await aiQueue.getDelayed();
      
      if (waitingJobs.length > 0 || delayedJobs.length > 0) {
        await aiQueue.drain();
        await aiQueue.clean(0, 1000, 'failed');
        logger.info(`🧹 Cleaned ${waitingJobs.length + delayedJobs.length} stale job(s) from queue`);
      }
    } catch (error) {
      logger.debug('Queue cleanup skipped (no stale jobs)');
    }
  }
});

// ============================================================
// Graceful Shutdown
// ============================================================

let isShuttingDown = false;

async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn(`⚠️  Second ${signal} received. Forcing shutdown...`);
    process.exit(1);
  }

  isShuttingDown = true;
  logger.info(`\n🛑 ${signal} received. Starting graceful shutdown...`);

  // Check if there are active jobs being processed
  let hasActiveJob = false;
  if (aiQueue) {
    try {
      const activeJobs = await aiQueue.getActive();
      hasActiveJob = activeJobs.length > 0;
    } catch (e) {
      // Ignore if queue not available
    }
  }

  if (hasActiveJob) {
    logger.warn(`⚠️  ${activeJobs.length} AI job(s) in progress. Waiting for completion...`);
    logger.warn(`   (This may take up to 6 minutes depending on the job)`);
  }

  // If there's an active AI job, give it up to 6 minutes to complete
  // Otherwise, 30 seconds is enough for normal cleanup
  const timeoutMs = hasActiveJob ? 6 * 60 * 1000 : 30 * 1000;
  const timeoutSeconds = timeoutMs / 1000;

  const shutdownTimer = setTimeout(() => {
    logger.error(`❌ Shutdown timed out after ${timeoutSeconds}s. Forcing exit.`);
    process.exit(1);
  }, timeoutMs);

  try {
    // Step 1: Stop accepting new HTTP connections
    logger.info('⏸️  Stopping HTTP server...');
    await new Promise<void>((resolve) => {
      httpServer.close(() => {
        logger.info('✅ HTTP server stopped');
        resolve();
      });
      // Force close all existing connections after 10s
      setTimeout(() => {
        logger.warn('⚠️  Forcing HTTP connections to close');
        httpServer.closeAllConnections?.();
      }, 10000);
    });

    // Step 2: Pause AI queue to stop accepting new jobs
    logger.info('⏸️  Pausing AI queue...');
    await aiQueue.pause();
    logger.info('✅ AI queue paused (no new jobs will be accepted)');

    // Step 3: Close AI worker (waits for current job to finish)
    logger.info('⏸️  Closing AI worker...');
    if (hasActiveJob) {
      logger.info('   Waiting for active job(s) to complete...');
    }
    await aiWorker.close();
    logger.info('✅ AI worker closed');

    // Step 4: Close Redis connection
    logger.info('⏸️  Closing Redis connection...');
    // IORedis instance is accessible through BullMQ queue connection
    const redisConnection = aiQueue.opts.connection as any;
    if (redisConnection && typeof redisConnection.quit === 'function') {
      await redisConnection.quit();
      logger.info('✅ Redis connection closed');
    }

    // Step 5: Close Prisma connection pool
    logger.info('⏸️  Disconnecting from database...');
    await prisma.$disconnect();
    logger.info('✅ Database disconnected');

    clearTimeout(shutdownTimer);
    logger.info(`✅ Graceful shutdown completed (took ${hasActiveJob ? '~6 min' : '< 1s'})`);
    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimer);
    logger.error('❌ Error during graceful shutdown:', { error });
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', { error: error.message, stack: error.stack });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('❌ Unhandled Rejection:', { reason: String(reason) });
  gracefulShutdown('unhandledRejection');
});

export default app;
