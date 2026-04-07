import { Router } from 'express';
import multer from 'multer';
import { authController, loginSchema, registerSchema, refreshSchema } from '../controllers/index.js';
import { authenticate, validate } from '../middlewares/index.js';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, authController.updateProfile);

export default router;
