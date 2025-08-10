# 🚀 VPS Deployment - Quick Start Guide

## 📋 **VPS'de Hızlı Kurulum (ROOT)**

### **1. Projeyi VPS'e İndir:**
```bash
# VPS'e SSH ile bağlan
ssh root@YOUR_VPS_IP

# Projeyi clone et
git clone https://github.com/angache/Benalsam-Monorepo.git
cd Benalsam-Monorepo
git checkout feature/cto-technical-audit-faz1-complete
```

### **2. Environment Dosyasını Hazırla:**
```bash
# .env dosyasını oluştur
cp env.consolidated.example .env

# .env dosyasını düzenle (production değerleri gir)
nano .env
```

**Önemli .env değerleri:**
```bash
NODE_ENV=production
CORS_ORIGIN=https://benalsam.com,https://admin.benalsam.com
VITE_API_URL=https://benalsam.com/api/v1
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

### **3. Root Deployment Script'ini Çalıştır:**
```bash
# Script'i çalıştırılabilir yap
chmod +x scripts/deploy-vps-production-root.sh

# Deployment'ı başlat
./scripts/deploy-vps-production-root.sh
```

### **4. Firewall Ayarları:**
```bash
# Gerekli portları aç
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 3002  # Admin Backend
ufw allow 3003  # Admin UI
ufw allow 9200  # Elasticsearch
ufw allow 6379  # Redis

# Firewall'u etkinleştir
ufw enable
```

### **5. Servisleri Kontrol Et:**
```bash
# Container'ların durumu
docker-compose -f docker-compose.production.yml ps

# Logları kontrol et
docker-compose -f docker-compose.production.yml logs -f

# Resource kullanımı
docker stats
```

## 🌐 **Servis URL'leri**

Deployment tamamlandıktan sonra:

- **Web:** `http://YOUR_VPS_IP:80`
- **Admin UI:** `http://YOUR_VPS_IP:3003`
- **Admin Backend:** `http://YOUR_VPS_IP:3002`
- **Elasticsearch:** `http://YOUR_VPS_IP:9200`
- **Redis:** `YOUR_VPS_IP:6379`

## 🔧 **Yönetim Komutları**

```bash
# Servisleri durdur
docker-compose -f docker-compose.production.yml down

# Servisleri yeniden başlat
docker-compose -f docker-compose.production.yml restart

# Servisleri güncelle
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Logları takip et
docker-compose -f docker-compose.production.yml logs -f

# Resource kullanımı
docker stats
```

## ⚠️ **Önemli Notlar**

### **Sistem Gereksinimleri:**
- **Minimum:** 4GB RAM, 2 vCPU, 20GB disk
- **Önerilen:** 8GB RAM, 4 vCPU, 50GB SSD

### **Güvenlik:**
- Root olarak çalışıyorsunuz, dikkatli olun
- .env dosyasını güvenli tutun
- Firewall ayarlarını kontrol edin

### **Monitoring:**
- Resource kullanımını takip edin
- Logları düzenli kontrol edin
- Backup almayı unutmayın

## 🆘 **Sorun Giderme**

### **Servis Başlamıyorsa:**
```bash
# Logları kontrol et
docker-compose -f docker-compose.production.yml logs [service_name]

# Container'ı yeniden başlat
docker-compose -f docker-compose.production.yml restart [service_name]

# Tüm servisleri yeniden başlat
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d
```

### **Memory Sorunu:**
```bash
# Resource kullanımını kontrol et
free -h
docker stats

# Gereksiz container'ları temizle
docker system prune -f
```

### **Disk Sorunu:**
```bash
# Disk kullanımını kontrol et
df -h

# Docker image'larını temizle
docker system prune -a -f
```

## ✅ **Başarılı Deployment Kontrolü**

Deployment başarılı olduğunda şunları göreceksiniz:

```
🎉 VPS Production Deployment (ROOT) tamamlandı!
🌐 Servisler:
   Web: http://localhost:80
   Admin UI: http://localhost:3003
   Admin Backend: http://localhost:3002
   Elasticsearch: http://localhost:9200
   Redis: localhost:6379
```

**Tüm servisler "Healthy" durumunda olmalı!** 🎯
