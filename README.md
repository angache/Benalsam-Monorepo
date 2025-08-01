# 🚀 Benalsam Enterprise Platform

Modern, scalable ve production-ready enterprise platform. Elasticsearch entegrasyonu, enterprise caching sistemi, comprehensive monitoring ve automated CI/CD pipeline ile enterprise-level bir çözüm.

## 📋 **ÖZELLİKLER**

### 🏗️ **Teknoloji Stack**
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + TypeScript
- **Mobile**: React Native/Expo + TypeScript
- **Database**: PostgreSQL (Supabase)
- **Search Engine**: Elasticsearch with Turkish analyzer
- **Cache**: Enterprise Multi-Tier Caching System
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Custom health checks + Winston logging

### 🎯 **Core Features**
- ✅ **Elasticsearch Integration**: Advanced search with Turkish language support
- ✅ **Enterprise Cache System**: Multi-tier caching with predictive capabilities
- ✅ **Real-time Monitoring**: Health checks, metrics, and performance tracking
- ✅ **Automated Backup**: PostgreSQL, Elasticsearch, and configuration backup
- ✅ **CI/CD Pipeline**: Automated testing, building, and deployment
- ✅ **Zero-downtime Deployment**: Blue-green deployment with rollback capability
- ✅ **Security Hardening**: JWT authentication, CORS, rate limiting
- ✅ **Production Ready**: Docker, Nginx, SSL, monitoring

### 📱 **Mobile Application**
- ✅ **React Native/Expo**: Cross-platform mobile development
- ✅ **React Query Integration**: Enterprise-level caching (8/8 modules)
- ✅ **Supabase Integration**: Real-time database operations
- ✅ **Hybrid Image Upload**: Gallery + Unsplash stock images
- ✅ **Location Services**: City/district/neighborhood selection
- ✅ **Form Validation**: Comprehensive error handling
- ✅ **User Authentication**: Secure session management

### 🌐 **Web Application**
- ✅ **Modern UI/UX**: Tailwind CSS responsive design
- ✅ **Settings 2.0**: Responsive settings layout with sidebar navigation
- ✅ **Code Splitting**: React.lazy and Suspense implementation
- ✅ **Real-time Chat**: WebSocket integration
- ✅ **Premium Features**: Analytics and advanced features

---

## 🚀 **HIZLI BAŞLANGIÇ**

### **Prerequisites**
- Node.js 20+
- Docker 24.0+
- Docker Compose 2.0+
- Git

### **Development Setup**
```bash
# Repository clone
git clone https://github.com/angache/benalsam-monorepo.git
cd benalsam-monorepo

# Dependencies install
pnpm install

# Shared types build
cd packages/shared-types && pnpm run build && cd ../..

# Environment setup
cp .env.example .env
# Edit .env with your configuration

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Check health
curl http://localhost:3002/api/v1/health
```

### **Production Setup**
```bash
# Production deployment
cd /opt/benalsam-admin
git clone https://github.com/angache/benalsam-monorepo.git .

# Environment configuration
cp .env.example .env
# Configure production environment variables

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d

# Setup monitoring and backup
./scripts/setup-backup-cron.sh
```

---

## 📁 **PROJE YAPISI**

```
benalsam-monorepo/
├── packages/
│   ├── shared-types/          # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── services/      # Elasticsearch service
│   │   │   └── types/         # TypeScript interfaces
│   │   └── dist/              # Compiled types
│   ├── admin-backend/         # Admin panel backend
│   │   ├── src/
│   │   │   ├── config/        # Configuration files
│   │   │   ├── controllers/   # Route controllers
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── routes/        # API routes
│   │   │   ├── services/      # Business logic
│   │   │   └── utils/         # Utility functions
│   │   └── dist/              # Compiled backend
│   ├── admin-ui/             # Admin panel frontend
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── pages/         # Page components
│   │   │   ├── services/      # API services
│   │   │   └── utils/         # Utility functions
│   │   └── dist/              # Built frontend
│   ├── web/                  # Web application
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── pages/         # Page components
│   │   │   ├── services/      # API services
│   │   │   └── utils/         # Utility functions
│   │   └── dist/              # Built web app
│   └── mobile/               # Mobile application
│       ├── src/
│       │   ├── components/    # React Native components
│       │   ├── screens/       # Screen components
│       │   ├── services/      # API services
│       │   └── utils/         # Utility functions
│       └── dist/              # Built mobile app
├── scripts/                  # Deployment & backup scripts
│   ├── backup.sh            # Automated backup
│   ├── restore.sh           # Backup restore
│   └── setup-backup-cron.sh # Backup automation
├── .github/workflows/        # CI/CD pipelines
│   └── deploy-admin.yml     # GitHub Actions workflow
├── docs/                    # Documentation
│   ├── project/            # Project documentation
│   ├── guides/             # Development guides
│   ├── todos/              # TODO documentation
│   ├── architecture/       # Architecture docs
│   ├── deployment/         # Deployment guides
│   ├── api/               # API documentation
│   ├── features/          # Feature guides
│   └── deprecated/        # Old documentation
└── docker-compose files     # Docker configurations
```

