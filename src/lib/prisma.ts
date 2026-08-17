import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

// Configura o pool de conexões super rápido e nativo do PostgreSQL
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Exporta a instância única (Singleton) para ser usada em toda a API
export const prisma = new PrismaClient({ adapter });