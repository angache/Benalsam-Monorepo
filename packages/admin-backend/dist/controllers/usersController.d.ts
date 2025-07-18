import { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
export declare const usersController: {
    getUsers(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    getUser(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    updateUser(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    banUser(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    unbanUser(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    deleteUser(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
};
//# sourceMappingURL=usersController.d.ts.map