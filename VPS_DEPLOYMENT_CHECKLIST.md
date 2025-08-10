# 🚀 VPS DEPLOYMENT CHECKLIST

**Tarih:** 2025-08-10  
**Hedef:** Production deployment test

---

## 📋 **PRE-DEPLOYMENT HAZIRLIK**

### **✅ YEREL HAZIRLIK (TAMAMLANDI)**
- [x] Shared types NPM'e publish edildi (`benalsam-shared-types@1.0.0`)
- [x] Tüm import'lar güncellendi (`@benalsam/shared-types` → `benalsam-shared-types`)
- [x] Docker build'ler başarılı (local)
- [x] Tüm servisler çalışıyor (local)
- [x] Production compose dosyası düzeltildi
- [x] Health check'ler düzeltildi
- [x] Deployment script'i hazır

### **🔄 VPS HAZIRLIK (YAPILACAK)**
- [ ] VPS'e SSH bağlantısı
- [ ] Docker & Docker Compose kurulumu
- [ ] Node.js kurulumu (nvm ile)
- [ ] Git repository clone
- [ ] Environment dosyası kopyalama
- [ ] Production deployment test

---

## 🎯 **DEPLOYMENT ADIMLARI**

### **ADIM 1: VPS'e Bağlan**
```bash
ssh root@209.227.228.96
```

### **ADIM 2: Docker Kurulumu**
```bash
# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose kurulumu
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### **ADIM 3: Node.js Kurulumu**
```bash
# nvm kurulumu
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Node.js kurulumu
nvm install 20
nvm use 20
```

### **ADIM 4: Repository Clone**
```bash
cd /root
git clone https://github.com/angache/BenalsamMobil-2025.git benalsam-monorepo
cd benalsam-monorepo
git checkout feature/cto-technical-audit-faz1-complete
```

### **ADIM 5: Environment Setup**
```bash
# .env dosyasını kopyala (local'den)
# scp .env root@209.227.228.96:/root/benalsam-monorepo/

# Veya manuel olarak oluştur
cp .env.example .env
# Gerekli değerleri doldur
```

### **ADIM 6: Production Deployment**
```bash
# Deployment script'ini çalıştır
./scripts/deploy-vps-production.sh
```

---

## 🔍 **TEST ADIMLARI**

### **Health Check Testleri**
```bash
# Redis
curl -f http://localhost:6379

# Elasticsearch
curl -f http://localhost:9200/_cluster/health

# Admin Backend
curl -f http://localhost:3002/health

# Admin UI
curl -f http://localhost:3003

# Web
curl -f http://localhost:80
```

### **Container Durumları**
```bash
docker-compose -f docker-compose.production.yml ps
docker stats --no-stream
```

---

## 📊 **BEKLENEN SONUÇLAR**

### **✅ BAŞARILI DEPLOYMENT**
- Tüm servisler healthy
- Port'lar açık ve erişilebilir
- Resource kullanımı normal
- Log'lar temiz

### **❌ POTANSİYEL SORUNLAR**
- Memory yetersizliği
- Disk alanı yetersizliği
- Network connectivity sorunları
- Environment variable eksiklikleri

---

## 🚨 **ACIL DURUM PLANI**

### **Rollback**
```bash
# Eski versiyona dön
git checkout main
docker-compose -f docker-compose.production.yml down
docker system prune -f
```

### **Log Analizi**
```bash
# Tüm logları gör
docker-compose -f docker-compose.production.yml logs -f

# Belirli servis logları
docker-compose -f docker-compose.production.yml logs -f admin-backend
```

---

## 📝 **NOTLAR**

- **VPS IP:** 209.227.228.96
- **Production Ports:** 80, 3002, 3003, 6379, 9200
- **Resource Limits:** 2GB RAM, 10GB Disk minimum
- **Backup:** Önceki deployment'ı yedekle

**Hazır! VPS'e geçebiliriz!** 🚀 