import { Router } from 'express';
import { aiController, analyzeSchema } from '../controllers/index.js';
import { authenticate, validate } from '../middlewares/index.js';
import { aiRateLimit } from '../middlewares/rateLimit.js';

const router = Router();

router.post('/analyze', authenticate, validate(analyzeSchema), aiRateLimit, aiController.analyze);
router.post('/reanalyze', authenticate, aiRateLimit, aiController.reAnalyze);

export default router;
