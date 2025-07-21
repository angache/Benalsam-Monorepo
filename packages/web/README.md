# 🌐 Web Admin Panel

Modern React tabanlı admin paneli - admin-backend ile tam entegre.

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build

# Testleri çalıştır
npm run test:run
```

## 📋 Özellikler

- ✅ **Authentication**: JWT tabanlı güvenli giriş
- ✅ **User Management**: Admin kullanıcı yönetimi
- ✅ **Listing Management**: İlan moderasyonu ve yönetimi
- ✅ **Analytics**: Dashboard ve raporlama
- ✅ **Real-time Updates**: WebSocket entegrasyonu
- ✅ **Responsive Design**: Mobil uyumlu arayüz
- ✅ **TypeScript**: Tam tip güvenliği
- ✅ **Testing**: %90+ test coverage
- ✅ **Security**: Güvenlik audit ve monitoring

## 🛠️ Teknolojiler

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: React Query + Zustand
- **Testing**: Vitest + React Testing Library
- **Monitoring**: Sentry + Performance Monitoring
- **CI/CD**: GitHub Actions

## 📚 Dokümantasyon

Detaylı dokümantasyon için: [📖 Web Admin Integration Documentation](../docs/WEB_ADMIN_INTEGRATION_DOCUMENTATION.md)

## 🔧 Geliştirme

### Environment Variables
```bash
# .env.local
VITE_ADMIN_API_URL=http://localhost:3002/api/v1
VITE_ADMIN_WS_URL=ws://localhost:3002
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn
```

### Komutlar
```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run test:run     # Testleri çalıştır
npm run test:ui      # Test UI
npm run lint         # Linting
npm run type-check   # Type checking
npm run security-audit # Güvenlik audit
```

## 🚀 Deployment

### Production Build
```bash
npm run build:prod
```

### CI/CD Pipeline
GitHub Actions ile otomatik deployment:
- ✅ Test çalıştırma
- ✅ Security audit
- ✅ Production build
- ✅ Deployment

## 📊 Monitoring

- **Error Tracking**: Sentry entegrasyonu
- **Performance**: Core Web Vitals monitoring
- **Analytics**: User behavior tracking
- **Security**: Automated security audits

## 🤝 Katkıda Bulunma

1. Feature branch oluştur
2. Kod yaz ve test et
3. Pull request aç
4. Code review bekle
5. Merge et

## 📞 Destek

- **Dokümantasyon**: [📖 Detaylı Dokümantasyon](../docs/WEB_ADMIN_INTEGRATION_DOCUMENTATION.md)
- **Issues**: GitHub Issues
- **Slack**: #web-admin

---

**Versiyon**: 1.0.0  
**Durum**: Production Ready ✅  
**Son Güncelleme**: 2024-01-XX 