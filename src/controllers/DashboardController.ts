import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { DashboardService } from '../services/DashboardService';

export class DashboardController {
    private dashboardService: DashboardService;

    constructor() {
        this.dashboardService = new DashboardService();
    }

    getDashboardData = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Usuário não autenticado.' });
                return;
            }

            const data = await this.dashboardService.getDashboardData(userId);
            res.json(data);
        } catch (error) {
            console.error('Erro ao buscar dados do dashboard:', error);
            res.status(500).json({ error: 'Erro interno ao buscar dados do dashboard.' });
        }
    };
}
