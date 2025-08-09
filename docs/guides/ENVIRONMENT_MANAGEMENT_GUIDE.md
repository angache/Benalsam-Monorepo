# 🌍 Environment Management Guide - Benalsam Monorepo

**Oluşturulma Tarihi:** 2025-01-18  
**Son Güncelleme:** 2025-01-18  
**Versiyon:** 1.0.0  

---

## 📋 **GENEL BAKIŞ**

Bu rehber, Benalsam monorepo projesinde environment configuration yönetimini açıklar. Proje, enterprise-level environment management için single source of truth yaklaşımını kullanır.

---

## 🏗️ **ENVIRONMENT ARCHITECTURE**

### **Single Source of Truth Pattern**

```
env.consolidated.example     ← Ana template (tüm variables)
├── .env                     ← Root environment (production)
├── .env.development        ← Development overrides
├── .env.production         ← Production overrides  
├── .env.local              ← Local machine overrides
└── packages/*/             ← Package-specific copies
    ├── .env
    ├── .env.development
    └── .env.production
```

### **Environment Hierarchy**

1. **Root Level** - Ana konfigürasyon
2. **Environment Specific** - Development/Production overrides
3. **Local Overrides** - Machine-specific ayarlar
4. **Package Level** - Her package için kopya

---

## 📁 **ENVIRONMENT DOSYALARI**

### **1. env.consolidated.example**
- **Amaç:** Tüm environment variables'ların single source of truth'u
- **İçerik:** Tüm packages için gerekli tüm variables
- **Kullanım:** Template olarak kullanılır, Git'e commit edilir

### **2. .env**
- **Amaç:** Root level environment configuration
- **İçerik:** Production-ready configuration
- **Git:** Commit edilmez (.gitignore)

### **3. .env.development**
- **Amaç:** Development environment overrides
- **İçerik:** Development-specific ayarlar
- **Git:** Commit edilmez (.gitignore)

### **4. .env.production**
- **Amaç:** Production environment overrides
- **İçerik:** Production-specific ayarlar
- **Git:** Commit edilmez (.gitignore)

### **5. .env.local**
- **Amaç:** Local machine overrides
- **İçerik:** Developer-specific ayarlar
- **Git:** Commit edilmez (.gitignore)

---

## 🚀 **HIZLI BAŞLANGIÇ**

### **Development Environment Setup**

```bash
# Development environment kurulumu
./scripts/setup-env.sh --dev

# Validation ile kurulum
./scripts/setup-env.sh --dev --validate

# Force overwrite (mevcut dosyaları üzerine yaz)
./scripts/setup-env.sh --dev --force
```

### **Production Environment Setup**

```bash
# Production environment kurulumu
./scripts/setup-env.sh --prod

# Validation ile kurulum
./scripts/setup-env.sh --prod --validate
```

### **Local Development Setup**

```bash
# Local development environment kurulumu
./scripts/setup-env.sh --local

# Force overwrite ile
./scripts/setup-env.sh --local --force
```

---

## 🔧 **ENVIRONMENT VALIDATION**

### **Manual Validation**

```bash
# Environment validation çalıştırma
node scripts/validate-env.js

# Strict validation (tüm warnings'ları error olarak göster)
node scripts/validate-env.js --strict
```

### **Validation Checks**

1. **Required Variables** - Zorunlu variables'ların varlığı
2. **Security Issues** - Güvenlik açıkları (default values, weak secrets)
3. **Variable Conflicts** - Farklı dosyalarda çakışan variables
4. **Naming Consistency** - Variable naming standartları
5. **Package Conflicts** - Package'lar arası conflicts

---

## 📝 **ENVIRONMENT VARIABLES REFERENCE**

### **Core Application Variables**

| Variable | Açıklama | Örnek | Gerekli |
|----------|----------|-------|---------|
| `NODE_ENV` | Application environment | `development`, `production` | ✅ |
| `PORT` | Application port | `3002` | ✅ |
| `API_VERSION` | API version | `v1` | ✅ |
| `HOST` | Application host | `localhost` | ✅ |

### **Supabase Configuration**

| Variable | Açıklama | Örnek | Gerekli |
|----------|----------|-------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://project.supabase.co` | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` | ✅ |

### **Database Configuration**

| Variable | Açıklama | Örnek | Gerekli |
|----------|----------|-------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | ✅ |
| `DB_MAX_CONNECTIONS` | Max database connections | `10` | ❌ |
| `DB_IDLE_TIMEOUT` | Connection idle timeout | `30000` | ❌ |

### **Redis Configuration**

| Variable | Açıklama | Örnek | Gerekli |
|----------|----------|-------|---------|
| `REDIS_HOST` | Redis host | `redis` | ❌ |
| `REDIS_PORT` | Redis port | `6379` | ❌ |
| `REDIS_PASSWORD` | Redis password | `password` | ❌ |
| `REDIS_URL` | Redis connection string | `redis://redis:6379` | ❌ |

### **JWT Configuration**

