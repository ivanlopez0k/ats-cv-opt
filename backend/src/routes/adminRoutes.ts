/**
 * Admin Routes - All protected with requireAdmin middleware.
 */

import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middlewares/index.js';
import { authRateLimit } from '../middlewares/rateLimit.js';

const router = Router();

// All admin routes require authentication AND admin role
router.use(authenticate);
router.use(requireAdmin);

// Apply strict rate limiting to admin endpoints
router.use(authRateLimit);

// Users management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/premium', adminController.togglePremium);
router.delete('/users/:id', adminController.deleteUser);

// CV moderation
router.get('/cvs', adminController.getCVs);
router.patch('/cvs/:id/status', adminController.updateCVStatus);
router.delete('/cvs/:id', adminController.deleteCV);

// Analytics
router.get('/stats', adminController.getStats);

export default router;
