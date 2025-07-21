/**
 * Environment Configuration
 * Centralized configuration for different environments
 */

export interface EnvironmentConfig {
  // Supabase configuration (existing)
  supabase: {
    url: string;
    anonKey: string;
  };
  
  // Admin Backend configuration (new)
  adminApi: {
    url: string;
    wsUrl: string;
  };
  
  // Environment detection
  isDevelopment: boolean;
  isProduction: boolean;
  isVPS: boolean;
}

/**
 * Get environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = (import.meta as any).env?.DEV || false;
  const isProduction = (import.meta as any).env?.PROD || false;
  
  // VPS IP address
  const VPS_IP = '209.227.228.96';
  
  // Check if we're running on VPS (by checking if we can access VPS IP)
  const isVPS = typeof window !== 'undefined' && (
    window.location.hostname === VPS_IP || 
    window.location.hostname === '209.227.228.96'
  );

  return {
    // Supabase configuration (existing)
    supabase: {
      url: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://dnwreckpeenhbdtapmxr.supabase.co',
      anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRud3JlY2twZWVuaGJkdGFwbXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTgwNzAsImV4cCI6MjA2NTU3NDA3MH0.2lzsxTj4hoKTcZeoCGMsUC3Cmsm1pgcqXP-3j_GV_Ys',
    },
    
    // Admin Backend configuration (new)
    adminApi: {
      url: (import.meta as any).env?.VITE_ADMIN_API_URL || (
        isVPS 
          ? `http://${VPS_IP}:3002/api/v1`
          : 'http://localhost:3002/api/v1'
      ),
      wsUrl: (import.meta as any).env?.VITE_ADMIN_WS_URL || (
        isVPS 
          ? `ws://${VPS_IP}:3002`
          : 'ws://localhost:3002'
      ),
    },
    
    // Environment detection
    isDevelopment,
    isProduction,
    isVPS,
  };
};

/**
 * Get current environment config
 */
export const config = getEnvironmentConfig();

/**
 * Environment-specific utilities
 */
export const env = {
  /**
   * Check if running in development
   */
  isDev: config.isDevelopment,
  
  /**
   * Check if running in production
   */
  isProd: config.isProduction,
  
  /**
   * Check if running on VPS
   */
  isVPS: config.isVPS,
  
  /**
   * Get admin API URL
   */
  getAdminApiUrl: () => config.adminApi.url,
  
  /**
   * Get admin WebSocket URL
   */
  getAdminWsUrl: () => config.adminApi.wsUrl,
  
  /**
   * Get Supabase URL
   */
  getSupabaseUrl: () => config.supabase.url,
  
  /**
   * Get Supabase anon key
   */
  getSupabaseAnonKey: () => config.supabase.anonKey,
  
  /**
   * Log environment info (development only)
   */
  logEnvironment: () => {
    if (config.isDevelopment) {
      console.log('🔧 Environment Config:', {
        environment: config.isVPS ? 'production' : 'development',
        adminApiUrl: config.adminApi.url,
        adminWsUrl: config.adminApi.wsUrl,
        supabaseUrl: config.supabase.url,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      });
    }
  },
};

// Log environment info in development
if (typeof window !== 'undefined') {
  env.logEnvironment();
}

export default config; 