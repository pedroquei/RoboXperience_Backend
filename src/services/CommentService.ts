import { prisma } from '../lib/prisma';

export interface CreateCommentDTO {
    content: string;
    userId: string;
    lessonId: string;
    parentCommentId?: string;
}

export class CommentService {
    async createComment(data: CreateCommentDTO) {
        const lessonExists = await prisma.lesson.findUnique({
            where: { id: data.lessonId },
        });

        if (!lessonExists) {
            throw new Error('AULA_NAO_ENCONTRADA');
        }

        if (data.parentCommentId) {
            const parentExists = await prisma.comment.findUnique({
                where: { id: data.parentCommentId },
            });
            if (!parentExists) {
                throw new Error('COMENTARIO_PAI_NAO_ENCONTRADO');
            }
        }

        return prisma.comment.create({
            data,
        });
    }

    async listByLesson(lessonId: string) {
        return prisma.comment.findMany({
            where: {
                lessonId,
                parentCommentId: null, // Apenas comentários principais
            },
            include: {
                user: {
                    select: {
                        name: true,
                        role: true,
                        profilePictureUrl: true,
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                role: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async deleteComment(commentId: string, userId: string, userRole: string) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            throw new Error('COMENTARIO_NAO_ENCONTRADO');
        }

        if (userRole !== 'ADMIN' && comment.userId !== userId) {
            throw new Error('SEM_PERMISSAO');
        }

        return prisma.comment.delete({
            where: { id: commentId },
        });
    }
}
