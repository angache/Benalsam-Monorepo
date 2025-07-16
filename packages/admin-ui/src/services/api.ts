import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginCredentials, 
  AuthResponse, 
  DashboardStats, 
  User, 
  Listing, 
  Category,
  AnalyticsData,
  SystemSettings,
  Notification,
  ApiResponse,
  PaginationParams 
} from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/v1/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/api/v1/auth/logout');
    localStorage.removeItem('admin_token');
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('admin_refresh_token');
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/v1/auth/refresh', { refreshToken });
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    const response: AxiosResponse<ApiResponse<DashboardStats>> = await this.api.get('/api/v1/dashboard/stats');
    return response.data.data;
  }

  async getAnalytics(period: string = '7d'): Promise<AnalyticsData[]> {
    const response: AxiosResponse<ApiResponse<AnalyticsData[]>> = await this.api.get(`/api/v1/dashboard/analytics?period=${period}`);
    return response.data.data;
  }

  // User management endpoints
  async getUsers(params: PaginationParams): Promise<ApiResponse<User[]>> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get('/api/v1/users', { params });
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get(`/api/v1/users/${id}`);
    return response.data.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put(`/api/v1/users/${id}`, data);
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/api/v1/users/${id}`);
  }

  // Listing management endpoints
  async getListings(params: PaginationParams): Promise<ApiResponse<Listing[]>> {
    const response: AxiosResponse<ApiResponse<Listing[]>> = await this.api.get('/api/v1/listings', { params });
    return response.data;
  }

  async getListingById(id: string): Promise<Listing> {
    const response: AxiosResponse<ApiResponse<Listing>> = await this.api.get(`/api/v1/listings/${id}`);
    return response.data.data;
  }

  async updateListing(id: string, data: Partial<Listing>): Promise<Listing> {
    const response: AxiosResponse<ApiResponse<Listing>> = await this.api.put(`/api/v1/listings/${id}`, data);
    return response.data.data;
  }

  async deleteListing(id: string): Promise<void> {
    await this.api.delete(`/api/v1/listings/${id}`);
  }

  async moderateListing(id: string, action: 'approve' | 'reject', reason?: string): Promise<Listing> {
    const response: AxiosResponse<ApiResponse<Listing>> = await this.api.post(`/api/v1/listings/${id}/moderate`, { action, reason });
    return response.data.data;
  }

  // Category management endpoints
  async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<ApiResponse<Category[]>> = await this.api.get('/api/v1/categories');
    return response.data.data;
  }

  async createCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const response: AxiosResponse<ApiResponse<Category>> = await this.api.post('/api/v1/categories', data);
    return response.data.data;
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const response: AxiosResponse<ApiResponse<Category>> = await this.api.put(`/api/v1/categories/${id}`, data);
    return response.data.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/api/v1/categories/${id}`);
  }

  // System settings endpoints
  async getSystemSettings(): Promise<SystemSettings> {
    const response: AxiosResponse<ApiResponse<SystemSettings>> = await this.api.get('/api/v1/settings');
    return response.data.data;
  }

  async updateSystemSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const response: AxiosResponse<ApiResponse<SystemSettings>> = await this.api.put('/api/v1/settings', data);
    return response.data.data;
  }

  // Notification endpoints
  async getNotifications(): Promise<Notification[]> {
    const response: AxiosResponse<ApiResponse<Notification[]>> = await this.api.get('/api/v1/notifications');
    return response.data.data;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.api.put(`/api/v1/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.api.put('/api/v1/notifications/read-all');
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 