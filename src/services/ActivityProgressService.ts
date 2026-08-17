import { prisma } from '../lib/prisma';

export interface MarkActivityProgressDTO {
    activityId: string;
    userId: string;
    isCompleted: boolean;
}

export class ActivityProgressService {
    async markAsCompleted(data: MarkActivityProgressDTO) {
        const { activityId, userId, isCompleted } = data;

        const activityExists = await prisma.activity.findUnique({
            where: { id: activityId },
        });

        if (!activityExists) {
            throw new Error('ATIVIDADE_NAO_ENCONTRADA');
        }

        const existingProgress = await prisma.activityProgress.findFirst({
            where: { activityId, userId },
        });

        const completedAt = isCompleted ? new Date() : null;

        if (existingProgress) {
            return prisma.activityProgress.update({
                where: { id: existingProgress.id },
                data: {
                    isCompleted,
                    completedAt,
                },
            });
        }

        return prisma.activityProgress.create({
            data: {
                activityId,
                userId,
                isCompleted,
                completedAt,
            },
        });
    }
}
