import { Router } from 'express';
import { LessonController } from '../controllers/LessonController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const lessonController = new LessonController();

// Middleware de proteção para todas as rotas (Alunos e Admins precisam estar logados)
router.use(authMiddleware);

// POST /api/lessons -> Apenas ADMIN
router.post('/', lessonController.create);

// GET /api/lessons/:id -> Qualquer usuário logado pode buscar os detalhes da aula
router.get('/:id', lessonController.getById);

// PUT /api/lessons/:id -> Atualiza uma aula (Apenas ADMIN)
router.put('/:id', lessonController.update);

// DELETE /api/lessons/:id -> Deleta uma aula (Apenas ADMIN)
router.delete('/:id', lessonController.delete);

export default router;