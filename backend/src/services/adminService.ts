/**
 * Admin Service - Business logic for admin operations.
 */

import { prisma } from './userService.js';
import { logger } from '../utils/logger.js';

export const adminService = {
  // ============================================================
  // Users
  // ============================================================
  async getUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { username: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          isPremium: true,
          isEmailVerified: true,
          createdAt: true,
          _count: { select: { cvs: true, votes: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isPremium: true,
        isEmailVerified: true,
        nationality: true,
        defaultTargetJob: true,
        defaultTargetIndustry: true,
        avatarUrl: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { cvs: true, votes: true, sessions: true } },
      },
    });
  },

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN', adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuario no encontrado');

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, email: true, role: true },
    });

    logger.info(`Admin ${adminId} changed role of user ${userId} to ${role}`);
    return updated;
  },

  async togglePremium(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuario no encontrado');

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: !user.isPremium },
      select: { id: true, username: true, email: true, isPremium: true },
    });

    logger.info(`Admin ${adminId} toggled premium for user ${userId}: ${updated.isPremium}`);
    return updated;
  },

  async deleteUser(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuario no encontrado');

    // Delete user's sessions, votes, and CVs (cascade handles most)
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.vote.deleteMany({ where: { userId } });
    await prisma.cV.deleteMany({ where: { userId } });

    const deleted = await prisma.user.delete({ where: { id: userId } });
    logger.info(`Admin ${adminId} deleted user ${userId} (${user.email})`);
    return deleted;
  },

  // ============================================================
  // CVs
  // ============================================================
  async getCVs(page: number = 1, limit: number = 20, filters?: {
    status?: string;
    userId?: string;
    search?: string;
  }) {
    const skip = (page - 1) * limit;
    const where: any = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.search && {
        title: { contains: filters.search, mode: 'insensitive' as const },
      }),
    };

    const [cvs, total] = await Promise.all([
      prisma.cV.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, email: true, name: true } },
          _count: { select: { votes: true } },
        },
      }),
      prisma.cV.count({ where }),
    ]);

    return {
      cvs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async updateCVStatus(cvId: string, status: string, adminId: string) {
    const cv = await prisma.cV.findUnique({ where: { id: cvId } });
    if (!cv) throw new Error('CV no encontrado');

    const updated = await prisma.cV.update({
      where: { id: cvId },
      data: { status: status as 'PROCESSING' | 'COMPLETED' | 'FAILED' },
      select: { id: true, title: true, status: true },
    });

    logger.info(`Admin ${adminId} changed CV ${cvId} status to ${status}`);
    return updated;
  },

  async deleteCV(cvId: string, adminId: string) {
    const cv = await prisma.cV.findUnique({ where: { id: cvId } });
    if (!cv) throw new Error('CV no encontrado');

    // Delete votes first
    await prisma.vote.deleteMany({ where: { cvId } });
    await prisma.cV.delete({ where: { id: cvId } });

    logger.info(`Admin ${adminId} deleted CV ${cvId} (${cv.title})`);
    return { id: cvId, title: cv.title };
  },

  // ============================================================
  // Stats
  // ============================================================
  async getStats() {
    const [
      totalUsers,
      totalCVs,
      totalVotes,
      cvsByStatus,
      premiumUsers,
      recentUsers,
      recentCVs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.cV.count(),
      prisma.vote.count(),
      prisma.cV.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          isPremium: true,
          isEmailVerified: true,
          createdAt: true,
        },
      }),
      prisma.cV.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, name: true } },
        },
      }),
    ]);

    const statusCounts = cvsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers,
      totalCVs,
      totalVotes,
      cvsProcessing: statusCounts.PROCESSING || 0,
      cvsCompleted: statusCounts.COMPLETED || 0,
      cvsFailed: statusCounts.FAILED || 0,
      premiumUsers,
      recentUsers,
      recentCVs,
    };
  },
};
