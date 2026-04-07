import { Router } from 'express';
import {
  authController,
  loginSchema,
  registerSchema,
  refreshSchema,
} from '../controllers/index.js';
import { authenticate, validate } from '../middlewares/index.js';
import { authRateLimit } from '../middlewares/rateLimit.js';

const router = Router();

// Apply rate limiting to auth endpoints (toggle-controlled)
router.post('/register', authRateLimit, validate(registerSchema), authController.register);
router.post('/login', authRateLimit, validate(loginSchema), authController.login);
router.post('/refresh', authRateLimit, validate(refreshSchema), authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, authController.updateProfile);

// Password management
router.post('/change-password', authenticate, authController.changePassword);

// Email verification (toggle-controlled)
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authenticate, authController.resendVerificationEmail);

export default router;
