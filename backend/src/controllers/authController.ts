import { Request, Response } from 'express';
import { z } from 'zod';
import { userService, sessionService } from '../services/index.js';
import { auditService } from '../services/auditService.js';
import { AuthenticatedRequest } from '../types/index.js';
import { config } from '../config/index.js';

// ============================================================
// Zod schemas
// ============================================================
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
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
    const { email, password, name } = req.body;

    try {
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ success: false, error: 'El email ya está registrado' });
        return;
      }

      const user = await userService.create({ email, password, name });
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
        res.status(201).json({
          success: true,
          data: { user, emailVerificationRequired: true },
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: { user, ...tokens, emailVerificationRequired: false },
      });
    } catch (error: any) {
      // Password strength validation error
      if (error.message?.includes('contraseña')) {
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
      // Timing-safe: still do a dummy hash to prevent timing attacks
      // (commented out for dev speed)
      // await bcrypt.hash('dummy', 10);
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
    const { name, avatarUrl } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    const user = await userService.update(userId, { name, avatarUrl });

    await auditService.log({
      userId,
      event: 'PROFILE_UPDATE',
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    res.json({ success: true, data: user });
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

    await auditService.log({
      userId,
      event: 'EMAIL_VERIFICATION_SENT',
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    // TODO: Send actual email via Resend here
    // await emailService.sendVerificationEmail(user.email, result.emailVerifyToken!);

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

    const user = await userService.findByEmail(
      (await userService.findById(userId))?.email || ''
    );
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

    res.json({ success: true, message: 'Contraseña actualizada' });
  },
};
