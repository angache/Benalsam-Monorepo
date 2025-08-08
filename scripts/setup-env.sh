#!/bin/bash

# ===== ENVIRONMENT SETUP SCRIPT =====

echo "🚀 Benalsam Environment Setup"

# Root .env dosyasını oluştur
cat > .env << 'EOF'
# ===== MERKEZI ENVIRONMENT KONFIGURASYONU =====

# === SUPABASE KONFIGURASYONU ===
SUPABASE_URL=https://dnwreckpeenhbdtapmxr.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# === ADMIN BACKEND KONFIGURASYONU ===
NODE_ENV=development
PORT=3002
CORS_ORIGIN=http://localhost:3003,http://localhost:5173,https://admin.benalsam.com,https://benalsam.com

# === JWT KONFIGURASYONU ===
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# === DATABASE KONFIGURASYONU ===
DATABASE_URL=your_database_url_here

# === REDIS KONFIGURASYONU ===
REDIS_URL=redis://localhost:6379

# === ELASTICSEARCH KONFIGURASYONU ===
ELASTICSEARCH_URL=http://localhost:9200

# === EMAIL KONFIGURASYONU ===
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=your_email@zoho.com
SMTP_PASS=your_app_password_here

# === AI SERVICES ===
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# === FIREBASE ===
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_APP_ID=your_firebase_app_id

# === EXPO ===
EXPO_PROJECT_ID=your_expo_project_id
EXPO_OWNER=your_expo_username

# === BUILD ===
BUILD_NUMBER=1
VERSION_NAME=1.0.0

# === SERVICE URLS (LOCAL DEVELOPMENT) ===
ADMIN_BACKEND_URL=http://localhost:3002
ADMIN_UI_URL=http://localhost:3003
WEB_URL=http://localhost:5173
MOBILE_ADMIN_BACKEND_URL=http://192.168.1.6:3002

# === SERVICE URLS (PRODUCTION) ===
PROD_ADMIN_BACKEND_URL=https://admin.benalsam.com
PROD_ADMIN_UI_URL=https://admin.benalsam.com
PROD_WEB_URL=https://benalsam.com
EOF

# Admin backend .env
cat > packages/admin-backend/.env << 'EOF'
# Admin Backend Environment
NODE_ENV=development
PORT=3002
CORS_ORIGIN=http://localhost:3003,http://localhost:5173,https://admin.benalsam.com,https://benalsam.com

# Supabase
SUPABASE_URL=https://dnwreckpeenhbdtapmxr.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=your_database_url_here

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Email
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=your_email@zoho.com
SMTP_PASS=your_app_password_here

# AI Services
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
EOF

# Admin UI .env
cat > packages/admin-ui/.env << 'EOF'
# Admin UI Environment
VITE_API_URL=http://localhost:3002/api/v1
VITE_SUPABASE_URL=https://dnwreckpeenhbdtapmxr.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF

# Web .env
cat > packages/web/.env << 'EOF'
# Web Environment
VITE_API_URL=http://localhost:3002/api/v1
VITE_SUPABASE_URL=https://dnwreckpeenhbdtapmxr.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF

# Mobile .env
cat > packages/mobile/.env << 'EOF'
# Mobile Environment
EXPO_PUBLIC_SUPABASE_URL=https://dnwreckpeenhbdtapmxr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# AI Services
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_APP_ID=your_firebase_app_id

# Expo
EXPO_PROJECT_ID=your_expo_project_id
EXPO_OWNER=your_expo_username

# Admin Backend (Local IP)
EXPO_PUBLIC_ADMIN_BACKEND_URL=http://192.168.1.6:3002

# Build
BUILD_NUMBER=1
VERSION_NAME=1.0.0
EOF

echo "✅ Environment dosyaları oluşturuldu!"
echo "📝 Lütfen .env dosyalarındaki 'your_*_here' değerlerini gerçek değerlerle değiştirin"
echo "🔧 Sonraki adım: pnpm install && pnpm run dev" 