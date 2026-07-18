import { Router, Request, Response } from 'express';
import { dashboardService } from '../services';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticateToken, (req: Request, res: Response) => {
  try {
    const stats = dashboardService.getDashboardStats(req.user!.id, req.user!.role);
    res.json(stats);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to retrieve dashboard stats' });
  }
});

export default router;
