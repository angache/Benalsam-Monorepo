"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("@/config/database");
const app_1 = require("@/config/app");
const response_1 = require("@/utils/response");
const logger_1 = __importDefault(require("@/config/logger"));
class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                response_1.ApiResponseUtil.badRequest(res, 'Email and password are required');
                return;
            }
            const admin = await database_1.prisma.adminUser.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (!admin) {
                response_1.ApiResponseUtil.unauthorized(res, 'Invalid credentials');
                return;
            }
            if (!admin.isActive) {
                response_1.ApiResponseUtil.unauthorized(res, 'Account is deactivated');
                return;
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, admin.password);
            if (!isPasswordValid) {
                response_1.ApiResponseUtil.unauthorized(res, 'Invalid credentials');
                return;
            }
            const payload = {
                adminId: admin.id,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
            };
            const token = jsonwebtoken_1.default.sign(payload, app_1.jwtConfig.secret, {
                expiresIn: app_1.jwtConfig.expiresIn,
            });
            const refreshToken = jsonwebtoken_1.default.sign(payload, app_1.jwtConfig.secret, {
                expiresIn: app_1.jwtConfig.refreshExpiresIn,
            });
            await database_1.prisma.adminUser.update({
                where: { id: admin.id },
                data: { lastLogin: new Date() },
            });
            await database_1.prisma.adminActivityLog.create({
                data: {
                    adminId: admin.id,
                    action: 'LOGIN',
                    resource: 'auth',
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                },
            });
            const { password: _, ...adminWithoutPassword } = admin;
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
            const existingAdmin = await database_1.prisma.adminUser.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (existingAdmin) {
                response_1.ApiResponseUtil.conflict(res, 'Email already exists');
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, app_1.securityConfig.bcryptRounds);
            const newAdmin = await database_1.prisma.adminUser.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    firstName,
                    lastName,
                    role: role || types_1.AdminRole.ADMIN,
                    permissions: permissions || [],
                },
            });
            await database_1.prisma.adminActivityLog.create({
                data: {
                    adminId: req.admin.id,
                    action: 'CREATE_ADMIN',
                    resource: 'admin_users',
                    resourceId: newAdmin.id,
                    details: { createdAdminEmail: email },
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                },
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
                updateData.firstName = firstName;
            if (lastName)
                updateData.lastName = lastName;
            if (currentPassword && newPassword) {
                const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, admin.password);
                if (!isCurrentPasswordValid) {
                    response_1.ApiResponseUtil.badRequest(res, 'Current password is incorrect');
                    return;
                }
                updateData.password = await bcryptjs_1.default.hash(newPassword, app_1.securityConfig.bcryptRounds);
            }
            const updatedAdmin = await database_1.prisma.adminUser.update({
                where: { id: admin.id },
                data: updateData,
            });
            await database_1.prisma.adminActivityLog.create({
                data: {
                    adminId: admin.id,
                    action: 'UPDATE_PROFILE',
                    resource: 'admin_users',
                    resourceId: admin.id,
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                },
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
            const decoded = jsonwebtoken_1.default.verify(refreshToken, app_1.jwtConfig.secret);
            const admin = await database_1.prisma.adminUser.findUnique({
                where: { id: decoded.adminId },
            });
            if (!admin || !admin.isActive) {
                response_1.ApiResponseUtil.unauthorized(res, 'Invalid refresh token');
                return;
            }
            const payload = {
                adminId: admin.id,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
            };
            const newToken = jsonwebtoken_1.default.sign(payload, app_1.jwtConfig.secret, {
                expiresIn: app_1.jwtConfig.expiresIn,
            });
            const newRefreshToken = jsonwebtoken_1.default.sign(payload, app_1.jwtConfig.secret, {
                expiresIn: app_1.jwtConfig.refreshExpiresIn,
            });
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
                await database_1.prisma.adminActivityLog.create({
                    data: {
                        adminId: admin.id,
                        action: 'LOGOUT',
                        resource: 'auth',
                        ipAddress: req.ip,
                        userAgent: req.get('User-Agent'),
                    },
                });
            }
            response_1.ApiResponseUtil.success(res, null, 'Logout successful');
        }
        catch (error) {
            logger_1.default.error('Logout error:', error);
            response_1.ApiResponseUtil.internalServerError(res, 'Logout failed');
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map