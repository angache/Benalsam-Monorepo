import { Response } from 'express';
import { ApiResponse, PaginationInfo } from '@/types';
export declare class ApiResponseUtil {
    static success<T>(res: Response, data?: T, message?: string, statusCode?: number): Response<ApiResponse<T>>;
    static error(res: Response, message: string, statusCode?: number, error?: string): Response<ApiResponse>;
    static paginated<T>(res: Response, data: T[], pagination: PaginationInfo, message?: string): Response<ApiResponse<T[]>>;
    static created<T>(res: Response, data: T, message?: string): Response<ApiResponse<T>>;
    static noContent(res: Response): Response;
    static badRequest(res: Response, message?: string, error?: string): Response<ApiResponse>;
    static unauthorized(res: Response, message?: string, error?: string): Response<ApiResponse>;
    static forbidden(res: Response, message?: string, error?: string): Response<ApiResponse>;
    static notFound(res: Response, message?: string, error?: string): Response<ApiResponse>;
    static conflict(res: Response, message?: string, error?: string): Response<ApiResponse>;
    static validationError(res: Response, message?: string, errors?: any): Response<ApiResponse>;
    static internalServerError(res: Response, message?: string, error?: string): Response<ApiResponse>;
}
export declare const createPaginationInfo: (page: number, limit: number, total: number) => PaginationInfo;
//# sourceMappingURL=response.d.ts.map