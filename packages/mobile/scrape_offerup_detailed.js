const puppeteer = require('puppeteer');

async function scrapeOfferUpDetailed() {
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
    
    console.log('🌐 OfferUp.com detaylı kategoriler yükleniyor...');
    
    // Ana kategori sayfalarını ziyaret et
    const categoryUrls = [
      'https://offerup.com/c/electronics/',
      'https://offerup.com/c/home-garden/',
      'https://offerup.com/c/fashion/',
      'https://offerup.com/c/sports-outdoors/',
      'https://offerup.com/c/toys-hobbies/',
      'https://offerup.com/c/vehicles/',
      'https://offerup.com/c/health-beauty/',
      'https://offerup.com/c/business-industrial/',
      'https://offerup.com/c/real-estate/',
      'https://offerup.com/c/services/'
    ];
    
    const detailedCategories = [];
    
    for (const url of categoryUrls) {
      try {
        console.log(`🔍 ${url} inceleniyor...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        await page.waitForTimeout(2000);
        
        const subCategories = await page.evaluate(() => {
          const elements = document.querySelectorAll('a[href*="/c/"], .subcategory, .category-item, [data-testid*="subcategory"]');
          const results = [];
          
          elements.forEach(element => {
            const text = element.textContent?.trim();
            const href = element.getAttribute('href');
            
            if (text && text.length > 2 && text.length < 100) {
              results.push({
                name: text,
                url: href
              });
            }
          });
          
          return results;
        });
        
        const categoryName = url.split('/c/')[1]?.replace('/', '') || 'Unknown';
        detailedCategories.push({
          mainCategory: categoryName,
          subCategories: subCategories
        });
        
      } catch (error) {
        console.log(`❌ ${url} yüklenemedi: ${error.message}`);
      }
    }
    
    console.log('📋 Detaylı OfferUp kategorileri:');
    detailedCategories.forEach(cat => {
      console.log(`\n${cat.mainCategory.toUpperCase()}:`);
      cat.subCategories.forEach(sub => {
        console.log(`  - ${sub.name}`);
      });
    });
    
    return detailedCategories;
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    
    // Alternatif: OfferUp'un detaylı kategori yapısı (genel bilgi)
    console.log('\n📝 OfferUp detaylı kategori yapısı:');
    const detailedOfferUpCategories = [
      {
        name: 'Electronics',
        subcategories: [
          {
            name: 'Cell Phones',
            subsubcategories: ['iPhone', 'Samsung', 'Android', 'Accessories', 'Other Phones']
          },
          {
            name: 'Computers & Tablets',
            subsubcategories: ['Laptops', 'Desktop Computers', 'Tablets', 'Computer Parts', 'Software']
          },
          {
            name: 'TV & Audio',
            subsubcategories: ['Televisions', 'Speakers', 'Headphones', 'Home Theater', 'Audio Equipment']
          },
          {
            name: 'Video Games',
            subsubcategories: ['PlayStation', 'Xbox', 'Nintendo', 'PC Games', 'Gaming Accessories']
          },
          {
            name: 'Cameras',
            subsubcategories: ['Digital Cameras', 'Video Cameras', 'Camera Lenses', 'Camera Accessories']
          }
        ]
      },
      {
        name: 'Home & Garden',
        subcategories: [
          {
            name: 'Furniture',
            subsubcategories: ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Outdoor Furniture']
          },
          {
            name: 'Appliances',
            subsubcategories: ['Refrigerators', 'Washers & Dryers', 'Dishwashers', 'Ovens & Stoves', 'Small Appliances']
          },
          {
            name: 'Tools',
            subsubcategories: ['Power Tools', 'Hand Tools', 'Garden Tools', 'Automotive Tools']
          },
          {
            name: 'Garden & Outdoor',
            subsubcategories: ['Plants & Seeds', 'Garden Equipment', 'Outdoor Decor', 'BBQ & Grills']
          },
          {
            name: 'Home Decor',
            subsubcategories: ['Wall Art', 'Rugs', 'Curtains', 'Lighting', 'Decorative Items']
          },
          {
            name: 'Kitchen & Dining',
            subsubcategories: ['Cookware', 'Dishes & Glassware', 'Kitchen Appliances', 'Storage']
          }
        ]
      },
      {
        name: 'Fashion',
        subcategories: [
          {
            name: 'Women\'s Clothing',
            subsubcategories: ['Tops', 'Dresses', 'Bottoms', 'Outerwear', 'Lingerie']
          },
          {
            name: 'Men\'s Clothing',
            subsubcategories: ['Shirts', 'Pants', 'Suits', 'Outerwear', 'Underwear']
          },
          {
            name: 'Kids & Baby',
            subsubcategories: ['Baby Clothing', 'Kids Clothing', 'Baby Gear', 'Toys']
          },
          {
            name: 'Shoes',
            subsubcategories: ['Women\'s Shoes', 'Men\'s Shoes', 'Kids Shoes', 'Athletic Shoes']
          },
          {
            name: 'Jewelry & Watches',
            subsubcategories: ['Necklaces', 'Rings', 'Earrings', 'Watches', 'Bracelets']
          }
        ]
      },
      {
        name: 'Sports & Outdoors',
        subcategories: [
          {
            name: 'Exercise & Fitness',
            subsubcategories: ['Treadmills', 'Weights', 'Yoga Equipment', 'Fitness Accessories']
          },
          {
            name: 'Team Sports',
            subsubcategories: ['Basketball', 'Soccer', 'Baseball', 'Football', 'Tennis']
          },
          {
            name: 'Outdoor Recreation',
            subsubcategories: ['Camping', 'Hiking', 'Fishing', 'Hunting', 'Water Sports']
          }
        ]
      }
    ];
    
    detailedOfferUpCategories.forEach(cat => {
      console.log(`\n${cat.name.toUpperCase()}:`);
      cat.subcategories.forEach(sub => {
        console.log(`  ${sub.name}:`);
        sub.subsubcategories.forEach(subsub => {
          console.log(`    - ${subsub}`);
        });
      });
    });
    
    return detailedOfferUpCategories;
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Script'i çalıştır
scrapeOfferUpDetailed(); 