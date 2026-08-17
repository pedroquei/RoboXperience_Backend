import { prisma } from '../lib/prisma';
import { UploadService } from './UploadService';

async function fetchYouTubeVideoDuration(youtubeVideoId: string): Promise<number | undefined> {
    try {
        const res = await fetch(`https://www.youtube.com/watch?v=${youtubeVideoId}`);
        const html = await res.text();
        const match = html.match(/"lengthSeconds":"(\d+)"/);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
    } catch (e) {
        console.error('Failed to fetch YouTube duration:', e);
    }
    return undefined;
}

export interface CreateLessonDTO {
    title: string;
    youtubeVideoId: string;
    order: number;
    moduleId: string;
    descriptionText?: string;
    stlFileUrl?: string;
    pdfFileUrl?: string;
    durationSeconds?: number;
}

export interface UpdateLessonDTO extends Partial<CreateLessonDTO> {}

export class LessonService {
    async updateLesson(lessonId: string, data: UpdateLessonDTO) {
        const lessonExists = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lessonExists) {
            throw new Error('AULA_NAO_ENCONTRADA');
        }

        if (data.order !== undefined && data.order !== lessonExists.order) {
            const moduleId = data.moduleId || lessonExists.moduleId;
            const orderExists = await prisma.lesson.findFirst({
                where: { moduleId, order: data.order },
            });
            if (orderExists) {
                throw new Error('ORDEM_JA_UTILIZADA');
            }
        }

        if (data.youtubeVideoId && (!lessonExists.durationSeconds || data.youtubeVideoId !== lessonExists.youtubeVideoId)) {
            const fetchedDuration = await fetchYouTubeVideoDuration(data.youtubeVideoId);
            if (fetchedDuration) {
                data.durationSeconds = fetchedDuration;
            }
        }

        const uploadService = new UploadService();
        if (data.stlFileUrl !== undefined && data.stlFileUrl !== lessonExists.stlFileUrl && lessonExists.stlFileUrl) {
            await uploadService.deleteFile(lessonExists.stlFileUrl);
        }
        if (data.pdfFileUrl !== undefined && data.pdfFileUrl !== lessonExists.pdfFileUrl && lessonExists.pdfFileUrl) {
            await uploadService.deleteFile(lessonExists.pdfFileUrl);
        }

        return prisma.lesson.update({
            where: { id: lessonId },
            data,
        });
    }

    async deleteLesson(lessonId: string) {
        const lessonExists = await prisma.lesson.findUnique({ 
            where: { id: lessonId },
            include: { activities: true }
        });
        if (!lessonExists) {
            throw new Error('AULA_NAO_ENCONTRADA');
        }

        const urlsToDelete: string[] = [];
        if (lessonExists.stlFileUrl) urlsToDelete.push(lessonExists.stlFileUrl);
        if (lessonExists.pdfFileUrl) urlsToDelete.push(lessonExists.pdfFileUrl);
        for (const act of lessonExists.activities) {
            if (act.circuitImageUrl) urlsToDelete.push(act.circuitImageUrl);
            if (act.codeFileUrl) urlsToDelete.push(act.codeFileUrl);
        }

        const uploadService = new UploadService();
        await Promise.all(urlsToDelete.map(url => uploadService.deleteFile(url)));

        return prisma.lesson.delete({
            where: { id: lessonId },
        });
    }

    async createLesson(data: CreateLessonDTO) {
        // Regra 1: O módulo onde esta aula será inserida existe?
        const moduleExists = await prisma.module.findUnique({
            where: { id: data.moduleId },
        });

        if (!moduleExists) {
            throw new Error('MODULO_NAO_ENCONTRADO');
        }

        // Regra 2: Já existe uma aula com a mesma ordem dentro DESTE módulo?
        const orderExists = await prisma.lesson.findFirst({
            where: { moduleId: data.moduleId, order: data.order },
        });

        if (orderExists) {
            throw new Error('ORDEM_JA_UTILIZADA');
        }

        if (data.youtubeVideoId && data.durationSeconds === undefined) {
            const fetchedDuration = await fetchYouTubeVideoDuration(data.youtubeVideoId);
            if (fetchedDuration) {
                data.durationSeconds = fetchedDuration;
            }
        }

        // Salva a aula no banco
        return prisma.lesson.create({
            data,
        });
    }

    async getLessonById(lessonId: string) {
        // (youtubeVideoId, pdfFileUrl, stlFileUrl, etc.) para renderizar o player
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: { select: { courseId: true } } }
        });

        if (!lesson) {
            throw new Error('AULA_NAO_ENCONTRADA');
        }

        const nextLesson = await prisma.lesson.findFirst({
            where: {
                moduleId: lesson.moduleId,
                order: { gt: lesson.order }
            },
            orderBy: { order: 'asc' },
            select: { id: true }
        });

        return {
            ...lesson,
            nextLessonId: nextLesson?.id || null
        };
    }

}