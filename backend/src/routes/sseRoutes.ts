import { Router, Request, Response } from 'express';
import { subscribeToCVStatus, CVStatusMessage } from '../services/sseService.js';
import { prisma } from '../services/userService.js';
import {logger} from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

const router = Router();

// SSE endpoint: /api/v1/sse/cv/:id
// Client connects via EventSource and receives real-time status updates
// Token can be passed via query param (for EventSource) or cookie
router.get('/cv/:id', async (req: Request, res: Response) => {
  const cvId = req.params.id;
  const token = req.query.token as string || req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ success: false, error: 'Token requerido' });
    return;
  }

  // Verify JWT token
  let userId: string;
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    userId = decoded.userId;
  } catch {
    res.status(401).json({ success: false, error: 'Token inválido' });
    return;
  }

  // Verify user has access to this CV
  const { cvService } = await import('../services/index.js');
  const cv = await cvService.findById(cvId);

  if (!cv) {
    res.status(404).json({ success: false, error: 'CV no encontrado' });
    return;
  }

  if (cv.userId !== userId) {
    res.status(403).json({ success: false, error: 'No tienes acceso a este CV' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // CORS headers for EventSource (cross-origin)
  res.setHeader('Access-Control-Allow-Origin', config.frontend.url);
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Helper to send SSE event
  const sendEvent = (event: string, data: CVStatusMessage) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial connection event
  sendEvent('connected', {
    cvId,
    status: cv.status as any,
    message: 'Conectado al stream de actualizaciones',
  });

  logger.info(`📡 SSE client connected for CV ${cvId}`);

  // Subscribe to Redis Pub/Sub for this CV
  const subscription = subscribeToCVStatus(cvId);

  subscription.onMessage((data) => {
    logger.info(`📤 Sending SSE event: ${data.status}`);
    sendEvent('cv-status', data);
  });

  // Handle client disconnect
  req.on('close', () => {
    subscription.unsubscribe();
    logger.info(`🔌 SSE client disconnected for CV ${cvId}`);
  });
});

export default router;