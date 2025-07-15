const puppeteer = require('puppeteer');

async function scrapeOfferUp() {
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
    
    console.log('🌐 OfferUp.com yükleniyor...');
    await page.goto('https://offerup.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Sayfanın yüklenmesini bekle
    await page.waitForTimeout(5000);
    
    console.log('🔍 Kategoriler aranıyor...');
    
    // Kategori elementlerini bul
    const categories = await page.evaluate(() => {
      const categoryElements = document.querySelectorAll('a[href*="/c/"], .category, .menu-item, nav a, .main-menu a, [data-testid*="category"]');
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
    
    console.log('📋 OfferUp kategorileri:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat.url}`);
    });
    
    return categories;
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    
    // Alternatif: OfferUp genel kategori yapısı
    console.log('\n📝 OfferUp genel kategori yapısı:');
    const offerupCategories = [
      {
        name: 'Electronics',
        subcategories: ['Cell Phones', 'Computers & Tablets', 'TV & Audio', 'Video Games', 'Cameras', 'Other Electronics']
      },
      {
        name: 'Home & Garden',
        subcategories: ['Furniture', 'Appliances', 'Tools', 'Garden & Outdoor', 'Home Decor', 'Kitchen & Dining']
      },
      {
        name: 'Fashion',
        subcategories: ['Women\'s Clothing', 'Men\'s Clothing', 'Kids & Baby', 'Shoes', 'Jewelry & Watches', 'Bags & Accessories']
      },
      {
        name: 'Sports & Outdoors',
        subcategories: ['Exercise & Fitness', 'Team Sports', 'Outdoor Recreation', 'Hunting & Fishing', 'Bicycles']
      },
      {
        name: 'Toys & Hobbies',
        subcategories: ['Toys & Games', 'Arts & Crafts', 'Musical Instruments', 'Collectibles', 'Books & Media']
      },
      {
        name: 'Vehicles',
        subcategories: ['Cars & Trucks', 'Motorcycles', 'RVs & Campers', 'Boats', 'Auto Parts', 'Other Vehicles']
      },
      {
        name: 'Health & Beauty',
        subcategories: ['Health Care', 'Beauty & Personal Care', 'Baby & Child Care', 'Medical & Mobility']
      },
      {
        name: 'Business & Industrial',
        subcategories: ['Office Supplies', 'Industrial Equipment', 'Commercial Printing Presses', 'Restaurant & Food Service']
      },
      {
        name: 'Real Estate',
        subcategories: ['Houses for Sale', 'Apartments for Rent', 'Land', 'Commercial Property']
      },
      {
        name: 'Services',
        subcategories: ['Automotive Services', 'Home Services', 'Professional Services', 'Personal Services']
      }
    ];
    
    offerupCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name}`);
      cat.subcategories.forEach(sub => {
        console.log(`   - ${sub}`);
      });
    });
    
    return offerupCategories;
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Script'i çalıştır
scrapeOfferUp(); 