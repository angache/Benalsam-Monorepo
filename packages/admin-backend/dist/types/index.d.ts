import { Request } from 'express';
import { AdminRole } from '@benalsam/shared-types';
import type { AdminUser, AdminProfile, AdminPermission, AdminRolePermission, AdminUserPermission, AdminActivityLog, AdminWorkflowAssignment, AdminPerformanceMetric, AdminDepartment, AdminApiResponse, AdminAuthResponse, AdminLoginCredentials, LoginDto, ServerConfig, JwtConfig, SecurityConfig, PaginationInfo, User, UserProfile, Listing, ListingWithUser, ListingStatus, Message, Conversation, Offer, InventoryItem, OfferAttachment, ApiResponse, AuthCredentials, RegisterData, ID, Pagination, QueryFilters, UserFeedback, FeedbackType, UserStatistics, MonthlyUsageStats, District, Province, Currency, Language, Category, NotificationPreferences, ChatPreferences, PlatformPreferences } from '@benalsam/shared-types';
export type Permission = AdminPermission;
export type RolePermission = AdminRolePermission;
export type UserPermission = AdminUserPermission;
export type AdminRoleDefinition = import('@benalsam/shared-types').AdminRoleDefinition;
export { AdminRole, AdminUser, AdminProfile, AdminPermission, AdminRolePermission, AdminUserPermission, AdminActivityLog, AdminWorkflowAssignment, AdminPerformanceMetric, AdminDepartment, AdminApiResponse, AdminAuthResponse, AdminLoginCredentials, LoginDto, ServerConfig, JwtConfig, SecurityConfig, PaginationInfo, User, UserProfile, Listing, ListingWithUser, ListingStatus, Message, Conversation, Offer, InventoryItem, OfferAttachment, ApiResponse, AuthCredentials, RegisterData, ID, Pagination, QueryFilters, UserFeedback, FeedbackType, UserStatistics, MonthlyUsageStats, District, Province, Currency, Language, Category, NotificationPreferences, ChatPreferences, PlatformPreferences };
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
    admin?: {
        id: string;
        email: string;
        role: AdminRole;
        permissions?: AdminPermission[];
    };
}
export interface DatabaseConfig {
    url: string;
    key: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
}
export interface CreateAdminUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: AdminRole;
    permissions?: string[];
}
export interface UpdateAdminUserDto {
    firstName?: string;
    lastName?: string;
    role?: AdminRole;
    permissions?: string[];
    isActive?: boolean;
}
export interface JwtPayload {
    adminId: string;
    email: string;
    role: AdminRole;
    permissions?: AdminPermission[];
}
export interface AdminUserWithRole extends AdminUser {
    roleDetails?: AdminRole;
    userPermissions?: AdminUserPermission[];
}
export interface CreateRoleDto {
    name: string;
    displayName: string;
    description?: string;
    level: number;
    permissions: string[];
}
export interface UpdateRoleDto {
    displayName?: string;
    description?: string;
    level?: number;
    isActive?: boolean;
    permissions?: string[];
}
export interface PermissionCheck {
    resource: string;
    action: string;
}
export interface UserFilter {
    search?: string;
    role?: AdminRole;
    isActive?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
}
export interface ListingFilter {
    search?: string;
    category?: string;
    status?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}
export interface ReportFilter {
    status?: string;
    type?: string;
    priority?: string;
    dateFrom?: Date;
    dateTo?: Date;
}
export interface FileUploadConfig {
    maxSize: number;
    allowedTypes: string[];
    uploadPath: string;
}
export interface UploadedFile {
    originalname: string;
    filename: string;
    path: string;
    size: number;
    mimetype: string;
    url?: string;
}
export interface EmailConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
}
export interface EmailTemplate {
    subject: string;
    html: string;
    text?: string;
}
export interface CacheConfig {
    ttl: number;
    prefix: string;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    code?: string;
}
//# sourceMappingURL=index.d.ts.map