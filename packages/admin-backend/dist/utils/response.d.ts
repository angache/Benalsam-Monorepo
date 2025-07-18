import { Response } from 'express';
import { AdminApiResponse } from '../types';
export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class ApiResponseUtil {
    static success<T>(res: Response, data?: T, message?: string, statusCode?: number): Response<AdminApiResponse<T>>;
    static error(res: Response, message: string, statusCode?: number, error?: string): Response<AdminApiResponse>;
    static paginated<T>(res: Response, data: T[], pagination: PaginationInfo, message?: string): Response<AdminApiResponse<T[]>>;
    static created<T>(res: Response, data: T, message?: string): Response<AdminApiResponse<T>>;
    static noContent(res: Response): Response;
    static badRequest(res: Response, message?: string, error?: string): Response<AdminApiResponse>;
    static unauthorized(res: Response, message?: string, error?: string): Response<AdminApiResponse>;
    static forbidden(res: Response, message?: string, error?: string): Response<AdminApiResponse>;
    static notFound(res: Response, message?: string, error?: string): Response<AdminApiResponse>;
    static conflict(res: Response, message?: string, error?: string): Response<AdminApiResponse>;
    static validationError(res: Response, message?: string, errors?: any): Response<AdminApiResponse>;
    static internalServerError(res: Response, message?: string, error?: string): Response<AdminApiResponse>;
}
export declare const createPaginationInfo: (page: number, limit: number, total: number) => PaginationInfo;
//# sourceMappingURL=response.d.ts.map