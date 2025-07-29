#!/bin/bash

# VPS Temizlik Scripti - Benalsam
# Bu script VPS'te disk alanını temizler ve 21GB boş alan sağlar

set -e  # Hata durumunda script'i durdur

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Başlangıç disk durumu
log "VPS Temizlik Scripti Başlatılıyor..."
log "Başlangıç disk durumu:"
df -h /

# Disk kullanımını kontrol et
AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
AVAILABLE_SPACE_GB=$(echo "scale=1; $AVAILABLE_SPACE/1024/1024" | bc)

log "Mevcut boş alan: ${AVAILABLE_SPACE_GB}GB"

# 1. Docker Servislerini Durdur
log "1. Docker servisleri durduruluyor..."
if command -v docker &> /dev/null; then
    # Çalışan container'ları durdur
    RUNNING_CONTAINERS=$(docker ps -q)
    if [ ! -z "$RUNNING_CONTAINERS" ]; then
        log "Çalışan container'lar durduruluyor..."
        docker stop $RUNNING_CONTAINERS || warn "Container durdurma hatası"
    fi
    
    # Tüm container'ları sil
    ALL_CONTAINERS=$(docker ps -aq)
    if [ ! -z "$ALL_CONTAINERS" ]; then
        log "Tüm container'lar siliniyor..."
        docker rm $ALL_CONTAINERS || warn "Container silme hatası"
    fi
else
    warn "Docker bulunamadı"
fi

# 2. Docker Cache Temizliği
log "2. Docker cache temizleniyor..."
if command -v docker &> /dev/null; then
    log "Docker system prune çalıştırılıyor..."
    docker system prune -a --volumes -f || warn "Docker prune hatası"
    
    # Docker overlay2 temizliği (gerekirse)
    if [ -d "/var/lib/docker/overlay2" ]; then
        log "Docker overlay2 dizini kontrol ediliyor..."
        OVERLAY_SIZE=$(du -sh /var/lib/docker/overlay2 2>/dev/null | cut -f1)
        log "Overlay2 boyutu: $OVERLAY_SIZE"
    fi
fi

# 3. Eski Proje Dosyalarını Temizle
log "3. Eski proje dosyaları temizleniyor..."
PROJECT_DIRS=(
    "/opt/benalsam-admin/benalsam-monorepo"
    "/opt/benalsam-monorepo"
    "/root/benalsam-monorepo"
    "/home/ubuntu/benalsam-monorepo"
)

for dir in "${PROJECT_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log "Siliniyor: $dir"
        rm -rf "$dir"
    fi
done

# 4. Sistem Cache Temizliği
log "4. Sistem cache'leri temizleniyor..."
apt-get clean || warn "apt-get clean hatası"
apt-get autoremove -y || warn "apt-get autoremove hatası"

# 5. Log Dosyalarını Temizle
log "5. Log dosyaları temizleniyor..."
find /var/log -name "*.log" -size +10M -delete 2>/dev/null || true
find /var/log -name "*.gz" -delete 2>/dev/null || true
rm -rf /tmp/* /var/tmp/* 2>/dev/null || true

# 6. Journal Log Temizliği
log "6. Journal log'ları temizleniyor..."
journalctl --vacuum-time=1d || warn "Journal temizleme hatası"

# 7. Node.js Cache Temizliği
log "7. Node.js cache'leri temizleniyor..."
rm -rf /root/.npm /root/.cache /root/.node-gyp 2>/dev/null || true
rm -rf /home/ubuntu/.npm /home/ubuntu/.cache /home/ubuntu/.node-gyp 2>/dev/null || true

# 8. Nginx Log Temizliği
log "8. Nginx log'ları temizleniyor..."
if [ -d "/var/log/nginx" ]; then
    find /var/log/nginx -name "*.log" -size +10M -delete 2>/dev/null || true
fi

# 9. Sistem Güncellemeleri
log "9. Sistem güncellemeleri kontrol ediliyor..."
apt-get update || warn "apt-get update hatası"

# 10. Gereksiz Paketleri Kaldır
log "10. Gereksiz paketler kaldırılıyor..."
apt-get autoremove --purge -y || warn "Gereksiz paket kaldırma hatası"

# Son disk durumu
log "Temizlik tamamlandı!"
log "Son disk durumu:"
df -h /

# Temizlik sonuçları
FINAL_AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
FINAL_AVAILABLE_SPACE_GB=$(echo "scale=1; $FINAL_AVAILABLE_SPACE/1024/1024" | bc)
SPACE_GAINED=$(echo "scale=1; $FINAL_AVAILABLE_SPACE_GB - $AVAILABLE_SPACE_GB" | bc)

log "Temizlik öncesi: ${AVAILABLE_SPACE_GB}GB"
log "Temizlik sonrası: ${FINAL_AVAILABLE_SPACE_GB}GB"
log "Kazanılan alan: ${SPACE_GAINED}GB"

# Başarı kontrolü
if (( $(echo "$FINAL_AVAILABLE_SPACE_GB >= 21" | bc -l) )); then
    log "✅ HEDEF BAŞARILI: 21GB+ boş alan elde edildi!"
    exit 0
else
    warn "⚠️  HEDEF BAŞARISIZ: 21GB boş alan elde edilemedi"
    warn "Mevcut boş alan: ${FINAL_AVAILABLE_SPACE_GB}GB"
    exit 1
fi 