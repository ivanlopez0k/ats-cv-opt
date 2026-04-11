import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/index.js';
import path from 'path';
import { createServer, Server } from 'http';

// Import AI worker to start processing jobs
import { aiWorker } from './workers/aiWorker.js';
import { aiQueue } from './services/cvService.js';
import { prisma } from './services/userService.js';

const app = express();
const server: Server = createServer(app);

app.use(helmet());
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Only serve static uploads if not in production (Cloudinary handles files in prod)
if (!config.isProd) {
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
}

app.use('/api', routes);

app.use(errorHandler);

const PORT = config.port;

const httpServer = server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
  console.log(`🤖 AI Worker connected to Redis`);
});

// ============================================================
// Graceful Shutdown
// ============================================================

let isShuttingDown = false;

async function gracefulShutdown(signal: string, timeoutMs: number = 10000): Promise<void> {
  if (isShuttingDown) {
    console.log(`⚠️  Second ${signal} received. Forcing shutdown...`);
    process.exit(1);
  }

  isShuttingDown = true;
  console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);

  const shutdownTimer = setTimeout(() => {
    console.error(`❌ Shutdown timed out after ${timeoutMs / 1000}s. Forcing exit.`);
    process.exit(1);
  }, timeoutMs);

  try {
    // Step 1: Stop accepting new HTTP connections
    console.log('⏸️  Stopping HTTP server...');
    await new Promise<void>((resolve) => {
      httpServer.close(() => {
        console.log('✅ HTTP server stopped');
        resolve();
      });
      // Force close all existing connections after 5s
      setTimeout(() => {
        console.log('⚠️  Forcing HTTP connections to close');
        httpServer.closeAllConnections?.();
      }, 5000);
    });

    // Step 2: Pause AI queue to stop accepting new jobs
    console.log('⏸️  Pausing AI queue...');
    await aiQueue.pause();

    // Step 3: Close AI worker
    console.log('⏸️  Closing AI worker...');
    await aiWorker.close();
    console.log('✅ AI worker closed');

    // Step 4: Close Redis connection
    console.log('⏸️  Closing Redis connection...');
    // IORedis instance is accessible through BullMQ queue connection
    const redisConnection = aiQueue.opts.connection as any;
    if (redisConnection && typeof redisConnection.quit === 'function') {
      await redisConnection.quit();
      console.log('✅ Redis connection closed');
    }

    // Step 5: Close Prisma connection pool
    console.log('⏸️  Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ Database disconnected');

    clearTimeout(shutdownTimer);
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimer);
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

export default app;
