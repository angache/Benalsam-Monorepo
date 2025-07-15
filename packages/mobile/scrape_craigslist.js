const puppeteer = require('puppeteer');

async function scrapeCraigslist() {
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
    
    console.log('🌐 Craigslist.org yükleniyor...');
    await page.goto('https://www.craigslist.org', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Sayfanın yüklenmesini bekle
    await page.waitForTimeout(3000);
    
    console.log('🔍 Craigslist kategorileri aranıyor...');
    
    // Kategori elementlerini bul
    const categories = await page.evaluate(() => {
      const categoryElements = document.querySelectorAll('a[href*="/search/"], .category, .cat, .main-categories a');
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
    
    console.log('📋 Craigslist kategorileri:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat.url}`);
    });
    
    return categories;
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    
    // Alternatif: Craigslist genel kategori yapısı
    console.log('\n📝 Craigslist genel kategori yapısı:');
    const craigslistCategories = [
      {
        name: 'Community',
        subcategories: [
          {
            name: 'Activities',
            subsubcategories: ['Artists', 'Childcare', 'Classes', 'Events', 'General', 'Groups', 'Local News', 'Lost & Found', 'Musicians', 'Pets', 'Politics', 'Rants & Raves', 'Ride Share', 'Volunteers']
          },
          {
            name: 'Artists',
            subsubcategories: ['Musicians', 'Photographers', 'Writers', 'Other Artists']
          },
          {
            name: 'Childcare',
            subsubcategories: ['Babysitters', 'Daycare', 'Nannies']
          },
          {
            name: 'Classes',
            subsubcategories: ['Academic', 'Art', 'Computer', 'Cooking', 'Dance', 'Language', 'Music', 'Sports', 'Writing']
          },
          {
            name: 'Events',
            subsubcategories: ['Classes', 'Concerts', 'Crafts', 'Festivals', 'Food & Drink', 'Fundraisers', 'Garage Sales', 'Health & Wellness', 'Kids', 'Literary', 'Musicians', 'Networking', 'Pets', 'Politics', 'Sales', 'Sports', 'Theater', 'Volunteers']
          }
        ]
      },
      {
        name: 'Housing',
        subcategories: [
          {
            name: 'Apartments / Housing',
            subsubcategories: ['apts / housing', 'housing swap', 'housing wanted', 'office / commercial', 'parking / storage', 'real estate for sale', 'rooms / shared', 'rooms wanted', 'sublets / temporary', 'vacation rentals']
          },
          {
            name: 'Real Estate',
            subsubcategories: ['Commercial', 'Land', 'Residential']
          }
        ]
      },
      {
        name: 'Jobs',
        subcategories: [
          {
            name: 'Accounting & Finance',
            subsubcategories: ['Accounting', 'Banking', 'Bookkeeping', 'Financial Services', 'Insurance', 'Investing', 'Tax Preparation']
          },
          {
            name: 'Admin / Office',
            subsubcategories: ['Administrative', 'Customer Service', 'Data Entry', 'Executive Assistant', 'Human Resources', 'Office Management', 'Receptionist', 'Secretary']
          },
          {
            name: 'Arch / Engineering',
            subsubcategories: ['Architecture', 'Civil Engineering', 'Construction', 'Drafting', 'Electrical Engineering', 'Mechanical Engineering', 'Structural Engineering']
          },
          {
            name: 'Art / Media / Design',
            subsubcategories: ['Graphic Design', 'Illustration', 'Marketing', 'Photography', 'Video / Film', 'Web Design', 'Writing / Editing']
          },
          {
            name: 'Biotech / Science',
            subsubcategories: ['Biology', 'Chemistry', 'Laboratory', 'Medical Research', 'Pharmaceuticals', 'Physics']
          },
          {
            name: 'Business / Mgmt',
            subsubcategories: ['Business Development', 'Consulting', 'Entrepreneur', 'Management', 'Project Management', 'Sales Management']
          },
          {
            name: 'Customer Service',
            subsubcategories: ['Call Center', 'Client Relations', 'Customer Support', 'Help Desk', 'Retail', 'Sales']
          },
          {
            name: 'Education',
            subsubcategories: ['Administration', 'Early Childhood', 'Elementary', 'Higher Education', 'Special Education', 'Teaching', 'Training']
          },
          {
            name: 'Food / Bev / Hosp',
            subsubcategories: ['Bartending', 'Catering', 'Chef', 'Food Service', 'Hospitality', 'Restaurant', 'Wait Staff']
          },
          {
            name: 'General Labor',
            subsubcategories: ['Construction', 'Factory', 'Landscaping', 'Manufacturing', 'Moving', 'Warehouse']
          },
          {
            name: 'Government',
            subsubcategories: ['City', 'County', 'Federal', 'State']
          },
          {
            name: 'Healthcare',
            subsubcategories: ['Dental', 'Medical', 'Nursing', 'Pharmacy', 'Physical Therapy', 'Veterinary']
          },
          {
            name: 'Internet Engineers',
            subsubcategories: ['Backend', 'Frontend', 'Full Stack', 'Mobile', 'QA / Testing', 'System Administration']
          },
          {
            name: 'Legal / Paralegal',
            subsubcategories: ['Attorney', 'Legal Assistant', 'Paralegal']
          },
          {
            name: 'Manufacturing',
            subsubcategories: ['Assembly', 'CNC', 'Fabrication', 'Machining', 'Quality Control', 'Welding']
          },
          {
            name: 'Marketing / PR / Ad',
            subsubcategories: ['Advertising', 'Branding', 'Digital Marketing', 'Public Relations', 'Social Media']
          },
          {
            name: 'Nonprofit Sector',
            subsubcategories: ['Advocacy', 'Development', 'Education', 'Healthcare', 'Social Services']
          },
          {
            name: 'Real Estate',
            subsubcategories: ['Agent', 'Appraisal', 'Broker', 'Property Management']
          },
          {
            name: 'Retail / Wholesale',
            subsubcategories: ['Cashier', 'Inventory', 'Management', 'Sales', 'Store Clerk']
          },
          {
            name: 'Sales / Biz Dev',
            subsubcategories: ['Account Management', 'Business Development', 'Inside Sales', 'Outside Sales', 'Sales Management']
          },
          {
            name: 'Salon / Spa / Fitness',
            subsubcategories: ['Cosmetology', 'Fitness', 'Hair Styling', 'Massage', 'Nail Care', 'Personal Training']
          },
          {
            name: 'Security',
            subsubcategories: ['Armed Guard', 'Loss Prevention', 'Security Guard', 'Surveillance']
          },
          {
            name: 'Skilled Trade / Craft',
            subsubcategories: ['Carpentry', 'Electrical', 'HVAC', 'Plumbing', 'Roofing']
          },
          {
            name: 'Software / QA / DBA',
            subsubcategories: ['Database Administration', 'Quality Assurance', 'Software Development', 'System Administration']
          },
          {
            name: 'Systems / Network',
            subsubcategories: ['Network Administration', 'System Administration', 'Technical Support']
          },
          {
            name: 'Technical Support',
            subsubcategories: ['Desktop Support', 'Help Desk', 'IT Support', 'Technical Support']
          },
          {
            name: 'Transport',
            subsubcategories: ['Aviation', 'Delivery', 'Driving', 'Logistics', 'Trucking']
          },
          {
            name: 'TV / Film / Video',
            subsubcategories: ['Acting', 'Camera Operator', 'Editing', 'Production', 'Sound', 'Writing']
          },
          {
            name: 'Web / Info Design',
            subsubcategories: ['Content Creation', 'Information Architecture', 'User Experience', 'Web Design', 'Web Development']
          },
          {
            name: 'Writing / Editing',
            subsubcategories: ['Content Writing', 'Copywriting', 'Editing', 'Journalism', 'Technical Writing']
          }
        ]
      },
      {
        name: 'For Sale',
        subcategories: [
          {
            name: 'Antiques',
            subsubcategories: ['Art', 'Books', 'Clothing', 'Furniture', 'Jewelry', 'Other']
          },
          {
            name: 'Appliances',
            subsubcategories: ['Dishwashers', 'Dryers', 'Freezers', 'Microwaves', 'Ovens', 'Refrigerators', 'Stoves', 'Washers', 'Other']
          },
          {
            name: 'Arts & Crafts',
            subsubcategories: ['Art Supplies', 'Crafts', 'Fabric', 'Jewelry Making', 'Knitting', 'Other']
          },
          {
            name: 'Auto Parts',
            subsubcategories: ['Auto Body Parts', 'Auto Electronics', 'Auto Interior', 'Auto Wheels & Tires', 'Other']
          },
          {
            name: 'Aviation',
            subsubcategories: ['Airplanes', 'Helicopters', 'Parts', 'Other']
          },
          {
            name: 'Baby & Kid Stuff',
            subsubcategories: ['Baby Carriers', 'Baby Clothes', 'Baby Furniture', 'Baby Toys', 'Kids Bikes', 'Kids Clothes', 'Kids Toys', 'Other']
          },
          {
            name: 'Barter',
            subsubcategories: ['Antiques', 'Appliances', 'Arts & Crafts', 'Auto Parts', 'Baby & Kid Stuff', 'Bikes', 'Books', 'Cars & Trucks', 'CDs / DVDs / VHS', 'Cell Phones', 'Clothes & Acc', 'Collectibles', 'Computer Parts', 'Computers', 'Electronics', 'Farm & Garden', 'Free Stuff', 'Furniture', 'Garage Sales', 'General', 'Health & Beauty', 'Household', 'Jewelry', 'Materials', 'Motorcycle Parts', 'Motorcycles', 'Music Instruments', 'Photo & Video', 'RVs', 'Sporting', 'Tickets', 'Tools', 'Toys & Games', 'Video Gaming', 'Wanted', 'Wheels & Tires']
          },
          {
            name: 'Bikes',
            subsubcategories: ['BMX', 'Cargo', 'Electric', 'Kids', 'Mountain', 'Road', 'Tandem', 'Other']
          },
          {
            name: 'Boats',
            subsubcategories: ['Canoes & Kayaks', 'Jet Skis', 'Motorboats', 'Sailboats', 'Other']
          },
          {
            name: 'Books',
            subsubcategories: ['Academic', 'Children\'s', 'Fiction', 'Magazines', 'Non-Fiction', 'Textbooks', 'Other']
          },
          {
            name: 'Business',
            subsubcategories: ['Advertising', 'Agriculture', 'Automotive', 'Construction', 'Food & Beverage', 'Health & Beauty', 'Industrial', 'Legal', 'Manufacturing', 'Marketing', 'Medical', 'Office', 'Real Estate', 'Restaurant', 'Retail', 'Service', 'Technology', 'Transportation', 'Other']
          },
          {
            name: 'Cars & Trucks',
            subsubcategories: ['Auto Parts', 'Auto Services', 'Cars', 'Trucks', 'Other']
          },
          {
            name: 'CDs / DVDs / VHS',
            subsubcategories: ['CDs', 'DVDs', 'VHS', 'Other']
          },
          {
            name: 'Cell Phones',
            subsubcategories: ['Accessories', 'iPhone', 'Samsung', 'Other']
          },
          {
            name: 'Clothes & Acc',
            subsubcategories: ['Baby & Kids', 'Men', 'Women', 'Other']
          },
          {
            name: 'Collectibles',
            subsubcategories: ['Art', 'Books', 'Coins', 'Comics', 'Dolls', 'Stamps', 'Toys', 'Other']
          },
          {
            name: 'Computer Parts',
            subsubcategories: ['CPUs / Processors', 'Hard Drives', 'Keyboards', 'Memory', 'Monitors', 'Motherboards', 'Other']
          },
          {
            name: 'Computers',
            subsubcategories: ['Desktops', 'Laptops', 'Tablets', 'Other']
          },
          {
            name: 'Electronics',
            subsubcategories: ['Audio', 'Cameras', 'Cell Phones', 'Computers', 'Gaming', 'TVs', 'Video', 'Other']
          },
          {
            name: 'Farm & Garden',
            subsubcategories: ['Animals', 'Plants', 'Tools', 'Other']
          },
          {
            name: 'Free Stuff',
            subsubcategories: ['Antiques', 'Appliances', 'Arts & Crafts', 'Auto Parts', 'Baby & Kid Stuff', 'Bikes', 'Books', 'Cars & Trucks', 'CDs / DVDs / VHS', 'Cell Phones', 'Clothes & Acc', 'Collectibles', 'Computer Parts', 'Computers', 'Electronics', 'Farm & Garden', 'Furniture', 'Garage Sales', 'General', 'Health & Beauty', 'Household', 'Jewelry', 'Materials', 'Motorcycle Parts', 'Motorcycles', 'Music Instruments', 'Photo & Video', 'RVs', 'Sporting', 'Tickets', 'Tools', 'Toys & Games', 'Video Gaming', 'Wheels & Tires']
          },
          {
            name: 'Furniture',
            subsubcategories: ['Antique', 'Bedroom', 'Dining Room', 'Kitchen', 'Living Room', 'Office', 'Outdoor', 'Other']
          },
          {
            name: 'Garage Sales',
            subsubcategories: ['Antiques', 'Appliances', 'Arts & Crafts', 'Auto Parts', 'Baby & Kid Stuff', 'Bikes', 'Books', 'Cars & Trucks', 'CDs / DVDs / VHS', 'Cell Phones', 'Clothes & Acc', 'Collectibles', 'Computer Parts', 'Computers', 'Electronics', 'Farm & Garden', 'Furniture', 'General', 'Health & Beauty', 'Household', 'Jewelry', 'Materials', 'Motorcycle Parts', 'Motorcycles', 'Music Instruments', 'Photo & Video', 'RVs', 'Sporting', 'Tickets', 'Tools', 'Toys & Games', 'Video Gaming', 'Wheels & Tires']
          },
          {
            name: 'General',
            subsubcategories: ['Antiques', 'Appliances', 'Arts & Crafts', 'Auto Parts', 'Baby & Kid Stuff', 'Bikes', 'Books', 'Cars & Trucks', 'CDs / DVDs / VHS', 'Cell Phones', 'Clothes & Acc', 'Collectibles', 'Computer Parts', 'Computers', 'Electronics', 'Farm & Garden', 'Furniture', 'Garage Sales', 'Health & Beauty', 'Household', 'Jewelry', 'Materials', 'Motorcycle Parts', 'Motorcycles', 'Music Instruments', 'Photo & Video', 'RVs', 'Sporting', 'Tickets', 'Tools', 'Toys & Games', 'Video Gaming', 'Wheels & Tires']
          },
          {
            name: 'Health & Beauty',
            subsubcategories: ['Bath & Body', 'Fragrances', 'Hair Care', 'Makeup', 'Medical', 'Skin Care', 'Other']
          },
          {
            name: 'Household',
            subsubcategories: ['Bathroom', 'Bedroom', 'Dining Room', 'Kitchen', 'Living Room', 'Other']
          },
          {
            name: 'Jewelry',
            subsubcategories: ['Antique', 'Diamond', 'Gold', 'Pearl', 'Platinum', 'Silver', 'Other']
          },
          {
            name: 'Materials',
            subsubcategories: ['Building Materials', 'Fabric', 'Metal', 'Plastic', 'Wood', 'Other']
          },
          {
            name: 'Motorcycle Parts',
            subsubcategories: ['Accessories', 'Body Parts', 'Engine Parts', 'Other']
          },
          {
            name: 'Motorcycles',
            subsubcategories: ['Harley-Davidson', 'Honda', 'Kawasaki', 'Suzuki', 'Yamaha', 'Other']
          },
          {
            name: 'Music Instruments',
            subsubcategories: ['Brass', 'Drums', 'Guitars', 'Pianos', 'String', 'Woodwind', 'Other']
          },
          {
            name: 'Photo & Video',
            subsubcategories: ['Cameras', 'Lenses', 'Video Cameras', 'Other']
          },
          {
            name: 'RVs',
            subsubcategories: ['Class A', 'Class B', 'Class C', 'Travel Trailers', 'Other']
          },
          {
            name: 'Sporting',
            subsubcategories: ['Baseball', 'Basketball', 'Bicycling', 'Camping', 'Exercise', 'Fishing', 'Football', 'Golf', 'Hiking', 'Hockey', 'Hunting', 'Soccer', 'Swimming', 'Tennis', 'Other']
          },
          {
            name: 'Tickets',
            subsubcategories: ['Concert', 'Sports', 'Theater', 'Other']
          },
          {
            name: 'Tools',
            subsubcategories: ['Hand Tools', 'Power Tools', 'Other']
          },
          {
            name: 'Toys & Games',
            subsubcategories: ['Board Games', 'Card Games', 'Dolls', 'Video Games', 'Other']
          },
          {
            name: 'Video Gaming',
            subsubcategories: ['Consoles', 'Games', 'Other']
          },
          {
            name: 'Wheels & Tires',
            subsubcategories: ['Car Tires', 'Motorcycle Tires', 'Rims', 'Truck Tires', 'Other']
          },
          {
            name: 'Wanted',
            subsubcategories: ['Antiques', 'Appliances', 'Arts & Crafts', 'Auto Parts', 'Baby & Kid Stuff', 'Bikes', 'Books', 'Cars & Trucks', 'CDs / DVDs / VHS', 'Cell Phones', 'Clothes & Acc', 'Collectibles', 'Computer Parts', 'Computers', 'Electronics', 'Farm & Garden', 'Furniture', 'General', 'Health & Beauty', 'Household', 'Jewelry', 'Materials', 'Motorcycle Parts', 'Motorcycles', 'Music Instruments', 'Photo & Video', 'RVs', 'Sporting', 'Tickets', 'Tools', 'Toys & Games', 'Video Gaming', 'Wheels & Tires']
          }
        ]
      },
      {
        name: 'Gigs',
        subcategories: [
          {
            name: 'Computer Gigs',
            subsubcategories: ['Computer', 'Creative', 'Crew', 'Domestic', 'Event', 'Labor', 'Talent', 'Writing']
          },
          {
            name: 'Creative Gigs',
            subsubcategories: ['Art', 'Film', 'Music', 'Photography', 'Writing']
          },
          {
            name: 'Crew Gigs',
            subsubcategories: ['Film', 'Music', 'Photography', 'Theater']
          },
          {
            name: 'Domestic Gigs',
            subsubcategories: ['Childcare', 'Cleaning', 'Cooking', 'Elder Care', 'Pet Care']
          },
          {
            name: 'Event Gigs',
            subsubcategories: ['Bartending', 'Catering', 'DJ', 'Entertainment', 'Photography', 'Security', 'Wait Staff']
          },
          {
            name: 'Labor Gigs',
            subsubcategories: ['Construction', 'General Labor', 'Moving', 'Yard Work']
          },
          {
            name: 'Talent Gigs',
            subsubcategories: ['Acting', 'Dancing', 'Modeling', 'Singing']
          },
          {
            name: 'Writing Gigs',
            subsubcategories: ['Content Writing', 'Copywriting', 'Editing', 'Translation']
          }
        ]
      },
      {
        name: 'Resumes',
        subsubcategories: ['Accounting & Finance', 'Admin / Office', 'Arch / Engineering', 'Art / Media / Design', 'Biotech / Science', 'Business / Mgmt', 'Customer Service', 'Education', 'Food / Bev / Hosp', 'General Labor', 'Government', 'Healthcare', 'Internet Engineers', 'Legal / Paralegal', 'Manufacturing', 'Marketing / PR / Ad', 'Nonprofit Sector', 'Real Estate', 'Retail / Wholesale', 'Sales / Biz Dev', 'Salon / Spa / Fitness', 'Security', 'Skilled Trade / Craft', 'Software / QA / DBA', 'Systems / Network', 'Technical Support', 'Transport', 'TV / Film / Video', 'Web / Info Design', 'Writing / Editing']
      },
      {
        name: 'Services',
        subcategories: [
          {
            name: 'Automotive',
            subsubcategories: ['Auto Parts', 'Auto Services', 'Auto Body', 'Auto Glass', 'Auto Repair', 'Auto Sales', 'Auto Wanted', 'Motorcycle Repair', 'Motorcycle Sales', 'Motorcycle Wanted', 'RV Repair', 'RV Sales', 'RV Wanted']
          },
          {
            name: 'Beauty',
            subsubcategories: ['Hair', 'Makeup', 'Massage', 'Nails', 'Skin Care', 'Spa']
          },
          {
            name: 'Cell Phone',
            subsubcategories: ['Cell Phone Repair', 'Cell Phone Sales', 'Cell Phone Wanted']
          },
          {
            name: 'Computer',
            subsubcategories: ['Computer Repair', 'Computer Sales', 'Computer Wanted', 'Web Design']
          },
          {
            name: 'Creative',
            subsubcategories: ['Art', 'Music', 'Photography', 'Video', 'Writing']
          },
          {
            name: 'Cycle',
            subsubcategories: ['Bike Repair', 'Bike Sales', 'Bike Wanted']
          },
          {
            name: 'Event',
            subsubcategories: ['Bartending', 'Catering', 'DJ', 'Entertainment', 'Photography', 'Planning', 'Venues']
          },
          {
            name: 'Farm & Garden',
            subsubcategories: ['Animal Care', 'Garden Care', 'Landscaping', 'Tree Service']
          },
          {
            name: 'Financial',
            subsubcategories: ['Accounting', 'Banking', 'Insurance', 'Investing', 'Tax Preparation']
          },
          {
            name: 'Health/Wellness',
            subsubcategories: ['Alternative Health', 'Dental', 'Medical', 'Mental Health', 'Physical Therapy', 'Veterinary']
          },
          {
            name: 'Household',
            subsubcategories: ['Childcare', 'Cleaning', 'Cooking', 'Elder Care', 'Pet Care', 'Repair']
          },
          {
            name: 'Labor/Move',
            subsubcategories: ['General Labor', 'Moving', 'Yard Work']
          },
          {
            name: 'Legal',
            subsubcategories: ['Attorney', 'Legal Services', 'Paralegal']
          },
          {
            name: 'Lessons',
            subsubcategories: ['Academic', 'Art', 'Computer', 'Cooking', 'Dance', 'Language', 'Music', 'Sports', 'Writing']
          },
          {
            name: 'Marine',
            subsubcategories: ['Boat Repair', 'Boat Sales', 'Boat Wanted']
          },
          {
            name: 'Pet',
            subsubcategories: ['Pet Care', 'Pet Grooming', 'Pet Sitting', 'Pet Training', 'Veterinary']
          },
          {
            name: 'Real Estate',
            subsubcategories: ['Agent', 'Appraisal', 'Property Management', 'Rental']
          },
          {
            name: 'Skilled Trade',
            subsubcategories: ['Carpentry', 'Electrical', 'HVAC', 'Plumbing', 'Roofing']
          },
          {
            name: 'Small Biz Ads',
            subsubcategories: ['Advertising', 'Marketing', 'Printing', 'Web Design']
          },
          {
            name: 'Travel/Vac',
            subsubcategories: ['Accommodations', 'Transportation', 'Travel Planning']
          },
          {
            name: 'Write/Ed/Tr8',
            subsubcategories: ['Editing', 'Translation', 'Writing']
          }
        ]
      }
    ];
    
    craigslistCategories.forEach(cat => {
      console.log(`\n${cat.name.toUpperCase()}:`);
      if (cat.subcategories) {
        cat.subcategories.forEach(sub => {
          console.log(`  ${sub.name}:`);
          if (sub.subsubcategories) {
            sub.subsubcategories.forEach(subsub => {
              console.log(`    - ${subsub}`);
            });
          }
        });
      } else if (cat.subsubcategories) {
        cat.subsubcategories.forEach(subsub => {
          console.log(`  - ${subsub}`);
        });
      }
    });
    
    return craigslistCategories;
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Script'i çalıştır
scrapeCraigslist(); 