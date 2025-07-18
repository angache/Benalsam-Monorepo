"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const app_1 = require("../config/app");
const types_1 = require("../types");
const response_1 = require("../utils/response");
const jwt_1 = require("../utils/jwt");
const logger_1 = __importDefault(require("../config/logger"));
class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            logger_1.default.info(`Login attempt for email: ${email}`);
            if (!email || !password) {
                response_1.ApiResponseUtil.badRequest(res, 'Email and password are required');
                return;
            }
            const { data: admin, error } = await database_1.supabase
                .from('admin_users')
                .select('*')
                .eq('email', email.toLowerCase())
                .single();
            logger_1.default.info(`Supabase query result:`, { admin: !!admin, error });
            if (error || !admin) {
                logger_1.default.error(`Admin not found or error:`, error);
                response_1.ApiResponseUtil.unauthorized(res, 'Invalid credentials');
                return;
            }
            logger_1.default.info(`Admin found: ${admin.email}, is_active: ${admin.is_active}`);
            if (!admin.is_active) {
                response_1.ApiResponseUtil.unauthorized(res, 'Account is deactivated');
                return;
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, admin.password);
            logger_1.default.info(`Password validation result: ${isPasswordValid}`);
            if (!isPasswordValid) {
                response_1.ApiResponseUtil.unauthorized(res, 'Invalid credentials');
                return;
            }
            const payload = {
                adminId: admin.id,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions || [],
            };
            const token = jwt_1.jwtUtils.sign(payload);
            const refreshToken = jwt_1.jwtUtils.signRefresh(payload);
            await database_1.supabase
                .from('admin_users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', admin.id);
            await database_1.supabase
                .from('admin_activity_logs')
                .insert({
                admin_id: admin.id,
                action: 'LOGIN',
                resource: 'auth',
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
            });
            const { password: _, ...adminWithoutPassword } = admin;
            logger_1.default.info(`Login successful for: ${admin.email}`);
            response_1.ApiResponseUtil.success(res, {
                admin: adminWithoutPassword,
                token,
                refreshToken,
            }, 'Login successful');
        }
        catch (error) {
            logger_1.default.error('Login error:', error);
            response_1.ApiResponseUtil.internalServerError(res, 'Login failed');
        }
    }
    static async createAdmin(req, res) {
        try {
            const { email, password, firstName, lastName, role, permissions } = req.body;
            if (!email || !password || !firstName || !lastName) {
                response_1.ApiResponseUtil.badRequest(res, 'All fields are required');
                return;
            }
            const { data: existingAdmin } = await database_1.supabase
                .from('admin_users')
                .select('id')
                .eq('email', email.toLowerCase())
                .single();
            if (existingAdmin) {
                response_1.ApiResponseUtil.conflict(res, 'Email already exists');
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, app_1.securityConfig.bcryptRounds);
            const { data: newAdmin, error } = await database_1.supabase
                .from('admin_users')
                .insert({
                email: email.toLowerCase(),
                password: hashedPassword,
                first_name: firstName,
                last_name: lastName,
                role: role || types_1.AdminRole.ADMIN,
                permissions: permissions || [],
                is_active: true,
            })
                .select()
                .single();
            if (error) {
                logger_1.default.error('Create admin error:', error);
                response_1.ApiResponseUtil.internalServerError(res, 'Failed to create admin user');
                return;
            }
            const { error: profileError } = await database_1.supabase
                .from('profiles')
                .insert({
                id: newAdmin.id,
                email: newAdmin.email,
                name: `${firstName} ${lastName}`,
                avatar_url: null,
                is_admin: true,
            });
            if (profileError) {
                logger_1.default.warn('Failed to create admin profile:', profileError);
            }
            await database_1.supabase
                .from('admin_activity_logs')
                .insert({
                admin_id: req.admin.id,
                action: 'CREATE_ADMIN',
                resource: 'admin_users',
                resource_id: newAdmin.id,
                details: { created_admin_email: email },
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
            });
            const { password: _, ...adminWithoutPassword } = newAdmin;
            response_1.ApiResponseUtil.created(res, adminWithoutPassword, 'Admin user created successfully');
        }
        catch (error) {
            logger_1.default.error('Create admin error:', error);
            response_1.ApiResponseUtil.internalServerError(res, 'Failed to create admin user');
        }
    }
    static async getProfile(req, res) {
        try {
            const admin = req.admin;
            if (!admin) {
                response_1.ApiResponseUtil.unauthorized(res, 'Authentication required');
                return;
            }
            const { password: _, ...adminWithoutPassword } = admin;
            response_1.ApiResponseUtil.success(res, adminWithoutPassword, 'Profile retrieved successfully');
        }
        catch (error) {
            logger_1.default.error('Get profile error:', error);
            response_1.ApiResponseUtil.internalServerError(res, 'Failed to get profile');
        }
    }
    static async updateProfile(req, res) {
        try {
            const admin = req.admin;
            const { firstName, lastName, currentPassword, newPassword } = req.body;
            if (!admin) {
                response_1.ApiResponseUtil.unauthorized(res, 'Authentication required');
                return;
            }
            const updateData = {};
            if (firstName)
                updateData.first_name = firstName;
            if (lastName)
                updateData.last_name = lastName;
            if (currentPassword && newPassword) {
                const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, admin.password);
                if (!isCurrentPasswordValid) {
                    response_1.ApiResponseUtil.badRequest(res, 'Current password is incorrect');
                    return;
                }
                updateData.password = await bcryptjs_1.default.hash(newPassword, app_1.securityConfig.bcryptRounds);
            }
            const { data: updatedAdmin, error } = await database_1.supabase
                .from('admin_users')
                .update(updateData)
                .eq('id', admin.id)
                .select()
                .single();
            if (error) {
                logger_1.default.error('Update profile error:', error);
                response_1.ApiResponseUtil.internalServerError(res, 'Failed to update profile');
                return;
            }
            await database_1.supabase
                .from('admin_activity_logs')
                .insert({
                admin_id: admin.id,
                action: 'UPDATE_PROFILE',
                resource: 'admin_users',
                resource_id: admin.id,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
            });
            const { password: _, ...adminWithoutPassword } = updatedAdmin;
            response_1.ApiResponseUtil.success(res, adminWithoutPassword, 'Profile updated successfully');
        }
        catch (error) {
            logger_1.default.error('Update profile error:', error);
            response_1.ApiResponseUtil.internalServerError(res, 'Failed to update profile');
        }
    }
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                response_1.ApiResponseUtil.badRequest(res, 'Refresh token is required');
                return;
            }
            const decoded = jwt_1.jwtUtils.verify(refreshToken);
            const { data: admin, error } = await database_1.supabase
                .from('admin_users')
                .select('*')
                .eq('id', decoded.adminId)
                .single();
            if (error || !admin || !admin.is_active) {
                response_1.ApiResponseUtil.unauthorized(res, 'Invalid refresh token');
                return;
            }
            const payload = {
                adminId: admin.id,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions || [],
            };
            const newToken = jwt_1.jwtUtils.sign(payload);
            const newRefreshToken = jwt_1.jwtUtils.signRefresh(payload);
            response_1.ApiResponseUtil.success(res, {
                token: newToken,
                refreshToken: newRefreshToken,
            }, 'Token refreshed successfully');
        }
        catch (error) {
            logger_1.default.error('Refresh token error:', error);
            response_1.ApiResponseUtil.unauthorized(res, 'Invalid refresh token');
        }
    }
    static async logout(req, res) {
        try {
            const admin = req.admin;
            if (admin) {
                await database_1.supabase
                    .from('admin_activity_logs')
                    .insert({
                    admin_id: admin.id,
                    action: 'LOGOUT',
                    resource: 'auth',
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent'),
                });
            }
            response_1.ApiResponseUtil.success(res, null, 'Logout successful');
        }
        catch (error) {
            logger_1.default.error('Logout error:', error);
            response_1.ApiResponseUtil.success(res, null, 'Logout successful');
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map