# 🚀 Benalsam Workflow Rehberi

## **Sorun: Environment ve Service Discovery Karışıklığı**

### **Mevcut Sorunlar:**
- ❌ Her paket farklı env dosyaları kullanıyor
- ❌ Servisler birbirini bulamıyor
- ❌ Docker vs Local karışıklığı
- ❌ Eski scriptler kullanılmıyor

### **Çözüm: Merkezi Environment Yönetimi**

## **📋 Yeni Workflow**

### **1. İlk Kurulum:**
```bash
# Environment setup
./scripts/setup-env.sh

# Dependencies install
pnpm install

# Environment'ı paketlere kopyala
./scripts/copy-env-to-packages.sh
```

### **2. Development (Local):**
```bash
# Tüm servisleri başlat
./scripts/dev-start.sh

# Veya manuel:
cd packages/admin-backend && pnpm run dev &
cd packages/admin-ui && pnpm run dev &
cd packages/web && pnpm run dev &
```

### **3. Development (Docker):**
```bash
# Docker ile başlat
./scripts/docker-dev.sh

# Veya manuel:
docker-compose -f docker-compose.dev.yml up
```

### **4. Production (VPS):**
```bash
# Minimal VPS deployment
./scripts/deploy-vps-minimal.sh

# Veya full deployment:
./scripts/deploy-vps.sh
```

## **🔧 Script Açıklamaları**

### **`setup-env.sh`**
- Root .env dosyası oluşturur
- Tüm paketler için env dosyaları oluşturur
- Template değerlerle başlar

### **`copy-env-to-packages.sh`**
- Root .env'yi tüm paketlere kopyalar
- .gitignore güncellemeleri yapar

### **`dev-start.sh`**
- Local development için tüm servisleri başlatır
- Background process'ler yönetir

### **`docker-dev.sh`**
- Docker ile development
- Hot reload desteği

### **`deploy-vps.sh`**
- Production deployment
- Health check'ler
- Resource monitoring

## **🌐 Service URLs**

### **Local Development:**
- Admin Backend: `http://localhost:3002`
- Admin UI: `http://localhost:3003`
- Web: `http://localhost:5173`
- Mobile: Expo DevTools

### **Production:**
- Admin Panel: `https://admin.benalsam.com`
- Web Site: `https://benalsam.com`

## **🔍 Troubleshooting**

### **Servisler Birbirini Bulamıyor:**
```bash
# Environment kontrol et
cat .env | grep URL

# Port'ları kontrol et
lsof -i :3002
lsof -i :3003
lsof -i :5173

# Docker network kontrol et
docker network ls
docker network inspect benalsam-monorepo_benalsam-network
```

### **Environment Sorunları:**
```bash
# Environment'ı yeniden oluştur
./scripts/setup-env.sh

# Paketlere kopyala
./scripts/copy-env-to-packages.sh

# Docker'ı yeniden başlat
docker-compose down
docker-compose up -d
```

### **Port Çakışması:**
```bash
# Çalışan process'leri bul
ps aux | grep node

# Port'ları serbest bırak
kill -9 $(lsof -ti:3002)
kill -9 $(lsof -ti:3003)
kill -9 $(lsof -ti:5173)
```

## **📝 Environment Variables**

### **Zorunlu Değişkenler:**
```bash
# Supabase
SUPABASE_URL=https://dnwreckpeenhbdtapmxr.supabase.co
SUPABASE_ANON_KEY=your_key_here

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

## **🚀 Quick Start**

```bash
# 1. Environment setup
./scripts/setup-env.sh

# 2. Dependencies
pnpm install

# 3. Environment'ı paketlere kopyala
./scripts/copy-env-to-packages.sh

# 4. Development başlat
./scripts/dev-start.sh

# 5. Tarayıcıda aç
open http://localhost:3003  # Admin Panel
open http://localhost:5173  # Web Site
```

## **📊 Monitoring**

### **Health Checks:**
```bash
# Admin Backend
curl http://localhost:3002/health

# Admin UI
curl http://localhost:3003/

# Web
curl http://localhost:5173/

# Elasticsearch
curl http://localhost:9200/

# Redis
redis-cli ping
```

### **Logs:**
```bash
# Docker logs
docker-compose logs -f admin-backend
docker-compose logs -f admin-ui
docker-compose logs -f web

# Local logs
tail -f packages/admin-backend/logs/app.log
``` 