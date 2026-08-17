import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CourseService } from '../services/CourseService';

export class CourseController {
    private courseService: CourseService;

    constructor() {
        this.courseService = new CourseService();
    }

    create = async (req: AuthRequest, res: Response): Promise => {
        try {
            // A validação de quem está batendo na porta (ADMIN) fica no Controller
            if (req.user?.role !== 'ADMIN') {
                res.status(403).json({ error: 'Acesso negado: Apenas administradores podem criar cursos.' });
                return;
            }

            const course = await this.courseService.createCourse(req.body);
            res.status(201).json({ message: 'Curso criado com sucesso!', course });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro interno ao criar o curso.' });
        }
    };

    list = async (req: Request, res: Response): Promise => {
        try {
            const courses = await this.courseService.listCourses();
            res.json(courses);
        } catch (error) {
            res.status(500).json({ error: 'Erro interno ao buscar os cursos.' });
        }
    };

    update = async (req: AuthRequest, res: Response) => {
        try {
            if (req.user?.role !== 'ADMIN') {
                res.status(403).json({ error: 'Acesso negado: Apenas administradores podem atualizar cursos.' });
                return;
            }
            const { id } = req.params;
            const updatedCourse = await this.courseService.updateCourse(id, req.body);
            res.json({ message: 'Curso atualizado com sucesso!', course: updatedCourse });
        } catch (error: any) {
            if (error.message === 'CURSO_NAO_ENCONTRADO') {
                res.status(404).json({ error: 'O curso especificado não existe.' });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro interno ao atualizar o curso.' });
        }
    };

    delete = async (req: AuthRequest, res: Response) => {
        try {
            if (req.user?.role !== 'ADMIN') {
                res.status(403).json({ error: 'Acesso negado: Apenas administradores podem deletar cursos.' });
                return;
            }
            const { id } = req.params;
            await this.courseService.deleteCourse(id);
            res.json({ message: 'Curso deletado com sucesso!' });
        } catch (error: any) {
            if (error.message === 'CURSO_NAO_ENCONTRADO') {
                res.status(404).json({ error: 'O curso especificado não existe.' });
                return;
            }
            console.error(error);
            res.status(500).json({ error: 'Erro interno ao deletar o curso.' });
        }
    };

    getById = async (req: Request, res: Response): Promise => {
        try {
            const { id } = req.params; // Pega o ID que vem na URL (ex: /api/courses/123)

            const course = await this.courseService.getCourseTree(id);

            res.json(course);
        } catch (error: any) {
            if (error.message === 'CURSO_NAO_ENCONTRADO') {
                res.status(404).json({ error: 'O curso especificado não existe.' });
                return;
            }
            res.status(500).json({ error: 'Erro interno ao buscar o curso.' });
        }
    };
}