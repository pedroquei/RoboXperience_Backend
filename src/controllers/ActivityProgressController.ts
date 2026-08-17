import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ActivityProgressService } from '../services/ActivityProgressService';

export class ActivityProgressController {
    private progressService: ActivityProgressService;

    constructor() {
        this.progressService = new ActivityProgressService();
    }

    markAsCompleted = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Usuário não autenticado.' });
                return;
            }

            const { activityId, isCompleted } = req.body;

            if (typeof isCompleted !== 'boolean') {
                res.status(400).json({ error: 'O campo isCompleted deve ser um booleano.' });
                return;
            }

            const progress = await this.progressService.markAsCompleted({
                activityId,
                userId,
                isCompleted,
            });

            res.json({ message: 'Progresso da atividade atualizado com sucesso!', progress });
        } catch (error: any) {
            if (error.message === 'ATIVIDADE_NAO_ENCONTRADA') {
                res.status(404).json({ error: 'A atividade especificada não existe.' });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro interno ao atualizar progresso da atividade.' });
        }
    };
}
