import { prisma } from './userService.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { config } from '../config/index.js';
import { auditService } from './auditService.js';

export interface SessionOptions {
  ipAddress?: string;
  userAgent?: string;
}

export const sessionService = {
  async createSession(
    user: { id: string; email: string; role: string },
    options?: SessionOptions
  ) {
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const refreshPayload = verifyRefreshToken(refreshToken);
    const expiresAt = new Date((refreshPayload.exp ?? 0) * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
        ipAddress: options?.ipAddress || null,
        userAgent: options?.userAgent || null,
      },
    });

    await auditService.log({
      userId: user.id,
      event: 'SESSION_CREATED',
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    });

    return { accessToken, refreshToken };
  },

  async refreshSession(refreshToken: string, options?: SessionOptions) {
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) {
      // ============================================================
      // TOKEN REUSE DETECTION (commented out for dev)
      // If the token doesn't exist in DB but was valid, it might have been
      // stolen and already rotated — revoke all user sessions.
      // ============================================================
      if (config.security.tokenReuseDetectionEnabled) {
        try {
          const decodedPayload = verifyRefreshToken(refreshToken);
          // Token was valid but not in DB → possible theft
          await auditService.log({
            userId: decodedPayload.userId,
            event: 'TOKEN_REUSE_DETECTED',
            ipAddress: options?.ipAddress,
            userAgent: options?.userAgent,
            details: { reason: 'refresh_token_not_in_db_but_valid' },
          });

          // Revoke all sessions for this user
          await prisma.session.deleteMany({
            where: { userId: decodedPayload.userId },
          });
        } catch {
          // Token is completely invalid — ignore
        }
      }

      throw new Error('Sesión no encontrada');
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new Error('Sesión expirada');
    }

    // ============================================================
    // TOKEN REUSE DETECTION: Check if a newer token already exists
    // ============================================================
    if (config.security.tokenReuseDetectionEnabled) {
      const newerSessions = await prisma.session.findMany({
        where: {
          userId: session.userId,
          createdAt: { gt: session.createdAt },
        },
        select: { id: true },
      });

      if (newerSessions.length > 0) {
        // This token was already superseded — possible theft
        await auditService.log({
          userId: session.userId,
          event: 'TOKEN_REUSE_DETECTED',
          ipAddress: options?.ipAddress,
          userAgent: options?.userAgent,
          details: { reason: 'newer_session_exists', sessionId: session.id },
        });

        // Revoke all sessions
        await prisma.session.deleteMany({
          where: { userId: session.userId },
        });

        throw new Error('Sesión revocada por seguridad. Por favor, inicia sesión nuevamente.');
      }
    }

    const payload = {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const refreshPayload = verifyRefreshToken(newRefreshToken);
    const expiresAt = new Date((refreshPayload.exp ?? 0) * 1000);

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt,
        ipAddress: options?.ipAddress || session.ipAddress,
        userAgent: options?.userAgent || session.userAgent,
      },
    });

    await auditService.log({
      userId: session.userId,
      event: 'SESSION_REFRESHED',
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async deleteSession(refreshToken: string) {
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      select: { userId: true },
    });

    const result = await prisma.session.deleteMany({
      where: { refreshToken },
    });

    if (session) {
      await auditService.log({
        userId: session.userId,
        event: 'SESSION_REVOKED',
      });
    }

    return result;
  },

  async deleteAllUserSessions(userId: string) {
    await auditService.log({
      userId,
      event: 'SESSION_REVOKED',
      details: { action: 'delete_all_sessions' },
    });

    return prisma.session.deleteMany({
      where: { userId },
    });
  },

  async getUserSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
