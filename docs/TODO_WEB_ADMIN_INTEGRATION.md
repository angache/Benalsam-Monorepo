# Web Admin Backend Entegrasyonu - TODO Listesi

## 🚀 **Faz 1: Temel Altyapı (1-2 gün)**

### **1.1 API Client Oluşturma**
- [x] `src/lib/apiClient.ts` dosyası oluştur
- [x] Base URL configuration
- [x] Token management (localStorage)
- [x] Request/Response interceptors
- [x] Error handling wrapper

### **1.2 Environment Configuration**
- [x] `src/config/environment.ts` dosyası oluştur
- [x] VITE_ADMIN_API_URL environment variable
- [x] VITE_ADMIN_WS_URL environment variable
- [x] Environment detection (dev/prod)
- [x] Fallback URL'ler

### **1.3 Admin Auth Service**
- [x] `src/services/adminAuthService.ts` oluştur
- [x] Admin login/logout methods
- [x] Token refresh logic
- [x] Session management
- [x] Permission checking

### **1.4 Error Handling Middleware**
- [x] Global error handler
- [x] HTTP status code handling
- [x] Toast notifications
- [x] Redirect logic (401/403)
- [x] Retry mechanism

---

## 🔧 **Faz 2: Servis Entegrasyonu (2-3 gün)**

### **2.1 Listing Service Hibrit Hale Getirme**
- [ ] Mevcut `listingService/fetchers.ts` koru
- [ ] `listingService/adminFetchers.ts` oluştur
- [ ] Admin-specific listing methods
- [ ] Moderation endpoints
- [ ] Analytics integration

### **2.2 Analytics Service**
- [ ] `src/services/adminAnalyticsService.ts` oluştur
- [ ] Dashboard stats endpoint
- [ ] User analytics
- [ ] Listing analytics
- [ ] Revenue analytics

### **2.3 Admin Management Service**
- [ ] `src/services/adminManagementService.ts` oluştur
- [ ] User management endpoints
- [ ] Role management
- [ ] Permission management
- [ ] System settings

### **2.4 Caching Layer**
- [ ] Redis integration
- [ ] Cache invalidation
- [ ] Cache warming
- [ ] Performance monitoring

---

## 🎨 **Faz 3: UI Entegrasyonu (2-3 gün)**

### **3.1 Admin Dashboard Components**
- [ ] `src/components/admin/Dashboard.tsx`
- [ ] Stats cards
- [ ] Recent activity
- [ ] Quick actions
- [ ] Navigation menu

### **3.2 Analytics Charts**
- [ ] Chart.js veya Recharts integration
- [ ] User growth chart
- [ ] Listing activity chart
- [ ] Revenue chart
- [ ] Geographic distribution

### **3.3 Moderation Tools**
- [ ] `src/components/admin/ModerationPanel.tsx`
- [ ] Listing approval/rejection
- [ ] User suspension
- [ ] Content filtering
- [ ] Bulk actions

### **3.4 User Management UI**
- [ ] `src/components/admin/UserManagement.tsx`
- [ ] User list with filters
- [ ] Role assignment
- [ ] User details modal
- [ ] Activity logs

---

## 🧪 **Faz 4: Testing & Optimization (1-2 gün)**

### **4.1 Unit Tests**
- [ ] API client tests
- [ ] Service method tests
- [ ] Component tests
- [ ] Utility function tests

### **4.2 Integration Tests**
- [ ] End-to-end API tests
- [ ] Authentication flow tests
- [ ] Error handling tests
- [ ] Performance tests

### **4.3 Performance Optimization**
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Bundle optimization
- [ ] Caching strategies

### **4.4 Error Handling**
- [ ] Global error boundary
- [ ] Network error handling
- [ ] User feedback
- [ ] Logging system

---

## 📁 **Dosya Yapısı**

```
src/
├── lib/
│   ├── apiClient.ts ✅ (Faz 1.1)
│   └── queryClient.ts (mevcut)
├── config/
│   └── environment.ts ✅ (Faz 1.2)
├── services/
│   ├── adminAuthService.ts ✅ (Faz 1.3)
│   ├── adminAnalyticsService.ts ✅ (Faz 2.2)
│   ├── adminManagementService.ts ✅ (Faz 2.3)
│   └── listingService/
│       ├── fetchers.ts (mevcut)
│       └── adminFetchers.ts ✅ (Faz 2.1)
├── components/
│   └── admin/
│       ├── Dashboard.tsx ✅ (Faz 3.1)
│       ├── ModerationPanel.tsx ✅ (Faz 3.3)
│       ├── UserManagement.tsx ✅ (Faz 3.4)
│       └── charts/
│           ├── UserGrowthChart.tsx ✅ (Faz 3.2)
│           ├── ListingActivityChart.tsx ✅ (Faz 3.2)
│           └── RevenueChart.tsx ✅ (Faz 3.2)
├── pages/
│   └── admin/
│       ├── AdminDashboard.tsx ✅ (Faz 3.1)
│       ├── AdminUsers.tsx ✅ (Faz 3.4)
│       └── AdminModeration.tsx ✅ (Faz 3.3)
└── types/
    └── admin.ts ✅ (Faz 1.1)
```

---

## 🔄 **Günlük Çalışma Planı**

### **Gün 1: Temel Altyapı**
- [ ] API Client oluştur
- [ ] Environment config
- [ ] Basic error handling

### **Gün 2: Auth & Services**
- [ ] Admin auth service
- [ ] Listing service hibrit
- [ ] Analytics service

### **Gün 3: Management & UI**
- [ ] Admin management service
- [ ] Dashboard components
- [ ] Basic charts

### **Gün 4: Moderation & Users**
- [ ] Moderation tools
- [ ] User management
- [ ] Role system

### **Gün 5: Testing & Polish**
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization

---

## 🎯 **Başarı Kriterleri**

### **Teknik Kriterler**
- [ ] API client %100 test coverage
- [ ] Error handling tüm durumları kapsıyor
- [ ] Performance < 2s load time
- [ ] Mobile responsive design

### **Fonksiyonel Kriterler**
- [ ] Admin login/logout çalışıyor
- [ ] Dashboard verileri doğru
- [ ] Moderation işlemleri çalışıyor
- [ ] User management tam fonksiyonel

### **Güvenlik Kriterleri**
- [ ] JWT token validation
- [ ] Role-based access control
- [ ] CORS configuration
- [ ] Input validation

---

## 📝 **Notlar**

- Her faz tamamlandıktan sonra test edilmeli
- Mevcut Supabase entegrasyonu bozulmamalı
- Environment variables doğru set edilmeli
- Error handling kapsamlı olmalı
- Performance monitoring eklenmeli

---

## 🚨 **Riskler & Mitigasyon**

### **Risk 1: Mevcut kod bozulması**
- **Mitigasyon:** Ayrı branch'te geliştir, test et, merge et

### **Risk 2: Performance degradation**
- **Mitigasyon:** Lazy loading, caching, code splitting

### **Risk 3: Security vulnerabilities**
- **Mitigasyon:** Input validation, CORS, RBAC

### **Risk 4: API compatibility**
- **Mitigasyon:** Versioning, backward compatibility 