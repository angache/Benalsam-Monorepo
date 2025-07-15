# 🏗️ Benalsam Monorepo

Benalsam web ve mobile uygulamalarını tek bir repository'de yöneten monorepo yapısı.

## 📦 Projeler

- **🌐 Web App** (`packages/web/`) - React/Vite tabanlı web uygulaması
- **📱 Mobile App** (`packages/mobile/`) - React Native/Expo tabanlı mobile uygulaması  
- **🔧 Shared Types** (`packages/shared-types/`) - Paylaşılan TypeScript tipleri ve servisler

## 🚀 Hızlı Başlangıç

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme ortamını başlat
cd packages/shared-types && npm run dev &
cd packages/web && npm run dev &
cd packages/mobile && npx expo start
```

### Geliştirme

```bash
# Shared-types (watch mode)
cd packages/shared-types
npm run dev

# Web projesi
cd packages/web  
npm run dev

# Mobile projesi
cd packages/mobile
npx expo start
```

## 📚 Dokümantasyon

- [📦 Shared-Types Kullanım Rehberi](./docs/SHARED_TYPES_GUIDE.md)
- [🏗️ Monorepo Rehberi](./docs/MONOREPO_GUIDE.md)

## 🛠️ Teknolojiler

### Shared-Types
- TypeScript
- Supabase Client
- Utility Functions

### Web App
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Radix UI
- Supabase

### Mobile App
- React Native
- Expo
- TypeScript
- React Query
- Supabase

## 📁 Proje Yapısı

```
benalsam-monorepo/
├── packages/
│   ├── shared-types/     # Paylaşılan tipler ve servisler
│   ├── web/             # Web uygulaması
│   └── mobile/          # Mobile uygulaması
├── docs/                # Dokümantasyon
└── README.md
```

## 🔄 Geliştirme Süreci

1. **Shared-Types'ta değişiklik yap**
2. **Otomatik build** (watch mode)
3. **Web/Mobile'da kullan**
4. **Test et ve commit**

## 📋 Script'ler

```bash
# Root level
npm install          # Tüm workspace'lerde install
npm run build        # Tüm workspace'lerde build
npm test            # Tüm workspace'lerde test

# Shared-types
cd packages/shared-types
npm run dev         # Watch mode
npm run build       # Production build

# Web
cd packages/web
npm run dev         # Development server
npm run build       # Production build

# Mobile
cd packages/mobile
npx expo start      # Development server
npx expo build      # Production build
```

## 🚨 Sorun Giderme

### Build Sorunları
```bash
cd packages/shared-types
npm run clean && npm run build
```

### Import Sorunları
```bash
# Web
cd packages/web
rm -rf node_modules/.cache && npm run dev

# Mobile  
cd packages/mobile
npx expo start --clear
```

## 📄 Lisans

MIT License

---

**Not:** Detaylı dokümantasyon için [docs/](./docs/) klasörüne bakın. 