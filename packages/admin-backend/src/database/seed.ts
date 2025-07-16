import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { adminConfig, securityConfig } from '@/config/app';
import logger from '@/config/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 Starting database seeding...');

  try {
    // Check if default admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: adminConfig.defaultEmail },
    });

    if (existingAdmin) {
      logger.info('✅ Default admin user already exists');
      return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash(adminConfig.defaultPassword, securityConfig.bcryptRounds);

    const defaultAdmin = await prisma.adminUser.create({
      data: {
        email: adminConfig.defaultEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: AdminRole.SUPER_ADMIN,
        permissions: [
          { resource: '*', action: '*' }, // Super admin has all permissions
        ],
        isActive: true,
      },
    });

    logger.info('✅ Default admin user created successfully');
    logger.info(`📧 Email: ${defaultAdmin.email}`);
    logger.info(`🔑 Password: ${adminConfig.defaultPassword}`);
    logger.info('⚠️  Please change the default password after first login!');

    // Create some default system settings
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

    logger.info('✅ Default system settings created');

    // Create sample daily stats for the last 7 days
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

    logger.info('✅ Sample daily stats created');

    logger.info('🎉 Database seeding completed successfully!');

  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    logger.error('❌ Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 