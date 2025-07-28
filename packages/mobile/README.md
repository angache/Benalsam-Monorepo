# BenAlsam - İkinci El Alışveriş Platformu

<div align="center">
  <img src="./assets/icon.png" alt="BenAlsam Logo" width="120" height="120" />
  <h3>Güvenli ve Kolay İkinci El Alışveriş Deneyimi</h3>
</div>

## 📱 Proje Hakkında

**BenAlsam**, kullanıcıların güvenli bir şekilde ikinci el ürün alıp satabilecekleri modern bir mobil platformdur. React Native ve Expo teknolojileri kullanılarak geliştirilmiş, Supabase backend servisleri ile desteklenen kapsamlı bir alışveriş uygulamasıdır.

### 🎯 Ana Özellikler

- **🛒 İlan Yönetimi**: Kolay ilan oluşturma, düzenleme ve yönetimi
- **💬 Mesajlaşma Sistemi**: Alıcı-satıcı arası güvenli iletişim
- **💰 Teklif Sistemi**: Ürünler için teklif verme ve alma
- **⭐ Favoriler**: Beğendiğiniz ürünleri kaydetme
- **📦 Envanter Yönetimi**: Sahip olduğunuz ürünleri organize etme
- **🏆 Güven Puanı Sistemi**: Güvenilir kullanıcıları ödüllendirme
- **🎨 Premium Özellikler**: İlanlarınızı öne çıkarma seçenekleri
- **🌙 Tema Desteği**: Karanlık/Aydınlık tema seçenekleri
- **🔍 Gelişmiş Arama**: Kategori ve filtre bazlı arama
- **📱 Cross-Platform**: iOS ve Android desteği

## 🚀 Hızlı Başlangıç

### Gereksinimler

- **Node.js** (v16 veya üzeri)
- **npm** veya **yarn**
- **Expo CLI**
- **iOS Simulator** (macOS) veya **Android Emulator**
- **Git**

### Kurulum Adımları

1. **Projeyi klonlayın**
   ```bash
   git clone <repository-url>
   cd BenAlsamExpo
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   # veya
   yarn install
   ```

3. **Expo CLI'yi yükleyin** (eğer yüklü değilse)
   ```bash
   npm install -g @expo/cli
   ```

4. **Environment variables'ları ayarlayın**
   ```bash
   cp env.example .env
   ```
   
   `.env` dosyasını düzenleyerek gerekli API anahtarlarını ekleyin:
   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # AI Services Configuration (İsteğe bağlı)
   EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Admin Backend Configuration (Geliştirme için)
   EXPO_PUBLIC_ADMIN_BACKEND_URL=http://YOUR_LOCAL_IP:3002
   ```

5. **Environment variables'ları ayarlayın**
   
   **Önemli**: Geliştirme ortamında admin backend'e bağlanmak için:
   
   a) Yerel IP adresinizi bulun:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig | findstr "IPv4"
   ```
   
   b) `.env` dosyasında `EXPO_PUBLIC_ADMIN_BACKEND_URL`'i güncelleyin:
   ```env
   EXPO_PUBLIC_ADMIN_BACKEND_URL=http://YOUR_LOCAL_IP:3002
   ```
   
   **Not**: IP adresiniz değiştiğinde sadece bu environment variable'ı güncellemeniz yeterli.

6. **Uygulamayı başlatın**
   ```bash
   npx expo start
   ```

6. **Geliştirme ortamını seçin**
   - **iOS Simulator** için: `i`
   - **Android Emulator** için: `a`
   - **Web** için: `w`
   - **Fiziksel cihaz** için: Expo Go uygulamasını kullanın

### 🤖 AI Servisleri Konfigürasyonu

BenAlsam, AI destekli ilan oluşturma özelliği için çoklu AI servis desteği sunar:

#### Desteklenen AI Servisleri

