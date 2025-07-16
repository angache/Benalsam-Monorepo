"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authMiddleware = exports.requirePermission = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("@/config/database");
const app_1 = require("@/config/app");
const response_1 = require("@/utils/response");
const logger_1 = __importDefault(require("@/config/logger"));
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            response_1.ApiResponseUtil.unauthorized(res, 'Access token required');
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, app_1.jwtConfig.secret);
        const admin = await database_1.prisma.adminUser.findUnique({
            where: { id: decoded.adminId },
        });
        if (!admin || !admin.isActive) {
            response_1.ApiResponseUtil.unauthorized(res, 'Invalid or inactive admin account');
            return;
        }
        await database_1.prisma.adminUser.update({
            where: { id: admin.id },
            data: { lastLogin: new Date() },
        });
        req.admin = admin;
        next();
    }
    catch (error) {
        logger_1.default.error('Authentication error:', error);
        response_1.ApiResponseUtil.unauthorized(res, 'Invalid token');
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.admin) {
            response_1.ApiResponseUtil.unauthorized(res, 'Authentication required');
            return;
        }
        const roleHierarchy = {
            [types_1.AdminRole.SUPPORT]: 1,
            [types_1.AdminRole.MODERATOR]: 2,
            [types_1.AdminRole.ADMIN]: 3,
            [types_1.AdminRole.SUPER_ADMIN]: 4,
        };
        const userRoleLevel = roleHierarchy[req.admin.role];
        const requiredRoleLevel = roleHierarchy[requiredRole];
        if (userRoleLevel < requiredRoleLevel) {
            response_1.ApiResponseUtil.forbidden(res, 'Insufficient permissions');
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
const requirePermission = (resource, action) => {
    return (req, res, next) => {
        if (!req.admin) {
            response_1.ApiResponseUtil.unauthorized(res, 'Authentication required');
            return;
        }
        if (req.admin.role === types_1.AdminRole.SUPER_ADMIN) {
            next();
            return;
        }
        const permissions = req.admin.permissions || [];
        const hasPermission = permissions.some((permission) => permission.resource === resource && permission.action === action);
        if (!hasPermission) {
            response_1.ApiResponseUtil.forbidden(res, 'Insufficient permissions');
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
const authMiddleware = (options = {}) => {
    return [
        exports.authenticateToken,
        ...(options.requiredRole ? [(0, exports.requireRole)(options.requiredRole)] : []),
        ...(options.requiredPermissions ? [
            (0, exports.requirePermission)(options.requiredPermissions[0], options.requiredPermissions[1])
        ] : []),
    ];
};
exports.authMiddleware = authMiddleware;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, app_1.jwtConfig.secret);
            const admin = await database_1.prisma.adminUser.findUnique({
                where: { id: decoded.adminId },
            });
            if (admin && admin.isActive) {
                req.admin = admin;
            }
        }
    }
    catch (error) {
        logger_1.default.debug('Optional auth token error:', error);
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map