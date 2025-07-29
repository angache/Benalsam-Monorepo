module.exports = {
  apps: [
    {
      name: 'admin-backend',
      cwd: './packages/admin-backend',
      script: 'pnpm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        ELASTICSEARCH_URL: 'http://localhost:9200',
        ELASTICSEARCH_INDEX: 'benalsam_listings',
        SUPABASE_URL: 'https://dnwreckpeenhbdtapmxr.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRud3JlY2twZWVuaGJkdGFwbXhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk5ODA3MCwiZXhwIjoyMDY1NTc0MDcwfQ.b6UNsncrPKXYB-17oyOEx8xY_hbofAx7ObwzKsyhsm4',
        ADMIN_JWT_SECRET: 'your-admin-jwt-secret-key-here'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'admin-ui',
      cwd: './packages/admin-ui',
      script: 'pnpm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3003,
        VITE_API_URL: 'http://localhost:3002',
        VITE_ELASTICSEARCH_URL: 'http://localhost:9200',
        VITE_SUPABASE_URL: 'https://dnwreckpeenhbdtapmxr.supabase.co'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'web',
      cwd: './packages/web',
      script: 'pnpm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 5173,
        VITE_API_URL: 'http://localhost:3002',
        VITE_ELASTICSEARCH_URL: 'http://localhost:9200',
        VITE_SUPABASE_URL: 'https://dnwreckpeenhbdtapmxr.supabase.co'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}; 