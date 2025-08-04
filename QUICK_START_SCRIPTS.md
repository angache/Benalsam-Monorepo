# 🚀 Scripts Quick Start Guide

Bu rehber, Benalsam projesindeki scriptlerin nasıl kullanılacağını açıklar.

## 📋 **Script Kategorileri**

### **🚀 Deployment Scriptleri**
- `deploy-vps.sh` - VPS Production Deployment
- `docker-dev.sh` - Local Development
- `docker-prod.sh` - Production Management

### **🧪 Test Scriptleri**
- `run-all-tests.sh` - Tüm Testleri Çalıştır
- `integration-test.sh` - Integration Testleri
- `docker-build-test.sh` - Docker Build Testleri
- `docker-compose-test.sh` - Docker Compose Testleri

### **⚡ Performance Scriptleri**
- `cache-performance.sh` - Cache Performance Testleri

### **🔒 Security Scriptleri**
- `security-scan.sh` - Güvenlik Taraması

## ⚡ **Hızlı Başlangıç**

### **1. Script'leri Executable Yapma**
```bash
# Tüm script'leri executable yap
chmod +x scripts/*.sh

# Tek tek yapma
chmod +x scripts/deploy-vps.sh
chmod +x scripts/docker-dev.sh
chmod +x scripts/docker-prod.sh
```

### **2. Local Development**
```bash
# Local development başlat
./scripts/docker-dev.sh

# Testleri çalıştır
./scripts/run-all-tests.sh

# Performance testleri
./scripts/cache-performance.sh
```

### **3. Production Deployment**
```bash
# VPS deployment
./scripts/deploy-vps.sh

# Production management
./scripts/docker-prod.sh start
./scripts/docker-prod.sh status
./scripts/docker-prod.sh logs
```

### **4. Security ve Monitoring**
```bash
# Güvenlik taraması
./scripts/security-scan.sh

# Integration testleri
./scripts/integration-test.sh
```

## 🛠️ **Script Kullanım Senaryoları**

### **Senaryo 1: Yeni Geliştirici**
```bash
# 1. Repository klonla
git clone https://github.com/your-username/benalsam-monorepo.git
cd benalsam-monorepo

# 2. Environment hazırla
cp .env.example .env
nano .env

# 3. Local development başlat
./scripts/docker-dev.sh

# 4. Testleri çalıştır
./scripts/run-all-tests.sh
```

### **Senaryo 2: Production Deployment**
```bash
# 1. VPS'e bağlan
ssh user@your-vps.com

# 2. Repository klonla
git clone https://github.com/your-username/benalsam-monorepo.git
cd benalsam-monorepo

# 3. Environment hazırla
cp env.production.example .env.production
nano .env.production

# 4. Production deployment
./scripts/deploy-vps.sh

# 5. Güvenlik kontrolü
./scripts/security-scan.sh
```

### **Senaryo 3: CI/CD Pipeline**
```bash
# 1. Build testleri
./scripts/docker-build-test.sh

# 2. Integration testleri
./scripts/integration-test.sh

# 3. Performance testleri
./scripts/cache-performance.sh

# 4. Security scan
./scripts/security-scan.sh

# 5. Production deployment
./scripts/deploy-vps.sh
```

### **Senaryo 4: Monitoring**
```bash
# 1. Production durumu
./scripts/docker-prod.sh status

# 2. Logları izle
./scripts/docker-prod.sh logs

# 3. Performance kontrol
./scripts/cache-performance.sh

# 4. Security kontrol
./scripts/security-scan.sh
```

## 📊 **Script Detayları**

### **🚀 Deployment Scriptleri**

#### **`deploy-vps.sh`**
```bash
# VPS Production Deployment
./scripts/deploy-vps.sh

# Yaptığı işlemler:
# ✅ Docker kontrolü
# ✅ Environment dosyası kontrolü
# ✅ Production build
# ✅ Health check'ler
# ✅ Resource monitoring
```

#### **`docker-dev.sh`**
```bash
# Local Development
./scripts/docker-dev.sh

# Yaptığı işlemler:
# ✅ Development servislerini başlatır
# ✅ Hot reload aktif
# ✅ Logları gösterir
```

#### **`docker-prod.sh`**
```bash
# Production Management
./scripts/docker-prod.sh [start|stop|restart|logs|status]

# Örnekler:
./scripts/docker-prod.sh start    # Production başlat
./scripts/docker-prod.sh stop     # Production durdur
./scripts/docker-prod.sh restart  # Production yeniden başlat
./scripts/docker-prod.sh logs     # Logları göster
./scripts/docker-prod.sh status   # Durumu kontrol et
```

### **🧪 Test Scriptleri**

