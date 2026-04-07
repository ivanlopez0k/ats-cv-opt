import { Request, Response } from 'express';
import { z } from 'zod';
import { aiService } from '../services/index.js';
import { AuthenticatedRequest } from '../types/index.js';

export const analyzeSchema = z.object({
  cvId: z.string().min(1, 'CV ID requerido'),
});

export const aiController = {
  async analyze(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { cvId } = req.body;

    const { cvService } = await import('../services/index.js');
    const cv = await cvService.findById(cvId);

    if (!cv) {
      res.status(404).json({ success: false, error: 'CV no encontrado' });
      return;
    }

    if (cv.userId !== req.user?.userId) {
      res.status(403).json({ success: false, error: 'No tienes acceso a este CV' });
      return;
    }

    try {
      const { extractTextFromPDF } = await import('../utils/pdf.js');
      const { downloadFromCloudinary } = await import('../utils/cloudinary.js');

      const pdfBuffer = await downloadFromCloudinary(cv.originalPdfUrl);
      const extracted = await extractTextFromPDF(pdfBuffer);

      const analysis = await aiService.analyzeCV(
        extracted.text,
        cv.targetJob || undefined,
        cv.targetIndustry || undefined
      );

      res.json({
        success: true,
        data: { analysis },
      });
    } catch (error) {
      console.error('AI Analysis Error:', error);
      res.status(500).json({ success: false, error: 'Error en el análisis de IA' });
    }
  },

  async reAnalyze(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { cvId, targetJob, targetIndustry } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    const { cvService } = await import('../services/index.js');
    const { aiQueue } = await import('../services/index.js');

    const cv = await cvService.findById(cvId);

    if (!cv) {
      res.status(404).json({ success: false, error: 'CV no encontrado' });
      return;
    }

    if (cv.userId !== userId) {
      res.status(403).json({ success: false, error: 'No tienes acceso a este CV' });
      return;
    }

    await aiQueue.add('analyze-cv', {
      cvId: cv.id,
      userId,
      targetJob: targetJob || cv.targetJob,
      targetIndustry: targetIndustry || cv.targetIndustry,
    });

    res.json({
      success: true,
      message: 'Análisis en cola. Recibirás una notificación cuando esté listo.',
    });
  },
};
