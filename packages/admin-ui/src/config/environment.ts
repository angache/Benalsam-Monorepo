// Environment-based configuration for admin-ui
export interface EnvironmentConfig {
  apiUrl: string;
  wsUrl: string;
  environment: 'development' | 'production';
  elasticsearchUrl: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  // VPS IP address - always use VPS IP for production
  const VPS_IP = '209.227.228.96';
  
  // Always use VPS IP for production environment
  return {
    apiUrl: `http://${VPS_IP}:3002`,
    wsUrl: `ws://${VPS_IP}:3002`,
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