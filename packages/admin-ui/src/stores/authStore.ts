import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../types';
import { apiService } from '../services/api';

interface AuthState {
  // State
  user: AdminUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  setUser: (user: AdminUser) => void;
  setToken: (token: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiService.login({ email, password });
          
          if (response.success) {
            const { admin, token, refreshToken } = response.data;
            
            set({
              user: admin,
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Store tokens in localStorage
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_refresh_token', refreshToken);
            
            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || 'Login failed',
            });
            return false;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      logout: () => {
        // Clear tokens from localStorage
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      refreshAuth: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) return false;

          const response = await apiService.refreshToken();
          
          if (response.success) {
            const { admin, token, refreshToken: newRefreshToken } = response.data;
            
            set({
              user: admin,
              token,
              refreshToken: newRefreshToken,
              isAuthenticated: true,
            });

            // Update tokens in localStorage
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_refresh_token', newRefreshToken);
            
            return true;
          }
          return false;
        } catch {
          get().logout();
          return false;
        }
      },

      setUser: (user: AdminUser) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
        localStorage.setItem('admin_token', token);
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 