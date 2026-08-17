import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ProgressService } from '../services/ProgressService';

export class ProgressController {
  private progressService: ProgressService;

  constructor() {
    this.progressService = new ProgressService();
  }

  mark = async (req: AuthRequest, res: Response): Promise => {
    try {
      // Extraímos o ID do usuário logado direto do Token (segurança máxima)
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }

      const { lessonId, isCompleted, watchedSeconds } = req.body;

      const progress = await this.progressService.saveProgress({
        userId,
        lessonId,
        isCompleted,
        watchedSeconds,
      });

      res.json({ message: 'Progresso salvo com sucesso!', progress });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno ao salvar o progresso.' });
    }
  };
}