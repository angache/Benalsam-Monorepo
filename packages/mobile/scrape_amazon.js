const puppeteer = require('puppeteer');

async function scrapeAmazon() {
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
    
    console.log('🌐 Amazon.com yükleniyor...');
    await page.goto('https://www.amazon.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Sayfanın yüklenmesini bekle
    await page.waitForTimeout(5000);
    
    console.log('🔍 Amazon kategorileri aranıyor...');
    
    // Kategori elementlerini bul
    const categories = await page.evaluate(() => {
      const categoryElements = document.querySelectorAll('a[href*="/gp/browse"], .nav-link, .nav-item, [data-testid*="category"], .nav-sprite');
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
    
    console.log('📋 Amazon kategorileri:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat.url}`);
    });
    
    return categories;
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    
    // Alternatif: Amazon genel kategori yapısı
    console.log('\n📝 Amazon genel kategori yapısı:');
    const amazonCategories = [
      {
        name: 'Electronics',
        subcategories: [
          {
            name: 'Computers',
            subsubcategories: ['Laptops', 'Desktop Computers', 'Tablets', 'Computer Components', 'Computer Accessories']
          },
          {
            name: 'Cell Phones & Accessories',
            subsubcategories: ['Cell Phones', 'Cell Phone Accessories', 'Cases & Covers', 'Chargers & Cables']
          },
          {
            name: 'TV & Video',
            subsubcategories: ['Televisions', 'TV Accessories', 'Video Projectors', 'Streaming Media Players']
          },
          {
            name: 'Audio & Home Theater',
            subsubcategories: ['Headphones', 'Speakers', 'Home Audio', 'Car Audio', 'Musical Instruments']
          },
          {
            name: 'Camera & Photo',
            subsubcategories: ['Digital Cameras', 'Camera Lenses', 'Camera Accessories', 'Video Cameras']
          },
          {
            name: 'Video Games',
            subsubcategories: ['PlayStation', 'Xbox', 'Nintendo', 'PC Games', 'Gaming Accessories']
          }
        ]
      },
      {
        name: 'Home & Kitchen',
        subcategories: [
          {
            name: 'Kitchen & Dining',
            subsubcategories: ['Kitchen Appliances', 'Cookware', 'Dishes & Glassware', 'Kitchen Utensils', 'Food Storage']
          },
          {
            name: 'Home & Kitchen Features',
            subsubcategories: ['Small Appliances', 'Large Appliances', 'Kitchen & Dining Furniture', 'Kitchen Organization']
          },
          {
            name: 'Appliances',
            subsubcategories: ['Refrigerators', 'Washers & Dryers', 'Dishwashers', 'Ovens & Ranges', 'Microwaves']
          },
          {
            name: 'Furniture',
            subsubcategories: ['Living Room Furniture', 'Bedroom Furniture', 'Dining Room Furniture', 'Office Furniture']
          },
          {
            name: 'Home Décor',
            subsubcategories: ['Wall Art', 'Rugs', 'Curtains & Drapes', 'Lighting', 'Decorative Accessories']
          },
          {
            name: 'Bedding',
            subsubcategories: ['Bedding Sets', 'Comforters & Sets', 'Sheets', 'Pillows', 'Bedding Accessories']
          }
        ]
      },
      {
        name: 'Clothing, Shoes & Jewelry',
        subcategories: [
          {
            name: 'Women',
            subsubcategories: ['Clothing', 'Shoes', 'Jewelry', 'Handbags & Accessories', 'Lingerie']
          },
          {
            name: 'Men',
            subsubcategories: ['Clothing', 'Shoes', 'Jewelry', 'Watches', 'Accessories']
          },
          {
            name: 'Girls',
            subsubcategories: ['Clothing', 'Shoes', 'Jewelry', 'Accessories']
          },
          {
            name: 'Boys',
            subsubcategories: ['Clothing', 'Shoes', 'Jewelry', 'Accessories']
          },
          {
            name: 'Baby',
            subsubcategories: ['Clothing', 'Shoes', 'Toys', 'Baby Care', 'Feeding']
          }
        ]
      },
      {
        name: 'Sports & Outdoors',
        subcategories: [
          {
            name: 'Exercise & Fitness',
            subsubcategories: ['Cardio Training', 'Strength Training', 'Yoga', 'Sports Nutrition', 'Fitness Accessories']
          },
          {
            name: 'Team Sports',
            subsubcategories: ['Basketball', 'Soccer', 'Baseball', 'Football', 'Tennis']
          },
          {
            name: 'Outdoor Recreation',
            subsubcategories: ['Camping', 'Hiking', 'Fishing', 'Hunting', 'Water Sports']
          },
          {
            name: 'Athletic Clothing',
            subsubcategories: ['Men\'s Athletic Clothing', 'Women\'s Athletic Clothing', 'Kids Athletic Clothing']
          }
        ]
      },
      {
        name: 'Toys & Games',
        subcategories: [
          {
            name: 'Toys',
            subsubcategories: ['Action Figures', 'Arts & Crafts', 'Building Toys', 'Dolls & Accessories', 'Educational Toys']
          },
          {
            name: 'Games',
            subsubcategories: ['Board Games', 'Card Games', 'Puzzle Games', 'Video Games', 'Party Games']
          },
          {
            name: 'Baby & Toddler Toys',
            subsubcategories: ['Baby Toys', 'Toddler Toys', 'Teething Toys', 'Learning Toys']
          }
        ]
      },
      {
        name: 'Automotive',
        subcategories: [
          {
            name: 'Car & Truck Parts',
            subsubcategories: ['Engine Parts', 'Brake Parts', 'Suspension Parts', 'Electrical Parts', 'Body Parts']
          },
          {
            name: 'Motorcycle & Powersports',
            subsubcategories: ['Motorcycle Parts', 'ATV Parts', 'Scooter Parts', 'Motorcycle Accessories']
          },
          {
            name: 'Automotive Tools & Equipment',
            subsubcategories: ['Hand Tools', 'Power Tools', 'Diagnostic Tools', 'Lifting Equipment']
          },
          {
            name: 'Car Care',
            subsubcategories: ['Car Wash & Wax', 'Interior Care', 'Exterior Care', 'Car Accessories']
          }
        ]
      },
      {
        name: 'Health & Household',
        subcategories: [
          {
            name: 'Health & Personal Care',
            subsubcategories: ['Personal Care', 'Health Care', 'Medical Supplies', 'Health Monitors']
          },
          {
            name: 'Household Supplies',
            subsubcategories: ['Cleaning Supplies', 'Paper Products', 'Laundry Supplies', 'Storage & Organization']
          },
          {
            name: 'Baby Products',
            subsubcategories: ['Baby Care', 'Baby Food', 'Diapers & Wipes', 'Baby Gear']
          }
        ]
      },
      {
        name: 'Books',
        subcategories: [
          {
            name: 'Books',
            subsubcategories: ['Fiction', 'Non-Fiction', 'Children\'s Books', 'Textbooks', 'Magazines']
          },
          {
            name: 'Kindle',
            subsubcategories: ['Kindle E-readers', 'Kindle Books', 'Kindle Unlimited', 'Kindle Accessories']
          }
        ]
      },
      {
        name: 'Tools & Home Improvement',
        subcategories: [
          {
            name: 'Tools',
            subsubcategories: ['Power Tools', 'Hand Tools', 'Tool Storage', 'Measuring Tools', 'Safety Equipment']
          },
          {
            name: 'Home Improvement',
            subsubcategories: ['Building Supplies', 'Hardware', 'Plumbing', 'Electrical', 'Paint']
          },
          {
            name: 'Garden & Outdoor',
            subsubcategories: ['Garden Tools', 'Plants & Seeds', 'Outdoor Living', 'Lawn Care', 'Pest Control']
          }
        ]
      }
    ];
    
    amazonCategories.forEach(cat => {
      console.log(`\n${cat.name.toUpperCase()}:`);
      cat.subcategories.forEach(sub => {
        console.log(`  ${sub.name}:`);
        sub.subsubcategories.forEach(subsub => {
          console.log(`    - ${subsub}`);
        });
      });
    });
    
    return amazonCategories;
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Script'i çalıştır
scrapeAmazon(); 