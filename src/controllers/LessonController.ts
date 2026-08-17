import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { LessonService } from '../services/LessonService';

export class LessonController {
    private lessonService: LessonService;

    constructor() {
        this.lessonService = new LessonService();
    }

    update = async (req: AuthRequest, res: Response) => {
        try {
            if (req.user?.role !== 'ADMIN') {
                res.status(403).json({ error: 'Acesso negado: Apenas administradores.' });
                return;
            }
            const { id } = req.params;
            
            const updateData: any = {};
            if (req.body.title !== undefined) updateData.title = req.body.title;
            if (req.body.order !== undefined) updateData.order = Number(req.body.order);
            if (req.body.moduleId !== undefined) updateData.moduleId = req.body.moduleId;
            if (req.body.stlFileUrl !== undefined) updateData.stlFileUrl = req.body.stlFileUrl;
            if (req.body.pdfFileUrl !== undefined) updateData.pdfFileUrl = req.body.pdfFileUrl;
            if (req.body.durationSeconds !== undefined) updateData.durationSeconds = req.body.durationSeconds;
            
            // Aceita tanto descriptionText quanto description do frontend
            if (req.body.descriptionText !== undefined) updateData.descriptionText = req.body.descriptionText;
            else if (req.body.description !== undefined) updateData.descriptionText = req.body.description;
            
            // Extrai o ID do vídeo caso venha uma URL completa no videoUrl
            if (req.body.videoUrl !== undefined) {
                const match = req.body.videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
                updateData.youtubeVideoId = match ? match[1] : req.body.videoUrl;
            } else if (req.body.youtubeVideoId !== undefined) {
                updateData.youtubeVideoId = req.body.youtubeVideoId;
            }

            const updatedLesson = await this.lessonService.updateLesson(id, updateData);
            res.json({ message: 'Aula atualizada com sucesso!', lesson: updatedLesson });
        } catch (error: any) {
            if (error.message === 'AULA_NAO_ENCONTRADA') {
                res.status(404).json({ error: 'A aula especificada não existe.' });
                return;
            }
            if (error.message === 'ORDEM_JA_UTILIZADA') {
                res.status(400).json({ error: 'Já existe uma aula com este número de ordem neste módulo.' });
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
            await this.lessonService.deleteLesson(id);
            res.json({ message: 'Aula deletada com sucesso!' });
        } catch (error: any) {
            if (error.message === 'AULA_NAO_ENCONTRADA') {
                res.status(404).json({ error: 'A aula especificada não existe.' });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    };

    create = async (req: AuthRequest, res: Response): Promise => {
        try {
            // Bloqueio de Segurança
            if (req.user?.role !== 'ADMIN') {
                res.status(403).json({ error: 'Acesso negado: Apenas administradores.' });
                return;
            }

            const { title, order, moduleId, description, descriptionText, videoUrl, youtubeVideoId, stlFileUrl, pdfFileUrl, durationSeconds } = req.body;
            
            let finalVideoId = youtubeVideoId;
            if (!finalVideoId && videoUrl) {
                const match = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
                finalVideoId = match ? match[1] : videoUrl;
            }

            const lessonData = {
                title,
                order: Number(order),
                moduleId,
                descriptionText: descriptionText || description || '',
                youtubeVideoId: finalVideoId || '',
                stlFileUrl: stlFileUrl || undefined,
                pdfFileUrl: pdfFileUrl || undefined,
                durationSeconds: durationSeconds || undefined
            };

            const newLesson = await this.lessonService.createLesson(lessonData);

            res.status(201).json({ message: 'Aula criada com sucesso!', lesson: newLesson });

        } catch (error: any) {
            if (error.message === 'MODULO_NAO_ENCONTRADO') {
                res.status(404).json({ error: 'O módulo especificado não existe.' });
                return;
            }
            if (error.message === 'ORDEM_JA_UTILIZADA') {
                res.status(400).json({ error: 'Já existe uma aula com este número de ordem neste módulo.' });
                return;
            }

            console.error(error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    };

    getById = async (req: Request, res: Response): Promise => {
        try {
            const { id } = req.params; // Captura o ID da URL

            const lesson = await this.lessonService.getLessonById(id);

            res.json(lesson);
        } catch (error: any) {
            if (error.message === 'AULA_NAO_ENCONTRADA') {
                res.status(404).json({ error: 'A aula especificada não existe.' });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro interno ao buscar a aula.' });
        }
    };
}