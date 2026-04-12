/**
 * Admin Controller - Handles admin API endpoints.
 */

import { Request, Response } from 'express';
import { adminService } from '../services/adminService.js';
import { auditService } from '../services/auditService.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';

export const adminController = {
  // ============================================================
  // Users
  // ============================================================
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, search } = req.query;

    const result = await adminService.getUsers(
      parseInt(page as string),
      parseInt(limit as string),
      search as string
    );

    res.json({ success: true, data: result });
  },

  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await adminService.getUserById(id);

    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    res.json({ success: true, data: user });
  },

  async updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.params.id;
    const adminId = req.user?.userId || 'unknown';
    const { role } = req.body;

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      res.status(400).json({ success: false, error: 'Role inválido' });
      return;
    }

    try {
      const updated = await adminService.updateUserRole(userId, role, adminId);

      await auditService.log({
        userId: adminId,
        event: 'ADMIN_ROLE_CHANGE',
        ipAddress: req.ip || undefined,
        userAgent: req.headers['user-agent'] || undefined,
        details: { targetUserId: userId, newRole: role },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async togglePremium(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.params.id;
    const adminId = req.user?.userId || 'unknown';

    try {
      const updated = await adminService.togglePremium(userId, adminId);

      await auditService.log({
        userId: adminId,
        event: 'ADMIN_PREMIUM_TOGGLE',
        ipAddress: req.ip || undefined,
        userAgent: req.headers['user-agent'] || undefined,
        details: { targetUserId: userId, isPremium: updated.isPremium },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.params.id;
    const adminId = req.user?.userId || 'unknown';

    try {
      await adminService.deleteUser(userId, adminId);

      await auditService.log({
        userId: adminId,
        event: 'ADMIN_DELETE_USER',
        ipAddress: req.ip || undefined,
        userAgent: req.headers['user-agent'] || undefined,
        details: { targetUserId: userId },
      });

      res.json({ success: true, message: 'Usuario eliminado' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // ============================================================
  // CVs
  // ============================================================
  async getCVs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, status, userId, search } = req.query;

    const result = await adminService.getCVs(
      parseInt(page as string),
      parseInt(limit as string),
      {
        status: status as string,
        userId: userId as string,
        search: search as string,
      }
    );

    res.json({ success: true, data: result });
  },

  async updateCVStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const cvId = req.params.id;
    const adminId = req.user?.userId || 'unknown';
    const { status } = req.body;

    if (!status || !['PROCESSING', 'COMPLETED', 'FAILED'].includes(status)) {
      res.status(400).json({ success: false, error: 'Status inválido' });
      return;
    }

    try {
      const updated = await adminService.updateCVStatus(cvId, status, adminId);

      await auditService.log({
        userId: adminId,
        event: 'ADMIN_CV_STATUS_CHANGE',
        ipAddress: req.ip || undefined,
        userAgent: req.headers['user-agent'] || undefined,
        details: { targetCVId: cvId, newStatus: status },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async deleteCV(req: AuthenticatedRequest, res: Response): Promise<void> {
    const cvId = req.params.id;
    const adminId = req.user?.userId || 'unknown';

    try {
      await adminService.deleteCV(cvId, adminId);

      await auditService.log({
        userId: adminId,
        event: 'ADMIN_DELETE_CV',
        ipAddress: req.ip || undefined,
        userAgent: req.headers['user-agent'] || undefined,
        details: { targetCVId: cvId },
      });

      res.json({ success: true, message: 'CV eliminado' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // ============================================================
  // Stats
  // ============================================================
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const stats = await adminService.getStats();
    res.json({ success: true, data: stats });
  },
};
