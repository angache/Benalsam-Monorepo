# 📚 Benalsam Monorepo Dokümantasyonu

Bu klasör, Benalsam monorepo'su için kapsamlı dokümantasyon içerir.

## 📖 Rehberler

### 🏗️ [Monorepo Rehberi](./MONOREPO_GUIDE.md)
Monorepo yapısı, kurulum, geliştirme süreci ve best practice'ler hakkında detaylı bilgi.

### 📦 [Shared-Types Kullanım Rehberi](./SHARED_TYPES_GUIDE.md)
Shared-types paketinin nasıl kullanılacağı, yeni özellik ekleme ve sorun giderme rehberi.

### 🔍 [Elasticsearch Turkish Search Entegrasyonu](./ELASTICSEARCH_TURKISH_SEARCH_INTEGRATION.md)
**YENİ!** Turkish search, queue sistemi ve Elasticsearch entegrasyonu hakkında kapsamlı rehber.

### 🚀 [Elasticsearch Implementation Guide](./ELASTICSEARCH_IMPLEMENTATION_GUIDE.md)
Elasticsearch implementasyonu, mimari ve teknik detaylar.

## 🎯 Hızlı Başlangıç

### 1. Monorepo'yu Anlama
- [Monorepo Rehberi](./MONOREPO_GUIDE.md#genel-bakış) - Genel bakış ve yapı
- [Kurulum](./MONOREPO_GUIDE.md#kurulum) - İlk kurulum adımları

### 2. Shared-Types Kullanımı
- [Shared-Types Rehberi](./SHARED_TYPES_GUIDE.md#genel-bakış) - Paket hakkında genel bilgi
- [Kullanım Örnekleri](./SHARED_TYPES_GUIDE.md#kullanım-örnekleri) - Pratik örnekler

### 3. Elasticsearch Entegrasyonu
- [Turkish Search Rehberi](./ELASTICSEARCH_TURKISH_SEARCH_INTEGRATION.md#genel-bakış) - Turkish search ve queue sistemi
- [Implementation Guide](./ELASTICSEARCH_IMPLEMENTATION_GUIDE.md#faz-1-shared-types--elasticsearch-service) - Teknik implementasyon

### 4. Geliştirme Süreci
- [Geliştirme Süreci](./MONOREPO_GUIDE.md#geliştirme-süreci) - Adım adım geliştirme
- [Best Practices](./MONOREPO_GUIDE.md#best-practices) - En iyi uygulamalar

## 🚀 Hızlı Komutlar

```bash
# Monorepo kurulumu
npm install

# Elasticsearch ve queue sistemi başlatma
docker-compose -f docker-compose.dev.yml up -d elasticsearch redis admin-backend

# Turkish search testi
curl -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"iphone","page":1,"limit":5}'

# Queue stats kontrolü
curl -s http://localhost:3002/api/v1/elasticsearch/queue/stats | jq .

# Geliştirme ortamını başlatma
cd packages/shared-types && npm run dev &
cd packages/web && npm run dev &
cd packages/mobile && npx expo start

# Shared-types değişiklik yapma
cd packages/shared-types
npm run dev  # Watch mode
```

## 🔍 Yeni Özellikler (v2.0.0)

### Turkish Search Entegrasyonu
- ✅ Built-in Turkish analyzer
- ✅ Location field optimization
- ✅ Test edilmiş arama sonuçları
- ✅ 12 listing indexed

### Queue-Based Sync Sistemi
- ✅ PostgreSQL-based queue
- ✅ Background processing
- ✅ Error handling ve retry
- ✅ Real-time monitoring

### Docker Container Orchestration
- ✅ Elasticsearch (1GB memory)
- ✅ Redis caching
- ✅ Admin backend integration
- ✅ Hot reload support

## 📞 Destek

Dokümantasyonla ilgili sorularınız için:
- GitHub Issues kullanın
- Pull Request ile katkıda bulunun
- Dokümantasyonu güncelleyin

---

**Not:** Bu dokümantasyon sürekli güncellenmektedir.  
**Son Güncelleme:** 19 Temmuz 2025 - Turkish Search & Queue System v2.0.0