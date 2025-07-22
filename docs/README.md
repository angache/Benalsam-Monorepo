# 📚 Benalsam Monorepo Dokümantasyonu

Bu klasör, Benalsam monorepo'su için kapsamlı dokümantasyon içerir.

## 📖 Dokümantasyon Kategorileri

### 🏗️ [Mimari Rehberleri](./architecture/)
- [Monorepo Rehberi](./architecture/MONOREPO_GUIDE.md) - Monorepo yapısı ve best practices
- [Shared-Types Rehberi](./architecture/SHARED_TYPES_GUIDE.md) - Shared-types paket kullanımı
- [Shared-Types Entegrasyonu](./architecture/SHARED_TYPES_INTEGRATION.md) - Entegrasyon detayları
- [Development Setup Guide](./architecture/DEVELOPMENT_SETUP_GUIDE.md) - Geliştirme ortamı kurulumu
- [Database Schema Documentation](./architecture/DATABASE_SCHEMA_DOCUMENTATION.md) - Veritabanı şeması ve yapısı
- [Mobile App Documentation](./architecture/MOBILE_APP_DOCUMENTATION.md) - Mobil uygulama dokümantasyonu
- [Security Documentation](./architecture/SECURITY_DOCUMENTATION.md) - Güvenlik politikaları ve önlemler

### 🚀 [Deployment Rehberleri](./deployment/)
- [Production Deployment](./deployment/PRODUCTION_DEPLOYMENT_GUIDE.md) - Production deployment
- [Admin Panel Deployment](./deployment/ADMIN_PANEL_DEPLOYMENT_GUIDE.md) - Admin panel deployment
- [Docker Setup](./deployment/DOCKER_SETUP_HOWTO.md) - Docker kurulumu
- [VPS Deployment Complete Guide](./deployment/VPS_DEPLOYMENT_COMPLETE_GUIDE.md) - VPS deployment tam rehberi
- [VPS Migration](./deployment/vps-migration/) - VPS migration rehberleri

### 🔍 [Özellik Dokümantasyonu](./features/)
- [Web Admin Integration](./features/web-admin-integration-documentation.md) - Web admin backend entegrasyonu
- [Elasticsearch Integration](./features/elasticsearch-implementation-guide.md) - Elasticsearch implementasyonu
- [Turkish Search](./features/elasticsearch-turkish-search-integration.md) - Turkish search entegrasyonu
- [Admin RBAC](./features/admin-role-based-access-control.md) - Role-based access control

### 📚 [API Dokümantasyonu](./api/)
- [API Documentation](./api/API_DOCUMENTATION.md) - Genel API dokümantasyonu
- [API Documentation (New)](./api/API_DOCUMENTATION_NEW.md) - Güncellenmiş API dokümantasyonu
- [Elasticsearch API](./api/ELASTICSEARCH_API_ARCHITECTURE.md) - Elasticsearch API mimarisi
- [Elasticsearch API Decision](./api/ELASTICSEARCH_API_DECISION.md) - Elasticsearch API kararları

### 🧪 [Testing](./testing/)
- Testing rehberleri ve best practices

### 📋 [Proje Yönetimi](./)
- [TODO Listesi](./TODO.md) - Aktif projeler ve gelecek planlar
- [Changelog](./CHANGELOG.md) - Proje değişiklik geçmişi
- [Quick Start](./QUICK_START.md) - Hızlı başlangıç rehberi

---

## 🎯 Hızlı Başlangıç

