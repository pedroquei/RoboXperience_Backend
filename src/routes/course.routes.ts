import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const courseController = new CourseController();

// Aplica o "segurança" (middleware) em TODAS as rotas de cursos abaixo desta linha
router.use(authMiddleware);

// POST /api/courses -> Rota de criação
router.post('/', courseController.create);

// GET /api/courses -> Rota de listagem
router.get('/', courseController.list);

// GET /api/courses/:id -> Retorna o curso e sua árvore completa
router.get('/:id', courseController.getById);

// PUT /api/courses/:id -> Atualiza um curso (Apenas ADMIN)
router.put('/:id', courseController.update);

// DELETE /api/courses/:id -> Deleta um curso e seus dependentes em cascata (Apenas ADMIN)
router.delete('/:id', courseController.delete);

export default router;