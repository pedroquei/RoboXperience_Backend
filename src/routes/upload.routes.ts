import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/UploadController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const uploadController = new UploadController();

// Configuração do Multer (Armazena em RAM temporariamente até subir pro R2)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // Limite de 50MB
  },
});

// Protege a rota: Apenas usuários logados podem subir arquivos
router.use(authMiddleware);

// O multer procura um campo chamado "file" no formulário
router.post('/', upload.single('file'), uploadController.upload);
router.delete('/', uploadController.delete);

export default router;