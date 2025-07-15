# Firebase Özellik & Etiket Yönetimi Kullanım Dokümantasyonu

Bu doküman, BenAlsam uygulamasında **özellik** ve **etiket** bilgilerinin Firebase Realtime Database ile nasıl yönetildiğini, kaydedildiğini ve uygulamada nasıl kullanılacağını özetler.

---

## 1. Kayıt Akışı

- **AI ile ilan oluşturma** veya **kullanıcı özel özellik/etiket ekleme** sırasında, ilgili veriler Firebase'e kaydedilir.
- Kayıt noktaları:
  - `ai_suggestions/<anahtar>`: AI önerileri ve analitikleri
  - `category_features/<kategori>/features`: Kategoriye özel özellikler
  - `category_features/<kategori>/tags`: Kategoriye özel etiketler

---

## 2. Firebase Veri Yapısı

### AI Önerileri
```json
{
  "ai_suggestions": {
    "magic_mouse": {
      "category": "Elektronik",
      "title": "Magic Mouse Aranıyor - İkinci El veya Az Kullanılmış",
      "tags": [...],
      "timestamp": 1752165731228,
      "usage_count": 1,
      ...
    }
  }
}
```

### Kategori Özellikleri & Etiketleri
```json
{
  "category_features": {
    "Elektronik > Bilgisayar": {
      "features": {
        "custom_1752165752916": {
          "name": "Özel Özellik",
          "status": "pending_approval",
          ...
        }
      },
      "tags": {
        "custom_1752165752916": {
          "name": "Magic mouse",
          "status": "pending_approval",
          ...
        }
      }
    }
  }
}
```

---

## 3. Uygulamada Kullanım

### a) Kategori seçildiğinde
- Firebase'den ilgili kategoriye ait tüm özellik ve etiketler çekilir.
- Onaylanmış olanlar kullanıcıya gösterilir.

### b) AI önerisi varsa
- AI önerisi otomatik olarak doldurulur veya kullanıcıya öneri olarak sunulur.

### c) Kullanıcı özel özellik/etiket eklerse
- Hemen ekranda gösterilir, arka planda Firebase'e kaydedilir.
- Moderasyon bekleyenler admin panelinde yönetilir.

---

## 4. Kodda Kullanım Örneği

```ts
import { ref, get } from 'firebase/database';
import { firebaseService } from '../services/firebaseService';

// Kategoriye ait etiketleri çek
const tagsRef = ref(firebaseService.db, 'category_features/Elektronik > Bilgisayar/tags');
const tagsSnapshot = await get(tagsRef);
const tags = tagsSnapshot.val();

// AI önerisini çek
const suggestionRef = ref(firebaseService.db, 'ai_suggestions/magic_mouse');
const suggestionSnapshot = await get(suggestionRef);
const suggestion = suggestionSnapshot.val();
```

---

## 5. Moderasyon
- `status: "pending_approval"` olanlar admin panelinde gösterilir.
- Onaylananlar kullanıcıya sunulur.

---

**Not:** Bu dosya, özellik/etiket yönetimi ve entegrasyonunun unutulmaması için oluşturulmuştur. Tüm özel dokümantasyonlar `docs/` klasöründe tutulacaktır. 