# 🏗️ Benalsam Projesi - Standartlar ve Kurallar

> **Son Güncelleme:** 2025-01-09  
> **Versiyon:** 1.0.0  
> **Durum:** Aktif

Bu doküman, Benalsam projesinde **MUTLAKA UYULMASI GEREKEN** standartları ve kuralları tanımlar.

---

## 🚨 **ZORUNLU KURALLAR**

### 📦 **Package Manager**
- **KULLANILACAK:** `pnpm` (npm veya yarn KULLANILMAYACAK)
- **Komutlar:**
  ```bash
  pnpm install          # Dependencies yükle
  pnpm add <package>    # Package ekle
  pnpm remove <package> # Package kaldır
  pnpm run <script>     # Script çalıştır
  pnpm build            # Build
  pnpm dev              # Development
  pnpm test             # Test
  ```

### 🔄 **Process Management**
- **KULLANILACAK:** `pm2` (nodemon veya doğrudan node KULLANILMAYACAK)
- **Komutlar:**
  ```bash
  pm2 start ecosystem.config.js    # Tüm servisleri başlat
  pm2 stop all                     # Tüm servisleri durdur
  pm2 restart all                  # Tüm servisleri yeniden başlat
  pm2 logs                         # Logları göster
  pm2 monit                        # Monitoring
  pm2 delete all                   # Tüm process'leri sil
  ```

### 🐳 **Container Management**
- **Development:** PM2 (hot-reload için)
- **Production:** Docker containers
- **Komutlar:**
  ```bash
  # Development
  pm2 start ecosystem.config.js
  
  # Production
  docker-compose -f docker-compose.prod.yml up -d
  docker-compose -f docker-compose.prod.yml down
  ```

---

## 📁 **Proje Yapısı Standartları**

### **Monorepo Yapısı**
```
benalsam-monorepo/
├── packages/
│   ├── admin-backend/     # Node.js/Express API
│   ├── admin-ui/          # React/Vite Admin Panel
│   ├── web/               # React/Vite Web App
│   ├── mobile/            # React Native/Expo
│   └── shared-types/      # TypeScript Types
├── todos/                 # TODO organizasyonu
├── docs/                  # Dokümantasyon
└── nginx/                 # Nginx configs
```

### **Package Naming**
- **Admin Backend:** `@benalsam/admin-backend`
- **Admin UI:** `@benalsam/admin-ui`
- **Web:** `@benalsam/web`
- **Mobile:** `@benalsam/mobile`
- **Shared Types:** `@benalsam/shared-types`

---

## 🔧 **Development Standartları**

