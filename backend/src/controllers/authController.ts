import { Request, Response } from 'express';
import { z } from 'zod';
import { userService, sessionService } from '../services/index.js';
import { AuthenticatedRequest } from '../types/index.js';

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

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { email, password, name } = req.body;

    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ success: false, error: 'El email ya está registrado' });
      return;
    }

    const user = await userService.create({ email, password, name });
    const tokens = await sessionService.createSession(user);

    res.status(201).json({
      success: true,
      data: { user, ...tokens },
    });
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await userService.findByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      return;
    }

    const isValid = await userService.verifyPassword(user, password);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      return;
    }

    const tokens = await sessionService.createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const userData = await userService.findById(user.id);

    res.json({
      success: true,
      data: { user: userData, ...tokens },
    });
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    const tokens = await sessionService.refreshSession(refreshToken);

    res.json({
      success: true,
      data: tokens,
    });
  },

  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await sessionService.deleteSession(refreshToken);
    }

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

    res.json({ success: true, data: user });
  },
};
