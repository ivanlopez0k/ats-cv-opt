import { Request, Response } from 'express';
import { z } from 'zod';
import { userService, sessionService, emailService } from '../services/index.js';
import { auditService } from '../services/auditService.js';
import { AuthenticatedRequest } from '../types/index.js';
import { config } from '../config/index.js';
import { uploadImageToCloudinary, deleteFromCloudinary, getPublicIdFromCloudinaryUrl } from '../utils/cloudinary.js';
import { logger } from '../utils/logger.js';

// ============================================================
// Zod schemas
// ============================================================
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'El username debe tener al menos 3 caracteres')
    .max(20, 'El username debe tener máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El username solo puede contener letras, números y guiones bajos'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  nationality: z.string().optional().or(z.literal('')),
  defaultTargetJob: z.string().optional().or(z.literal('')),
  defaultTargetIndustry: z.string().optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .min(3, 'El username debe tener al menos 3 caracteres')
    .max(20, 'El username debe tener máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El username solo puede contener letras, números y guiones bajos'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

// ============================================================
// Helper: set secure cookie with tokens
// ============================================================
function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string }
) {
  if (!config.security.secureCookiesEnabled) return;

  const cookieOptions: Partial<import('express').CookieOptions> = {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('cv_access_token', tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('cv_refresh_token', tokens.refreshToken, cookieOptions);
}

function clearAuthCookies(res: Response) {
  res.clearCookie('cv_access_token', { path: '/' });
  res.clearCookie('cv_refresh_token', { path: '/' });
}

// ============================================================
// Helper: get client info from request
// ============================================================
function getClientInfo(req: Request) {
  return {
    ipAddress: req.ip || req.socket.remoteAddress || undefined,
    userAgent: req.headers['user-agent'] || undefined,
  };
}

// ============================================================
// Controller
// ============================================================
export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { username, email, password, name, nationality, defaultTargetJob, defaultTargetIndustry } = req.body;

    try {
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ success: false, error: 'El email ya está registrado' });
        return;
      }

      const user = await userService.create({
        username,
        email,
        password,
        name,
        nationality: nationality || undefined,
        defaultTargetJob: defaultTargetJob || undefined,
        defaultTargetIndustry: defaultTargetIndustry || undefined,
      });

      const clientInfo = getClientInfo(req);
      const tokens = await sessionService.createSession(
        { id: user.id, email: user.email, role: user.role },
        clientInfo
      );

      setAuthCookies(res, tokens);

      await auditService.log({
        userId: user.id,
        event: 'REGISTER_SUCCESS',
        ...clientInfo,
      });

      if (config.security.emailVerificationEnabled) {
        // Send verification email (non-blocking, don't fail registration if email fails)
        emailService.sendVerificationEmail(user.email, user.name, tokens.accessToken)
          .then(result => {
            if (!result.success) {
              logger.error('Failed to send verification email:', result.error);
            }
          })
          .catch(err => logger.error('Failed to send verification email:', err));

        res.status(201).json({
          success: true,
          data: { user, emailVerificationRequired: true },
        });
        return;
      }

      // Send welcome email if email verification is not required
      emailService.sendWelcomeEmail(user.email, user.name)
        .then(result => {
          if (!result.success) {
            logger.error('Failed to send welcome email:', result.error);
          }
        })
        .catch(err => logger.error('Failed to send welcome email:', err));

      res.status(201).json({
        success: true,
        data: { user, ...tokens, emailVerificationRequired: false },
      });
    } catch (error: any) {
      // Username or password validation error
      if (error.message?.includes('username') || error.message?.includes('contraseña')) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      throw error;
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const clientInfo = getClientInfo(req);

    const user = await userService.findByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      return;
    }

    // Check account lockout
    const isLocked = await userService.isAccountLocked({ lockedUntil: user.lockedUntil ?? null });
    if (isLocked) {
      await auditService.log({
        userId: user.id,
        event: 'LOGIN_FAILED',
        ...clientInfo,
        details: { reason: 'account_locked', lockedUntil: user.lockedUntil },
      });
      res.status(423).json({
        success: false,
        error: `Cuenta bloqueada temporalmente. Intenta de nuevo más tarde.`,
        lockedUntil: user.lockedUntil,
      });
      return;
    }

    const isValid = await userService.verifyPassword(user, password);
    if (!isValid) {
      await userService.incrementFailedAttempts(user.id);
      await auditService.log({
        userId: user.id,
        event: 'LOGIN_FAILED',
        ...clientInfo,
        details: { reason: 'invalid_password' },
      });
      res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      return;
    }

    // Successful login — reset failed attempts
    await userService.resetFailedAttempts(user.id);

    const tokens = await sessionService.createSession(
      { id: user.id, email: user.email, role: user.role },
      clientInfo
    );

    setAuthCookies(res, tokens);

    await auditService.log({
      userId: user.id,
      event: 'LOGIN_SUCCESS',
      ...clientInfo,
    });

    const userData = await userService.findById(user.id);

    res.json({
      success: true,
      data: {
        user: userData,
        ...tokens,
        emailVerificationRequired: config.security.emailVerificationEnabled && !(userData as any)?.isEmailVerified,
      },
    });
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    const clientInfo = getClientInfo(req);

    try {
      const tokens = await sessionService.refreshSession(refreshToken, clientInfo);
      setAuthCookies(res, tokens);

      res.json({ success: true, data: tokens });
    } catch (error: any) {
      clearAuthCookies(res);
      res.status(401).json({ success: false, error: error.message || 'Refresh token inválido' });
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    const clientInfo = getClientInfo(req);

    if (refreshToken) {
      await sessionService.deleteSession(refreshToken);
    }

    clearAuthCookies(res);

    res.json({ success: true, message: 'Sesión cerrada' });
  },

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    const user = await userService.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    res.json({ success: true, data: user });
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { name, avatarUrl, nationality, defaultTargetJob, defaultTargetIndustry } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    const user = await userService.update(userId, {
      name,
      avatarUrl,
      nationality,
      defaultTargetJob,
      defaultTargetIndustry,
    });

    await auditService.log({
      userId,
      event: 'PROFILE_UPDATE',
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    res.json({ success: true, data: user });
  },

  async updateUsername(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { username } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    try {
      const user = await userService.updateUsername(userId, username);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async checkUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ success: false, error: 'Username requerido' });
      return;
    }

    // Validate format first
    const { validateUsername } = await import('../services/userService.js');
    const validation = validateUsername(username);

    if (validation && !validation.valid) {
      res.json({ success: true, available: false, error: validation.error });
      return;
    }

    const available = await userService.isUsernameAvailable(username);
    res.json({ success: true, available });
  },

  // ============================================================
  // Email verification
  // ============================================================
  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.params;

    if (!config.security.emailVerificationEnabled) {
      res.status(400).json({ success: false, error: 'Verificación de email deshabilitada' });
      return;
    }

    const user = await userService.verifyEmail(token);

    if (!user) {
      res.status(400).json({ success: false, error: 'Token inválido o expirado' });
      return;
    }

    await auditService.log({
      userId: user.id,
      event: 'EMAIL_VERIFIED',
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    res.json({ success: true, message: 'Email verificado exitosamente' });
  },

  async resendVerificationEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    if (!config.security.emailVerificationEnabled) {
      res.status(400).json({ success: false, error: 'Verificación de email deshabilitada' });
      return;
    }

    const user = await userService.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    if ((user as any).isEmailVerified) {
      res.status(400).json({ success: false, error: 'Email ya verificado' });
      return;
    }

    const result = await userService.resendVerificationEmail(userId);
    if (!result) {
      res.status(500).json({ success: false, error: 'Error al generar token de verificación' });
      return;
    }

    await auditService.log({
      userId,
      event: 'EMAIL_VERIFICATION_SENT',
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(
      result.email,
      result.username,
      result.emailVerifyToken!
    );

    if (!emailResult.success) {
      logger.error('Failed to resend verification email:', emailResult.error);
    }

    res.json({ success: true, message: 'Email de verificación reenviado' });
  },

  // ============================================================
  // Change password
  // ============================================================
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    const currentUser = await userService.findById(userId);
    if (!currentUser) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    const user = await userService.findByEmail(currentUser.email);
    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    const isValid = await userService.verifyPassword(user, currentPassword);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Contraseña actual incorrecta' });
      return;
    }

    // Validate new password strength
    const { validatePasswordStrength } = await import('../services/userService.js');
    const strengthResult = validatePasswordStrength(newPassword);
    if (!strengthResult.valid) {
      res.status(400).json({ success: false, error: strengthResult.errors.join(', ') });
      return;
    }

    await userService.updatePassword(userId, await require('bcrypt').hash(newPassword, 12));

    // Revoke all other sessions
    await sessionService.deleteAllUserSessions(userId);

    await auditService.log({
      userId,
      event: 'PASSWORD_CHANGE',
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    // Send password changed notification email
    emailService.sendPasswordChangedNotification(user.email, user.name)
      .then(result => {
        if (!result.success) {
          logger.error('Failed to send password changed notification:', result.error);
        }
      })
      .catch(err => logger.error('Failed to send password changed notification:', err));

    res.json({ success: true, message: 'Contraseña actualizada' });
  },

  // ============================================================
  // Forgot password
  // ============================================================
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, error: 'Email requerido' });
      return;
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists (security best practice)
      res.json({ success: true, message: 'Si el email existe, recibirás un link para resetear tu contraseña' });
      return;
    }

    const result = await userService.createPasswordResetToken(email);
    if (!result) {
      res.status(500).json({ success: false, error: 'Error al generar token de reset' });
      return;
    }

    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(
      result.email,
      result.name,
      result.passwordResetToken!
    );

    if (!emailResult.success) {
      logger.error('Failed to send password reset email:', emailResult.error);
      res.status(500).json({ success: false, error: 'Error al enviar email de reset' });
      return;
    }

    await auditService.log({
      userId: user.id,
      event: 'PASSWORD_RESET_REQUESTED',
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    res.json({ success: true, message: 'Si el email existe, recibirás un link para resetear tu contraseña' });
  },

  // ============================================================
  // Reset password
  // ============================================================
  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ success: false, error: 'Token y nueva contraseña requeridos' });
      return;
    }

    // Validate password strength
    const { validatePasswordStrength } = await import('../services/userService.js');
    const strengthResult = validatePasswordStrength(newPassword);
    if (!strengthResult.valid) {
      res.status(400).json({ success: false, error: strengthResult.errors.join(', ') });
      return;
    }

    const user = await userService.resetPassword(token, newPassword);
    if (!user) {
      res.status(400).json({ success: false, error: 'Token inválido o expirado' });
      return;
    }

    // Revoke all sessions
    await sessionService.deleteAllUserSessions(user.id);

    await auditService.log({
      userId: user.id,
      event: 'PASSWORD_RESET_COMPLETED',
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
  },

  // ============================================================
  // Avatar upload
  // ============================================================
  async uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const file = req.file;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    if (!file) {
      res.status(400).json({ success: false, error: 'Imagen requerida' });
      return;
    }

    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      res.status(400).json({ success: false, error: 'Solo se permiten imágenes (JPG, PNG, WebP)' });
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      res.status(400).json({ success: false, error: 'La imagen debe ser menor a 2MB' });
      return;
    }

    try {
      const user = await userService.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      // Delete old avatar if exists
      if (user.avatarUrl && user.avatarUrl.includes('cloudinary')) {
        try {
          const oldPublicId = getPublicIdFromCloudinaryUrl(user.avatarUrl);
          await deleteFromCloudinary(oldPublicId);
        } catch (error) {
          logger.warn('Failed to delete old avatar:', error);
        }
      }

      // Upload new avatar
      const filename = `${userId}/avatar-${Date.now()}`;
      const result = await uploadImageToCloudinary(file.buffer, filename, 'cvmaster/avatars');

      // Update user
      const updatedUser = await userService.updateAvatar(userId, result.url);

      await auditService.log({
        userId,
        event: 'AVATAR_UPLOADED',
        ipAddress: req.ip || undefined,
        userAgent: req.headers['user-agent'] || undefined,
      });

      res.json({ success: true, data: { avatarUrl: updatedUser.avatarUrl } });
    } catch (error: any) {
      logger.error('Error uploading avatar:', error);
      res.status(500).json({ success: false, error: 'Error al subir el avatar' });
    }
  },

  async deleteAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    try {
      const user = await userService.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      // Delete from Cloudinary if exists
      if (user.avatarUrl && user.avatarUrl.includes('cloudinary')) {
        try {
          const publicId = getPublicIdFromCloudinaryUrl(user.avatarUrl);
          await deleteFromCloudinary(publicId);
        } catch (error) {
          logger.warn('Failed to delete avatar from Cloudinary:', error);
        }
      }

      // Remove from DB
      await userService.removeAvatar(userId);

      res.json({ success: true, message: 'Avatar eliminado' });
    } catch (error: any) {
      logger.error('Error deleting avatar:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar el avatar' });
    }
  },
};
