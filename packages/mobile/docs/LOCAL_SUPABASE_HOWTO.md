# 🐳 Local Supabase Kullanım Kılavuzu (HowTo)

Bu doküman, Benalsam projesinde local Supabase instance'ı ile çalışırken ihtiyacın olacak temel komutları ve ipuçlarını içerir.

---

## 1. Local Supabase'ı Başlatma

```bash
npx supabase start
```
- Tüm servisler (veritabanı, Studio, API, Storage) Docker ile başlatılır.
- Studio arayüzü: [http://127.0.0.1:54323](http://127.0.0.1:54323)

---

## 2. Local Supabase'ı Durdurma

```bash
npx supabase stop
```
Eğer Studio veya servisler kapanmazsa:
```bash
docker stop $(docker ps -q --filter "name=supabase")
```

---

## 3. Migration İşlemleri

- **Remote şemayı local'e çekmek:**
  ```bash
  npx supabase db pull --linked
  ```
- **Migration uygulamak (reset):**
  ```bash
  npx supabase db reset
  ```
- **Migration zincirini sıfırlamak için:**
  ```bash
  # Migration klasörünü yedekle, temizle, sonra şemayı çek
  zip -r supabase/migrations_backup_$(date +%Y%m%d_%H%M%S).zip supabase/migrations
  rm supabase/migrations/*.sql
  npx supabase db pull --linked
  ```

---

## 4. Edge Functions

- **Remote'daki edge functions'ları local'e çekmek:**
  ```bash
  npx supabase functions download <function-name>
  # Örnek: npx supabase functions download calculate-trust-score
  ```
- **Tüm edge functions'ları localde serve etmek:**
  ```bash
  npx supabase functions serve
  ```
- **Yeni edge function oluşturmak:**
  ```bash
  npx supabase functions new <function-name>
  ```

---

## 5. Sık Karşılaşılan Sorunlar & Çözümler

- **Studio kapanmıyor:**
  - Docker container'larını elle durdur:  
    `docker stop $(docker ps -q --filter "name=supabase")`
- **Edge function serve hatası:**
  - Önce `npx supabase start` ile local instance'ı başlat.
- **Migration çakışması:**
  - Migration dosyalarını yedekle, temizle, zinciri baştan başlat.

---

## 6. Faydalı Linkler
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Studio](http://127.0.0.1:54323)

---

> **Not:** Tüm komutlar `benalsam-monorepo/packages/mobile` dizininde çalıştırılmalıdır. 