import { Request } from 'express';
import { AdminRole as PrismaAdminRole, ModerationDecisionType as PrismaModerationDecisionType } from '@prisma/client';

// Admin User Types
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

// Authentication Types
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

// Permission Types
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
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

// API Response Types
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

// Request Types
export interface AuthenticatedRequest extends Request {
  admin?: AdminUser;
  user?: any; // For compatibility with existing code
}

// Enums
export type AdminRole = PrismaAdminRole;

export type ModerationDecisionType = PrismaModerationDecisionType;

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

// Config Types
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