| Variable | Açıklama | Örnek | Gerekli |
|----------|----------|-------|---------|
| `JWT_SECRET` | JWT signing secret | `super-secret-key-32-chars-min` | ✅ |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` | ❌ |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` | ❌ |

---

## 🔒 **GÜVENLİK REHBERİ**

### **Critical Security Variables**

```bash
# ❌ NEVER commit these to Git
JWT_SECRET=your-actual-secret-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-key
DATABASE_URL=your-actual-database-url
AWS_ACCESS_KEY_ID=your-actual-aws-key
AWS_SECRET_ACCESS_KEY=your-actual-aws-secret
```

### **Security Best Practices**

1. **Strong Secrets** - JWT_SECRET en az 32 karakter
2. **No Default Values** - Production'da placeholder values kullanmayın
3. **Environment Isolation** - Development ve production credentials'ları ayırın
4. **Regular Rotation** - Secrets'ları düzenli olarak değiştirin
5. **Access Control** - Environment dosyalarına sadece gerekli kişiler erişsin

---

## 🐳 **DOCKER INTEGRATION**

### **Environment File Loading**

```yaml
# docker-compose.yml
services:
  admin-backend:
    env_file:
      - .env
      - .env.${NODE_ENV:-development}
    environment:
      - NODE_ENV=${NODE_ENV:-development}
```

### **Production Docker**

```yaml
# docker-compose.prod.yml
services:
  admin-backend:
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
```

---

## 📊 **MONITORING & LOGGING**

### **Environment Health Checks**

```bash
# Environment validation
node scripts/validate-env.js

# Check environment files
ls -la .env*

# Validate package environments
for pkg in packages/*; do
  echo "Checking $pkg..."
  ls -la "$pkg/.env*" 2>/dev/null || echo "No env files"
done
```

### **Logging Configuration**

```bash
# Development logging
LOG_LEVEL=debug
ENABLE_DEBUG_MODE=true

# Production logging
LOG_LEVEL=warn
ENABLE_PROD_LOGGING=true
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Missing Required Variables**
```bash
# Error: Missing required variable: SUPABASE_URL
# Solution: Add to .env file
SUPABASE_URL=https://your-project.supabase.co
```

#### **2. Variable Conflicts**
```bash
# Error: Variable conflict: API_URL has different values
# Solution: Use single source of truth in .env
# Override in environment-specific files
```

#### **3. Security Issues**
```bash
# Error: Security issue: JWT_SECRET has default value
# Solution: Set actual secret value
JWT_SECRET=your-actual-32-character-secret-key
```

#### **4. Package Environment Issues**
```bash
# Error: Package admin-backend missing .env
# Solution: Run setup script
./scripts/setup-env.sh --dev
```

### **Debug Commands**

```bash
# Check environment file contents
cat .env | grep SUPABASE

# Validate specific package
cd packages/admin-backend
node ../../scripts/validate-env.js

# Check environment variables in Node.js
node -e "console.log(process.env.NODE_ENV)"
```

---

## 📚 **BEST PRACTICES**

### **1. Environment Organization**
- ✅ Single source of truth kullanın
- ✅ Environment-specific overrides kullanın
- ✅ Local overrides için .env.local kullanın
- ❌ Hardcoded values kullanmayın

### **2. Security**
- ✅ Strong secrets kullanın (32+ karakter)
- ✅ Production credentials'ları güvenli tutun
- ✅ Regular security audits yapın
- ❌ Default values commit etmeyin

### **3. Development Workflow**
- ✅ Setup script'leri kullanın
- ✅ Validation çalıştırın
- ✅ Environment conflicts'leri çözün
- ❌ Manual environment file creation yapmayın

### **4. Team Collaboration**
- ✅ Template files'ları güncel tutun
- ✅ Environment setup documentation'ı paylaşın
- ✅ Security guidelines'ları takip edin
- ❌ Actual credentials'ları paylaşmayın

---

## 🔄 **MAINTENANCE**

### **Regular Tasks**

1. **Weekly** - Environment validation çalıştırın
2. **Monthly** - Security audit yapın
3. **Quarterly** - Template files'ları güncelleyin
4. **Annually** - Environment strategy'yi review edin

### **Update Process**

```bash
# 1. Backup existing environments
cp .env .env.backup.$(date +%Y%m%d)

# 2. Update templates
# Edit env.consolidated.example

# 3. Re-run setup
./scripts/setup-env.sh --dev --force

# 4. Validate
node scripts/validate-env.js
```

---

## 📞 **SUPPORT**

### **Getting Help**

1. **Documentation** - Bu rehberi kontrol edin
2. **Validation Script** - `node scripts/validate-env.js`
3. **Setup Script** - `./scripts/setup-env.sh --help`
4. **Team Lead** - Environment issues için

### **Reporting Issues**

Environment configuration issues için:
1. Issue description
2. Error messages
3. Environment type (dev/prod/local)
4. Validation output
5. Steps to reproduce

---

## 📝 **CHANGELOG**

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-18 | Initial release with comprehensive guide |

---

**Son Güncelleme:** 2025-01-18  
**Güncelleyen:** CTO Technical Audit Team  
**Sonraki Review:** 2025-01-25
