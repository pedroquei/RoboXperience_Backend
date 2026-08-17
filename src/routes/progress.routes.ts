import { Router } from 'express';
import { ProgressController } from '../controllers/ProgressController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const progressController = new ProgressController();

// Como envolve o progresso de um aluno específico, a rota DEVE ser protegida
router.use(authMiddleware);

// POST /api/progress -> Rota para salvar/atualizar o progresso
router.post('/', progressController.mark);

export default router;