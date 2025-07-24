# 🔧 Type Tutarsızlık Düzeltme TODO Listesi

> **Tarih:** 2025-01-09  
> **Öncelik:** Yüksek  
> **Durum:** 🔴 Başlanmadı

---

## 🎯 Genel Hedef

Projedeki tüm type tanımlarını `shared-types` paketinde merkezileştirmek ve veritabanı şeması ile tam uyumlu hale getirmek.

---

## 📋 TODO Listesi

### 🔥 **ACİL - Kritik Sorunlar**

#### 1. **Eksik Status Enum'larını Ekle**
- [ ] `MessageStatus` enum'ını ekle (`sent`, `delivered`, `read`)
- [ ] `PremiumSubscriptionStatus` enum'ını ekle (`active`, `cancelled`, `expired`, `pending`)
- [ ] `ProfileStatus` enum'ını ekle (`active`, `inactive`)
- [ ] `ReportStatus` enum'ını ekle (`pending`, `reviewed`, `resolved`, `dismissed`)

#### 2. **Local Interface'leri Kaldır**
- [ ] Web uygulamasındaki `authStore.ts` local User interface'ini kaldır
- [ ] Web uygulamasındaki `followService.ts` local User interface'ini kaldır
- [ ] Web uygulamasındaki `reportService.ts` local ListingReport interface'ini kaldır
- [ ] Mobil uygulamadaki `types/index.ts` local interface'leri kaldır
- [ ] Admin-UI'daki `api.ts` local interface'leri kaldır

#### 3. **Shared-Types Import'larını Düzelt**
- [ ] Tüm paketlerde `@benalsam/shared-types` import'larını ekle
- [ ] Local interface'ler yerine shared-types kullan
- [ ] Type safety'yi sağla

---

### ⚡ **YÜKSEK ÖNCELİK**

#### 4. **Admin-UI Interface'lerini Düzelt**
- [ ] `Listing` interface'indeki field isimlerini düzelt:
  - `price` → `budget`
  - `status` case'ini düzelt (`ACTIVE` → `active`)
  - `createdAt` → `created_at`
  - `userId` → `user_id`
  - `images` → `additional_image_urls`
- [ ] `User` interface'indeki field isimlerini düzelt:
  - `status` case'ini düzelt
  - `createdAt` → `created_at`
  - `lastLoginAt` → `last_login`
  - `profileImage` → `avatar_url`

#### 5. **Mobil Uygulama Type'larını İyileştir**
- [ ] `MobileUserProfileData` interface'indeki `any` type'ları düzelt:
  - `platform_preferences: any` → `platform_preferences: PlatformPreferences`
  - `notification_preferences: any` → `notification_preferences: NotificationPreferences`
  - `chat_preferences: any` → `chat_preferences: ChatPreferences`
- [ ] Duplicate `name` field'ını kaldır
- [ ] Shared-types'tan extend et

---

### 📱 **ORTA ÖNCELİK**

#### 6. **Eksik Interface'leri Ekle**
- [ ] `Message` interface'ine `status` field'ı ekle
- [ ] `PremiumSubscription` interface'ini ekle
- [ ] `ListingReport` interface'ini ekle
- [ ] `UserActivity` interface'ini ekle

#### 7. **Type Safety İyileştirmeleri**
- [ ] Tüm `any` type kullanımlarını düzelt
- [ ] Generic type'ları ekle
- [ ] Union type'ları optimize et
- [ ] Optional field'ları düzgün işaretle

#### 8. **Enum'ları Standardize Et**
- [ ] Tüm status enum'larını aynı pattern'de tanımla
- [ ] String literal union'ları enum'lara çevir
- [ ] Case tutarlılığını sağla

---

### 🔧 **DÜŞÜK ÖNCELİK**

#### 9. **Case Tutarsızlıklarını Düzelt**
- [ ] camelCase vs snake_case tutarlılığını sağla
- [ ] Field isimlerini standardize et
- [ ] Naming convention'ları belirle

#### 10. **Dokümantasyon**
- [ ] Type değişikliklerini dokümante et
- [ ] Migration guide hazırla
- [ ] Breaking changes'leri listele

---

## 🛠️ **Uygulama Adımları**

### **Faz 1: Shared-Types Güncellemeleri**
```bash
cd packages/shared-types
# 1. Eksik enum'ları ekle
# 2. Eksik interface'leri ekle
# 3. Build et
npm run build:cjs && npm run build:esm
```

### **Faz 2: Local Interface'leri Kaldır**
```bash
# Her pakette local interface'leri kaldır
# Shared-types import'larını ekle
# Type safety'yi test et
```

### **Faz 3: Test ve Doğrulama**
```bash
# TypeScript compile test'leri
# Runtime test'leri
# Integration test'leri
```

---

## 📊 **İlerleme Takibi**

- [ ] **Faz 1**: Shared-Types Güncellemeleri (0/4)
- [ ] **Faz 2**: Local Interface'leri Kaldır (0/5)
- [ ] **Faz 3**: Admin-UI Düzeltmeleri (0/3)
- [ ] **Faz 4**: Mobil Uygulama İyileştirmeleri (0/3)
- [ ] **Faz 5**: Test ve Doğrulama (0/3)

**Toplam İlerleme**: 0/18 (%0)

---

## 🚨 **Risk Faktörleri**

1. **Breaking Changes**: Local interface'leri kaldırmak breaking change yaratabilir
2. **Build Failures**: Type değişiklikleri build hatalarına neden olabilir
3. **Runtime Errors**: Field ismi değişiklikleri runtime hatalarına neden olabilir

---

## ✅ **Tamamlandığında Beklenen Sonuçlar**

- ✅ Tüm type'lar merkezi olarak yönetiliyor
- ✅ Veritabanı şeması ile tam uyumluluk
- ✅ Type safety %100 sağlanıyor
- ✅ Kod tutarlılığı artıyor
- ✅ Maintenance kolaylaşıyor
- ✅ Developer experience iyileşiyor

---

## 📝 **Notlar**

- Her değişiklikten sonra test et
- Breaking changes'leri dokümante et
- Team'e bilgi ver
- Staging'de test et
- Production'a gradual rollout yap

---

**Son Güncelleme**: 2025-01-09  
**Güncelleyen**: AI Assistant  
**Durum**: 🔴 Başlanmadı 