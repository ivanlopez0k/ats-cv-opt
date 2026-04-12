import { Router } from 'express';
import { communityController } from '../controllers/index.js';
import { authenticate } from '../middlewares/index.js';
import { voteRateLimit } from '../middlewares/rateLimit.js';

const router = Router();

router.get('/cvs', authenticate, communityController.getPublicCVs);
router.get('/top', communityController.getTopCVs);
router.get('/cvs/:id', communityController.getPublicCVById);
router.post('/cvs/:id/vote', authenticate, voteRateLimit, communityController.vote);
router.delete('/cvs/:id/vote', authenticate, voteRateLimit, communityController.unvote);

export default router;
