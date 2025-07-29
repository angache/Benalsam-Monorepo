#!/bin/bash

# VPS Temizlik Deploy Scripti - Benalsam
# Bu script VPS'e temizlik script'ini yükler ve çalıştırır

set -e

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Log fonksiyonu
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# VPS IP adresi
VPS_IP="209.227.228.96"
VPS_USER="root"

# Script dosyası kontrolü
if [ ! -f "vps-cleanup.sh" ]; then
    error "vps-cleanup.sh dosyası bulunamadı!"
    exit 1
fi

log "VPS Temizlik Deploy Scripti Başlatılıyor..."
log "VPS IP: $VPS_IP"
log "Kullanıcı: $VPS_USER"

# 1. VPS bağlantısını test et
log "1. VPS bağlantısı test ediliyor..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $VPS_USER@$VPS_IP "echo 'Bağlantı başarılı'" 2>/dev/null; then
    error "VPS bağlantısı başarısız! SSH key ayarlarını kontrol edin."
    exit 1
fi

# 2. VPS'te başlangıç disk durumu
log "2. VPS başlangıç disk durumu:"
ssh $VPS_USER@$VPS_IP "df -h /"

# 3. Temizlik script'ini VPS'e yükle
log "3. Temizlik script'i VPS'e yükleniyor..."
scp vps-cleanup.sh $VPS_USER@$VPS_IP:/tmp/

# 4. Script'i çalıştırılabilir yap
log "4. Script çalıştırılabilir yapılıyor..."
ssh $VPS_USER@$VPS_IP "chmod +x /tmp/vps-cleanup.sh"

# 5. Temizlik script'ini çalıştır
log "5. Temizlik script'i çalıştırılıyor..."
ssh $VPS_USER@$VPS_IP "/tmp/vps-cleanup.sh"

# 6. Temizlik script'ini sil
log "6. Geçici dosyalar temizleniyor..."
ssh $VPS_USER@$VPS_IP "rm -f /tmp/vps-cleanup.sh"

# 7. Son disk durumu
log "7. Son disk durumu:"
ssh $VPS_USER@$VPS_IP "df -h /"

log "✅ VPS temizlik işlemi tamamlandı!"
log "Artık yeni projeyi deploy edebilirsiniz."

echo ""
echo "Sonraki adımlar:"
echo "1. git clone https://github.com:angache/Benalsam-Monorepo.git"
echo "2. cd Benalsam-Monorepo"
echo "3. npm run build:docker"
echo "4. docker-compose up -d" 