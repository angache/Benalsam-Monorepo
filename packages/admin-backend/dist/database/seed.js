"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const admin_types_1 = require("../types/admin-types");
async function seedAdminUser() {
    try {
        console.log('🌱 Seeding admin user...');
        const { data: existingAdmin } = await supabase_1.supabase
            .from('admin_users')
            .select('id')
            .eq('email', 'admin@benalsam.com')
            .single();
        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash('admin123456', 12);
        const { data: admin, error } = await supabase_1.supabase
            .from('admin_users')
            .insert({
            email: 'admin@benalsam.com',
            password: hashedPassword,
            first_name: 'Admin',
            last_name: 'User',
            role: admin_types_1.AdminRole.SUPER_ADMIN,
            permissions: [
                { resource: 'listings', action: 'read' },
                { resource: 'listings', action: 'write' },
                { resource: 'listings', action: 'delete' },
                { resource: 'listings', action: 'moderate' },
                { resource: 'users', action: 'read' },
                { resource: 'users', action: 'write' },
                { resource: 'users', action: 'delete' },
                { resource: 'admin_users', action: 'read' },
                { resource: 'admin_users', action: 'write' },
                { resource: 'admin_users', action: 'delete' },
            ],
            is_active: true,
        })
            .select()
            .single();
        if (error) {
            console.error('❌ Error creating admin user:', error);
            return;
        }
        console.log('✅ Admin user created successfully:', admin.email);
        console.log('🔑 Login credentials:');
        console.log('   Email: admin@benalsam.com');
        console.log('   Password: admin123456');
    }
    catch (error) {
        console.error('❌ Seed error:', error);
    }
}
seedAdminUser();
//# sourceMappingURL=seed.js.map