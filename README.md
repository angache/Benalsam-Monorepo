# 🚀 Benalsam Monorepo

Modern alım ilanları platformu - React Native, React, Node.js, Supabase, Elasticsearch

## 📋 **Hızlı Başlangıç**

### **Local Development**
```bash
# Repository klonlama
git clone https://github.com/your-username/benalsam-monorepo.git
cd benalsam-monorepo

# Environment dosyası
cp .env.example .env

# Development servislerini başlatma
docker-compose -f docker-compose.dev.yml up -d
```

**📖 Detaylı Local Guide:** [QUICK_START_LOCAL.md](./QUICK_START_LOCAL.md)

### **VPS Production**
```bash
# Sistem hazırlığı
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Proje kurulumu
git clone https://github.com/your-username/benalsam-monorepo.git
cd benalsam-monorepo
cp env.production.example .env.production

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

**📖 Detaylı VPS Guide:** [QUICK_START_VPS.md](./QUICK_START_VPS.md)  
**📖 Scripts Guide:** [QUICK_START_SCRIPTS.md](./QUICK_START_SCRIPTS.md)

## 🔗 **Erişim URL'leri**

### **Local Development**
- **Admin Backend**: http://localhost:3002
- **Admin UI**: http://localhost:3003
- **Web App**: http://localhost:5173
- **Elasticsearch**: http://localhost:9200

### **Production**
- **Web App**: https://benalsam.com
- **Admin Panel**: https://admin.benalsam.com
- **API**: https://benalsam.com/api

## 🏗️ **Proje Yapısı**

```
benalsam-monorepo/
├── packages/
│   ├── admin-backend/     # Node.js API
│   ├── admin-ui/          # React Admin Panel
│   ├── web/               # React Web App
│   ├── mobile/            # React Native App
│   └── shared-types/      # TypeScript Types
├── docs/                  # Dokümantasyon
├── scripts/               # Deployment Scripts
├── nginx/                 # Nginx Config
└── todos/                 # TODO Listeleri
```

## 🛠️ **Teknolojiler**

### **Frontend**
- **React 18** - Web uygulamaları
- **React Native** - Mobile uygulama
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling

### **Backend**
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Supabase** - Database & Auth
- **Elasticsearch** - Search engine
- **Redis** - Caching

### **DevOps**
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy
- **Let's Encrypt** - SSL certificates

## 🚀 **Özellikler**

### **Core Features**
- ✅ Multi-platform (Web, Mobile, Admin)
- ✅ Real-time messaging
- ✅ Advanced search with Elasticsearch
- ✅ Image optimization
- ✅ User authentication
- ✅ Role-based access control

### **Development Features**
- ✅ Hot reload
- ✅ Type safety
- ✅ Code splitting
- ✅ Performance optimization
- ✅ Security hardening

### **Production Features**
- ✅ SSL/TLS encryption
- ✅ Rate limiting
- ✅ Resource monitoring
- ✅ Automated backups
- ✅ Health checks

## 📊 **Performance**

### **Development**
- **Build Time**: < 2 minutes
- **Hot Reload**: < 1 second
- **Memory Usage**: ~2GB total

### **Production**
- **Response Time**: < 200ms
- **Uptime**: 99.9%
- **Resource Usage**: Optimized

## 🔒 **Güvenlik**

- ✅ Non-root containers
- ✅ SSL/TLS encryption
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection protection
- ✅ XSS protection

## 📈 **Monitoring**

- ✅ Health checks
- ✅ Resource monitoring
- ✅ Error tracking
- ✅ Performance metrics
- ✅ Automated alerts

## 🤝 **Katkıda Bulunma**

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 **Lisans**

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 **İletişim**

- **CTO**: +90 XXX XXX XX XX
- **Email**: dev@benalsam.com
- **Website**: https://benalsam.com

---

**Son Güncelleme:** 2025-08-04  
**Versiyon:** 2.0.0  
**Status:** Production Ready ✅ 