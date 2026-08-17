import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

// Apenas usuários autenticados podem ver o seu dashboard
router.use(authMiddleware);

router.get('/', dashboardController.getDashboardData);

export default router;
