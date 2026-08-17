import { Router } from 'express';
import { ModuleController } from '../controllers/ModuleController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const moduleController = new ModuleController();

// Protege todas as rotas de módulos
router.use(authMiddleware);

// POST /api/modules -> Rota para criar um módulo
router.post('/', moduleController.create);

// GET /api/modules/:id -> Retorna um módulo
router.get('/:id', moduleController.getById);

// PUT /api/modules/:id -> Atualiza um módulo (Apenas ADMIN)
router.put('/:id', moduleController.update);

// DELETE /api/modules/:id -> Deleta um módulo e suas aulas em cascata (Apenas ADMIN)
router.delete('/:id', moduleController.delete);

export default router;