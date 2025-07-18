"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authMiddleware = exports.requireAllPermissions = exports.requireAnyPermission = exports.requirePermission = exports.requireRole = exports.authenticateToken = void 0;
const database_1 = require("../config/database");
const types_1 = require("../types");
const response_1 = require("../utils/response");
const jwt_1 = require("../utils/jwt");
const permissionService_1 = require("../services/permissionService");
const logger_1 = __importDefault(require("../config/logger"));
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        console.log('🔐 Auth middleware - Token:', token ? 'Token exists' : 'No token');
        console.log('🔐 Auth middleware - Auth header:', authHeader);
        if (!token) {
            console.log('❌ No token provided');
            response_1.ApiResponseUtil.unauthorized(res, 'Access token required');
            return;
        }
        console.log('🔐 Verifying token...');
        const decoded = jwt_1.jwtUtils.verify(token);
        console.log('🔐 Token decoded:', decoded);
        const { data: admin, error } = await database_1.supabase
            .from('admin_users')
            .select('*')
            .eq('id', decoded.adminId)
            .single();
        if (error || !admin || !admin.is_active) {
            console.log('❌ Admin not found or inactive:', { error, admin: !!admin, isActive: admin?.is_active });
            response_1.ApiResponseUtil.unauthorized(res, 'Invalid or inactive admin account');
            return;
        }
        const permissions = await permissionService_1.PermissionService.getAdminPermissions(admin.id);
        await database_1.supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', admin.id);
        console.log('✅ Auth successful for admin:', admin.email);
        req.admin = {
            ...admin,
            permissions
        };
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
            [types_1.AdminRole.CONTENT_MANAGER]: 3,
            [types_1.AdminRole.ANALYTICS_MANAGER]: 4,
            [types_1.AdminRole.CATEGORY_MANAGER]: 5,
            [types_1.AdminRole.USER_MANAGER]: 6,
            [types_1.AdminRole.ADMIN]: 7,
            [types_1.AdminRole.SUPER_ADMIN]: 8,
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
    return async (req, res, next) => {
        if (!req.admin) {
            response_1.ApiResponseUtil.unauthorized(res, 'Authentication required');
            return;
        }
        if (req.admin.role === types_1.AdminRole.SUPER_ADMIN) {
            next();
            return;
        }
        const permissionName = `${resource}:${action}`;
        const hasPermission = req.admin.permissions?.some((permission) => permission.name === permissionName);
        if (!hasPermission) {
            response_1.ApiResponseUtil.forbidden(res, 'Insufficient permissions');
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
const requireAnyPermission = (permissions) => {
    return async (req, res, next) => {
        if (!req.admin) {
            response_1.ApiResponseUtil.unauthorized(res, 'Authentication required');
            return;
        }
        if (req.admin.role === types_1.AdminRole.SUPER_ADMIN) {
            next();
            return;
        }
        const userPermissions = req.admin.permissions?.map((p) => p.name) || [];
        const hasAnyPermission = permissions.some(permission => userPermissions.includes(permission));
        if (!hasAnyPermission) {
            response_1.ApiResponseUtil.forbidden(res, 'Insufficient permissions');
            return;
        }
        next();
    };
};
exports.requireAnyPermission = requireAnyPermission;
const requireAllPermissions = (permissions) => {
    return async (req, res, next) => {
        if (!req.admin) {
            response_1.ApiResponseUtil.unauthorized(res, 'Authentication required');
            return;
        }
        if (req.admin.role === types_1.AdminRole.SUPER_ADMIN) {
            next();
            return;
        }
        const userPermissions = req.admin.permissions?.map((p) => p.name) || [];
        const hasAllPermissions = permissions.every(permission => userPermissions.includes(permission));
        if (!hasAllPermissions) {
            response_1.ApiResponseUtil.forbidden(res, 'Insufficient permissions');
            return;
        }
        next();
    };
};
exports.requireAllPermissions = requireAllPermissions;
const authMiddleware = (options = {}) => {
    const middleware = [exports.authenticateToken];
    if (options.requiredRole) {
        middleware.push((0, exports.requireRole)(options.requiredRole));
    }
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
        if (options.requiredPermissions.length === 1) {
            const [resource, action] = options.requiredPermissions[0].split(':');
            middleware.push((0, exports.requirePermission)(resource, action));
        }
        else {
            middleware.push((0, exports.requireAnyPermission)(options.requiredPermissions));
        }
    }
    if (options.requiredResource && options.requiredAction) {
        middleware.push((0, exports.requirePermission)(options.requiredResource, options.requiredAction));
    }
    return middleware;
};
exports.authMiddleware = authMiddleware;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = jwt_1.jwtUtils.verify(token);
            const { data: admin, error } = await database_1.supabase
                .from('admin_users')
                .select('*')
                .eq('id', decoded.adminId)
                .single();
            if (admin && admin.is_active) {
                const permissions = await permissionService_1.PermissionService.getAdminPermissions(admin.id);
                req.admin = {
                    ...admin,
                    permissions
                };
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