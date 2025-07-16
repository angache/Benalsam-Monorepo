import { Response } from 'express';
import { ApiResponse, PaginationInfo } from '@/types';

export class ApiResponseUtil {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    error?: string
  ): Response<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      message,
      error,
    };

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationInfo,
    message?: string
  ): Response<ApiResponse<T[]>> {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      message,
      pagination,
    };

    return res.status(200).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message?: string
  ): Response<ApiResponse<T>> {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static badRequest(
    res: Response,
    message: string = 'Bad Request',
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, 400, error);
  }

  static unauthorized(
    res: Response,
    message: string = 'Unauthorized',
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, 401, error);
  }

  static forbidden(
    res: Response,
    message: string = 'Forbidden',
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, 403, error);
  }

  static notFound(
    res: Response,
    message: string = 'Not Found',
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, 404, error);
  }

  static conflict(
    res: Response,
    message: string = 'Conflict',
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, 409, error);
  }

  static validationError(
    res: Response,
    message: string = 'Validation Error',
    errors?: any
  ): Response<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      message,
      error: 'VALIDATION_ERROR',
      data: errors,
    };

    return res.status(422).json(response);
  }

  static internalServerError(
    res: Response,
    message: string = 'Internal Server Error',
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, 500, error);
  }
}

export const createPaginationInfo = (
  page: number,
  limit: number,
  total: number
): PaginationInfo => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}; 