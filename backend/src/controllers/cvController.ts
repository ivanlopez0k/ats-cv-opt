import { Request, Response } from 'express';
import { z } from 'zod';
import { cvService, voteService } from '../services/index.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';

export const createCVSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  targetJob: z.string().optional(),
  targetIndustry: z.string().optional(),
  isPublic: z.coerce.boolean().default(false).optional(),
});

export const updateCVSchema = z.object({
  title: z.string().min(1).optional(),
  targetJob: z.string().optional().nullable(),
  targetIndustry: z.string().optional().nullable(),
  isPublic: z.boolean().optional(),
});

export const cvController = {
  async upload(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const file = req.file;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    if (!file) {
      res.status(400).json({ success: false, error: 'Archivo PDF requerido' });
      return;
    }

    if (file.mimetype !== 'application/pdf') {
      res.status(400).json({ success: false, error: 'Solo se permiten archivos PDF' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      res.status(400).json({ success: false, error: 'El archivo debe ser menor a 10MB' });
      return;
    }

    const { title, targetJob, targetIndustry, isPublic } = req.body;

    try {
      const cv = await cvService.create(
        userId,
        {
          title,
          targetJob,
          targetIndustry,
          // FormData sends booleans as strings, so we need to parse them
          isPublic: isPublic === 'true' || isPublic === true,
        },
        file.buffer,
        file.originalname
      );

      res.status(201).json({
        success: true,
        data: cv,
        message: 'CV subido exitosamente. Procesamiento en progreso...',
      });
    } catch (error) {
      logger.error('Error uploading CV:', error);
      res.status(500).json({ success: false, error: 'Error al procesar el CV' });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    const cvs = await cvService.findAllByUser(userId);

    res.json({ success: true, data: cvs });
  },

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    const cv = await cvService.findById(id);

    if (!cv) {
      res.status(404).json({ success: false, error: 'CV no encontrado' });
      return;
    }

    if (cv.userId !== userId && !cv.isPublic) {
      res.status(403).json({ success: false, error: 'No tienes acceso a este CV' });
      return;
    }

    const hasVoted = await voteService.hasVoted(userId, id);

    res.json({
      success: true,
      data: { ...cv, hasVoted },
    });
  },

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;
    const data = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    try {
      const cv = await cvService.update(id, userId, data);
      res.json({ success: true, data: cv });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar';
      res.status(403).json({ success: false, error: message });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    try {
      await cvService.delete(id, userId);
      res.json({ success: true, message: 'CV eliminado' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar';
      res.status(403).json({ success: false, error: message });
    }
  },
};
