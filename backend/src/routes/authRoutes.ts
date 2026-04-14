import { Router } from 'express';
import multer from 'multer';
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

// Multer config for avatar upload (memory storage, max 2MB)
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPG, PNG, WebP)'));
    }
  },
});

// Apply rate limiting to auth endpoints (toggle-controlled)
router.post('/register', authRateLimit, validate(registerSchema), authController.register);
router.post('/login', authRateLimit, validate(loginSchema), authController.login);
router.post('/refresh', authRateLimit, validate(refreshSchema), authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, authController.updateProfile);

// Avatar management
router.patch('/avatar', authenticate, avatarUpload.single('avatar'), authController.uploadAvatar);
router.delete('/avatar', authenticate, authController.deleteAvatar);

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
