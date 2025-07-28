import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AdminRole } from '../types/admin-types';
export interface AuthMiddlewareOptions {
    requiredRole?: AdminRole;
    requiredPermissions?: string[];
    requiredResource?: string;
    requiredAction?: string;
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (requiredRole: AdminRole) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requirePermission: (resource: string, action: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAnyPermission: (permissions: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAllPermissions: (permissions: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authMiddleware: (options?: AuthMiddlewareOptions) => any[];
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authenticateSupabaseToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map