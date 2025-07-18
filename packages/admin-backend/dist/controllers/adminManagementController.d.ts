import { Request, Response } from 'express';
export declare class AdminManagementController {
    static getAdminUsers(req: Request, res: Response): Promise<void>;
    static getAdminUser(req: Request, res: Response): Promise<void>;
    static createAdminUser(req: Request, res: Response): Promise<void>;
    static updateAdminUser(req: Request, res: Response): Promise<void>;
    static deleteAdminUser(req: Request, res: Response): Promise<void>;
    static getRoles(req: Request, res: Response): Promise<void>;
    static getRoleDetails(req: Request, res: Response): Promise<void>;
    static updateRolePermissions(req: Request, res: Response): Promise<void>;
    static getPermissions(req: Request, res: Response): Promise<void>;
    static getPermissionMatrix(req: Request, res: Response): Promise<void>;
    static getCurrentUserPermissions(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=adminManagementController.d.ts.map