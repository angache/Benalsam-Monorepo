"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const databaseConfig = {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/benalsam_admin',
};
exports.databaseConfig = databaseConfig;
const prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
exports.prisma = prisma;
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=database.js.map