module.exports = {
  apps: [
    {
      name: 'admin-backend',
      cwd: './packages/admin-backend',
      script: 'pnpm',
      args: 'start', // production build
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        REDIS_HOST: '209.227.228.96', // VPS IP
        REDIS_PORT: 6379,
        ELASTICSEARCH_URL: 'http://209.227.228.96:9200', // VPS IP
        ELASTICSEARCH_INDEX: 'benalsam_listings',
        SUPABASE_URL: 'https://dnwreckpeenhbdtapmxr.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'your_service_role_key_here',
        ADMIN_JWT_SECRET: 'your_jwt_secret_here'
      },
      instances: 'max', // CPU core sayısı kadar
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      autorestart: true,
      watch: false, // Production'da watch kapalı
      ignore_watch: ['node_modules', 'logs'],
      env_file: '.env'
    },
    {
      name: 'admin-ui',
      cwd: './packages/admin-ui',
      script: 'pnpm',
      args: 'start', // production build
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        VITE_API_URL: 'http://209.227.228.96:3002/api/v1', // VPS IP
        VITE_ELASTICSEARCH_URL: 'http://209.227.228.96:3002/api/v1/elasticsearch'
      },
      instances: 1,
      max_memory_restart: '1G',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      autorestart: true,
      watch: false, // Production'da watch kapalı
      ignore_watch: ['node_modules', 'logs', 'dist']
    },
    {
      name: 'web',
      cwd: './packages/web',
      script: 'pnpm',
      args: 'start', // production build
      env: {
        NODE_ENV: 'production',
        PORT: 5173,
        VITE_API_URL: 'http://209.227.228.96:3002/api/v1', // VPS IP
        VITE_SUPABASE_URL: 'https://dnwreckpeenhbdtapmxr.supabase.co'
      },
      instances: 1,
      max_memory_restart: '1G',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      autorestart: true,
      watch: false, // Production'da watch kapalı
      ignore_watch: ['node_modules', 'logs', 'dist']
    }
  ],

  deploy: {
    production: {
      user: 'root', // VPS'de root kullanıcı
      host: '209.227.228.96',
      ref: 'origin/main',
      repo: 'git@github.com:angache/Benalsam-Monorepo.git',
      path: '/var/www/benalsam',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm run build && pm2 reload ecosystem.production.config.js --env production',
      'pre-setup': ''
    }
  }
}; 