// Admin User Types
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
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

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  totalCategories: number;
  totalRevenue: number;
  activeListings: number;
  pendingModeration: number;
  newUsersToday: number;
  newListingsToday: number;
}

// User Management
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  listingsCount: number;
  trustScore: number;
}

// Listing Management
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  images: string[];
  userId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  views: number;
  favorites: number;
}

// Category Management
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  isActive: boolean;
  listingsCount: number;
  createdAt: string;
}

// Analytics
export interface AnalyticsData {
  date: string;
  users: number;
  listings: number;
  revenue: number;
  views: number;
}

// System Settings
export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxImagesPerListing: number;
  maxListingPrice: number;
}

// Notification
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
} 