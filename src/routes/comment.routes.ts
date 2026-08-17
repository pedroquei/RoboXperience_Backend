import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const commentController = new CommentController();

router.use(authMiddleware);

router.post('/', commentController.create);
router.get('/lesson/:lessonId', commentController.listByLesson);
router.delete('/:id', commentController.delete);

export default router;
