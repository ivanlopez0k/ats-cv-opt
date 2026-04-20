import { Request, Response } from 'express';
import { cvService, voteService, userService } from '../services/index.js';
import { notifyVoteReceived } from '../services/notificationService.js';
import { AuthenticatedRequest } from '../types/index.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

export const communityController = {
  async getPublicCVs(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = req.query.search as string;
    const targetJob = req.query.targetJob as string;
    const targetIndustry = req.query.targetIndustry as string;
    const minScore = req.query.minScore as string;
    const sort = req.query.sort as string; // 'votes', 'recent', 'score'
    const userId = (req as AuthenticatedRequest).user?.userId;

    const result = await cvService.getPublicCVs(page, limit, {
      search,
      targetJob,
      targetIndustry,
      userId,
      minScore,
      sort,
    });

    res.json({
      success: true,
      data: result.cvs,
      pagination: result.pagination,
    });
  },

  async getTopCVs(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 10;
    const cvs = await cvService.getTopCVs(limit);

    res.json({ success: true, data: cvs });
  },

  async getPublicCVById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const cv = await cvService.findById(id);

    if (!cv) {
      res.status(404).json({ success: false, error: 'CV no encontrado' });
      return;
    }

    if (!cv.isPublic) {
      res.status(403).json({ success: false, error: 'Este CV no es público' });
      return;
    }

    const userId = (req as AuthenticatedRequest).user?.userId;
    let hasVoted = false;

    if (userId) {
      hasVoted = await voteService.hasVoted(userId, id);
    }

    res.json({
      success: true,
      data: { ...cv, hasVoted },
    });
  },

  async vote(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    if (!cv.isPublic) {
      res.status(403).json({ success: false, error: 'No puedes votar este CV' });
      return;
    }

    try {
      await voteService.vote(userId, id);
      const updatedCV = await cvService.findById(id);
      
      // Notify CV owner
      if (updatedCV && updatedCV.userId !== userId) {
        const voter = await userService.findById(userId);
        notifyVoteReceived(id, updatedCV.userId, voter?.username || 'Alguien');
      }
      
      res.json({
        success: true,
        data: { upvotes: updatedCV?.upvotes },
        message: 'Voto registrado',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al votar';
      res.status(400).json({ success: false, error: message });
    }
  },

  async unvote(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    try {
      await voteService.unvote(userId, id);
      const updatedCV = await cvService.findById(id);
      res.json({
        success: true,
        data: { upvotes: updatedCV?.upvotes },
        message: 'Voto eliminado',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al quitar voto';
      res.status(400).json({ success: false, error: message });
    }
  },
};
