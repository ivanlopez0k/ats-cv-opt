import { prisma } from './userService.js';
import { config } from '../config/index.js';
import path from 'path';
import fs from 'fs';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

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
    },
    pdfBuffer: Buffer,
    filename: string
  ) {
    const uploadsDir = path.join(process.cwd(), 'uploads', userId);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}-${filename}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    fs.writeFileSync(filePath, pdfBuffer);

    const originalPdfUrl = `/uploads/${userId}/${uniqueFilename}`;

    const cv = await prisma.cV.create({
      data: {
        userId,
        title: data.title,
        originalPdfUrl,
        targetJob: data.targetJob,
        targetIndustry: data.targetIndustry,
        isPublic: data.isPublic || false,
        status: 'PROCESSING',
      },
    });

    await aiQueue.add('analyze-cv', {
      cvId: cv.id,
      userId,
      targetJob: data.targetJob,
      targetIndustry: data.targetIndustry,
      filePath,
    });

    return cv;
  },

  async findAllByUser(userId: string) {
    return prisma.cV.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { votes: true } },
      },
    });
  },

  async findById(cvId: string) {
    return prisma.cV.findUnique({
      where: { id: cvId },
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
    const cv = await prisma.cV.findUnique({ where: { id: cvId } });
    
    if (!cv) throw new Error('CV no encontrado');
    if (cv.userId !== userId) throw new Error('No tienes permisos');

    return prisma.cV.update({
      where: { id: cvId },
      data,
    });
  },

  async delete(cvId: string, userId: string) {
    const cv = await prisma.cV.findUnique({ where: { id: cvId } });
    
    if (!cv) throw new Error('CV no encontrado');
    if (cv.userId !== userId) throw new Error('No tienes permisos');

    if (cv.originalPdfUrl) {
      const filePath = path.join(process.cwd(), cv.originalPdfUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    if (cv.improvedPdfUrl) {
      const filePath = path.join(process.cwd(), cv.improvedPdfUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return prisma.cV.delete({ where: { id: cvId } });
  },

  async getPublicCVs(page: number = 1, limit: number = 12, filters?: {
    targetJob?: string;
    targetIndustry?: string;
  }) {
    const skip = (page - 1) * limit;
    
    const where = {
      isPublic: true,
      status: 'COMPLETED' as const,
      ...(filters?.targetJob && { targetJob: { contains: filters.targetJob, mode: 'insensitive' as const } }),
      ...(filters?.targetIndustry && { targetIndustry: { contains: filters.targetIndustry, mode: 'insensitive' as const } }),
    };

    const [cvs, total] = await Promise.all([
      prisma.cV.findMany({
        where,
        skip,
        take: limit,
        orderBy: { upvotes: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { votes: true } },
        },
      }),
      prisma.cV.count({ where }),
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

  async getTopCVs(limit: number = 10) {
    return prisma.cV.findMany({
      where: { isPublic: true, status: 'COMPLETED' },
      take: limit,
      orderBy: { upvotes: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { votes: true } },
      },
    });
  },
};
