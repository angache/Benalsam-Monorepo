# 🚀 Local Development - Quick Start

## 📋 **Gereksinimler**
- Docker & Docker Compose
- Git
- Node.js 18+ (opsiyonel)

## ⚡ **Hızlı Başlangıç**

### **1. Repository Klonlama**
```bash
git clone https://github.com/your-username/benalsam-monorepo.git
cd benalsam-monorepo
```

### **2. Environment Dosyası**
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

### **3. Development Servislerini Başlatma**
```bash
# Tüm servisleri başlat
docker-compose -f docker-compose.dev.yml up -d

# Logları kontrol et
docker-compose -f docker-compose.dev.yml logs -f
```

### **4. Health Check**
```bash
# Servislerin durumunu kontrol et
curl http://localhost:3002/health  # Admin Backend
curl http://localhost:3003/         # Admin UI
curl http://localhost:5173/         # Web App
curl http://localhost:9200/         # Elasticsearch
```

## 🔗 **Erişim URL'leri**
- **Admin Backend**: http://localhost:3002
- **Admin UI**: http://localhost:3003
- **Web App**: http://localhost:5173
- **Elasticsearch**: http://localhost:9200

## 🛠️ **Yaygın Komutlar**

### **Servisleri Yeniden Başlatma**
```bash
docker-compose -f docker-compose.dev.yml restart
```

### **Logları İzleme**
```bash
docker-compose -f docker-compose.dev.yml logs -f [service-name]
```

### **Servisleri Durdurma**
```bash
docker-compose -f docker-compose.dev.yml down
```

### **Temizlik**
```bash
docker system prune -f
docker volume prune -f
```

## 🔧 **Troubleshooting**

### **Port Çakışması**
```bash
# Kullanılan portları kontrol et
lsof -i :3002
lsof -i :3003
lsof -i :5173
```

### **Permission Sorunu**
```bash
# Docker grubuna kullanıcı ekle
sudo usermod -aG docker $USER
newgrp docker
```

### **Build Sorunu**
```bash
# Cache'i temizle ve yeniden build et
docker-compose -f docker-compose.dev.yml build --no-cache
```

## 📝 **Notlar**
- Hot reload aktif
- Volume mount'lar sayesinde kod değişiklikleri anında yansır
- Development modunda debug logları açık
- Health check'ler otomatik çalışır

---
**Son Güncelleme:** 2025-08-04  
**Versiyon:** 1.0.0 