import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { jwtConfig } from '@/config/app';
import { AuthenticatedRequest, JwtPayload } from '@/types';
import { AdminRole } from '@prisma/client';
import { ApiResponseUtil } from '@/utils/response';
import logger from '@/config/logger';

export interface AuthMiddlewareOptions {
  requiredRole?: AdminRole;
  requiredPermissions?: string[];
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      ApiResponseUtil.unauthorized(res, 'Access token required');
      return;
    }

    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    
    // Get admin user from database
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.adminId },
    });

    if (!admin || !admin.isActive) {
      ApiResponseUtil.unauthorized(res, 'Invalid or inactive admin account');
      return;
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    req.admin = admin;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    ApiResponseUtil.unauthorized(res, 'Invalid token');
  }
};

export const requireRole = (requiredRole: AdminRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      ApiResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    const roleHierarchy = {
      [AdminRole.SUPPORT]: 1,
      [AdminRole.MODERATOR]: 2,
      [AdminRole.ADMIN]: 3,
      [AdminRole.SUPER_ADMIN]: 4,
    };

    const userRoleLevel = roleHierarchy[req.admin.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      ApiResponseUtil.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

export const requirePermission = (resource: string, action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      ApiResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    // Super admin has all permissions
    if (req.admin.role === AdminRole.SUPER_ADMIN) {
      next();
      return;
    }

    const permissions = req.admin.permissions as any[] || [];
    const hasPermission = permissions.some(
      (permission) =>
        permission.resource === resource && permission.action === action
    );

    if (!hasPermission) {
      ApiResponseUtil.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

export const authMiddleware = (options: AuthMiddlewareOptions = {}) => {
  return [
    authenticateToken,
    ...(options.requiredRole ? [requireRole(options.requiredRole)] : []),
    ...(options.requiredPermissions ? [
      requirePermission(options.requiredPermissions[0], options.requiredPermissions[1])
    ] : []),
  ];
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
      
      const admin = await prisma.adminUser.findUnique({
        where: { id: decoded.adminId },
      });

      if (admin && admin.isActive) {
        req.admin = admin;
      }
    }
  } catch (error) {
    // Silently ignore token errors for optional auth
    logger.debug('Optional auth token error:', error);
  }

  next();
}; 