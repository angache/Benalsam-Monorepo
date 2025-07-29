# 🗑️ Deprecated Files

Bu klasör, artık kullanılmayan veya eski versiyonları olan dosyaları içerir.

## 📁 Klasör Yapısı

### 🔧 **scripts/**
Eski script dosyaları:
- `admin-status.sh` - Eski admin durum kontrol script'i (PM2 kullanmıyor)
- `check-offers.js` - Test script'i
- `copy-env-to-packages.sh` - Eski environment copy script'i
- `copy-env-to-vps.sh` - Eski VPS deployment script'i
- `deploy-cleanup.sh` - Eski VPS cleanup deployment script'i
- `deploy.sh` - Eski deployment script'i
- `deploy-vps.sh` - Eski VPS deployment script'i
- `generate-fake-listings.js` - Test verisi oluşturma script'i
- `remove_inventory_item_id.sql` - Tek seferlik SQL script'i
- `start-admin-all.sh` - Eski admin başlatma script'i (npm kullanıyor)
- `start-admin-backend.sh` - Eski backend başlatma script'i (npm kullanıyor)
- `start-admin-ui.sh` - Eski UI başlatma script'i (npm kullanıyor)
- `start-local.sh` - Eski local deployment script'i
- `start-vm.sh` - Eski VM deployment script'i
- `start-vps.sh` - Eski VPS deployment script'i
- `stop-admin-all.sh` - Eski admin durdurma script'i (npm kullanıyor)
- `update-mobile-imports.js` - Geçici import düzeltme script'i
- `validate-config.sh` - Eski config validation script'i
- `vps-cleanup.sh` - Eski VPS cleanup script'i

### ⚙️ **ecosystem/**
Eski PM2 ecosystem dosyaları:
- `ecosystem.local.js` - Eski local config
- `ecosystem.production.config.js` - Eski production config
- `ecosystem.vm.js` - Eski VM config
- `ecosystem.vps.js` - Eski VPS config

### 🌍 **environment/**
Eski environment dosyaları:
- `env.local.example` - Eski local environment template
- `env.vps` - Eski VPS environment

### 📱 **mobile-scripts/**
Eski mobile script dosyaları:
- `migrate-categories-to-supabase.js` - Tek seferlik migration script'i
- `new-categories-copy.json` - Büyük JSON dosyası (1MB+)

## ⚠️ Önemli Notlar

- Bu dosyalar **artık kullanılmıyor**
- Gerektiğinde referans için saklanıyor
- **SİLMEYİN** - Gelecekte gerekebilir
- Yeni geliştirmeler için bu dosyaları kullanmayın

## 🔄 Güncel Kullanım

### PM2 Ecosystem
```bash
# Güncel kullanım
pm2 start ecosystem.config.js
```

### Deployment
```bash
# Güncel kullanım
pm2 start ecosystem.config.js --only admin-backend
pm2 start ecosystem.config.js --only admin-ui
```

### Environment
```bash
# Güncel kullanım
# Environment variables ecosystem.config.js içinde tanımlanıyor
```

---

**Son Güncelleme:** 2025-01-09  
**Sebep:** Proje temizliği ve organizasyon  
**Toplam Dosya:** 29 dosya 