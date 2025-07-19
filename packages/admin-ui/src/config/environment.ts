// Environment-based configuration for admin-ui
export interface EnvironmentConfig {
  apiUrl: string;
  wsUrl: string;
  environment: 'development' | 'production';
  elasticsearchUrl: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  // VPS IP address
  const VPS_IP = '209.227.228.96';
  
  // Check if we're running on VPS (by checking if we can access VPS IP)
  const isVPS = window.location.hostname === VPS_IP || window.location.hostname === '209.227.228.96';
  
  // For local development (both Docker and local), use localhost
  if (isDevelopment && !isVPS) {
    return {
      apiUrl: 'http://localhost:3002',
      wsUrl: 'ws://localhost:3003',
      environment: 'development',
      elasticsearchUrl: 'http://localhost:3002/api/v1/elasticsearch'
    };
  }
  
  // VPS environment (both development and production)
  return {
    apiUrl: `http://${VPS_IP}:3002`,
    wsUrl: `ws://${VPS_IP}:3003`,
    environment: 'production',
    elasticsearchUrl: `http://${VPS_IP}:3002/api/v1/elasticsearch`
  };
};

export const config = getEnvironmentConfig();

// Environment variables for Vite
export const VITE_CONFIG = {
  API_URL: config.apiUrl,
  WS_URL: config.wsUrl,
  ENVIRONMENT: config.environment,
  ELASTICSEARCH_URL: config.elasticsearchUrl
};

// Log configuration for debugging
console.log('🔧 Environment Config:', {
  environment: config.environment,
  apiUrl: config.apiUrl,
  elasticsearchUrl: config.elasticsearchUrl,
  hostname: window.location.hostname
}); 