import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const activityController = new ActivityController();

router.use(authMiddleware);

router.post('/', activityController.create);
router.put('/:id', activityController.update);
router.delete('/:id', activityController.delete);
router.get('/lesson/:lessonId', activityController.getByLessonId);
router.get('/:id', activityController.getById);

export default router;
