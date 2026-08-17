import { prisma } from '../lib/prisma';

export interface MarkProgressDTO {
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  watchedSeconds?: number;
}

export class ProgressService {
  async saveProgress(data: MarkProgressDTO) {
    // 1. O aluno já tem algum progresso salvo nesta aula?
    const existingProgress = await prisma.progress.findFirst({
      where: {
        userId: data.userId,
        lessonId: data.lessonId,
      },
    });

    // 2. Se sim, apenas atualizamos os dados
    if (existingProgress) {
      return prisma.progress.update({
        where: { id: existingProgress.id },
        data: {
          isCompleted: data.isCompleted,
          // Se não mandarmos os segundos novos, mantém os antigos
          watchedSeconds: data.watchedSeconds ?? existingProgress.watchedSeconds,
        },
      });
    }

    // 3. Se não, criamos o primeiro registro de progresso dele nesta aula
    return prisma.progress.create({
      data: {
        userId: data.userId,
        lessonId: data.lessonId,
        isCompleted: data.isCompleted,
        watchedSeconds: data.watchedSeconds ?? 0,
      },
    });
  }
}