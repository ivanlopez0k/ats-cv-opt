import { Router } from 'express';
import authRoutes from './authRoutes.js';
import cvRoutes from './cvRoutes.js';
import communityRoutes from './communityRoutes.js';
import aiRoutes from './aiRoutes.js';
import adminRoutes from './adminRoutes.js';
import { prisma } from '../services/userService.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cvs', cvRoutes);
router.use('/community', communityRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);

// Enhanced health check with service status
router.get('/health', async (req, res) => {
  const startTime = Date.now();
  
  const services: Record<string, string> = {};
  let overallStatus = 'ok';

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    services.database = 'connected';
  } catch (error) {
    services.database = 'disconnected';
    overallStatus = 'degraded';
    logger.error('Health check: Database connection failed', error);
  }

  // Check Redis (via BullMQ queue)
  try {
    const Redis = (await import('ioredis')).default;
    const redis = new Redis(config.redis.url);
    await redis.ping();
    await redis.quit();
    services.redis = 'connected';
  } catch (error) {
    services.redis = 'disconnected';
    overallStatus = 'degraded';
    logger.error('Health check: Redis connection failed', error);
  }

  // Check Cloudinary config
  services.cloudinary = config.cloudinary.cloudName ? 'configured' : 'not_configured';

  res.status(overallStatus === 'ok' ? 200 : 503).json({
    status: overallStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    responseTime: `${Date.now() - startTime}ms`,
    services,
  });
});

export default router;
