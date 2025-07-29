# 📋 Benalsam Projesi - Proje Standartları

Bu dosya, Benalsam projesinin geliştirme standartlarını ve kurallarını içerir.

## 🔧 **Geliştirme Kuralları**

### **PM2 Kullanımı**
- PM2 ile servisleri başlatırken mutlaka `ecosystem.config.js` dosyasını kullanın
- Örnek: `pm2 restart ecosystem.config.js --only admin-backend`
- PM2 loglarını kontrol ederken log dosyasından okuyun: `tail -n 50 packages/admin-backend/logs/combined.log`
- PM2 komut satırı logları yerine dosya loglarını tercih edin

### **Package Management**
- Proje `pnpm` kullanır, `npm` yerine `pnpm` komutlarını kullanın
- Örnek: `pnpm install`, `pnpm run dev`

### **Git Kullanımı**
- Commit mesajları İngilizce olmalı
- Push yaparken: `git push origin <branch-name>` kullanın

### **Environment Variables**
- Manuel çalıştırırken environment variable'ları manuel set edin
- PM2 ile çalıştırırken ecosystem.config.js'deki env değişkenlerini kullanın

### **Code Standards**
- TypeScript kullanın
- ESLint kurallarına uyun
- Kod dokümantasyonu yazın

### **Service Communication**
- Admin backend için 'a-b' kısaltmasını kullanın
- Shared types için 's-t' kısaltmasını kullanın
- `@benalsam/shared-types` modülünden ortak veri yapılarını import edin

### **Error Handling**
- Hata durumlarında detaylı log yazın
- Response'ları dosyaya kaydederek debug edin
- Try-catch bloklarını kullanın

## 🚀 **Deployment Kuralları**

### **VPS Management**
- Node.js'i nvm ile yönetin
- Tam path bilgilerini kullanın
- Docker container'ları için backup alın

### **Monitoring**
- Health check'leri düzenli kontrol edin
- Log dosyalarını takip edin
- Performance metriklerini izleyin

## 📝 **Documentation**
- Tüm değişiklikleri dokümante edin
- README dosyalarını güncel tutun
- API dokümantasyonunu güncelleyin 