---

## 🔍 **ELASTICSEARCH TURKISH SEARCH**

### **Advanced Search Features**
- **Built-in Turkish Analyzer**: Native Elasticsearch Turkish analyzer
- **Location Field Optimization**: Text-based location mapping
- **Turkish Language Support**: Perfect Turkish search support
- **Search Performance**: ~130ms average response time
- **Queue Integration**: PostgreSQL-based sync system

### **Technical Implementation**
- **Index Mapping**: Optimized field types and analyzers
- **Connection Management**: Health check and monitoring
- **Search Operations**: Turkish search support
- **Background Processing**: 5-second interval sync

---

## 🚀 **ENTERPRISE CACHE SYSTEM**

### **Multi-Tier Caching Architecture**
- **Memory Cache (L1)**: In-memory caching for fastest access
- **Remote Redis (L2)**: Distributed caching for scalability
- **Distributed Redis (L3)**: Geographic distribution (planned)
- **Database (L4)**: Persistent storage as fallback

### **Advanced Cache Features**
- **Predictive Caching**: ML-based cache prediction
- **Geographic Caching**: CDN integration, regional distribution
- **Smart Invalidation**: AI-based pattern recognition
- **Cache Compression**: Data compression (Gzip)
- **Real-time Analytics**: Performance monitoring
- **Admin Dashboard**: Visual cache management

### **Cache Services**
- **MemoryCacheService**: L1 memory caching
- **SearchCacheService**: Elasticsearch query caching
- **APICacheService**: API response caching
- **PredictiveCacheService**: ML-based prediction
- **GeographicCacheService**: Regional distribution
- **SmartInvalidationService**: Intelligent cache invalidation
- **CacheCompressionService**: Data compression
- **CacheAnalyticsService**: Performance monitoring

---

## 📱 **MOBILE APPLICATION**

### **React Native/Expo Features**
- **Cross-platform Development**: iOS and Android support
- **React Query Integration**: Enterprise-level caching (8/8 modules)
- **Supabase Integration**: Real-time database operations
- **Hybrid Image Upload**: Gallery + Unsplash stock images
- **Location Services**: City/district/neighborhood selection
- **Form Validation**: Comprehensive error handling
- **User Authentication**: Secure session management

### **Technical Excellence**
- **TypeScript**: Full type safety
- **React Query**: Enterprise-level state management
- **Zustand**: Lightweight state management
- **AsyncStorage/SecureStore**: Platform-specific storage
- **Performance**: Optimized bundle size and lazy loading

### **Production Status**
- **71 Tests PASSED** ✅
- **Main branch merged** ✅
- **Clean codebase** ✅
- **Production-ready** ✅

---

## 🌐 **WEB APPLICATION**

### **Modern Web Features**
- **React 18**: Modern React features
- **Vite**: Fast build tool
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Supabase**: Backend integration
- **React Router**: Client-side routing

### **Settings 2.0 - Responsive Layout**
- **Desktop (1024px+)**: Sidebar navigation + content area
- **Mobile (<1024px)**: Compact single-page layout
- **Auto-resize**: Automatic layout switching
- **Settings Categories**: Account, Platform, Support
- **Technical Features**: Route structure, animations, active states

### **Code Splitting Implementation**
- **React.lazy and Suspense**: Lazy loading
- **Vite Config**: Chunk separation
- **Preload**: Performance optimization
- **Route-based splitting**: Page-based splitting

---

## 🔧 **API ENDPOINTS**

