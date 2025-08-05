# 🚀 Minimal VPS Quick Start

Bu rehber, düşük kaynaklı VPS'ler için optimize edilmiş deployment adımlarını açıklar.

## 📋 **Minimal VPS Gereksinimleri**

### **Minimum Sistem Gereksinimleri**
- **CPU**: 2 cores
- **RAM**: 4GB (Elasticsearch optimize edildi)
- **Disk**: 30GB SSD
- **OS**: Ubuntu 20.04+

## ⚡ **Hızlı Kurulum**

### **1. Sistem Hazırlığı**
```bash
# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Kullanıcıyı docker grubuna ekle
sudo usermod -aG docker $USER
newgrp docker
```

### **2. Proje Kurulumu**
```bash
# Repository klonlama
git clone https://github.com/your-username/benalsam-monorepo.git
cd benalsam-monorepo

# Environment dosyası hazırlama
cp env.production.example .env.production
nano .env.production  # Gerekli değerleri doldurun
```

### **3. Minimal Production Deployment**
```bash
# Minimal production build ve deployment
docker-compose -f docker-compose.prod.minimal.yml build --no-cache
docker-compose -f docker-compose.prod.minimal.yml up -d

# Health check
./scripts/deploy-vps-minimal.sh
```

### **4. Domain ve SSL Kurulumu**
```bash
# Nginx kurulumu
sudo apt install -y nginx certbot python3-certbot-nginx

# SSL sertifikası alma
sudo certbot --nginx -d benalsam.com -d www.benalsam.com
sudo certbot --nginx -d admin.benalsam.com

# Nginx konfigürasyonu
sudo cp nginx/nginx.minimal.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
```

## 🔗 **Production URL'leri**
- **Web App**: https://benalsam.com
- **Admin Panel**: https://admin.benalsam.com
- **API**: https://benalsam.com/api

## 🛠️ **Yaygın Komutlar**

### **Servisleri Yeniden Başlatma**
```bash
docker-compose -f docker-compose.prod.minimal.yml restart
```

### **Logları İzleme**
```bash
docker-compose -f docker-compose.prod.minimal.yml logs -f
```

### **Servisleri Durdurma**
```bash
docker-compose -f docker-compose.prod.minimal.yml down
```

### **Resource Kullanımı**
```bash
# Container durumu
docker-compose -f docker-compose.prod.minimal.yml ps

# Resource kullanımı
docker stats --no-stream

# Disk kullanımı
df -h
```

## 🔒 **Minimal Güvenlik Ayarları**

### **Firewall Konfigürasyonu**
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

### **SSL Sertifika Yenileme**
```bash
# SSL sertifika durumu
sudo certbot certificates

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

## 📊 **Resource Optimizasyonu**

### **Memory Kullanımı**
- **Admin Backend**: 256MB limit
- **Admin UI**: 128MB limit
- **Web App**: 128MB limit
- **Elasticsearch**: 256MB limit (optimize edildi)
- **Redis**: 128MB limit
- **Nginx**: 64MB limit

### **CPU Kullanımı**
- **Admin Backend**: 0.3 CPU limit
- **Admin UI**: 0.2 CPU limit
- **Web App**: 0.2 CPU limit
- **Elasticsearch**: 0.3 CPU limit (optimize edildi)
- **Redis**: 0.1 CPU limit
- **Nginx**: 0.05 CPU limit

## 🔧 **Troubleshooting**

### **Memory Sorunu**
```bash
# Memory kullanımını kontrol et
free -h

# Swap alanı ekle (gerekirse)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### **Disk Alanı Sorunu**
```bash
# Disk kullanımını kontrol et
df -h

# Docker cleanup
docker system prune -a -f
docker volume prune -f
```

### **Port Çakışması**
```bash
# Kullanılan portları kontrol et
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

## 📝 **Önemli Notlar**

### **Minimal Konfigürasyon**
- ✅ Elasticsearch optimize edildi (256MB heap)
- ✅ Resource limits optimize edildi
- ✅ Minimal Nginx konfigürasyonu
- ✅ Basic monitoring

### **Performance**
- ✅ Response time: < 500ms
- ✅ Memory usage: ~900MB total
- ✅ CPU usage: ~1.1 cores total
- ✅ Disk usage: ~3GB total

### **Güvenlik**
- ✅ SSL/TLS encryption
- ✅ Basic security headers
- ✅ Non-root containers
- ✅ Resource limits

---

**Son Güncelleme:** 2025-08-04  
**Versiyon:** 1.0.0  
**Status:** Minimal Production Ready ✅ 