import { Router, Request, Response } from 'express';
import multer from 'multer';
import { cvController, createCVSchema, updateCVSchema } from '../controllers/index.js';
import { cvService } from '../services/index.js';
import { authenticate, validate } from '../middlewares/index.js';
import { uploadRateLimit } from '../middlewares/rateLimit.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { downloadFromCloudinary } from '../utils/cloudinary.js';
import { renderHTMLToPDF } from '../services/pdfRenderer.js';
import { extractTextFromPDF } from '../utils/pdf.js';
import * as htmlDocx from 'html-docx-js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  },
});

router.post('/upload', authenticate, uploadRateLimit, upload.single('pdf'), validate(createCVSchema), cvController.upload);
router.get('/', authenticate, cvController.getAll);
router.get('/deleted', authenticate, cvController.getDeleted);
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const stats = await cvService.getStatsForUser(userId);
  res.json(successResponse(stats));
});

// Export CV in different formats
router.get('/:id/export', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const format = req.query.format as string || 'pdf';
  const userId = (req as any).user?.userId;

  const cv = await cvService.findById(id);
  if (!cv) {
    res.status(404).json(errorResponse('CV no encontrado', 404));
    return;
  }

  if (cv.userId !== userId) {
    res.status(403).json(errorResponse('No tienes acceso', 403));
    return;
  }

  try {
    if (format === 'docx') {
      // Convert HTML to DOCX
      const htmlContent = (cv.improvedJson as any)?.html || '';
      if (!htmlContent) {
        res.status(400).json(errorResponse('CV no tiene contenido para exportar', 400));
        return;
      }

      // Wrap HTML in proper structure for DOCX
      const styledHtml = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; }
            h2 { font-size: 18px; margin-top: 20px; }
            p { line-height: 1.6; }
          </style>
        </head>
        <body>${htmlContent}</body>
        </html>
      `;

      const docxBuffer = htmlDocx.asBlob(styledHtml);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${cv.title}.docx"`);
      res.send(docxBuffer);
    } else {
      // PDF - already available
      if (cv.improvedPdfUrl) {
        res.redirect(cv.improvedPdfUrl);
      } else {
        res.status(400).json(errorResponse('PDF no disponible', 400));
      }
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json(errorResponse('Error al exportar', 500));
  }
});
router.get('/:id', authenticate, cvController.getById);
router.patch('/:id', authenticate, validate(updateCVSchema), cvController.update);
router.delete('/:id', authenticate, cvController.delete);
router.post('/:id/restore', authenticate, cvController.restore);

export default router;
