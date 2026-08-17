import { authMiddleware, AuthRequest } from './middlewares/auth.middleware';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import moduleRoutes from './routes/module.routes';
import lessonRoutes from './routes/lesson.routes';
import progressRoutes from './routes/progress.routes';
import activityRoutes from './routes/activity.routes';
import activityProgressRoutes from './routes/activity-progress.routes';
import commentRoutes from './routes/comment.routes';
import userRoutes from './routes/user.routes';
import uploadRoutes from './routes/upload.routes';
import dashboardRoutes from './routes/dashboard.routes';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// --- ROTAS DA APLICAÇÃO ---
// 2. Dizemos ao Express: "Tudo que começar com /api/auth, mande para o authRoutes"
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/activity-progress', activityProgressRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota de Healthcheck (Mantemos ela aqui para testes rápidos)
app.get('/api/status', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', message: 'API da RoboXperience online e conectada via Prisma 7!' });
  } catch (error) {
    console.error('Erro no banco de dados:', error);
    res.status(500).json({ status: 'ERROR', message: 'Falha na conexão com o banco de dados' });
  }
});

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT} e acessível na rede (0.0.0.0)`);
});



// --- ROTA PROTEGIDA DE TESTE ---
// Note que o authMiddleware fica no meio, entre o caminho e a função final
app.get('/api/me', authMiddleware, (req: AuthRequest, res) => {
  // Se o código chegou até aqui, o token é válido com 100% de certeza!
  res.json({
    message: 'Acesso autorizado! Aqui estão seus dados:',
    seuPerfil: req.user
  });
});