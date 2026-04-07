import { prisma } from './userService.js';
import { config } from '../config/index.js';

export type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'SESSION_CREATED'
  | 'SESSION_REVOKED'
  | 'SESSION_REFRESHED'
  | 'EMAIL_VERIFIED'
  | 'EMAIL_VERIFICATION_SENT'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'TOKEN_REUSE_DETECTED'
  | 'REGISTER_SUCCESS'
  | 'PROFILE_UPDATE'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED';

export const auditService = {
  /**
   * Log a security event.
   * Respects the `auditLogEnabled` toggle — no-op when disabled.
   */
  async log(params: {
    userId?: string | null;
    event: AuditEventType;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
  }) {
    if (!config.security.auditLogEnabled) return;

    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          event: params.event,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
          details: params.details ? (params.details as any) : null,
        },
      });
    } catch (err) {
      // Never break the main flow because of audit logging
      console.error('[AuditLog] Failed to write:', err);
    }
  },

  /**
   * Get recent audit events for a user (admin use).
   */
  async getUserEvents(userId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  /**
   * Get recent security events globally (admin use).
   */
  async getGlobalEvents(limit = 100) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { email: true, name: true } } },
    });
  },
};