### 1. Monorepo'yu Anlama
- [Monorepo Rehberi](./architecture/monorepo-guide.md#genel-bakış) - Genel bakış ve yapı
- [Kurulum](./architecture/monorepo-guide.md#kurulum) - İlk kurulum adımları

### 2. Shared-Types Kullanımı
- [Shared-Types Rehberi](./architecture/shared-types-guide.md#genel-bakış) - Paket hakkında genel bilgi
- [Kullanım Örnekleri](./architecture/shared-types-guide.md#kullanım-örnekleri) - Pratik örnekler

### 3. Web Admin Integration
- [Web Admin Integration](./features/web-admin-integration-documentation.md) - Tam entegrasyon rehberi
- [Admin RBAC](./features/admin-role-based-access-control.md) - Yetkilendirme sistemi

### 4. Elasticsearch Entegrasyonu
- [Turkish Search Rehberi](./features/elasticsearch-turkish-search-integration.md) - Turkish search ve queue sistemi
- [Implementation Guide](./features/elasticsearch-implementation-guide.md) - Teknik implementasyon

### 5. Deployment
- [Production Deployment](./deployment/production-deployment-guide.md) - Production deployment
- [Docker Setup](./deployment/docker-setup-howto.md) - Docker kurulumu

---

## 🚀 Hızlı Komutlar

```bash
# Monorepo kurulumu
npm install

# Web admin paneli başlatma
cd packages/web && npm run dev

# Admin backend başlatma
cd packages/admin-backend && npm run dev

# Elasticsearch ve queue sistemi başlatma
docker-compose -f docker-compose.dev.yml up -d elasticsearch redis admin-backend

# Turkish search testi
curl -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"iphone","page":1,"limit":5}'

# Geliştirme ortamını başlatma
cd packages/shared-types && npm run dev &
cd packages/web && npm run dev &
cd packages/mobile && npx expo start
```

---

## 🔍 Aktif Projeler

### ✅ **Tamamlanan Projeler**
- **Web Admin Backend Integration** - Production ready ✅
- **Elasticsearch Turkish Search** - Tamamlandı ✅
- **Admin RBAC System** - Tamamlandı ✅
- **Shared-Types Integration** - Tamamlandı ✅

### 🚧 **Aktif Projeler**
- **Mobile App Admin Integration** - Planlama aşamasında
- **Performance Optimization** - Beklemede
- **Advanced Analytics Dashboard** - Beklemede

### 📋 **Gelecek Projeler**
- **CI/CD Pipeline Enhancement** - Planlanıyor
- **Security Audit** - Planlanıyor
- **Monitoring & Observability** - Planlanıyor

---

## 📊 Proje Durumu

| Proje | Durum | Tamamlanma | Dokümantasyon |
|-------|-------|------------|---------------|
| Web Admin Integration | ✅ Production Ready | %100 | [📖 Detaylı](./features/web-admin-integration-documentation.md) |
| Elasticsearch Integration | ✅ Tamamlandı | %100 | [📖 Detaylı](./features/elasticsearch-implementation-guide.md) |
| Admin RBAC | ✅ Tamamlandı | %100 | [📖 Detaylı](./features/admin-role-based-access-control.md) |
| Shared-Types | ✅ Tamamlandı | %100 | [📖 Detaylı](./architecture/shared-types-guide.md) |

---

## 🔧 Teknik Stack

### Frontend
- **Web**: React 18 + TypeScript + Vite
- **Mobile**: React Native + Expo
- **UI**: Tailwind CSS + Lucide React

### Backend
- **Admin Backend**: Node.js + Express + Prisma
- **Database**: PostgreSQL + Supabase
- **Search**: Elasticsearch
- **Cache**: Redis

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + Performance Monitoring

---

## 📞 Destek

Dokümantasyonla ilgili sorularınız için:
- **GitHub Issues**: Proje sorunları ve öneriler
- **Pull Request**: Dokümantasyon iyileştirmeleri
- **Slack**: #benalsam-dev (geliştirici soruları)

---

## 📝 Katkıda Bulunma

1. **Dokümantasyon Güncelleme**: Pull request ile katkıda bulunun
2. **Hata Bildirimi**: GitHub Issues kullanın
3. **Öneriler**: Feature request olarak bildirin

---

**Son Güncelleme**: 2024-01-XX  
**Versiyon**: 2.0.0  
**Durum**: Production Ready ✅