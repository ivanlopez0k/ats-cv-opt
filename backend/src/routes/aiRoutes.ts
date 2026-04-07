import { Router } from 'express';
import { aiController, analyzeSchema } from '../controllers/index.js';
import { authenticate, validate } from '../middlewares/index.js';

const router = Router();

router.post('/analyze', authenticate, validate(analyzeSchema), aiController.analyze);
router.post('/reanalyze', authenticate, aiController.reAnalyze);

export default router;
