import { Request } from 'express';
import { AdminRole, AdminUser, AdminPermission } from './admin-types';
declare const s_t: any;
export declare const ListingStatus: any;
export type ServerConfig = typeof s_t.ServerConfig;
export type JwtConfig = typeof s_t.JwtConfig;
export type SecurityConfig = typeof s_t.SecurityConfig;
export type PaginationInfo = typeof s_t.PaginationInfo;
export type User = typeof s_t.User;
export type UserProfile = typeof s_t.UserProfile;
export type Listing = typeof s_t.Listing;
export type ListingWithUser = typeof s_t.ListingWithUser;
export type Message = typeof s_t.Message;
export type Conversation = typeof s_t.Conversation;
export type Offer = typeof s_t.Offer;
export type InventoryItem = typeof s_t.InventoryItem;
export type OfferAttachment = typeof s_t.OfferAttachment;
export type ApiResponse = typeof s_t.ApiResponse;
export type AuthCredentials = typeof s_t.AuthCredentials;
export type RegisterData = typeof s_t.RegisterData;
export type ID = typeof s_t.ID;
export type Pagination = typeof s_t.Pagination;
export type QueryFilters = typeof s_t.QueryFilters;
export type UserFeedback = typeof s_t.UserFeedback;
export type FeedbackType = typeof s_t.FeedbackType;
export type UserStatistics = typeof s_t.UserStatistics;
export type MonthlyUsageStats = typeof s_t.MonthlyUsageStats;
export type District = typeof s_t.District;
export type Province = typeof s_t.Province;
export type Currency = typeof s_t.Currency;
export type Language = typeof s_t.Language;
export type Category = typeof s_t.Category;
export type NotificationPreferences = typeof s_t.NotificationPreferences;
export type ChatPreferences = typeof s_t.ChatPreferences;
export type PlatformPreferences = typeof s_t.PlatformPreferences;
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email?: string;
        role?: string;
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
    role?: typeof AdminRole;
    permissions?: string[];
}
export interface UpdateAdminUserDto {
    firstName?: string;
    lastName?: string;
    role?: typeof AdminRole;
    permissions?: string[];
    isActive?: boolean;
}
export interface JwtPayload {
    adminId: string;
    email: string;
    role: typeof AdminRole;
    permissions?: (typeof s_t.AdminPermission)[];
}
export interface AdminUserWithRole extends AdminUser {
    roleDetails?: typeof AdminRole;
    userPermissions?: (typeof s_t.AdminUserPermission)[];
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
    role?: typeof AdminRole;
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
export {};
//# sourceMappingURL=index.d.ts.map