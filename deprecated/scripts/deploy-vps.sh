#!/bin/bash

# 🚀 VPS Deployment Script
# Bu script VPS'de production deployment yapar

set -e  # Hata durumunda script'i durdur

echo "🚀 Benalsam VPS Deployment başlıyor..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="209.227.228.96"
VPS_USER="root"
PROJECT_PATH="/var/www/benalsam"
REPO_URL="https://github.com/angache/Benalsam-Monorepo.git"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running on VPS
if [[ "$HOSTNAME" != *"209.227.228.96"* ]]; then
    log_warning "Bu script VPS'de çalıştırılmalıdır!"
    log_info "VPS'e bağlan: ssh root@209.227.228.96"
    exit 1
fi

# 1. System Update
log_info "Sistem güncellemeleri kontrol ediliyor..."
apt update -y
apt upgrade -y

# 2. Node.js Check
log_info "Node.js versiyonu kontrol ediliyor..."
if ! command -v node &> /dev/null; then
    log_error "Node.js kurulu değil!"
    log_info "Node.js kuruluyor..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
log_success "Node.js $NODE_VERSION kurulu"

# 3. PM2 Check
log_info "PM2 kontrol ediliyor..."
if ! command -v pm2 &> /dev/null; then
    log_info "PM2 kuruluyor..."
    npm install -g pm2
fi

PM2_VERSION=$(pm2 --version)
log_success "PM2 $PM2_VERSION kurulu"

# 4. Project Directory
log_info "Proje dizini kontrol ediliyor..."
if [ ! -d "$PROJECT_PATH" ]; then
    log_info "Proje dizini oluşturuluyor..."
    mkdir -p "$PROJECT_PATH"
    cd "$PROJECT_PATH"
    git clone "$REPO_URL" .
else
    log_info "Proje dizini mevcut, güncelleniyor..."
    cd "$PROJECT_PATH"
    git fetch origin
    git reset --hard origin/main
fi

# 5. Dependencies
log_info "Dependencies kuruluyor..."
pnpm install

# 6. Build
log_info "Production build yapılıyor..."
pnpm run build

# 7. Environment Setup
log_info "Environment dosyası kontrol ediliyor..."
if [ ! -f ".env" ]; then
    log_warning ".env dosyası bulunamadı!"
    log_info "Production environment template'i kopyalanıyor..."
    cp scripts/env.production.template .env
    log_warning "⚠️  Lütfen .env dosyasını düzenleyin!"
    log_info "Özellikle şu değerleri güncelleyin:"
    log_info "  - SUPABASE_SERVICE_ROLE_KEY"
    log_info "  - SUPABASE_ANON_KEY" 
    log_info "  - ADMIN_JWT_SECRET"
    log_info "  - REDIS_HOST (gerekirse)"
    log_info "  - ELASTICSEARCH_URL (gerekirse)"
else
    log_success ".env dosyası mevcut"
fi

# 8. PM2 Setup
log_info "PM2 servisleri durduruluyor..."
pm2 delete all 2>/dev/null || true

log_info "PM2 production servisleri başlatılıyor..."
pm2 start ecosystem.production.config.js

# 9. PM2 Startup
log_info "PM2 startup script oluşturuluyor..."
pm2 startup
pm2 save

# 10. Firewall Setup
log_info "Firewall portları açılıyor..."
ufw allow 3002/tcp  # Admin Backend
ufw allow 3003/tcp  # Admin UI
ufw allow 5173/tcp  # Web

# 11. Status Check
log_info "Servis durumu kontrol ediliyor..."
sleep 5
pm2 status

# 12. Health Check
log_info "Health check yapılıyor..."
if curl -s http://localhost:3002/api/v1/health > /dev/null; then
    log_success "Admin Backend çalışıyor!"
else
    log_error "Admin Backend çalışmıyor!"
fi

if curl -s http://localhost:3003 > /dev/null; then
    log_success "Admin UI çalışıyor!"
else
    log_error "Admin UI çalışmıyor!"
fi

if curl -s http://localhost:5173 > /dev/null; then
    log_success "Web çalışıyor!"
else
    log_error "Web çalışmıyor!"
fi

# 13. Final Status
log_success "🎉 VPS Deployment tamamlandı!"
echo ""
echo "📊 Servis Durumu:"
echo "  🌐 Admin Backend: http://$VPS_IP:3002"
echo "  🎛️  Admin UI: http://$VPS_IP:3003"
echo "  🌍 Web: http://$VPS_IP:5173"
echo ""
echo "🔧 Yönetim Komutları:"
echo "  📊 Status: pm2 status"
echo "  📝 Logs: pm2 logs"
echo "  🔄 Restart: pm2 restart all"
echo "  🛑 Stop: pm2 stop all"
echo "  ▶️  Start: pm2 start all"
echo ""
echo "📈 Monitoring:"
echo "  📊 PM2 Monitor: pm2 monit"
echo "  🌐 PM2 Plus: pm2 plus"
echo ""
log_success "Deployment başarılı! 🚀" 