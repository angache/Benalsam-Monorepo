#!/bin/bash

# ⚡ Hızlı Supabase Yedekleme Scripti
# Sadece dosyaları yedekler, veritabanı dump'ı yapmaz

set -e

# Renkli çıktılar
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}"
}

# Supabase backups klasörü oluştur
mkdir -p "supabase/backups"

# Yedek klasörü
BACKUP_DIR="supabase/backups/backup_$(date +%Y%m%d_%H%M%S)"
log "📁 Yedek klasörü: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Migration dosyaları
log "📋 Migration dosyaları..."
if [ -d "supabase/migrations" ]; then
    cp -r supabase/migrations "$BACKUP_DIR/"
    log "✅ Migration dosyaları kopyalandı"
else
    warn "Migration klasörü yok"
fi

# Config dosyası
log "⚙️ Config dosyası..."
if [ -f "supabase/config.toml" ]; then
    cp supabase/config.toml "$BACKUP_DIR/"
    log "✅ Config kopyalandı"
else
    warn "Config dosyası yok"
fi

# Proje bilgileri
log "📝 Bilgiler kaydediliyor..."
cat > "$BACKUP_DIR/INFO.md" << EOF
# ⚡ Hızlı Yedek - $(date)

## 📁 İçerik
- Migration dosyaları
- Config dosyası (varsa)

## 🎯 Proje
- BenAlsamExpo
- Supabase: benalsam2025

## 📊 Boyut
$(du -sh "$BACKUP_DIR" | cut -f1)

## 🔧 Kullanım
\`\`\`bash
# Hızlı yedek al
./quick_backup.sh

# Tam yedek al (veritabanı ile)
./backup_supabase.sh
\`\`\`

## 📍 Konum
\`$BACKUP_DIR\`
EOF

# Sonuç
log "🎉 Hızlı yedek tamamlandı!"
echo -e "${BLUE}📁 Klasör: $BACKUP_DIR${NC}"
echo -e "${BLUE}📏 Boyut: $(du -sh "$BACKUP_DIR" | cut -f1)${NC}"
ls -la "$BACKUP_DIR" 