### **Health Check**
```bash
# Basic health check
GET /api/v1/health

# Detailed health check
GET /api/v1/health/detailed

# Individual service health
GET /api/v1/health/database
GET /api/v1/health/redis
GET /api/v1/health/elasticsearch
```

### **Monitoring**
```bash
# System metrics
GET /api/v1/monitoring/metrics

# Performance metrics
GET /api/v1/monitoring/performance

# Error tracking
GET /api/v1/monitoring/errors

# Service status
GET /api/v1/monitoring/status
```

### **Admin Management**
```bash
# User management
GET /api/v1/admin/users
PUT /api/v1/admin/users/:id
POST /api/v1/admin/users/:id/block

# Category management
GET /api/v1/admin/categories
POST /api/v1/admin/categories
PUT /api/v1/admin/categories/:id

# Listing management
GET /api/v1/admin/listings
PUT /api/v1/admin/listings/:id/status
```

### **Elasticsearch**
```bash
# Search listings
POST /api/v1/elasticsearch/search

# Index management
POST /api/v1/elasticsearch/reindex
GET /api/v1/elasticsearch/stats
```

### **Cache Management**
```bash
# Cache statistics
GET /api/v1/cache/stats

# Cache invalidation
POST /api/v1/cache/invalidate

# Cache warming
POST /api/v1/cache/warm

# Cache analytics
GET /api/v1/cache/analytics
```

---

## 🗄️ **BACKUP & RESTORE**

### **Automated Backup**
```bash
# Setup automated backup (production)
sudo ./scripts/setup-backup-cron.sh

# Manual backup
./scripts/backup.sh

# Check backup status
./scripts/backup-status.sh
```

### **Restore from Backup**
```bash
# List available backups
./scripts/restore.sh list

# Validate backup
./scripts/restore.sh validate <backup_id>

# Restore from backup
./scripts/restore.sh restore <backup_id>
```

---

## 🔍 **MONITORING**

### **Health Monitoring**
```bash
# Health check
curl http://admin.benalsam.com/health

# Detailed metrics
curl http://admin.benalsam.com/api/v1/monitoring/metrics

# Service status
curl http://admin.benalsam.com/api/v1/monitoring/status
```

### **Log Monitoring**
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f admin-backend

# Backup logs
tail -f /var/log/benalsam-backup.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
```

---

## 🚀 **DEPLOYMENT**

### **Development**
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### **Production**
```bash
# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Update deployment
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# Health check
curl -f http://localhost:3002/api/v1/health
```

### **CI/CD Pipeline**
```bash
# GitHub Actions automatically:
# 1. Runs tests on push to main
# 2. Builds Docker images
# 3. Deploys to VPS
# 4. Performs health checks
# 5. Sends notifications
```

---

## 🔒 **SECURITY**

### **Authentication**
- JWT token-based authentication
- Role-based access control (RBAC)
- Secure password hashing
- Session management

### **Network Security**
- HTTPS/SSL encryption
- CORS configuration
- Rate limiting
- Firewall protection

### **Data Security**
- Encrypted data transmission
- Secure environment variables
- Regular security updates
- Automated backup encryption

---

## 📊 **PERFORMANCE**

### **Optimization Features**
- Database connection pooling
- Enterprise multi-tier caching
- Elasticsearch query optimization
- Gzip compression
- CDN integration

### **Monitoring Metrics**
- Response time tracking
- Error rate monitoring
- Resource usage tracking
- Performance alerts

---

## 🛠️ **DEVELOPMENT**

### **Adding New Features**
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Implement changes
# - Add TypeScript types in shared-types
# - Implement backend logic in admin-backend
# - Add UI components in admin-ui/web/mobile

# 3. Run tests
pnpm test

# 4. Build and test
pnpm run build
docker-compose -f docker-compose.dev.yml up -d

# 5. Create pull request
git push origin feature/new-feature
```

### **Testing**
```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm run test:backend
pnpm run test:frontend
pnpm run test:mobile

# Run tests with coverage
pnpm run test:coverage
```

### **Code Quality**
```bash
# Linting
pnpm run lint

# Type checking
pnpm run type-check

# Format code
pnpm run format
```

---

## 📚 **DOCUMENTATION**

