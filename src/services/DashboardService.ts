import { prisma } from '../lib/prisma';

export class DashboardService {
    async getDashboardData(userId: string) {
        // Busca todos os cursos publicados com suas aulas e atividades
        const courses = await prisma.course.findMany({
            where: { isPublished: true },
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
            },
            orderBy: { createdAt: 'desc' }
        });

        // Busca o progresso do usuário logado
        const userProgress = await prisma.progress.findMany({
            where: { userId, isCompleted: true }
        });

        const userActivityProgress = await prisma.activityProgress.findMany({
            where: { userId, isCompleted: true }
        });

        const completedLessonIds = new Set(userProgress.map(p => p.lessonId));
        const completedActivityIds = new Set(userActivityProgress.map(p => p.activityId));

        let globalTotalLessonsWatched = 0;
        let globalTotalActivitiesCompleted = 0;
        let globalCoursesStarted = 0;
        let globalCoursesCompleted = 0;

        const courseStats = courses.map(course => {
            let totalLessons = 0;
            let completedLessons = 0;
            let totalActivities = 0;
            let completedActivities = 0;

            course.modules.forEach(mod => {
                mod.lessons.forEach(lesson => {
                    totalLessons++;
                    if (completedLessonIds.has(lesson.id)) completedLessons++;

                    lesson.activities.forEach(act => {
                        totalActivities++;
                        if (completedActivityIds.has(act.id)) completedActivities++;
                    });
                });
            });

            const hasStarted = completedLessons > 0 || completedActivities > 0;
            if (hasStarted) globalCoursesStarted++;

            const totalItems = totalLessons + totalActivities;
            const completedItems = completedLessons + completedActivities;
            
            const isCourseCompleted = totalItems > 0 && completedItems === totalItems;
            if (isCourseCompleted) globalCoursesCompleted++;

            globalTotalLessonsWatched += completedLessons;
            globalTotalActivitiesCompleted += completedActivities;

            const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

            return {
                courseId: course.id,
                title: course.title,
                thumbnailUrl: course.thumbnailUrl,
                description: course.description,
                stats: {
                    totalLessons,
                    completedLessons,
                    totalActivities,
                    completedActivities,
                    progressPercentage
                }
            };
        });

        // Ordenar: cursos em andamento primeiro, depois os não iniciados, e por último os completos
        const sortedCourseStats = courseStats.sort((a, b) => {
            if (a.stats.progressPercentage === 100 && b.stats.progressPercentage < 100) return 1;
            if (b.stats.progressPercentage === 100 && a.stats.progressPercentage < 100) return -1;
            return b.stats.progressPercentage - a.stats.progressPercentage;
        });

        return {
            globalStats: {
                totalLessonsWatched: globalTotalLessonsWatched,
                totalActivitiesCompleted: globalTotalActivitiesCompleted,
                coursesStarted: globalCoursesStarted,
                coursesCompleted: globalCoursesCompleted,
            },
            courseStats: sortedCourseStats
        };
    }
}
