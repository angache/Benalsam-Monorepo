# 🚀 Benalsam Admin Panel

Modern, scalable ve production-ready admin panel sistemi. Elasticsearch entegrasyonu, comprehensive monitoring ve automated CI/CD pipeline ile enterprise-level bir çözüm.

## 📋 **ÖZELLİKLER**

### 🏗️ **Teknoloji Stack**
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + TypeScript
- **Database**: PostgreSQL (Supabase)
- **Search Engine**: Elasticsearch
- **Cache**: Redis
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Custom health checks + Winston logging

### 🎯 **Core Features**
- ✅ **Elasticsearch Integration**: Advanced search with Turkish language support
- ✅ **Real-time Monitoring**: Health checks, metrics, and performance tracking
- ✅ **Automated Backup**: PostgreSQL, Elasticsearch, and configuration backup
- ✅ **CI/CD Pipeline**: Automated testing, building, and deployment
- ✅ **Zero-downtime Deployment**: Blue-green deployment with rollback capability
- ✅ **Security Hardening**: JWT authentication, CORS, rate limiting
- ✅ **Production Ready**: Docker, Nginx, SSL, monitoring

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
git clone https://github.com/your-username/benalsam-monorepo.git
cd benalsam-monorepo

# Dependencies install
npm install

# Shared types build
cd packages/shared-types && npm run build && cd ../..

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
git clone https://github.com/your-username/benalsam-monorepo.git .

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
│   └── admin-ui/             # Admin panel frontend
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── pages/         # Page components
│       │   ├── services/      # API services
│       │   └── utils/         # Utility functions
│       └── dist/              # Built frontend
├── scripts/                  # Deployment & backup scripts
│   ├── backup.sh            # Automated backup
│   ├── restore.sh           # Backup restore
│   └── setup-backup-cron.sh # Backup automation
├── .github/workflows/        # CI/CD pipelines
│   └── deploy-admin.yml     # GitHub Actions workflow
├── docs/                    # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── ELASTICSEARCH_PRODUCTION_DEPLOYMENT_GUIDE.md
└── docker-compose files     # Docker configurations
```

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
- Redis caching
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
# - Add UI components in admin-ui

# 3. Run tests
npm test

# 4. Build and test
npm run build
docker-compose -f docker-compose.dev.yml up -d

# 5. Create pull request
git push origin feature/new-feature
```

### **Testing**
```bash
# Run all tests
npm test

# Run specific test suite
npm run test:backend
npm run test:frontend

# Run tests with coverage
npm run test:coverage
```

### **Code Quality**
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

---

## 📚 **DOCUMENTATION**

### **Available Documentation**
- [API Documentation](./docs/API_DOCUMENTATION.md) - Complete API reference
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - Production deployment guide
- [Elasticsearch Guide](./docs/ELASTICSEARCH_PRODUCTION_DEPLOYMENT_GUIDE.md) - Elasticsearch integration guide

### **Architecture**
- **Monorepo Structure**: Shared types, backend, and frontend in single repository
- **Microservices**: Docker-based service architecture
- **Event-Driven**: Redis pub/sub for real-time updates
- **Search-First**: Elasticsearch for advanced search capabilities

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
docker-compose -f docker-compose.prod.yml exec admin-backend npm run db:test

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

---

## 📈 **ROADMAP**

### **Upcoming Features**
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app
- [ ] AI-powered recommendations
- [ ] Advanced reporting
- [ ] API rate limiting dashboard
- [ ] User activity tracking

### **Performance Improvements**
- [ ] Database query optimization
- [ ] Elasticsearch index optimization
- [ ] CDN integration
- [ ] Image optimization
- [ ] Caching improvements

---

*Bu proje sürekli geliştirilmektedir. Son güncelleme: 2025-07-19*

---

<div align="center">

**Made with ❤️ by the Benalsam Team**

[![GitHub stars](https://img.shields.io/github/stars/your-username/benalsam-monorepo?style=social)](https://github.com/your-username/benalsam-monorepo/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/your-username/benalsam-monorepo?style=social)](https://github.com/your-username/benalsam-monorepo/network)
[![GitHub issues](https://img.shields.io/github/issues/your-username/benalsam-monorepo)](https://github.com/your-username/benalsam-monorepo/issues)
[![GitHub license](https://img.shields.io/github/license/your-username/benalsam-monorepo)](https://github.com/your-username/benalsam-monorepo/blob/main/LICENSE)

</div> 