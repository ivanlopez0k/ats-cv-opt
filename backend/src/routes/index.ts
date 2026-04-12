import { Router } from 'express';
import authRoutes from './authRoutes.js';
import cvRoutes from './cvRoutes.js';
import communityRoutes from './communityRoutes.js';
import aiRoutes from './aiRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cvs', cvRoutes);
router.use('/community', communityRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
