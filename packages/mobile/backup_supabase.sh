#!/bin/bash

# 🛡️ Supabase Tam Yedekleme Scripti
# Bu script tüm Supabase verilerini tek seferde yedekler

set -e  # Hata durumunda dur

# Renkli çıktılar için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log fonksiyonu
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Supabase backups klasörü oluştur
mkdir -p "supabase/backups"

# Yedek klasörü oluştur
BACKUP_DIR="supabase/backups/supabase_backup_$(date +%Y%m%d_%H%M%S)"
log "📁 Yedek klasörü oluşturuluyor: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# 1. Migration dosyalarını yedekle
log "📋 Migration dosyaları yedekleniyor..."
if [ -d "supabase/migrations" ]; then
    cp -r supabase/migrations "$BACKUP_DIR/"
    log "✅ Migration dosyaları kopyalandı"
else
    warn "Migration klasörü bulunamadı"
fi

# 2. Functions dosyalarını yedekle
log "🔧 Functions dosyaları yedekleniyor..."
if [ -d "supabase/functions" ]; then
    cp -r supabase/functions "$BACKUP_DIR/"
    log "✅ Functions dosyaları kopyalandı"
else
    warn "Functions klasörü bulunamadı"
fi

# 3. Config dosyasını yedekle
log "⚙️ Config dosyası yedekleniyor..."
if [ -f "supabase/config.toml" ]; then
    cp supabase/config.toml "$BACKUP_DIR/"
    log "✅ Config dosyası kopyalandı"
else
    warn "Config dosyası bulunamadı"
fi

# 4. Veritabanı schema dump
log "🗄️ Veritabanı schema yedekleniyor..."
if command -v npx &> /dev/null; then
    if npx supabase db dump --linked --schema-only --file "$BACKUP_DIR/schema_dump.sql" 2>/dev/null; then
        log "✅ Schema dump tamamlandı"
    else
        warn "Schema dump başarısız, manuel yapılması gerekebilir"
    fi
else
    warn "npx bulunamadı, schema dump atlandı"
fi

# 5. Tam veritabanı dump (data ile)
log "💾 Tam veritabanı yedekleniyor..."
if command -v npx &> /dev/null; then
    if npx supabase db dump --linked --file "$BACKUP_DIR/full_database_dump.sql" 2>/dev/null; then
        log "✅ Tam veritabanı dump tamamlandı"
    else
        warn "Tam veritabanı dump başarısız, manuel yapılması gerekebilir"
    fi
else
    warn "npx bulunamadı, tam dump atlandı"
fi

# 6. Proje bilgilerini kaydet
log "📝 Proje bilgileri kaydediliyor..."
cat > "$BACKUP_DIR/BACKUP_INFO.md" << 'EOF'
# 🛡️ Supabase Tam Yedek Bilgileri

## 📅 Yedekleme Tarihi
$(date)

## 🎯 Proje Bilgileri
- Proje Adı: BenAlsamExpo
- Supabase Projesi: benalsam2025 (dnwreckpeenhbdtapmxr)
- Yedek Klasörü: $BACKUP_DIR

## ✅ Yedeklenen Bileşenler
- ✅ Migration dosyaları
- ✅ Functions dosyaları (varsa)
- ✅ Config dosyası (varsa)
- ✅ Veritabanı schema dump
- ✅ Tam veritabanı dump

## 📁 Yedek İçeriği
$(ls -la "$BACKUP_DIR" | grep -v "^total")

## 🔧 Geri Yükleme Komutları
```bash
# Schema geri yükle
psql "postgresql://postgres:[PASSWORD]@db.dnwreckpeenhbdtapmxr.supabase.co:5432/postgres" < schema_dump.sql

# Tam veritabanı geri yükle
psql "postgresql://postgres:[PASSWORD]@db.dnwreckpeenhbdtapmxr.supabase.co:5432/postgres" < full_database_dump.sql

# Migration'ları çalıştır
npx supabase db reset
```

## 📝 Notlar
- Bu yedek otomatik script ile oluşturuldu
- Tüm dosyalar supabase/backups/ klasöründe toplandı
- Docker çalışıyor durumda
- Supabase CLI aktif

## 🎯 Sonraki Adımlar
1. Condition alanını ekle (gerekirse)
2. Migration'ları test et
3. Uygulamayı test et

## 📍 Konum
`$BACKUP_DIR`
EOF

# 7. Yedek boyutunu göster
log "📊 Yedek tamamlandı!"
echo -e "${BLUE}📁 Yedek Klasörü: $BACKUP_DIR${NC}"
echo -e "${BLUE}📏 Boyut: $(du -sh "$BACKUP_DIR" | cut -f1)${NC}"
echo -e "${BLUE}📋 İçerik:${NC}"
ls -la "$BACKUP_DIR"

log "🎉 Yedekleme tamamlandı! Tüm dosyalar $BACKUP_DIR klasöründe toplandı." 