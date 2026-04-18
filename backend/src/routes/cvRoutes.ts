import { Router, Request, Response } from 'express';
import multer from 'multer';
import { cvController, createCVSchema, updateCVSchema } from '../controllers/index.js';
import { cvService } from '../services/index.js';
import { authenticate, validate } from '../middlewares/index.js';
import { uploadRateLimit } from '../middlewares/rateLimit.js';
import { successResponse } from '../utils/response.js';

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
router.get('/:id', authenticate, cvController.getById);
router.patch('/:id', authenticate, validate(updateCVSchema), cvController.update);
router.delete('/:id', authenticate, cvController.delete);
router.post('/:id/restore', authenticate, cvController.restore);

export default router;
