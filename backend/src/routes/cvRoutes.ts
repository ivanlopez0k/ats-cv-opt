import { Router } from 'express';
import multer from 'multer';
import { cvController, createCVSchema, updateCVSchema } from '../controllers/index.js';
import { authenticate, validate } from '../middlewares/index.js';
import { uploadRateLimit } from '../middlewares/rateLimit.js';

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
router.get('/:id', authenticate, cvController.getById);
router.patch('/:id', authenticate, validate(updateCVSchema), cvController.update);
router.delete('/:id', authenticate, cvController.delete);
router.post('/:id/restore', authenticate, cvController.restore);

export default router;
