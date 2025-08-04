# 🚀 VPS Production - Quick Start

## 📋 **VPS Gereksinimleri**
- **CPU**: 4 cores (8 önerilen)
- **RAM**: 8GB (16GB önerilen)
- **Disk**: 50GB SSD (100GB önerilen)
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+

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

### **3. Production Deployment**
```bash
# Production build ve deployment
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Health check
./scripts/deploy-vps.sh
```

### **4. Domain ve SSL Kurulumu**
```bash
# Nginx kurulumu
sudo apt install -y nginx certbot python3-certbot-nginx

# SSL sertifikası alma
sudo certbot --nginx -d benalsam.com -d www.benalsam.com
sudo certbot --nginx -d admin.benalsam.com

# Nginx konfigürasyonu
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
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
docker-compose -f docker-compose.prod.yml restart
```

### **Logları İzleme**
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### **Servisleri Durdurma**
```bash
docker-compose -f docker-compose.prod.yml down
```

### **Backup Alma**
```bash
# Redis backup
docker-compose -f docker-compose.prod.yml exec redis redis-cli BGSAVE

# Application backup
tar -czf backup-$(date +%Y%m%d).tar.gz /opt/benalsam
```

## 🔒 **Güvenlik Ayarları**

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

## 📊 **Monitoring**

### **Resource Kullanımı**
```bash
# Container durumu
docker-compose -f docker-compose.prod.yml ps

# Resource kullanımı
docker stats --no-stream

# Disk kullanımı
df -h
```

### **Health Check Script'i**
```bash
# Monitoring script'i oluştur
sudo nano /opt/benalsam/monitor.sh

#!/bin/bash
curl -f https://benalsam.com/health || exit 1
curl -f https://admin.benalsam.com/health || exit 1

# Cron job ekle
sudo crontab -e
# */5 * * * * /opt/benalsam/monitor.sh
```

## 🔧 **Troubleshooting**

### **Memory Sorunu**
```bash
# Memory kullanımını kontrol et
free -h

# Swap alanı ekle (gerekirse)
sudo fallocate -l 2G /swapfile
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
- Production modunda debug logları kapalı
- Resource limits aktif
- SSL sertifikaları otomatik yenilenir
- Backup'lar günlük alınır
- Monitoring 5 dakikada bir çalışır

---
**Son Güncelleme:** 2025-08-04  
**Versiyon:** 1.0.0 