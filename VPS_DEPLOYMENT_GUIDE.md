# 🚀 VPS Deployment Rehberi - Benalsam

## 📋 **VPS Gereksinimleri**

### **Minimum Sistem Gereksinimleri:**
- **CPU**: 2 cores
- **RAM**: 4GB (optimize edildi)
- **Disk**: 30GB SSD
- **OS**: Ubuntu 20.04+
- **Docker**: 20.10+
- **Docker Compose**: 2.20+

---

## ⚡ **Hızlı Deployment**

### **1. VPS Hazırlığı**
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

# Environment setup
./scripts/setup-env.sh

# Environment'ı düzenle
nano .env  # Gerekli değerleri doldurun

# Dependencies install
pnpm install

# Environment'ı paketlere kopyala
./scripts/copy-env-to-packages.sh
```

### **3. Production Deployment**
```bash
# Minimal production deployment
./scripts/deploy-vps-minimal.sh

# Veya manuel:
docker-compose -f docker-compose.prod.minimal.yml build --no-cache
docker-compose -f docker-compose.prod.minimal.yml up -d
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

---

## 🔗 **Production URL'leri**

### **Ana Servisler:**
- **Web App**: https://benalsam.com
- **Admin Panel**: https://admin.benalsam.com
- **API**: https://benalsam.com/api

### **Monitoring:**
- **Health Check**: https://benalsam.com/health
- **Admin Health**: https://admin.benalsam.com/health

---

## 🛠️ **Yaygın Komutlar**

### **Servis Yönetimi:**
```bash
# Servisleri başlat
docker-compose -f docker-compose.prod.minimal.yml up -d

# Servisleri durdur
docker-compose -f docker-compose.prod.minimal.yml down

# Servisleri yeniden başlat
docker-compose -f docker-compose.prod.minimal.yml restart

# Logları izle
docker-compose -f docker-compose.prod.minimal.yml logs -f

# Belirli servis logları
docker-compose -f docker-compose.prod.minimal.yml logs -f admin-backend
```

### **Resource Monitoring:**
```bash
# Container durumu
docker-compose -f docker-compose.prod.minimal.yml ps

# Resource kullanımı
docker stats --no-stream

# Disk kullanımı
df -h

# Memory kullanımı
free -h
```

### **Backup ve Restore:**
```bash
# Database backup
docker-compose -f docker-compose.prod.minimal.yml exec elasticsearch elasticsearch-dump --input=http://localhost:9200/benalsam --output=backup.json

# Redis backup
docker-compose -f docker-compose.prod.minimal.yml exec redis redis-cli BGSAVE

# Volume backup
docker run --rm -v benalsam-monorepo_elasticsearch_data:/data -v $(pwd):/backup alpine tar czf /backup/elasticsearch_backup.tar.gz -C /data .
```

---

## 🔒 **Güvenlik Ayarları**

### **Firewall Konfigürasyonu:**
```bash
# UFW kurulumu
sudo apt install ufw

# Firewall ayarları
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Firewall durumu
sudo ufw status
```

### **SSL Sertifika Yönetimi:**
```bash
# SSL sertifika durumu
sudo certbot certificates

# Otomatik yenileme testi
sudo certbot renew --dry-run

# SSL sertifika yenileme
sudo certbot renew
```

### **Security Headers:**
```bash
# Nginx security headers kontrolü
curl -I https://benalsam.com

# SSL test
curl -I https://www.ssllabs.com/ssltest/analyze.html?d=benalsam.com
```

---

## 📊 **Performance Monitoring**

### **Resource Limits:**
- **Admin Backend**: 256MB RAM, 0.3 CPU
- **Admin UI**: 128MB RAM, 0.2 CPU
- **Web App**: 128MB RAM, 0.2 CPU
- **Elasticsearch**: 256MB RAM, 0.3 CPU
- **Redis**: 128MB RAM, 0.1 CPU
- **Nginx**: 64MB RAM, 0.05 CPU

### **Monitoring Scripts:**
```bash
# Health check
curl -f https://benalsam.com/health

# API test
curl -f https://benalsam.com/api/v1/health

# Admin panel test
curl -f https://admin.benalsam.com/health
```

---

## 🔧 **Troubleshooting**

### **Memory Sorunu:**
```bash
# Memory kullanımını kontrol et
free -h

# Swap alanı ekle (gerekirse)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Swap'ı kalıcı yap
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### **Disk Alanı Sorunu:**
```bash
# Disk kullanımını kontrol et
df -h

# Docker cleanup
docker system prune -a -f
docker volume prune -f

# Log dosyalarını temizle
sudo journalctl --vacuum-time=7d
```

### **Port Çakışması:**
```bash
# Kullanılan portları kontrol et
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Process'leri sonlandır
sudo kill -9 $(sudo lsof -t -i:80)
sudo kill -9 $(sudo lsof -t -i:443)
```

### **Container Sorunları:**
```bash
# Container loglarını kontrol et
docker-compose -f docker-compose.prod.minimal.yml logs admin-backend

# Container'ı yeniden başlat
docker-compose -f docker-compose.prod.minimal.yml restart admin-backend

# Container'ı yeniden build et
docker-compose -f docker-compose.prod.minimal.yml build --no-cache admin-backend
```

---

## 📝 **Environment Variables**

### **Zorunlu Değişkenler:**
```bash
# Supabase
SUPABASE_URL=https://dnwreckpeenhbdtapmxr.supabase.co
SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_secret_here

# Email (Zoho)
SMTP_HOST=smtp.zoho.com
SMTP_USER=your_email@zoho.com
SMTP_PASS=your_app_password_here
```

### **Opsiyonel Değişkenler:**
```bash
# AI Services
OPENAI_API_KEY=your_key_here
DEEPSEEK_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_APP_ID=your_app_id
```

---

## 🚀 **Deployment Checklist**

### **✅ Pre-Deployment:**
- [ ] VPS hazırlığı tamamlandı
- [ ] Docker ve Docker Compose kuruldu
- [ ] Repository klonlandı
- [ ] Environment dosyası oluşturuldu
- [ ] Gerekli değerler dolduruldu
- [ ] Dependencies install edildi

### **✅ Deployment:**
- [ ] Docker build başarılı
- [ ] Container'lar çalışıyor
- [ ] Health check'ler başarılı
- [ ] Port'lar açık
- [ ] SSL sertifikaları alındı
- [ ] Nginx konfigürasyonu tamamlandı

### **✅ Post-Deployment:**
- [ ] Domain DNS ayarları yapıldı
- [ ] SSL sertifikaları aktif
- [ ] Firewall ayarları yapıldı
- [ ] Monitoring aktif
- [ ] Backup stratejisi hazır
- [ ] Documentation güncellendi

---

## 📞 **Destek ve İletişim**

### **Log Dosyaları:**
```bash
# Docker logs
docker-compose -f docker-compose.prod.minimal.yml logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -f
```

### **Debug Komutları:**
```bash
# Container durumu
docker ps

# Network durumu
docker network ls
docker network inspect benalsam-monorepo_benalsam-network

# Volume durumu
docker volume ls
docker volume inspect benalsam-monorepo_elasticsearch_data
```

---

**Son Güncelleme:** 2025-01-09  
**Versiyon:** 2.0.0  
**Status:** Production Ready ✅

