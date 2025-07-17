import { Request } from 'express';

// Admin Role enum - Genişletilmiş
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT',
  CATEGORY_MANAGER = 'CATEGORY_MANAGER',
  ANALYTICS_MANAGER = 'ANALYTICS_MANAGER',
  USER_MANAGER = 'USER_MANAGER',
  CONTENT_MANAGER = 'CONTENT_MANAGER'
}

// Permission types
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  role: AdminRole;
  permissionId: string;
  permission?: Permission;
  createdAt: string;
}

export interface UserPermission {
  id: string;
  adminId: string;
  permissionId: string;
  grantedBy?: string;
  permission?: Permission;
  createdAt: string;
}

export interface AdminRoleDefinition {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Moderation Decision Type enum
export enum ModerationDecisionType {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  WARN = 'WARN',
  BAN = 'BAN',
  SUSPEND = 'SUSPEND'
}

// Extend Express Request interface
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
    permissions?: Permission[];
  };
}

// Database configuration
export interface DatabaseConfig {
  url: string;
  key: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
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
  permissions?: Permission[];
}

export interface AuthResponse {
  success: boolean;
  data: {
    admin: AdminUser;
    token: string;
    refreshToken: string;
  };
  message: string;
}

// Admin User types
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  permissions?: Permission[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin Management types
export interface AdminUserWithRole extends AdminUser {
  roleDetails?: AdminRole;
  userPermissions?: UserPermission[];
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

// Permission check types
export interface PermissionCheck {
  resource: string;
  action: string;
}

// Listing types
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string;
  status: ListingStatus;
  views: number;
  favorites: number;
  userId: string;
  moderatedAt?: string;
  moderatedBy?: string;
  moderationReason?: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  location?: {
    city: string;
    district: string;
    neighborhood?: string;
  };
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  SOLD = 'SOLD',
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  status: UserStatus;
  trustScore: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
  SUSPENDED = 'SUSPENDED',
}

// Activity Log Types
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

// Moderation Types
export interface ModerationDecision {
  id: string;
  adminId: string;
  reportId?: string;
  decision: ModerationDecisionType;
  reason?: string;
  duration?: number;
  createdAt: Date;
}

// System Settings Types
export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedBy: string;
  updatedAt: Date;
}

// Analytics Types
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

// Dashboard Types
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

// File Upload Types
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

// Email Types
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

// Cache Types
export interface CacheConfig {
  ttl: number;
  prefix: string;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
}

// Enums are already defined above

// Filter Types
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