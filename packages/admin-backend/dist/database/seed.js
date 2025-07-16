"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app_1 = require("@/config/app");
const logger_1 = __importDefault(require("@/config/logger"));
const prisma = new client_1.PrismaClient();
async function main() {
    logger_1.default.info('🌱 Starting database seeding...');
    try {
        const existingAdmin = await prisma.adminUser.findUnique({
            where: { email: app_1.adminConfig.defaultEmail },
        });
        if (existingAdmin) {
            logger_1.default.info('✅ Default admin user already exists');
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(app_1.adminConfig.defaultPassword, app_1.securityConfig.bcryptRounds);
        const defaultAdmin = await prisma.adminUser.create({
            data: {
                email: app_1.adminConfig.defaultEmail,
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: client_1.AdminRole.SUPER_ADMIN,
                permissions: [
                    { resource: '*', action: '*' },
                ],
                isActive: true,
            },
        });
        logger_1.default.info('✅ Default admin user created successfully');
        logger_1.default.info(`📧 Email: ${defaultAdmin.email}`);
        logger_1.default.info(`🔑 Password: ${app_1.adminConfig.defaultPassword}`);
        logger_1.default.info('⚠️  Please change the default password after first login!');
        const defaultSettings = [
            {
                key: 'site_name',
                value: 'Benalsam Admin',
                description: 'Site name for the admin panel',
            },
            {
                key: 'maintenance_mode',
                value: 'false',
                description: 'Maintenance mode status',
            },
            {
                key: 'max_listings_per_user',
                value: '5',
                description: 'Maximum listings per user',
            },
            {
                key: 'auto_approve_listings',
                value: 'false',
                description: 'Auto approve new listings',
            },
        ];
        for (const setting of defaultSettings) {
            await prisma.systemSetting.create({
                data: {
                    ...setting,
                    updatedBy: defaultAdmin.id,
                },
            });
        }
        logger_1.default.info('✅ Default system settings created');
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            await prisma.dailyStat.create({
                data: {
                    date,
                    totalUsers: Math.floor(Math.random() * 1000) + 100,
                    newUsers: Math.floor(Math.random() * 50) + 5,
                    activeUsers: Math.floor(Math.random() * 200) + 20,
                    totalListings: Math.floor(Math.random() * 500) + 50,
                    newListings: Math.floor(Math.random() * 30) + 3,
                    activeListings: Math.floor(Math.random() * 100) + 10,
                    totalRevenue: Math.floor(Math.random() * 1000) + 100,
                    premiumSubscriptions: Math.floor(Math.random() * 20) + 2,
                    reportsCount: Math.floor(Math.random() * 10) + 1,
                    resolvedReports: Math.floor(Math.random() * 8) + 1,
                },
            });
        }
        logger_1.default.info('✅ Sample daily stats created');
        logger_1.default.info('🎉 Database seeding completed successfully!');
    }
    catch (error) {
        logger_1.default.error('❌ Database seeding failed:', error);
        throw error;
    }
}
main()
    .catch((error) => {
    logger_1.default.error('❌ Seeding error:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map