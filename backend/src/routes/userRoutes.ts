import { Router, Request, Response } from 'express';
import { userService, cvService } from '../services/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// Get public profile by username
router.get('/:username', async (req: Request, res: Response) => {
  const { username } = req.params;

  // Find user by username
  const user = await userService.findByUsername(username);
  if (!user) {
    errorResponse(res, 'Usuario no encontrado', 404);
    return;
  }

  // Get public profile
  const profile = await userService.findPublicProfile(user.id);
  if (!profile) {
    errorResponse(res, 'Usuario no encontrado', 404);
    return;
  }

  successResponse(res, profile);
});

// Get user's public CVs
router.get('/:username/cvs', async (req: Request, res: Response) => {
  const { username } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;

  const user = await userService.findByUsername(username);
  if (!user) {
    errorResponse(res, 'Usuario no encontrado', 404);
    return;
  }

  const result = await cvService.getPublicCVsByUser(user.id, page, limit);

  successResponse(res, result.cvs, undefined, 200, { pagination: result.pagination });
});

export default router;