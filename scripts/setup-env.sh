#!/bin/bash

# Environment Setup Script for Benalsam
# Creates centralized .env file for all packages

set -e

echo "🔧 Benalsam Environment Setup"
echo "============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env already exists
if [ -f ".env" ]; then
    print_warning ".env file already exists. Creating backup..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

print_status "Creating centralized .env file..."

# Create .env file with all necessary variables
cat > .env << 'EOF'
# ===== BENALSAM ENVIRONMENT CONFIGURATION =====

# Supabase Configuration
SUPABASE_URL=https://dnwreckpeenhbdtapmxr.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/benalsam
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=benalsam
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch Configuration
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200

# Email Configuration (Zoho)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=your_email@zoho.com
SMTP_PASS=your_app_password_here
SMTP_FROM=your_email@zoho.com
SMTP_FROM_NAME=Benalsam

# AI Services Configuration
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_APP_ID=your_app_id
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id

# Expo Configuration
EXPO_PUBLIC_SUPABASE_URL=https://dnwreckpeenhbdtapmxr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_ADMIN_BACKEND_URL=https://admin.benalsam.com/api/v1

# Service URLs (Production)
ADMIN_BACKEND_URL=https://admin.benalsam.com/api/v1
ADMIN_UI_URL=https://admin.benalsam.com
WEB_APP_URL=https://benalsam.com
MOBILE_APP_URL=https://expo.dev

# Service URLs (Local Development)
LOCAL_ADMIN_BACKEND_URL=http://localhost:3002
LOCAL_ADMIN_UI_URL=http://localhost:3003
LOCAL_WEB_APP_URL=http://localhost:5173

# CORS Configuration
CORS_ORIGIN=https://admin.benalsam.com,https://benalsam.com,http://localhost:3000,http://localhost:3003,http://localhost:5173

# Environment
NODE_ENV=production
PORT=3002

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Performance
COMPRESSION_LEVEL=6
CACHE_TTL=3600
SESSION_TIMEOUT=86400000

# Monitoring
HEALTH_CHECK_INTERVAL=30000
METRICS_ENABLED=true
TRACING_ENABLED=false

# Development
DEBUG=false
HOT_RELOAD=false
SOURCE_MAPS=false
EOF

print_status "✅ Centralized .env file created successfully!"

# Copy .env to all packages
print_status "Copying .env to all packages..."

# Copy to admin-backend
if [ -d "packages/admin-backend" ]; then
    cp .env packages/admin-backend/.env
    print_status "✅ Copied to packages/admin-backend/.env"
fi

# Copy to admin-ui
if [ -d "packages/admin-ui" ]; then
    cp .env packages/admin-ui/.env
    print_status "✅ Copied to packages/admin-ui/.env"
fi

# Copy to web
if [ -d "packages/web" ]; then
    cp .env packages/web/.env
    print_status "✅ Copied to packages/web/.env"
fi

# Copy to mobile (if exists)
if [ -d "packages/mobile" ]; then
    cp .env packages/mobile/.env
    print_status "✅ Copied to packages/mobile/.env"
fi

# Update .gitignore files
print_status "Updating .gitignore files..."

# Root .gitignore
if [ ! -f ".gitignore" ]; then
    touch .gitignore
fi

if ! grep -q "\.env" .gitignore; then
    echo "" >> .gitignore
    echo "# Environment files" >> .gitignore
    echo ".env" >> .gitignore
    echo ".env.local" >> .gitignore
    echo ".env.production" >> .gitignore
    echo ".env.backup.*" >> .gitignore
fi

# Package .gitignore files
for package in packages/*/; do
    if [ -d "$package" ]; then
        if [ ! -f "${package}.gitignore" ]; then
            touch "${package}.gitignore"
        fi
        if ! grep -q "\.env" "${package}.gitignore"; then
            echo "" >> "${package}.gitignore"
            echo "# Environment files" >> "${package}.gitignore"
            echo ".env" >> "${package}.gitignore"
            echo ".env.local" >> "${package}.gitignore"
        fi
    fi
done

print_status "✅ Environment setup completed successfully!"

print_warning "Next steps:"
echo "1. Edit .env file with your actual values"
echo "2. Run: ./scripts/copy-env-to-packages.sh"
echo "3. Run: pnpm install"
echo "4. Run: ./scripts/deploy-vps-minimal.sh"

print_status "Environment setup script completed!" 