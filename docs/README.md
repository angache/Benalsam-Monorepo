# 📚 Benalsam Monorepo Dokümantasyonu

Bu klasör, Benalsam monorepo'su için kapsamlı dokümantasyon içerir.

## 📖 Rehberler

### 🏗️ [Monorepo Rehberi](./MONOREPO_GUIDE.md)
Monorepo yapısı, kurulum, geliştirme süreci ve best practice'ler hakkında detaylı bilgi.

### 📦 [Shared-Types Kullanım Rehberi](./SHARED_TYPES_GUIDE.md)
Shared-types paketinin nasıl kullanılacağı, yeni özellik ekleme ve sorun giderme rehberi.

## 🎯 Hızlı Başlangıç

### 1. Monorepo'yu Anlama
- [Monorepo Rehberi](./MONOREPO_GUIDE.md#genel-bakış) - Genel bakış ve yapı
- [Kurulum](./MONOREPO_GUIDE.md#kurulum) - İlk kurulum adımları

### 2. Shared-Types Kullanımı
- [Shared-Types Rehberi](./SHARED_TYPES_GUIDE.md#genel-bakış) - Paket hakkında genel bilgi
- [Kullanım Örnekleri](./SHARED_TYPES_GUIDE.md#kullanım-örnekleri) - Pratik örnekler

### 3. Geliştirme Süreci
- [Geliştirme Süreci](./MONOREPO_GUIDE.md#geliştirme-süreci) - Adım adım geliştirme
- [Best Practices](./MONOREPO_GUIDE.md#best-practices) - En iyi uygulamalar

## 🚀 Hızlı Komutlar

```bash
# Monorepo kurulumu
npm install

# Geliştirme ortamını başlatma
cd packages/shared-types && npm run dev &
cd packages/web && npm run dev &
cd packages/mobile && npx expo start

# Shared-types değişiklik yapma
cd packages/shared-types
npm run dev  # Watch mode
```

## 📞 Destek

Dokümantasyonla ilgili sorularınız için:
- GitHub Issues kullanın
- Pull Request ile katkıda bulunun
- Dokümantasyonu güncelleyin

---

**Not:** Bu dokümantasyon sürekli güncellenmektedir.