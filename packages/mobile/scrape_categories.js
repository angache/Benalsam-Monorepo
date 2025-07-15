const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeSahibindenCategories() {
  try {
    console.log('🔍 Sahibinden.com kategorileri inceleniyor...');
    
    // Sahibinden.com ana sayfasını çek
    const response = await axios.get('https://www.sahibinden.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const categories = [];

    // Kategori menüsünü bul
    $('.category-list, .categories, .main-categories, nav a, .menu a').each((index, element) => {
      const text = $(element).text().trim();
      const href = $(element).attr('href');
      
      if (text && text.length > 2 && text.length < 50) {
        categories.push({
          name: text,
          url: href
        });
      }
    });

    console.log('📋 Bulunan kategoriler:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat.url}`);
    });

    return categories;

  } catch (error) {
    console.error('❌ Hata:', error.message);
    
    // Alternatif olarak manuel kategori listesi
    console.log('\n📝 Manuel kategori listesi (genel bilgi):');
    const manualCategories = [
      'Vasıta',
      'Emlak', 
      'İkinci El ve Sıfır Alışveriş',
      'İş Makineleri & Sanayi',
      'Ustalar ve Hizmetler',
      'Özel Ders Verenler',
      'İş İlanları'
    ];
    
    manualCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat}`);
    });
    
    return manualCategories;
  }
}

// Script'i çalıştır
scrapeSahibindenCategories(); 