### **TypeScript**
- **Versiyon:** En son stable
- **Strict Mode:** ZORUNLU
- **Shared Types:** `@benalsam/shared-types` kullanılacak
- **Local Interfaces:** YASAK (shared-types'tan import et)

### **React Versiyonu**
- **Tüm React projeleri:** `19.0.0`
- **React DOM:** `19.0.0`
- **@types/react:** `19.0.0`

### **Code Style**
- **Indentation:** 2 spaces
- **Quotes:** Single quotes
- **Semicolons:** ZORUNLU
- **Trailing comma:** ZORUNLU

### **Import Sıralaması**
```typescript
// 1. External libraries
import React from 'react';
import { useState } from 'react';

// 2. Internal packages
import { User, Listing } from '@benalsam/shared-types';

// 3. Local imports
import { apiService } from '../services/api';
import { UserCard } from '../components/UserCard';
```

---

## 🚀 **Development Workflow**

### **1. Proje Başlatma**
```bash
# Root'ta
pnpm install
pm2 start ecosystem.config.js
```

### **2. Yeni Feature**
```bash
# 1. Geliştir
# 2. Test et
pm2 restart all  # Değişiklikleri test et

# 3. Commit
git add .
git commit -m "feat: add feature description"

# 4. Push
git push origin main
```

### **3. Debug İşlemleri**
```bash
# Logları izle
pm2 logs

# Monitoring
pm2 monit

# Belirli servisi restart et
pm2 restart admin-backend
pm2 restart admin-ui
pm2 restart web
```

---

## 🧪 **Testing Standartları**

### **Type Testing**
```bash
# Her pakette
pnpm run build  # TypeScript compile test
```

### **Runtime Testing**
```bash
# 1. Servisleri başlat
pm2 start ecosystem.config.js

# 2. Health check
curl http://localhost:3002/health

# 3. API test
curl http://localhost:3002/api/v1/auth/login

# 4. UI test
# http://localhost:3000 (admin-ui)
# http://localhost:3001 (web)
```

### **Integration Testing**
- Admin-backend ↔ Admin-UI
- Admin-backend ↔ Web
- Shared-types ↔ Tüm paketler

---

## 📝 **Commit Standartları**

### **Commit Message Format**
```
type(scope): description

feat: yeni özellik
fix: hata düzeltme
docs: dokümantasyon
style: kod formatı
refactor: kod yeniden düzenleme
test: test ekleme/düzenleme
chore: bakım işleri
```

### **Örnekler**
```bash
git commit -m "feat(admin-ui): add user management interface"
git commit -m "fix(shared-types): correct User interface field names"
git commit -m "docs: update project standards documentation"
git commit -m "refactor(admin-backend): improve error handling"
```

---

## 🔒 **Security Standartları**

### **Environment Variables**
- `.env` dosyaları git'e commit edilmeyecek
- `.env.example` dosyaları oluşturulacak
- Production'da environment variables kullanılacak

### **API Security**
- JWT token authentication
- Role-based access control (RBAC)
- Input validation
- Rate limiting

---

## 📊 **Monitoring Standartları**

### **PM2 Monitoring**
```bash
# Process durumu
pm2 status

# Log monitoring
pm2 logs --lines 100

# Performance monitoring
pm2 monit
```

### **Health Checks**
- Admin-backend: `/health`
- Admin-UI: `/health`
- Web: `/health`

---

## 🚨 **YASAK OLANLAR**

### **Package Manager**
- ❌ `npm install`
- ❌ `yarn add`
- ❌ `npm run dev`

### **Process Management**
- ❌ `nodemon`
- ❌ `node src/index.js`
- ❌ `npm start`

### **Type Definitions**
- ❌ Local interface tanımlama
- ❌ `any` type kullanımı
- ❌ Duplicate type definitions

### **Code Style**
- ❌ 4 spaces indentation
- ❌ Double quotes
- ❌ Missing semicolons
- ❌ Inconsistent naming

---

## 📋 **Checklist**

### **Her Commit Öncesi**
- [ ] `pnpm run build` (tüm paketlerde)
- [ ] `pm2 restart all` (test için)
- [ ] Type consistency kontrolü
- [ ] Commit message formatı
- [ ] Environment variables kontrolü

### **Her Feature Öncesi**
- [ ] Shared-types güncelle (gerekirse)
- [ ] Type definitions kontrol et
- [ ] Import sıralaması kontrol et

### **Her Deployment Öncesi**
- [ ] Tüm testler geçiyor
- [ ] Build hatasız
- [ ] Environment variables ayarlandı
- [ ] Security kontrolü yapıldı

---

## 📞 **İletişim**

### **Hata Bildirimi**
- GitHub Issues kullan
- Detaylı hata açıklaması
- Steps to reproduce
- Environment bilgisi

### **Soru Sorma**
- Önce bu dokümanı kontrol et
- GitHub Discussions kullan
- Slack/Teams kanalları

---

## 🔄 **Güncelleme Süreci**

Bu doküman güncellenirken:
1. **Versiyon numarası** artırılır
2. **Değişiklik tarihi** güncellenir
3. **Changelog** eklenir
4. **Team'e bilgi** verilir

---

**Son Güncelleme:** 2025-01-09  
**Versiyon:** 1.0.0  
**Güncelleyen:** AI Assistant  
**Onaylayan:** Project Team 