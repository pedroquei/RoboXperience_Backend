import { prisma } from '../lib/prisma';
import { UploadService } from './UploadService';

// DTO (Data Transfer Object) - Define a tipagem exata que o serviço espera receber
export interface CreateModuleDTO {
    title: string;
    description?: string;
    order: number;
    courseId: string;
}

export interface UpdateModuleDTO extends Partial<CreateModuleDTO> {}

export class ModuleService {
    async getModuleById(moduleId: string) {
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                lessons: {
                    orderBy: { order: 'asc' },
                }
            }
        });
        if (!module) {
            throw new Error('MODULO_NAO_ENCONTRADO');
        }
        return module;
    }

    async updateModule(moduleId: string, data: UpdateModuleDTO) {
        const moduleExists = await prisma.module.findUnique({ where: { id: moduleId } });
        if (!moduleExists) {
            throw new Error('MODULO_NAO_ENCONTRADO');
        }

        if (data.order !== undefined && data.order !== moduleExists.order) {
            const courseId = data.courseId || moduleExists.courseId;
            const orderExists = await prisma.module.findFirst({
                where: { courseId, order: data.order },
            });
            if (orderExists) {
                throw new Error('ORDEM_JA_UTILIZADA');
            }
        }

        return prisma.module.update({
            where: { id: moduleId },
            data,
        });
    }

    async deleteModule(moduleId: string) {
        const moduleExists = await prisma.module.findUnique({ 
            where: { id: moduleId },
            include: {
                lessons: {
                    include: {
                        activities: true
                    }
                }
            }
        });
        if (!moduleExists) {
            throw new Error('MODULO_NAO_ENCONTRADO');
        }

        const urlsToDelete: string[] = [];
        for (const less of moduleExists.lessons) {
            if (less.pdfFileUrl) urlsToDelete.push(less.pdfFileUrl);
            if (less.stlFileUrl) urlsToDelete.push(less.stlFileUrl);
            for (const act of less.activities) {
                if (act.circuitImageUrl) urlsToDelete.push(act.circuitImageUrl);
                if (act.codeFileUrl) urlsToDelete.push(act.codeFileUrl);
            }
        }

        const uploadService = new UploadService();
        await Promise.all(urlsToDelete.map(url => uploadService.deleteFile(url)));

        return prisma.module.delete({
            where: { id: moduleId },
        });
    }

    async createModule(data: CreateModuleDTO) {
        // Regra de Negócio 1: O curso onde este módulo será inserido realmente existe?
        const courseExists = await prisma.course.findUnique({
            where: { id: data.courseId },
        });

        if (!courseExists) {
            throw new Error('CURSO_NAO_ENCONTRADO');
        }

        // Regra de Negócio 2: Verifica se já existe um módulo com essa mesma ordem neste curso
        const orderExists = await prisma.module.findFirst({
            where: { courseId: data.courseId, order: data.order },
        });

        if (orderExists) {
            throw new Error('ORDEM_JA_UTILIZADA');
        }

        // Se passou nas regras, salva no banco
        return prisma.module.create({
            data,
        });
    }
}