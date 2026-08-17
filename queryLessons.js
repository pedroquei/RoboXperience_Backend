const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, title: true, order: true, moduleId: true }
  });
  console.log(JSON.stringify(lessons, null, 2));
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