#### **`run-all-tests.sh`**
```bash
# Tüm Testleri Çalıştır
./scripts/run-all-tests.sh

# Yaptığı işlemler:
# ✅ Unit testler
# ✅ Integration testler
# ✅ E2E testler
# ✅ Test coverage raporu
```

#### **`integration-test.sh`**
```bash
# Integration Testleri
./scripts/integration-test.sh

# Yaptığı işlemler:
# ✅ API endpoint testleri
# ✅ Database bağlantı testleri
# ✅ Elasticsearch testleri
# ✅ Redis testleri
```

#### **`docker-build-test.sh`**
```bash
# Docker Build Testleri
./scripts/docker-build-test.sh

# Yaptığı işlemler:
# ✅ Docker image build testleri
# ✅ Multi-stage build kontrolü
# ✅ Security scan
# ✅ Size optimization
```

#### **`docker-compose-test.sh`**
```bash
# Docker Compose Testleri
./scripts/docker-compose-test.sh

# Yaptığı işlemler:
# ✅ Service health check'leri
# ✅ Network connectivity testleri
# ✅ Volume mount testleri
# ✅ Environment variable testleri
```

### **⚡ Performance Scriptleri**

#### **`cache-performance.sh`**
```bash
# Cache Performance Testleri
./scripts/cache-performance.sh

# Yaptığı işlemler:
# ✅ Redis performance testleri
# ✅ Memory cache testleri
# ✅ Cache hit/miss oranları
# ✅ Response time ölçümleri
```

### **🔒 Security Scriptleri**

#### **`security-scan.sh`**
```bash
# Güvenlik Taraması
./scripts/security-scan.sh

# Yaptığı işlemler:
# ✅ Docker image security scan
# ✅ Dependency vulnerability check
# ✅ SSL certificate check
# ✅ Port security check
```

## 🔧 **Troubleshooting**

### **Script Permission Sorunu**
```bash
# Script'leri executable yap
chmod +x scripts/*.sh

# Tek tek yap
chmod +x scripts/deploy-vps.sh
chmod +x scripts/docker-dev.sh
```

### **Script Path Sorunu**
```bash
# Script path'ini kontrol et
which bash
echo $PATH

# Absolute path kullan
/usr/bin/bash /path/to/scripts/deploy-vps.sh
```

### **Script Error Handling**
```bash
# Script'i debug modunda çalıştır
bash -x scripts/deploy-vps.sh

# Error loglarını kontrol et
./scripts/deploy-vps.sh 2>&1 | tee script-error.log
```

### **Environment Variable Sorunu**
```bash
# Environment variables'ları kontrol et
env | grep DOCKER
env | grep PROJECT

# Environment dosyasını kontrol et
cat .env
```

## 📝 **Önemli Notlar**

### **Script Güvenliği**
- ✅ Script'ler production'da test edilmiştir
- ✅ Error handling mevcuttur
- ✅ Logging ve monitoring vardır
- ✅ Rollback mekanizması vardır

### **Script Best Practices**
- ✅ Her script'in tek bir sorumluluğu vardır
- ✅ Script'ler idempotent'tir (birden fazla çalıştırılabilir)
- ✅ Script'ler logging yapar
- ✅ Script'ler error handling içerir

### **Script Maintenance**
- ✅ Script'ler düzenli olarak güncellenir
- ✅ Script'ler test edilir
- ✅ Script'ler dokümante edilir
- ✅ Script'ler version control'de tutulur

## 🚀 **Hızlı Komutlar**

### **Development**
```bash
./scripts/docker-dev.sh          # Local development başlat
./scripts/run-all-tests.sh       # Testleri çalıştır
./scripts/cache-performance.sh   # Performance testleri
```

### **Production**
```bash
./scripts/deploy-vps.sh          # VPS deployment
./scripts/docker-prod.sh start   # Production başlat
./scripts/docker-prod.sh status  # Durumu kontrol et
./scripts/security-scan.sh       # Güvenlik taraması
```

### **Testing**
```bash
./scripts/integration-test.sh    # Integration testleri
./scripts/docker-build-test.sh   # Build testleri
./scripts/docker-compose-test.sh # Compose testleri
```

### **Monitoring**
```bash
./scripts/docker-prod.sh logs    # Logları izle
./scripts/cache-performance.sh   # Performance kontrol
./scripts/security-scan.sh       # Security kontrol
```

## 📊 **Script Monitoring**

### **Script Logları**
```bash
# Script loglarını izle
tail -f /var/log/benalsam-scripts.log

# Script execution history
history | grep "scripts/"
```

### **Script Performance**
```bash
# Script execution time
time ./scripts/deploy-vps.sh

# Script resource usage
/usr/bin/time ./scripts/docker-build-test.sh
```

---

**Son Güncelleme:** 2025-08-04  
**Versiyon:** 1.0.0  
**Status:** Production Ready ✅ 