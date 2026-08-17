import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CommentService } from '../services/CommentService';

export class CommentController {
    private commentService: CommentService;

    constructor() {
        this.commentService = new CommentService();
    }

    create = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Usuário não autenticado.' });
                return;
            }

            const { content, lessonId, parentCommentId } = req.body;

            const newComment = await this.commentService.createComment({
                content,
                userId,
                lessonId,
                parentCommentId,
            });

            res.status(201).json({ message: 'Comentário criado com sucesso!', comment: newComment });
        } catch (error: any) {
            if (error.message === 'AULA_NAO_ENCONTRADA') {
                res.status(404).json({ error: 'A aula especificada não existe.' });
                return;
            }
            if (error.message === 'COMENTARIO_PAI_NAO_ENCONTRADO') {
                res.status(404).json({ error: 'O comentário pai especificado não existe.' });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    };

    listByLesson = async (req: Request, res: Response) => {
        try {
            const { lessonId } = req.params;
            const comments = await this.commentService.listByLesson(lessonId);
            res.json(comments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro interno ao buscar comentários.' });
        }
    };

    delete = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.id;
            const userRole = req.user?.role;
            if (!userId || !userRole) {
                res.status(401).json({ error: 'Usuário não autenticado.' });
                return;
            }

            const { id } = req.params;
            await this.commentService.deleteComment(id, userId, userRole);
            res.json({ message: 'Comentário deletado com sucesso!' });
        } catch (error: any) {
            if (error.message === 'COMENTARIO_NAO_ENCONTRADO') {
                res.status(404).json({ error: 'O comentário não existe.' });
                return;
            }
            if (error.message === 'SEM_PERMISSAO') {
                res.status(403).json({ error: 'Você não tem permissão para deletar este comentário.' });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    };
}
