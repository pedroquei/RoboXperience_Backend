import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { UploadService } from './UploadService';

export interface CreateActivityDTO {
    title: string;
    description: string;
    materials?: Prisma.InputJsonValue;
    steps?: string;
    circuitImageUrl?: string;
    codeFileUrl?: string;
    estimatedTimeMinutes?: number;
    difficulty?: string;
    lessonId: string;
}

export interface UpdateActivityDTO extends Partial<CreateActivityDTO> {}

export class ActivityService {
    async createActivity(data: CreateActivityDTO) {
        const lessonExists = await prisma.lesson.findUnique({
            where: { id: data.lessonId },
        });

        if (!lessonExists) {
            throw new Error('AULA_NAO_ENCONTRADA');
        }

        return prisma.activity.create({
            data,
        });
    }

    async updateActivity(activityId: string, data: UpdateActivityDTO) {
        const activityExists = await prisma.activity.findUnique({ where: { id: activityId } });
        if (!activityExists) {
            throw new Error('ATIVIDADE_NAO_ENCONTRADA');
        }

        const uploadService = new UploadService();
        if (data.circuitImageUrl !== undefined && data.circuitImageUrl !== activityExists.circuitImageUrl && activityExists.circuitImageUrl) {
            await uploadService.deleteFile(activityExists.circuitImageUrl);
        }
        if (data.codeFileUrl !== undefined && data.codeFileUrl !== activityExists.codeFileUrl && activityExists.codeFileUrl) {
            await uploadService.deleteFile(activityExists.codeFileUrl);
        }

        return prisma.activity.update({
            where: { id: activityId },
            data,
        });
    }

    async deleteActivity(activityId: string) {
        const activityExists = await prisma.activity.findUnique({ where: { id: activityId } });
        if (!activityExists) {
            throw new Error('ATIVIDADE_NAO_ENCONTRADA');
        }

        const urlsToDelete: string[] = [];
        if (activityExists.circuitImageUrl) urlsToDelete.push(activityExists.circuitImageUrl);
        if (activityExists.codeFileUrl) urlsToDelete.push(activityExists.codeFileUrl);

        const uploadService = new UploadService();
        await Promise.all(urlsToDelete.map(url => uploadService.deleteFile(url)));

        return prisma.activity.delete({
            where: { id: activityId },
        });
    }

    async getByLessonId(lessonId: string) {
        return prisma.activity.findMany({
            where: { lessonId },
            orderBy: { createdAt: 'asc' }
        });
    }

    async getActivityById(activityId: string, userId?: string) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
        });

        if (!activity) {
            throw new Error('ATIVIDADE_NAO_ENCONTRADA');
        }

        let isCompleted = false;
        if (userId) {
            const progress = await prisma.activityProgress.findFirst({
                where: { activityId, userId }
            });
            if (progress) {
                isCompleted = progress.isCompleted;
            }
        }

        return { ...activity, isCompleted };
    }
}
