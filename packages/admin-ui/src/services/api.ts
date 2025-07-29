import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { config } from '../config/environment';
import type { 
  LoginRequest, 
  LoginResponse, 
  ApiResponse, 
  Listing, 
  GetListingsParams, 
  User, 
  AdminUser, 
  Role, 
  Permission, 
  AnalyticsData 
} from '@benalsam/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_URL || config.apiUrl;
console.log('🔧 API_BASE_URL:', API_BASE_URL);

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
    return response.data.data!;
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

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const response = await apiClient.get<ApiResponse<AnalyticsData>>('/analytics');
    return response.data.data;
  },

  // Admin Management
  async getAdminUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: { role?: string; status?: string };
  } = {}): Promise<ApiResponse<AdminUser[]>> {
    const response = await apiClient.get<ApiResponse<AdminUser[]>>('/admin-management/users', { params });
    return response.data;
  },

  async getAdminUser(id: string): Promise<AdminUser> {
    const response = await apiClient.get<ApiResponse<AdminUser>>(`/admin-management/users/${id}`);
    return response.data.data;
  },

  async createAdminUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions?: string[];
  }): Promise<AdminUser> {
    const response = await apiClient.post<ApiResponse<AdminUser>>('/admin-management/users', data);
    return response.data.data;
  },

  async updateAdminUser(id: string, data: {
    firstName?: string;
    lastName?: string;
    role?: string;
    isActive?: boolean;
    permissions?: string[];
  }): Promise<AdminUser> {
    const response = await apiClient.put<ApiResponse<AdminUser>>(`/admin-management/users/${id}`, data);
    return response.data.data;
  },

  async deleteAdminUser(id: string): Promise<void> {
    await apiClient.delete(`/admin-management/users/${id}`);
  },

  async getRoles(): Promise<ApiResponse<Role[]>> {
    const response = await apiClient.get<ApiResponse<Role[]>>('/admin-management/roles');
    return response.data;
  },

  async getRoleDetails(role: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(`/admin-management/roles/${role}`);
    return response.data;
  },

  async updateRolePermissions(role: string, permissionIds: string[]): Promise<void> {
    await apiClient.put(`/admin-management/roles/${role}/permissions`, { permissionIds });
  },

  async getPermissions(params?: { resource?: string }): Promise<ApiResponse<Permission[]>> {
    const response = await apiClient.get<ApiResponse<Permission[]>>('/admin-management/permissions', { params });
    return response.data;
  },

  async getPermissionMatrix(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/admin-management/permissions/matrix');
    return response.data;
  },

  async getCurrentUserPermissions(): Promise<ApiResponse<Permission[]>> {
    const response = await apiClient.get<ApiResponse<Permission[]>>('/admin-management/permissions/current');
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Real-time Analytics
  async getRealTimeMetrics(): Promise<any> {
    const response = await apiClient.get('/analytics/real-time-metrics');
    return response.data.data;
  },

  async getUserActivities(): Promise<any[]> {
    const response = await apiClient.get('/analytics/user-activities');
    return response.data.data || [];
  },

  async getPerformanceAlerts(): Promise<any[]> {
    const response = await apiClient.get('/analytics/performance-alerts');
    return response.data.data || [];
  },

  async getPerformanceMetrics(days: number = 7): Promise<any> {
    const response = await apiClient.get(`/analytics/performance-metrics?days=${days}`);
    return response.data.data;
  },

  async getDashboardStats(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/dashboard-stats');
    return response.data.data;
  },

  async getAnalyticsDashboard(days: number = 7): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/analytics/dashboard?days=${days}`);
    return response.data;
  },

  async getPopularPages(days: number = 7): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/analytics/popular-pages?days=${days}`);
    return response.data;
  },

  async getFeatureUsage(days: number = 7): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/analytics/feature-usage?days=${days}`);
    return response.data;
  },

  async getUserJourney(userId: string, days: number = 7): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/analytics/user-journey/${userId}?days=${days}`);
    return response.data;
  },

  async getBounceRate(days: number = 7): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/analytics/bounce-rate?days=${days}`);
    return response.data;
  },

  // Elasticsearch
  async getElasticsearchStats(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/elasticsearch/stats');
    return response.data;
  },

  async searchElasticsearchIndex(indexName: string, size: number = 20): Promise<any> {
    console.log('🔍 API Service: Searching index:', indexName, 'size:', size);
    const response = await apiClient.get<ApiResponse<any>>(`/elasticsearch/search?index=${indexName}&size=${size}`);
    console.log('📊 API Service: Response:', response.data);
    return response.data;
  },

  // Enhanced Analytics Methods
  async getAnalyticsEvents(params: {
    page?: number;
    limit?: number;
    event_type?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<any> {
    const response = await apiClient.get('/analytics/events', { params });
    return response.data;
  },

  async getAnalyticsEventTypes(days: number = 7): Promise<any> {
    const response = await apiClient.get('/analytics/event-types', {
      params: { days }
    });
    return response.data;
  },

  async getAnalyticsUserStats(userId: string, days: number = 30): Promise<any> {
    const response = await apiClient.get(`/analytics/user-stats/${userId}`, {
      params: { days }
    });
    return response.data;
  },

  async getAnalyticsPerformanceMetrics(days: number = 7): Promise<any> {
    const response = await apiClient.get('/analytics/performance-metrics', {
      params: { days }
    });
    return response.data;
  },

  async getAnalyticsUserJourney(userId: string, days: number = 7): Promise<any> {
    const response = await apiClient.get(`/analytics/user-journey/${userId}`, {
      params: { days }
    });
    return response.data;
  },

  async trackAnalyticsEvent(event: any): Promise<any> {
    const response = await apiClient.post('/analytics/track-event', event);
    return response.data;
  }
}; 