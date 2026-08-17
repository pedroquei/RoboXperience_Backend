import { Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middlewares/auth.middleware';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }

      const userId = req.user.id;
      const user = await this.userService.getProfile(userId);
      res.json(user);
    } catch (error: any) {
      if (error.message === 'USUARIO_NAO_ENCONTRADO') {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  };

  changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }
      
      const userId = req.user.id;
      const result = await this.userService.changePassword(userId, req.body);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'USUARIO_NAO_ENCONTRADO') {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }
      if (error.message === 'SENHA_ATUAL_INCORRETA') {
        res.status(400).json({ error: 'Senha atual incorreta.' });
        return;
      }
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  };

  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }
      
      const userId = req.user.id;
      const { name, profilePictureUrl } = req.body;
      
      const updatedUser = await this.userService.updateProfile(userId, { name, profilePictureUrl });
      res.json(updatedUser);
    } catch (error: any) {
      if (error.message === 'USUARIO_NAO_ENCONTRADO') {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  };
}
