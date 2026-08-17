import { prisma } from '../lib/prisma';
import { UploadService } from './UploadService';

export interface CreateCourseDTO {
    title: string;
    description?: string;
    thumbnailUrl?: string;
}

export interface UpdateCourseDTO extends Partial<CreateCourseDTO> {
    isPublished?: boolean;
}

export class CourseService {
    async createCourse(data: CreateCourseDTO) {
        return prisma.course.create({
            data: {
                ...data,
                isPublished: false, // Regra de negócio: nasce como rascunho
            },
        });
    }

    async listCourses() {
        return prisma.course.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateCourse(courseId: string, data: UpdateCourseDTO) {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            throw new Error('CURSO_NAO_ENCONTRADO');
        }

        // Verifica se a thumbnail mudou
        if (data.thumbnailUrl && data.thumbnailUrl !== course.thumbnailUrl && course.thumbnailUrl) {
            const uploadService = new UploadService();
            await uploadService.deleteFile(course.thumbnailUrl);
        }

        return prisma.course.update({
            where: { id: courseId },
            data,
        });
    }

    async deleteCourse(courseId: string) {
        const course = await prisma.course.findUnique({ 
            where: { id: courseId },
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                activities: true
                            }
                        }
                    }
                }
            }
        });
        if (!course) {
            throw new Error('CURSO_NAO_ENCONTRADO');
        }

        // Mapeia todos os arquivos do curso e de seus filhos para deletar do R2
        const urlsToDelete: string[] = [];
        if (course.thumbnailUrl) urlsToDelete.push(course.thumbnailUrl);
        for (const mod of course.modules) {
            for (const less of mod.lessons) {
                if (less.pdfFileUrl) urlsToDelete.push(less.pdfFileUrl);
                if (less.stlFileUrl) urlsToDelete.push(less.stlFileUrl);
                for (const act of less.activities) {
                    if (act.circuitImageUrl) urlsToDelete.push(act.circuitImageUrl);
                    if (act.codeFileUrl) urlsToDelete.push(act.codeFileUrl);
                }
            }
        }

        const uploadService = new UploadService();
        await Promise.all(urlsToDelete.map(url => uploadService.deleteFile(url)));

        return prisma.course.delete({
            where: { id: courseId },
        });
    }

    async getCourseTree(courseId: string) {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                modules: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        order: true,
                        lessons: {
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                title: true,
                                order: true,
                                durationSeconds: true,
                            }
                        }
                    }
                }
            }
        });

        if (!course) {
            throw new Error('CURSO_NAO_ENCONTRADO');
        }

        return course;
    }
}