1. **OpenAI GPT-4o-mini** (Öncelik: 1)
   - Ücretsiz tier: $5 kredi/ay
   - Ücretli tier: $0.15 / 1M input token
   - API Key: [OpenAI Platform](https://platform.openai.com/api-keys)
   - Environment variable: `EXPO_PUBLIC_OPENAI_API_KEY`

2. **Google Gemini** (Öncelik: 2)
   - Ücretsiz tier: Aylık 15M karakter
   - API Key: [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Environment variable: `EXPO_PUBLIC_GEMINI_API_KEY`

3. **DeepSeek** (Öncelik: 3)
   - Ücretsiz tier: Aylık 5M token
   - API Key: [DeepSeek Console](https://platform.deepseek.com/)
   - Environment variable: `EXPO_PUBLIC_DEEPSEEK_API_KEY`

#### AI Servis Yönetimi

- **Otomatik Geçiş**: Bir servis başarısız olursa otomatik olarak diğerine geçer
- **Mock Service**: Tüm AI servisleri kullanılamazsa demo veriler kullanılır
- **Servis Durumu**: Uygulama içinde hangi servislerin hazır olduğu görüntülenir

#### API Key Kurulumu

1. **OpenAI API Key**:
   ```bash
   # OpenAI Platform'a gidin
   # https://platform.openai.com/api-keys
   # Yeni API key oluşturun
   # .env dosyasına ekleyin
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **Gemini API Key**:
   ```bash
   # Google AI Studio'ya gidin
   # https://makersuite.google.com/app/apikey
   # Yeni API key oluşturun
   # .env dosyasına ekleyin
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **DeepSeek API Key**:
   ```bash
   # DeepSeek Console'a gidin
   # https://platform.deepseek.com/
   # Yeni API key oluşturun
   # .env dosyasına ekleyin
   EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

#### AI Özellikleri

- **Akıllı İlan Oluşturma**: Ürün açıklamasından profesyonel ilan
- **Kategori Önerisi**: Otomatik kategori belirleme
- **Fiyat Önerisi**: Piyasa analizi ile fiyat önerisi
- **SEO Optimizasyonu**: Arama motorları için optimize edilmiş içerik
- **Özellik Çıkarımı**: Ürün özelliklerini otomatik belirleme

## 📱 Uygulama Kullanımı

### 👤 Kullanıcı Hesabı

#### Kayıt ve Giriş
- **Kayıt**: E-posta ve şifre ile hesap oluşturma
- **Giriş**: Mevcut hesap bilgileriyle giriş yapma
- **Profil Yönetimi**: Kişisel bilgileri güncelleme

#### Güven Puanı Sistemi
- **Puan Hesaplama**: Aktivite bazlı güven puanı
- **Seviye Sistemi**: Bronz, Gümüş, Altın, Platin seviyeleri
- **Güvenilirlik**: Diğer kullanıcıların güven puanını görme

### 🛒 İlan İşlemleri

#### İlan Oluşturma
1. **Ana Sayfa** → **"+"** butonuna tıklayın
2. **Kategori Seçimi**: Ürününüzün kategorisini belirleyin
3. **Detaylar**: Ürün adı, açıklama, fiyat bilgilerini girin
4. **Fotoğraflar**: En az 1, en fazla 5 fotoğraf ekleyin
5. **Konum**: İl ve ilçe bilgilerini seçin
6. **Onay**: İlan bilgilerini kontrol edip yayınlayın

#### İlan Yönetimi
- **İlanlarım**: Yayınladığınız ilanları görüntüleme
- **Düzenleme**: İlan bilgilerini güncelleme
- **Silme**: İlanları kaldırma
- **Premium Özellikler**: İlanlarınızı öne çıkarma

### 💬 İletişim ve Mesajlaşma

#### Mesajlaşma Sistemi
- **Konuşmalar**: Tüm mesajlaşmalarınızı görüntüleme
- **Yeni Mesaj**: İlan sahibine mesaj gönderme
- **Görüntüleme**: Mesajları okundu olarak işaretleme
- **Bildirimler**: Yeni mesaj bildirimleri

#### Teklif Sistemi
- **Teklif Verme**: İlanlar için teklif gönderme
- **Teklif Alma**: Gelen teklifleri görüntüleme
- **Teklif Yönetimi**: Teklifleri kabul etme/reddetme
- **Müzakere**: Teklif üzerinden pazarlık

### 📦 Envanter Yönetimi

#### Envanter Ekleme
1. **Profil** → **"Envanterim"** sekmesine gidin
2. **"Yeni Ürün Ekle"** butonuna tıklayın
3. **Ürün Bilgileri**: Ad, açıklama, kategori
4. **Fotoğraflar**: Kamera veya galeriden fotoğraf ekleme
5. **Kaydetme**: Ürünü envanterinize ekleme

#### Envanter Kullanımı
- **Tekliflerde Kullanma**: Teklif verirken envanterinizden seçim
- **Hızlı Erişim**: Sık kullanılan ürünlerinize kolay erişim
- **Organizasyon**: Ürünlerinizi kategorilere göre düzenleme

### 🔍 Arama ve Keşif

#### Arama Özellikleri
- **Metin Arama**: Ürün adı ve açıklamalarda arama
- **Kategori Filtreleme**: Belirli kategorilerde arama
- **Fiyat Aralığı**: Minimum-maksimum fiyat belirleme
- **Konum Filtreleme**: İl/ilçe bazlı arama
- **Gelişmiş Filtreler**: Durum, marka, model filtreleri

#### Keşif Özellikleri
- **Ana Sayfa**: Öne çıkan ilanlar ve kategoriler
- **Kategori Takibi**: İlgilendiğiniz kategorileri takip etme
- **Öneriler**: Size özel ürün önerileri
- **Trendler**: Popüler ürünler ve kategoriler

### ⭐ Premium Özellikler

#### Premium Planlar
- **Temel Plan**: Ücretsiz (5 ilan/ay)
- **Gelişmiş Plan**: 29₺/ay (20 ilan/ay)
- **Kurumsal Plan**: 99₺/ay (50 ilan/ay)

#### Premium Avantajlar
- **Öne Çıkan İlanlar**: İlanlarınızı vitrinde gösterme
- **Acil İlan**: Hızlı satış için öncelik
- **Güncelim Dopingi**: İlanlarınızı yenileme
- **Kalın Yazı & Renkli Çerçeve**: Görsel öne çıkarma
- **Gelişmiş Analitik**: Detaylı istatistikler
- **Öncelikli Destek**: Hızlı müşteri desteği

## 🛠️ Teknik Detaylar

### Teknoloji Stack

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Authentication**: Supabase Auth
- **Storage**: AsyncStorage + Supabase Storage
- **Icons**: Lucide React Native
- **Testing**: Jest + React Native Testing Library

### Proje Yapısı

```
src/
├── components/          # UI bileşenleri
│   ├── Button.tsx      # Buton bileşenleri
│   ├── Card.tsx        # Kart bileşenleri
│   ├── Header.tsx      # Header bileşenleri
│   └── ...
├── screens/            # Uygulama ekranları
│   ├── HomeScreen.tsx  # Ana sayfa
│   ├── LoginScreen.tsx # Giriş ekranı
│   ├── ProfileScreen.tsx # Profil ekranı
│   └── ...
├── services/           # Backend servisleri
│   ├── listingService/ # İlan servisleri
│   ├── authService.ts  # Kimlik doğrulama
│   ├── imageService.ts # Resim yükleme
│   └── ...
├── stores/             # State management
│   ├── authStore.ts    # Kimlik doğrulama state
│   ├── themeStore.ts   # Tema state
│   └── ...
├── hooks/              # Custom hooks
│   ├── queries/        # React Query hooks
│   └── ...
├── navigation/         # Navigasyon yapısı
├── types/              # TypeScript tipleri
└── utils/              # Yardımcı fonksiyonlar
```

### Veritabanı Şeması

Uygulama aşağıdaki ana tabloları kullanır:

- **users**: Kullanıcı bilgileri
- **listings**: İlan bilgileri
- **offers**: Teklif bilgileri
- **conversations**: Mesajlaşma
- **favorites**: Favoriler
- **inventory_items**: Envanter ürünleri
- **user_activities**: Kullanıcı aktiviteleri
- **subscription_plans**: Premium planlar

## 🧪 Test ve Geliştirme

### Test Komutları

```bash
# Tüm testleri çalıştır
npm test

# Watch mode
npm run test:watch

# Coverage raporu
npm run test:coverage
```

### Geliştirme Komutları

```bash
# Development server
npx expo start

# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Web
npx expo start --web
```

### Build Komutları

```bash
# Android APK
npx expo build:android

# iOS IPA
npx expo build:ios

# Web
npx expo build:web
```

## 🚀 Deployment

### Expo Application Services (EAS)

1. **EAS CLI'yi yükleyin**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Giriş yapın**
   ```bash
   eas login
   ```

3. **Build yapılandırması**
   ```bash
   eas build:configure
   ```

4. **Build oluşturun**
   ```bash
   eas build --platform android
   eas build --platform ios
   ```

### Firebase Distribution

```bash
# Android APK dağıtımı
./scripts/deploy-firebase.sh android preview

# iOS IPA dağıtımı
./scripts/deploy-firebase.sh ios preview
```

## 🔧 Konfigürasyon

### Environment Variables

`.env` dosyasında aşağıdaki değişkenleri tanımlayın:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key
```

### Supabase Setup

1. **Proje Oluşturma**: Supabase'de yeni proje oluşturun
2. **Veritabanı Şeması**: `src/services/db-schema/schema.json` dosyasını kullanın
3. **Storage Bucket**: Resim yükleme için bucket oluşturun
4. **RLS Policies**: Güvenlik politikalarını ayarlayın

## 📊 Performans ve Optimizasyon

### Uygulanan Optimizasyonlar

- **Lazy Loading**: Ekranlar ve bileşenler için lazy loading
- **Image Optimization**: Resim sıkıştırma ve önbellekleme
- **State Management**: Zustand ile optimize edilmiş state yönetimi
- **Error Boundaries**: Hata yakalama ve kurtarma
- **Memory Management**: Gereksiz re-render'ları önleme

### Monitoring

- **Error Tracking**: Hata raporlama ve izleme
- **Performance Monitoring**: Uygulama performansı takibi
- **User Analytics**: Kullanıcı davranışları analizi
- **Crash Reporting**: Çökme raporları

## 🤝 Katkıda Bulunma

1. **Fork yapın**
2. **Feature branch oluşturun** (`git checkout -b feature/amazing-feature`)
3. **Commit yapın** (`git commit -m 'Add some amazing feature'`)
4. **Push yapın** (`git push origin feature/amazing-feature`)
5. **Pull Request oluşturun**

### Geliştirme Kuralları

- **TypeScript**: Tüm kod TypeScript ile yazılmalı
- **ESLint**: Kod kalitesi kurallarına uyulmalı
- **Testing**: Yeni özellikler için test yazılmalı
- **Documentation**: Kod dokümantasyonu güncellenmeli

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Geliştirici**: BenAlsam Team
- **E-posta**: support@benalsam.com
- **Website**: https://benalsam.com
- **GitHub**: https://github.com/benalsam/benalsam-expo

## 🙏 Teşekkürler

- [Expo](https://expo.dev/) - Geliştirme platformu
- [Supabase](https://supabase.com/) - Backend servisleri
- [React Navigation](https://reactnavigation.org/) - Navigasyon
- [React Native](https://reactnative.dev/) - Mobil uygulama geliştirme
- [Lucide](https://lucide.dev/) - İkon kütüphanesi
- [NativeWind](https://www.nativewind.dev/) - Styling çözümü

---

<div align="center">
  <p>Made with ❤️ by BenAlsam Team</p>
  <p>Version 1.0.0</p>
</div> 