const puppeteer = require('puppeteer');

async function scrapeWithPuppeteer() {
  let browser;
  
  try {
    console.log('🚀 Tarayıcı başlatılıyor...');
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // User agent'ı ayarla
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('🌐 Sahibinden.com yükleniyor...');
    await page.goto('https://www.sahibinden.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Sayfanın yüklenmesini bekle
    await page.waitForTimeout(3000);
    
    console.log('🔍 Kategoriler aranıyor...');
    
    // Kategori elementlerini bul
    const categories = await page.evaluate(() => {
      const categoryElements = document.querySelectorAll('a[href*="/kategori"], .category, .menu-item, nav a, .main-menu a');
      const results = [];
      
      categoryElements.forEach(element => {
        const text = element.textContent?.trim();
        const href = element.getAttribute('href');
        
        if (text && text.length > 2 && text.length < 100 && !results.find(r => r.name === text)) {
          results.push({
            name: text,
            url: href
          });
        }
      });
      
      return results;
    });
    
    console.log('📋 Bulunan kategoriler:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat.url}`);
    });
    
    return categories;
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    
    // Alternatif: Manuel kategori yapısı
    console.log('\n📝 Sahibinden.com genel kategori yapısı:');
    const sahibindenCategories = [
      {
        name: 'Vasıta',
        subcategories: ['Otomobil', 'Motosiklet', 'Ticari Araçlar', 'Deniz Araçları', 'Yedek Parça']
      },
      {
        name: 'Emlak',
        subcategories: ['Konut', 'İş Yeri', 'Arsa', 'Projeler', 'Devremülk']
      },
      {
        name: 'İkinci El ve Sıfır Alışveriş',
        subcategories: ['Elektronik', 'Ev & Yaşam', 'Moda', 'Spor & Outdoor', 'Hobi & Sanat']
      },
      {
        name: 'İş Makineleri & Sanayi',
        subcategories: ['İş Makineleri', 'Tarım Makineleri', 'Sanayi', 'Enerji']
      },
      {
        name: 'Ustalar ve Hizmetler',
        subcategories: ['Ev Tadilat', 'Temizlik', 'Nakliyat', 'Teknik Servis']
      },
      {
        name: 'Özel Ders Verenler',
        subcategories: ['Matematik', 'İngilizce', 'Müzik', 'Spor', 'Diğer']
      },
      {
        name: 'İş İlanları',
        subcategories: ['Tam Zamanlı', 'Yarı Zamanlı', 'Uzaktan Çalışma', 'Staj']
      }
    ];
    
    sahibindenCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name}`);
      cat.subcategories.forEach(sub => {
        console.log(`   - ${sub}`);
      });
    });
    
    return sahibindenCategories;
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Script'i çalıştır
scrapeWithPuppeteer(); 