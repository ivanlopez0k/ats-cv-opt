import { Router } from 'express';
import {
  authController,
  loginSchema,
  registerSchema,
  refreshSchema,
  updateUsernameSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
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

// Username management
router.get('/check-username/:username', authController.checkUsername);
router.patch('/username', authenticate, validate(updateUsernameSchema), authController.updateUsername);

// Password management
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/forgot-password', authRateLimit, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimit, validate(resetPasswordSchema), authController.resetPassword);

// Email verification (toggle-controlled)
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authenticate, authController.resendVerificationEmail);

export default router;
