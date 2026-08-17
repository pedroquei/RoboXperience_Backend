import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ModuleService } from '../services/ModuleService';

export class ModuleController {
    private moduleService: ModuleService;

    constructor() {
        // Injeção de dependência simplificada
        this.moduleService = new ModuleService();
    }

    getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const module = await this.moduleService.getModuleById(id);
            res.json(module);
        } catch (error: any) {
            if (error.message === 'MODULO_NAO_ENCONTRADO') {
                res.status(404).json({ error: 'O módulo especificado não existe.' });
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
            if (req.body.order !== undefined) updateData.order = Number(req.body.order);
            if (req.body.courseId !== undefined) updateData.courseId = req.body.courseId;

            const updatedModule = await this.moduleService.updateModule(id, updateData);
            res.json({ message: 'Módulo atualizado com sucesso!', module: updatedModule });
        } catch (error: any) {
            if (error.message === 'MODULO_NAO_ENCONTRADO') {
                res.status(404).json({ error: 'O módulo especificado não existe.' });
                return;
            }
            if (error.message === 'ORDEM_JA_UTILIZADA') {
                res.status(400).json({ error: 'Já existe um módulo com este número de ordem neste curso.' });
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
            await this.moduleService.deleteModule(id);
            res.json({ message: 'Módulo deletado com sucesso!' });
        } catch (error: any) {
            if (error.message === 'MODULO_NAO_ENCONTRADO') {
                res.status(404).json({ error: 'O módulo especificado não existe.' });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    };

    create = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            // Validação de Segurança
            if (req.user?.role !== 'ADMIN') {
                res.status(403).json({ error: 'Acesso negado: Apenas administradores.' });
                return;
            }

            const { title, description, order, courseId } = req.body;

            // Chama o cérebro passando os dados sanitizados
            const moduleData = {
                title,
                description: description || undefined,
                order: Number(order),
                courseId
            };
            const newModule = await this.moduleService.createModule(moduleData);

            res.status(201).json({ message: 'Módulo criado com sucesso!', module: newModule });

        } catch (error: any) {
            // Tratamento de erros de negócio mapeados pelo Service
            if (error.message === 'CURSO_NAO_ENCONTRADO') {
                res.status(404).json({ error: 'O curso especificado não existe.' });
                return;
            }
            if (error.message === 'ORDEM_JA_UTILIZADA') {
                res.status(400).json({ error: 'Já existe um módulo com este número de ordem neste curso.' });
                return;
            }

            console.error(error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    };
}