"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginationInfo = exports.ApiResponseUtil = void 0;
class ApiResponseUtil {
    static success(res, data, message, statusCode = 200) {
        const response = {
            success: true,
            data,
            message,
        };
        return res.status(statusCode).json(response);
    }
    static error(res, message, statusCode = 500, error) {
        const response = {
            success: false,
            message,
            error,
        };
        return res.status(statusCode).json(response);
    }
    static paginated(res, data, pagination, message) {
        const response = {
            success: true,
            data,
            message,
            pagination,
        };
        return res.status(200).json(response);
    }
    static created(res, data, message) {
        return this.success(res, data, message, 201);
    }
    static noContent(res) {
        return res.status(204).send();
    }
    static badRequest(res, message = 'Bad Request', error) {
        return this.error(res, message, 400, error);
    }
    static unauthorized(res, message = 'Unauthorized', error) {
        return this.error(res, message, 401, error);
    }
    static forbidden(res, message = 'Forbidden', error) {
        return this.error(res, message, 403, error);
    }
    static notFound(res, message = 'Not Found', error) {
        return this.error(res, message, 404, error);
    }
    static conflict(res, message = 'Conflict', error) {
        return this.error(res, message, 409, error);
    }
    static validationError(res, message = 'Validation Error', errors) {
        const response = {
            success: false,
            message,
            error: 'VALIDATION_ERROR',
            data: errors,
        };
        return res.status(422).json(response);
    }
    static internalServerError(res, message = 'Internal Server Error', error) {
        return this.error(res, message, 500, error);
    }
}
exports.ApiResponseUtil = ApiResponseUtil;
const createPaginationInfo = (page, limit, total) => {
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
exports.createPaginationInfo = createPaginationInfo;
//# sourceMappingURL=response.js.map