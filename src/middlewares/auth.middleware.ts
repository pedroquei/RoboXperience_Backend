import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendemos o formato padrão do Express para incluir a propriedade "user"
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 1. Verifica se o header de Autorização foi enviado
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Acesso negado: Token não fornecido.' });
    return;
  }

  // 2. O token vem no formato "Bearer asdjklh123..." -> Nós dividimos pelo espaço para pegar só o código
  const [, token] = authHeader.split(' ');

  try {
    // 3. Verifica se o token foi forjado ou se já expirou (usando a mesma senha do .env)
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };

    // 4. Injeta os dados decodificados (id e cargo) na requisição
    req.user = decoded;

    // 5. Manda a requisição seguir em frente para o Controller
    next();
  } catch (error) {
    res.status(401).json({ error: 'Acesso negado: Token inválido ou expirado.' });
  }
};