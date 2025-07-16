import { Request } from 'express';
import { AdminRole as PrismaAdminRole } from '@prisma/client';
export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: AdminRole;
    permissions?: Permission[];
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateAdminUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: AdminRole;
    permissions?: Permission[];
}
export interface UpdateAdminUserDto {
    firstName?: string;
    lastName?: string;
    role?: AdminRole;
    permissions?: Permission[];
    isActive?: boolean;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthResponse {
    admin: AdminUser;
    token: string;
    refreshToken: string;
}
export interface JwtPayload {
    adminId: string;
    email: string;
    role: AdminRole;
    permissions?: Permission[];
}
export interface Permission {
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}
export interface ActivityLog {
    id: string;
    adminId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
export interface ModerationDecision {
    id: string;
    adminId: string;
    reportId?: string;
    decision: ModerationDecisionType;
    reason?: string;
    duration?: number;
    createdAt: Date;
}
export interface SystemSetting {
    id: string;
    key: string;
    value: string;
    description?: string;
    updatedBy: string;
    updatedAt: Date;
}
export interface DailyStat {
    id: string;
    date: Date;
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    totalListings: number;
    newListings: number;
    activeListings: number;
    totalRevenue: number;
    premiumSubscriptions: number;
    reportsCount: number;
    resolvedReports: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserActivity {
    id: string;
    userId: string;
    action: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    pagination?: PaginationInfo;
}
export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface AuthenticatedRequest extends Request {
    admin?: AdminUser;
    user?: any;
}
export type AdminRole = PrismaAdminRole;
export declare enum ModerationDecisionType {
    APPROVE = "APPROVE",
    REJECT = "REJECT",
    BAN_TEMPORARY = "BAN_TEMPORARY",
    BAN_PERMANENT = "BAN_PERMANENT",
    WARNING = "WARNING",
    DELETE = "DELETE"
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
export interface DashboardStats {
    totalUsers: number;
    newUsersToday: number;
    activeUsersToday: number;
    totalListings: number;
    newListingsToday: number;
    activeListings: number;
    totalRevenue: number;
    revenueToday: number;
    premiumSubscriptions: number;
    reportsCount: number;
    resolvedReportsToday: number;
}
export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
    }[];
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
export interface DatabaseConfig {
    url: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
}
export interface JwtConfig {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
}
export interface ServerConfig {
    port: number;
    nodeEnv: string;
    apiVersion: string;
}
export interface SecurityConfig {
    bcryptRounds: number;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    corsOrigin: string[];
}
//# sourceMappingURL=index.d.ts.map