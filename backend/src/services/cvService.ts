import { prisma } from './userService.js';
import { config } from '../config/index.js';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinary.js';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from '../utils/logger.js';
import { getCache, setCache, generateCacheKey, cached } from './cacheService.js';

const redis = new IORedis(config.redis.url, { maxRetriesPerRequest: null });
export const aiQueue = new Queue('ai-processing', { connection: redis });

export const cvService = {
  async create(
    userId: string,
    data: {
      title: string;
      targetJob?: string;
      targetIndustry?: string;
      isPublic?: boolean;
      template?: 'MODERN' | 'CLASSIC' | 'MINIMAL';
    },
    pdfBuffer: Buffer,
    filename: string
  ) {
    const uniqueFilename = `${userId}/${Date.now()}-${filename.replace(/\s+/g, '-').toLowerCase()}`;

    // Upload PDF to Cloudinary
    logger.info(`📤 Uploading original PDF to Cloudinary: ${uniqueFilename}`);
    const cloudinaryResult = await uploadToCloudinary(pdfBuffer, uniqueFilename, 'cvmaster/originals');

    const cv = await prisma.cV.create({
      data: {
        userId,
        title: data.title,
        originalPdfUrl: cloudinaryResult.url,
        targetJob: data.targetJob,
        targetIndustry: data.targetIndustry,
        isPublic: data.isPublic || false,
        template: data.template || 'MODERN',
        status: 'PROCESSING',
      },
    });

    // Queue job with Cloudinary URL and PDF buffer
    // Convert buffer to base64 to safely pass through BullMQ
    await aiQueue.add('analyze-cv', {
      cvId: cv.id,
      userId,
      targetJob: data.targetJob,
      targetIndustry: data.targetIndustry,
      template: data.template || 'MODERN',
      originalPdfUrl: cloudinaryResult.url,
      originalPdfPublicId: cloudinaryResult.publicId,
      pdfBufferBase64: pdfBuffer.toString('base64'),
    });

    return cv;
  },

  async findAllByUser(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [cvs, total] = await Promise.all([
      prisma.cV.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { votes: true } },
        },
      }),
      prisma.cV.count({ where: { userId, deletedAt: null } }),
    ]);

    return {
      cvs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(cvId: string) {
    return prisma.cV.findUnique({
      where: { id: cvId, deletedAt: null },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        votes: true,
        _count: { select: { votes: true } },
      },
    });
  },

  async update(cvId: string, userId: string, data: {
    title?: string;
    targetJob?: string;
    targetIndustry?: string;
    isPublic?: boolean;
  }) {
    const cv = await prisma.cV.findUnique({ where: { id: cvId, deletedAt: null } });

    if (!cv) throw new Error('CV no encontrado');
    if (cv.userId !== userId) throw new Error('No tienes permisos');

    return prisma.cV.update({
      where: { id: cvId },
      data,
    });
  },

  async delete(cvId: string, userId: string) {
    const cv = await prisma.cV.findUnique({ where: { id: cvId, deletedAt: null } });

    if (!cv) throw new Error('CV no encontrado');
    if (cv.userId !== userId) throw new Error('No tienes permisos');

    // Soft delete: mark as deleted instead of removing from DB
    return prisma.cV.update({
      where: { id: cvId },
      data: { deletedAt: new Date() },
    });
  },

  async restore(cvId: string, userId: string) {
    const cv = await prisma.cV.findUnique({ where: { id: cvId } });

    if (!cv) throw new Error('CV no encontrado');
    if (cv.userId !== userId) throw new Error('No tienes permisos');
    if (!cv.deletedAt) throw new Error('El CV no está eliminado');

    return prisma.cV.update({
      where: { id: cvId },
      data: { deletedAt: null },
    });
  },

  async getPublicCVs(page: number = 1, limit: number = 12, filters?: {
    search?: string;
    targetJob?: string;
    targetIndustry?: string;
    userId?: string;
    minScore?: string;
    sort?: string;
  }) {
    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = filters?.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' as const } },
            { targetJob: { contains: filters.search, mode: 'insensitive' as const } },
            { user: { name: { contains: filters.search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const where: any = {
      isPublic: true,
      status: 'COMPLETED' as const,
      deletedAt: null,
      ...searchFilter,
      ...(filters?.targetJob && { targetJob: { contains: filters.targetJob, mode: 'insensitive' as const } }),
      ...(filters?.targetIndustry && { targetIndustry: { contains: filters.targetIndustry, mode: 'insensitive' as const } }),
      ...(filters?.minScore === '90' && { analysisResult: { path: ['score'], gte: 90 } }),
      ...(filters?.minScore === '70' && { analysisResult: { path: ['score'], gte: 70, lte: 89 } }),
      ...(filters?.minScore === 'low' && { analysisResult: { path: ['score'], lte: 69 } }),
    };

    // Determine sort order
    let orderBy: any = { upvotes: 'desc' };
    if (filters?.sort === 'recent') {
      orderBy = { createdAt: 'desc' };
    } else if (filters?.sort === 'score') {
      orderBy = { analysisResult: { path: ['score'], order: 'desc' as const } };
    }

    const [cvs, total] = await Promise.all([
      prisma.cV.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          votes: filters?.userId ? { where: { userId: filters.userId } } : false,
          _count: { select: { votes: true } },
        },
      }),
      prisma.cV.count({ where }),
    ]);

    const cvsWithVotes = cvs.map((cv) => ({
      ...cv,
      hasVoted: filters?.userId ? cv.votes.length > 0 : undefined,
      votes: undefined,
    }));

    return {
      cvs: cvsWithVotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getTopCVs(limit: number = 10) {
    // Cache top CVs for 2 minutes (they don't change often)
    const cacheKey = `top-cvs:${limit}`;
    return cached(cacheKey, async () => {
      return prisma.cV.findMany({
        where: { isPublic: true, status: 'COMPLETED', deletedAt: null },
        take: limit,
        orderBy: { upvotes: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { votes: true } },
        },
      });
    }, 120);
  },

  async getDeletedByUser(userId: string) {
    return prisma.cV.findMany({
      where: { userId, deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
    });
  },
};
