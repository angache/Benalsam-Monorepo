import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AdminRole } from '@/types';
export interface AuthMiddlewareOptions {
    requiredRole?: AdminRole;
    requiredPermissions?: string[];
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (requiredRole: AdminRole) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requirePermission: (resource: string, action: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const authMiddleware: (options?: AuthMiddlewareOptions) => ((req: AuthenticatedRequest, res: Response, next: NextFunction) => void)[];
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map