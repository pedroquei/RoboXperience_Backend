import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UploadService } from '../services/UploadService';

export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { fileUrl } = req.body;
      if (!fileUrl) {
        res.status(400).json({ error: 'URL do arquivo não fornecida.' });
        return;
      }
      await this.uploadService.deleteFile(fileUrl);
      res.status(200).json({ message: 'Arquivo deletado com sucesso.' });
    } catch (error) {
      console.error('Erro na exclusão de arquivo:', error);
      res.status(500).json({ error: 'Erro interno ao excluir arquivo.' });
    }
  };

  upload = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // O multer injeta o arquivo dentro de req.file
      if (!req.file) {
        res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        return;
      }

      // Podemos passar no FormData um campo 'folder' para organizar as pastas no R2 (ex: "users", "lessons")
      const folder = req.body.folder || 'geral';

      // Chama o cérebro que criamos no passo anterior
      const fileUrl = await this.uploadService.uploadFile(req.file, folder);

      res.status(201).json({ 
        message: 'Upload concluído com sucesso!', 
        url: fileUrl 
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ error: 'Erro interno ao processar o arquivo para a nuvem.' });
    }
  };
}