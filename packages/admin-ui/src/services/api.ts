import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1';

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    console.log('🔑 Adding auth token to request:', token ? 'Token exists' : 'No token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  admin: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    permissions: any[];
    is_active: boolean;
    last_login: string;
    created_at: string;
    updated_at: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED';
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  images: string[];
  location?: {
    city: string;
    district: string;
    neighborhood: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface GetListingsParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    status?: string;
    category?: string;
    userId?: string;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: string;
  lastLoginAt?: string;
  profileImage?: string;
}

export interface AnalyticsData {
  totalListings: number;
  totalUsers: number;
  totalRevenue: number;
  pendingListings: number;
  activeListings: number;
  rejectedListings: number;
  monthlyStats: {
    month: string;
    listings: number;
    users: number;
    revenue: number;
  }[];
}

// API Service
export const apiService = {
  // Auth
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🔐 Attempting login with:', credentials.email);
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    console.log('🔐 Login response:', response.data);
    
    // Admin backend returns { success: true, data: { admin, token, refreshToken }, message }
    const loginData = response.data.data;
    return {
      token: loginData.token,
      refreshToken: loginData.refreshToken,
      admin: loginData.admin,
    };
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data.data;
  },

  // Listings
  async getListings(params: GetListingsParams = {}): Promise<ApiResponse<Listing[]>> {
    console.log('🔍 Fetching listings with params:', params);
    const response = await apiClient.get<ApiResponse<Listing[]>>('/listings', { params });
    console.log('✅ Listings response:', response.data);
    return response.data;
  },

  async getListing(id: string): Promise<Listing> {
    const response = await apiClient.get<ApiResponse<Listing>>(`/listings/${id}`);
    return response.data.data;
  },

  async moderateListing(id: string, action: 'approve' | 'reject', reason?: string): Promise<void> {
    const status = action === 'approve' ? 'active' : 'rejected';
    await apiClient.post(`/listings/${id}/moderate`, { status, reason });
  },

  async reEvaluateListing(id: string, reason?: string): Promise<void> {
    await apiClient.post(`/listings/${id}/re-evaluate`, { reason });
  },

  async deleteListing(id: string): Promise<void> {
    await apiClient.delete(`/listings/${id}`);
  },

  async updateListing(id: string, data: Partial<Listing>): Promise<Listing> {
    const response = await apiClient.put<ApiResponse<Listing>>(`/listings/${id}`, data);
    return response.data.data;
  },

  // Users
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: { status?: string; role?: string };
  } = {}): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return response.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  async banUser(id: string, reason?: string): Promise<void> {
    await apiClient.post(`/users/${id}/ban`, { reason });
  },

  async unbanUser(id: string): Promise<void> {
    await apiClient.post(`/users/${id}/unban`);
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const response = await apiClient.get<ApiResponse<AnalyticsData>>('/analytics');
    return response.data.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get('/health');
    return response.data;
  },
}; 