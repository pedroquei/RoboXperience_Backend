import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ActivityService } from '../services/ActivityService';

export class ActivityController {
    private activityService: ActivityService;

    constructor() {
        this.activityService = new ActivityService();
    }

    create = async (req: AuthRequest, res: Response) => {
        try {
            if (req.user?.role !== 'ADMIN') {
                res.status(403).json({ error: 'Acesso negado: Apenas administradores.' });
                return;
            }

            const { title, description, materials, steps, circuitImageUrl, codeFileUrl, estimatedTimeMinutes, difficulty, lessonId } = req.body;
            
            const activityData = {
                title,
                description,
                materials: materials || undefined,
                steps: steps || undefined,
                circuitImageUrl: circuitImageUrl || undefined,
                codeFileUrl: codeFileUrl || undefined,
                estimatedTimeMinutes: estimatedTimeMinutes ? Number(estimatedTimeMinutes) : undefined,
                difficulty: difficulty || undefined,
                lessonId
            };

            const newActivity = await this.activityService.createActivity(activityData);
            res.status(201).json({ message: 'Atividade criada com sucesso!', activity: newActivity });
        } catch (error: any) {
            if (error.message === 'AULA_NAO_ENCONTRADA') {
                res.status(404).json({ error: 'A aula especificada não existe.' });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    };

    update = async (req: AuthRequest, res: Response) => {
        try {
            if (req.user?.role !== 'ADMIN') {
                res.status(403).json({ error: 'Acesso negado: Apenas administradores.' });
                return;
            }
            const { id } = req.params;
            
            const updateData: any = {};
            if (req.body.title !== undefined) updateData.title = req.body.title;
            if (req.body.description !== undefined) updateData.description = req.body.description;
            if (req.body.materials !== undefined) updateData.materials = req.body.materials;
            if (req.body.steps !== undefined) updateData.steps = req.body.steps;
            if (req.body.circuitImageUrl !== undefined) updateData.circuitImageUrl = req.body.circuitImageUrl;
            if (req.body.codeFileUrl !== undefined) updateData.codeFileUrl = req.body.codeFileUrl;
            if (req.body.estimatedTimeMinutes !== undefined) updateData.estimatedTimeMinutes = Number(req.body.estimatedTimeMinutes);
            if (req.body.difficulty !== undefined) updateData.difficulty = req.body.difficulty;
            if (req.body.lessonId !== undefined) updateData.lessonId = req.body.lessonId;

            const updatedActivity = await this.activityService.updateActivity(id, updateData);
            res.json({ message: 'Atividade atualizada com sucesso!', activity: updatedActivity });
        } catch (error: any) {
            if (error.message === 'ATIVIDADE_NAO_ENCONTRADA') {
                res.status(404).json({ error: 'A atividade especificada não existe.' });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    };

    delete = async (req: AuthRequest, res: Response) => {
        try {
            if (req.user?.role !== 'ADMIN') {
                res.status(403).json({ error: 'Acesso negado: Apenas administradores.' });
                return;
            }
            const { id } = req.params;
            await this.activityService.deleteActivity(id);
            res.json({ message: 'Atividade deletada com sucesso!' });
        } catch (error: any) {
            if (error.message === 'ATIVIDADE_NAO_ENCONTRADA') {
                res.status(404).json({ error: 'A atividade especificada não existe.' });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    };

    getByLessonId = async (req: Request, res: Response) => {
        try {
            const { lessonId } = req.params;
            const activities = await this.activityService.getByLessonId(lessonId);
            res.json(activities);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro interno ao buscar as atividades.' });
        }
    };

    getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as AuthRequest).user?.id;
            const activity = await this.activityService.getActivityById(id, userId);
            res.json(activity);
        } catch (error: any) {
            if (error.message === 'ATIVIDADE_NAO_ENCONTRADA') {
                res.status(404).json({ error: 'A atividade especificada não existe.' });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro interno ao buscar a atividade.' });
        }
    };
}