### **📖 Available Documentation**
- [📚 Docs Overview](./docs/README.md) - Complete documentation index
- [🏗️ Project Standards](./docs/project/PROJECT_STANDARDS.md) - Project rules and standards
- [🚀 Development Setup](./docs/architecture/DEVELOPMENT_SETUP_GUIDE.md) - Development environment setup
- [🔧 API Documentation](./docs/api/API_DOCUMENTATION_NEW.md) - Complete API reference
- [⚡ Features Guide](./docs/features/ELASTICSEARCH_IMPLEMENTATION_GUIDE.md) - Elasticsearch integration guide
- [🚀 Cache System](./docs/features/ENTERPRISE_CACHE_SYSTEM_DOCUMENTATION.md) - Enterprise caching guide
- [📱 Mobile App](./docs/architecture/MOBILE_APP_DOCUMENTATION.md) - Mobile application guide
- [📋 Active TODOs](./docs/todos/README.md) - Current tasks and planning

### **Architecture**
- **Monorepo Structure**: Shared types, backend, frontend, and mobile in single repository
- **Microservices**: Docker-based service architecture
- **Event-Driven**: Redis pub/sub for real-time updates
- **Search-First**: Elasticsearch for advanced search capabilities
- **Cache-First**: Enterprise multi-tier caching system

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **Service Won't Start**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs admin-backend

# Check health
curl -f http://localhost:3002/api/v1/health

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

#### **Database Connection Issues**
```bash
# Test database connection
docker-compose -f docker-compose.prod.yml exec admin-backend pnpm run db:test

# Check environment variables
docker-compose -f docker-compose.prod.yml exec admin-backend env | grep SUPABASE
```

#### **Elasticsearch Issues**
```bash
# Check Elasticsearch health
curl -X GET "localhost:9200/_cluster/health?pretty"

# Check indices
curl -X GET "localhost:9200/_cat/indices?v"

# Restart Elasticsearch
docker-compose -f docker-compose.prod.yml restart elasticsearch
```

#### **Cache Issues**
```bash
# Check cache status
curl http://localhost:3002/api/v1/cache/stats

# Clear cache
curl -X POST http://localhost:3002/api/v1/cache/invalidate

# Check Redis connection
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

### **Performance Issues**
```bash
# Check resource usage
docker stats

# Monitor logs
docker-compose -f docker-compose.prod.yml logs -f

# Check system resources
htop
df -h
free -h
```

---

## 🤝 **CONTRIBUTING**

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

### **Code Standards**
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write comprehensive tests
- Update documentation
- Follow commit message conventions

### **Commit Message Format**
```
type(scope): description

feat(api): add user management endpoints
fix(ui): resolve search filter issue
docs(readme): update installation instructions
```

---

## 📞 **SUPPORT**

### **Getting Help**
- **Documentation**: Check the docs folder
- **Issues**: Create GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: support@benalsam.com

### **Emergency Contacts**
- **Technical Lead**: [Your Name] - [Phone] - [Email]
- **DevOps**: [DevOps Contact] - [Phone] - [Email]

---

## 📄 **LICENSE**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 **ACKNOWLEDGMENTS**

- **Elasticsearch**: For powerful search capabilities
- **Supabase**: For database and authentication
- **Docker**: For containerization
- **GitHub Actions**: For CI/CD automation
- **React & Node.js**: For the development framework
- **React Native/Expo**: For cross-platform mobile development

---

## 📈 **ROADMAP**

### **Upcoming Features**
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] AI-powered recommendations
- [ ] Advanced reporting
- [ ] API rate limiting dashboard
- [ ] User activity tracking
- [ ] Geographic cache distribution

### **Performance Improvements**
- [ ] Database query optimization
- [ ] Elasticsearch index optimization
- [ ] CDN integration
- [ ] Image optimization
- [ ] Cache improvements
- [ ] Mobile app performance optimization

---

*Bu proje sürekli geliştirilmektedir. Son güncelleme: 2025-01-09*

---

<div align="center">

**Made with ❤️ by the Benalsam Team**

[![GitHub stars](https://img.shields.io/github/stars/angache/benalsam-monorepo?style=social)](https://github.com/angache/benalsam-monorepo/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/angache/benalsam-monorepo?style=social)](https://github.com/angache/benalsam-monorepo/network)
[![GitHub issues](https://img.shields.io/github/issues/angache/benalsam-monorepo)](https://github.com/angache/benalsam-monorepo/issues)
[![GitHub license](https://img.shields.io/github/license/angache/benalsam-monorepo)](https://github.com/angache/benalsam-monorepo/blob/main/LICENSE)

</div> 