import { PrismaClient } from '@prisma/client';
import { DatabaseConfig } from '@/types';
declare const databaseConfig: DatabaseConfig;
declare const prisma: PrismaClient<{
    log: ("error" | "query" | "warn")[];
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export { prisma, databaseConfig };
//# sourceMappingURL=database.d.ts.map