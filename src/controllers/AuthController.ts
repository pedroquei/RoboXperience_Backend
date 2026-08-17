import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Usando Arrow Function para evitar perda de contexto do 'this' nas rotas
  register = async (req: Request, res: Response): Promise => {
    try {
      const user = await this.authService.register(req.body);
      res.status(201).json({ message: 'Usuário criado com sucesso!', user });
    } catch (error: any) {
      if (error.message === 'EMAIL_JA_EM_USO') {
        res.status(400).json({ error: 'Este email já está em uso.' });
        return;
      }
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  };

  login = async (req: Request, res: Response): Promise => {
    try {
      const result = await this.authService.login(req.body);
      res.json({ message: 'Login realizado com sucesso!', ...result });
    } catch (error: any) {
      if (error.message === 'CREDENCIAIS_INVALIDAS') {
        res.status(401).json({ error: 'Credenciais inválidas.' });
        return;
      }
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  };
}