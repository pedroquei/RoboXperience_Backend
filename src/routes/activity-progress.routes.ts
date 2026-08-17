import { Router } from 'express';
import { ActivityProgressController } from '../controllers/ActivityProgressController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const activityProgressController = new ActivityProgressController();

router.use(authMiddleware);

router.post('/mark', activityProgressController.markAsCompleted);

export default router;
