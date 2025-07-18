# Benalsam Monorepo

Modern ilan uygulaması için monorepo yapısı - React Native, Web ve Admin Panel

## 🏗️ Proje Yapısı

```
benalsam-monorepo/
├── packages/
│   ├── admin-backend/     # Admin API (Node.js/Express)
│   ├── admin-ui/         # Admin Panel (React/TypeScript)
│   ├── mobile/           # Mobile App (React Native/Expo)
│   ├── web/              # Web App (React/TypeScript)
│   └── shared-types/     # Shared TypeScript Types
├── scripts/
│   └── dev.sh           # Development startup script
├── docker-compose.dev.yml
└── lerna.json
```

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- Docker & Docker Compose
- npm 9+

### Kurulum

```bash
# 1. Repo'yu klonla
git clone <repo-url>
cd benalsam-monorepo

# 2. Dependencies'leri yükle
npm install

# 3. Lerna bootstrap
npm run bootstrap

# 4. Shared-types'ı build et
npm run build:shared
```

### Geliştirme

```bash
# Tüm servisleri başlat (Önerilen)
./scripts/dev.sh

# Veya manuel olarak:
npm run dev:admin    # Admin backend + UI
npm run dev:mobile   # Mobile app
npm run dev:web      # Web app
```

## 📊 Servisler

| Servis | Port | URL | Açıklama |
|--------|------|-----|----------|
| Admin Backend | 3002 | http://localhost:3002 | Admin API |
| Admin UI | 3003 | http://localhost:3003 | Admin Panel |
| Redis | 6379 | localhost:6379 | Cache/Queue |
| Elasticsearch | 9200 | localhost:9200 | Search Engine |

## 🛠️ Script'ler

```bash
# Development
npm run dev              # Tüm servisleri paralel başlat
npm run dev:admin        # Sadece admin servisleri
npm run dev:mobile       # Sadece mobile
npm run dev:web          # Sadece web

# Build
npm run build            # Tüm paketleri build et
npm run build:shared     # Sadece shared-types

# Docker
npm run docker:up        # Docker servislerini başlat
npm run docker:down      # Docker servislerini durdur
npm run docker:logs      # Docker loglarını göster

# Maintenance
npm run clean            # Tüm build dosyalarını temizle
npm run bootstrap        # Dependencies'leri yeniden yükle
npm run format           # Kod formatla
npm run format:check     # Format kontrolü
npm run type-check       # TypeScript kontrolü
```

## 📦 Paket Detayları

### admin-backend
- **Teknoloji**: Node.js, Express, TypeScript
- **Veritabanı**: PostgreSQL (Supabase)
- **Cache**: Redis
- **Search**: Elasticsearch
- **Auth**: JWT

### admin-ui
- **Teknoloji**: React, TypeScript, Vite
- **UI Library**: Custom components
- **State**: Zustand
- **API**: Axios

### mobile
- **Teknoloji**: React Native, Expo
- **Navigation**: React Navigation
- **State**: React Query + Zustand
- **API**: Supabase client

### web
- **Teknoloji**: React, TypeScript, Vite
- **UI Library**: Custom components
- **State**: Zustand
- **API**: Supabase client

### shared-types
- **Amaç**: Tüm paketler arası tip paylaşımı
- **Export**: TypeScript interfaces
- **Build**: TypeScript compiler

## 🔄 Workflow

### Yeni Özellik Ekleme

1. **Shared Types Güncelle**
   ```bash
   cd packages/shared-types
   # Yeni interface'ler ekle
   npm run build
   ```

2. **Backend API Ekle**
   ```bash
   cd packages/admin-backend
   # Yeni endpoint'ler ekle
   npm run build
   ```

3. **Frontend Güncelle**
   ```bash
   cd packages/admin-ui
   # Yeni UI component'leri ekle
   ```

### Hot Reload

- **Backend**: `npm run dev` (nodemon)
- **Admin UI**: `npm run dev` (Vite HMR)
- **Mobile**: Expo dev server
- **Web**: Vite HMR

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **Shared Types Build Hatası**
   ```bash
   npm run build:shared
   npm run bootstrap
   ```

2. **Docker Bağlantı Sorunu**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Port Çakışması**
   ```bash
   lsof -ti:3002 | xargs kill -9
   lsof -ti:3003 | xargs kill -9
   ```

4. **Node Modules Sorunu**
   ```bash
   npm run clean
   npm install
   npm run bootstrap
   ```

## 📝 Commit Kuralları

```bash
# Feature
git commit -m "feat: add user management system"

# Fix
git commit -m "fix: resolve authentication token issue"

# Refactor
git commit -m "refactor: improve API response structure"

# Docs
git commit -m "docs: update README with new setup instructions"
```

## 🚀 Production

```bash
# Build all packages
npm run build

# Docker production
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Destek

Sorun yaşarsan:
1. README'yi kontrol et
2. Issue aç
3. Logları kontrol et

---

**Benalsam Monorepo** - Modern ilan uygulaması geliştirme platformu 