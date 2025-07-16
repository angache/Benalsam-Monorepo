import { PrismaClient } from '@prisma/client';
import { DatabaseConfig } from '@/types';

const databaseConfig: DatabaseConfig = {
  url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/benalsam_admin',
};

// Prisma client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma, databaseConfig }; 