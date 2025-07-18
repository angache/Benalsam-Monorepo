import { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
export interface CategoryAttribute {
    key: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'array';
    required: boolean;
    options?: string[];
}
export interface Category {
    name: string;
    icon: string;
    color: string;
    subcategories?: Category[];
    attributes?: CategoryAttribute[];
}
export declare const categoriesController: {
    getCategories(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    getCategory(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    createCategory(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    updateCategory(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    deleteCategory(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    createAttribute(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    updateAttribute(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    deleteAttribute(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    logCategoryActivity(admin: any, action: string, categoryPath: string, details?: any): Promise<void>;
};
//# sourceMappingURL=categoriesController.d.ts.map