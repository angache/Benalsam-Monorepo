module.exports = {
  apps: [
    {
      name: 'admin-backend',
      cwd: './packages/admin-backend',
      script: 'npx',
      args: 'ts-node src/index.ts',
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
        REDIS_HOST: '209.227.228.96',
        REDIS_PORT: 6379,
        ELASTICSEARCH_URL: 'http://209.227.228.96:9200',
        ELASTICSEARCH_INDEX: 'benalsam_listings',
        SUPABASE_URL: 'https://dnwreckpeenhbdtapmxr.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRud3JlY2twZWVuaGJkdGFwbXhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk5ODA3MCwiZXhwIjoyMDY1NTc0MDcwfQ.b6UNsncrPKXYB-17oyOEx8xY_hbofAx7ObwzKsyhsm4',
        ADMIN_JWT_SECRET: 'your-admin-jwt-secret-key-here'
      },
      log_file: './logs/combined.log',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      instances: 1,
      autorestart: true,
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '1G',
      env_file: '.env'
    },
    {
      name: 'admin-ui',
      cwd: './packages/admin-ui',
      script: 'pnpm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3003,
        VITE_API_URL: 'http://localhost:3002/api/v1',
        VITE_ELASTICSEARCH_URL: 'http://localhost:3002/api/v1/elasticsearch'
      },
      log_file: './logs/combined.log',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      instances: 1,
      autorestart: true,
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_memory_restart: '1G'
    },
    {
      name: 'web',
      cwd: './packages/web',
      script: 'pnpm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 5173,
        VITE_API_URL: 'http://localhost:3002/api/v1',
        VITE_SUPABASE_URL: 'https://dnwreckpeenhbdtapmxr.supabase.co'
      },
      log_file: './logs/combined.log',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      instances: 1,
      autorestart: true,
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_memory_restart: '1G'
    },
    {
      name: 'mobile-dev-server',
      cwd: './packages/mobile',
      script: 'npx',
      args: 'expo start --dev-client',
      env: {
        NODE_ENV: 'development',
        EXPO_PORT: 8081
      },
      log_file: './logs/combined.log',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      instances: 1,
      autorestart: true,
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs', '.expo'],
      max_memory_restart: '1G'
    }
  ]
}; 