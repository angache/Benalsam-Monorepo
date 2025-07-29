const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.join(__dirname, '../packages/mobile/.env');
console.log('🔍 Looking for .env file at:', envPath);
console.log('🔍 File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('🔍 .env content preview:', envContent.substring(0, 200) + '...');
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
      console.log(`🔍 Loaded env var: ${key.trim()}`);
    }
  });
} else {
  console.error('❌ .env file not found at:', envPath);
}

// Add service role key manually if not in .env
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRud3JlY2twZWVuaGJkdGFwbXhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk5ODA3MCwiZXhwIjoyMDY1NTc0MDcwfQ.b6UNsncrPKXYB-17oyOEx8xY_hbofAx7ObwzKsyhsm4';
  console.log('🔍 Added service role key manually');
}

// Supabase client - Use service role key for admin operations
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
if (!isDevelopment) {
  console.error('❌ Fake data generation is only allowed in development environment');
  process.exit(1);
}

// Configuration
const CONFIG = {
  TEST_PREFIX: '[TEST_DATA]',
  BATCH_SIZE: 100, // Kaç ilan oluşturulacak
  MAX_IMAGES_PER_LISTING: 3,
  // Gerçek leaf kategoriler (kullanıcıların ilan verdiği kategoriler)
  CATEGORIES: [
    'Elektronik > Telefon > Akıllı Telefon > Akıllı Telefonlar',
    'Elektronik > Bilgisayar > Laptop > Laptoplar',
    'Elektronik > Bilgisayar > Masaüstü Bilgisayar > Masaüstü Bilgisayarlar',
    'Ev Aletleri & Mobilya > Ev Aletleri > Buzdolabı > Buzdolapları',
    'Ev Aletleri & Mobilya > Ev Aletleri > Çamaşır Makinesi > Çamaşır Makineleri',
    'Araç & Vasıta > Bisiklet > Şehir Bisikleti > Şehir Bisikletleri',
    'Araç & Vasıta > Motosiklet > Şehir Motosikleti > Şehir Motosikletleri',
    'İş Makinesi > İş Makineleri > Ekskavatör > Ekskavatörler'
  ],
  LOCATIONS: [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 
    'Gaziantep', 'Mersin', 'Diyarbakır', 'Samsun', 'Denizli', 'Eskişehir'
  ]
};

// Leaf category-specific configurations
const CATEGORY_CONFIG = {
  'Elektronik > Telefon > Akıllı Telefon > Akıllı Telefonlar': {
    imageQueries: ['smartphone', 'iphone', 'samsung', 'mobile phone'],
    priceRange: { min: 2000, max: 30000 },
    titles: [
      'iPhone Alınır',
      'Samsung Telefon Aranıyor',
      'Akıllı Telefon Alınır',
      'Son Model Telefon Aranıyor',
      'İkinci El Telefon Alınır'
    ],
    descriptions: [
      'iPhone almak istiyorum, son model olsun.',
      'Samsung telefon arıyorum, iyi durumda olsun.',
      'Akıllı telefon almak istiyorum, yeni gibi olsun.',
      'Son model telefon arıyorum, garantili olsun.',
      'İkinci el telefon almak istiyorum, uygun fiyatlı olsun.'
    ]
  },
  'Elektronik > Bilgisayar > Laptop > Laptoplar': {
    imageQueries: ['laptop', 'notebook', 'macbook', 'dell laptop'],
    priceRange: { min: 5000, max: 50000 },
    titles: [
      'Laptop Alınır',
      'MacBook Aranıyor',
      'Dell Laptop Alınır',
      'Gaming Laptop Aranıyor',
      'İş Laptopu Alınır'
    ],
    descriptions: [
      'Laptop almak istiyorum, hızlı olsun.',
      'MacBook arıyorum, Apple ekosistemi için.',
      'Dell laptop almak istiyorum, iş için.',
      'Gaming laptop arıyorum, yüksek performanslı olsun.',
      'İş laptopu almak istiyorum, güvenilir olsun.'
    ]
  },
  'Ev Aletleri & Mobilya > Ev Aletleri > Buzdolabı > Buzdolapları': {
    imageQueries: ['refrigerator', 'fridge', 'freezer'],
    priceRange: { min: 3000, max: 25000 },
    titles: [
      'Buzdolabı Alınır',
      'Enerji Tasarruflu Buzdolabı Aranıyor',
      'İkinci El Buzdolabı Alınır',
      'No Frost Buzdolabı Aranıyor'
    ],
    descriptions: [
      'Buzdolabı almak istiyorum, enerji tasarruflu olsun.',
      'Enerji tasarruflu buzdolabı arıyorum, yeni olsun.',
      'İkinci el buzdolabı almak istiyorum, iyi durumda olsun.',
      'No frost buzdolabı arıyorum, modern olsun.'
    ]
  },
  'Araç & Vasıta > Bisiklet > Şehir Bisikleti > Şehir Bisikletleri': {
    imageQueries: ['bicycle', 'city bike', 'urban bike'],
    priceRange: { min: 500, max: 5000 },
    titles: [
      'Şehir Bisikleti Alınır',
      'Bisiklet Aranıyor',
      'İkinci El Bisiklet Alınır',
      'Elektrikli Bisiklet Aranıyor'
    ],
    descriptions: [
      'Şehir bisikleti almak istiyorum, konforlu olsun.',
      'Bisiklet arıyorum, şehir içi için.',
      'İkinci el bisiklet almak istiyorum, uygun fiyatlı olsun.',
      'Elektrikli bisiklet arıyorum, uzun mesafe için.'
    ]
  },
  'Elektronik > Bilgisayar > Masaüstü Bilgisayar > Masaüstü Bilgisayarlar': {
    imageQueries: ['desktop computer', 'pc', 'gaming pc', 'workstation'],
    priceRange: { min: 8000, max: 60000 },
    titles: [
      'Masaüstü Bilgisayar Alınır',
      'Gaming PC Aranıyor',
      'İş Bilgisayarı Alınır',
      'Yüksek Performanslı PC Aranıyor'
    ],
    descriptions: [
      'Masaüstü bilgisayar almak istiyorum, hızlı olsun.',
      'Gaming PC arıyorum, yüksek performanslı olsun.',
      'İş bilgisayarı almak istiyorum, güvenilir olsun.',
      'Yüksek performanslı PC arıyorum, oyun için.'
    ]
  },
  'Ev Aletleri & Mobilya > Ev Aletleri > Çamaşır Makinesi > Çamaşır Makineleri': {
    imageQueries: ['washing machine', 'laundry', 'washer'],
    priceRange: { min: 2000, max: 20000 },
    titles: [
      'Çamaşır Makinesi Alınır',
      'Otomatik Çamaşır Makinesi Aranıyor',
      'İkinci El Çamaşır Makinesi Alınır',
      'Enerji Tasarruflu Çamaşır Makinesi Aranıyor'
    ],
    descriptions: [
      'Çamaşır makinesi almak istiyorum, otomatik olsun.',
      'Otomatik çamaşır makinesi arıyorum, yeni olsun.',
      'İkinci el çamaşır makinesi almak istiyorum, iyi durumda olsun.',
      'Enerji tasarruflu çamaşır makinesi arıyorum, modern olsun.'
    ]
  },
  'Araç & Vasıta > Motosiklet > Şehir Motosikleti > Şehir Motosikletleri': {
    imageQueries: ['motorcycle', 'scooter', 'city motorcycle'],
    priceRange: { min: 10000, max: 100000 },
    titles: [
      'Şehir Motosikleti Alınır',
      'Motosiklet Aranıyor',
      'İkinci El Motosiklet Alınır',
      'Scooter Aranıyor'
    ],
    descriptions: [
      'Şehir motosikleti almak istiyorum, ekonomik olsun.',
      'Motosiklet arıyorum, şehir içi için.',
      'İkinci el motosiklet almak istiyorum, uygun fiyatlı olsun.',
      'Scooter arıyorum, kolay kullanım için.'
    ]
  },
  'İş Makinesi > İş Makineleri > Ekskavatör > Ekskavatörler': {
    imageQueries: ['excavator', 'construction equipment', 'digger'],
    priceRange: { min: 500000, max: 5000000 },
    titles: [
      'Ekskavatör Alınır',
      'İş Makinesi Aranıyor',
      'İkinci El Ekskavatör Alınır',
      'Kazı Makinesi Aranıyor'
    ],
    descriptions: [
      'Ekskavatör almak istiyorum, iyi durumda olsun.',
      'İş makinesi arıyorum, inşaat için.',
      'İkinci el ekskavatör almak istiyorum, uygun fiyatlı olsun.',
      'Kazı makinesi arıyorum, proje için.'
    ]
  }
};

// Utility functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (daysAgo = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Get Unsplash images for category
const getCategoryImages = async (category) => {
  try {
    const config = CATEGORY_CONFIG[category];
    const query = getRandomElement(config.imageQueries);
    
    const { data, error } = await supabase.functions.invoke('fetch-unsplash-images', {
      body: { query },
    });

    if (error || !data?.images) {
      console.warn(`⚠️ Could not fetch images for ${category}, using fallback`);
      return [];
    }

    // Return random subset of images
    const shuffled = data.images.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, CONFIG.MAX_IMAGES_PER_LISTING).map(img => img.urls.regular);
  } catch (error) {
    console.warn(`⚠️ Error fetching images for ${category}:`, error.message);
    return [];
  }
};

// Get active users
const getActiveUsers = async () => {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, name, trust_score, created_at')
      .order('trust_score', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }

    console.log(`✅ Found ${users.length} active users`);
    return users || [];
  } catch (error) {
    console.error('❌ Error in getActiveUsers:', error);
    return [];
  }
};

// Generate fake listing
const generateFakeListing = async (user, category) => {
  const config = CATEGORY_CONFIG[category];
  const batchId = `batch_${Date.now()}`;
  
  const title = getRandomElement(config.titles);
  const description = getRandomElement(config.descriptions);
  const price = getRandomNumber(config.priceRange.min, config.priceRange.max);
  const location = getRandomElement(CONFIG.LOCATIONS);
  const isPremium = Math.random() > 0.8; // 20% premium
  const viewsCount = getRandomNumber(10, 1000);
  
  const fakeListing = {
    title: `${CONFIG.TEST_PREFIX} ${title}`,
    description: description,
    category: category,
    user_id: user.id,
    budget: price,
    location: location,
    created_at: getRandomDate(),
    views_count: viewsCount,
    urgency: getRandomElement(['low', 'medium', 'high']),
    status: 'active', // Set status to active for test listings
    tags: ['test-data', 'fake-listing', 'generated'] // Test işaretlemesi için tags
  };

  // Add images
  try {
    const images = await getCategoryImages(category);
    if (images.length > 0) {
      fakeListing.main_image_url = images[0];
      fakeListing.additional_image_urls = images.slice(1);
    }
  } catch (error) {
    console.warn(`⚠️ Could not add images for listing: ${error.message}`);
  }

  return fakeListing;
};

// Generate fake listings for a user
const generateUserListings = async (user) => {
  const listings = [];
  // 100 listing için daha fazla listing per user
  const listingCount = Math.min(
    Math.floor(CONFIG.BATCH_SIZE / 13) + 1, // 13 user var, her birine eşit dağıt
    20 // Max 20 listings per user
  );

  console.log(`📝 Generating ${listingCount} listings for user ${user.name} (trust: ${user.trust_score})`);

  for (let i = 0; i < listingCount; i++) {
    const category = getRandomElement(CONFIG.CATEGORIES);
    const listing = await generateFakeListing(user, category);
    listings.push(listing);
  }

  return listings;
};

// Save listings to database
const saveListingsToDatabase = async (listings) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .insert(listings)
      .select();

    if (error) {
      console.error('❌ Error saving listings:', error);
      return false;
    }

    console.log(`✅ Successfully saved ${data.length} listings`);
    return true;
  } catch (error) {
    console.error('❌ Error in saveListingsToDatabase:', error);
    return false;
  }
};

// Cleanup test data
const cleanupTestData = async (batchId = null) => {
  try {
    let query = supabase
      .from('listings')
      .delete()
      .like('title', `${CONFIG.TEST_PREFIX}%`);

    if (batchId) {
      query = query.eq('metadata->batch_id', batchId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Test data cleanup failed:', error);
      return false;
    }

    console.log(`🧹 Cleaned up test listings`);
    return true;
  } catch (error) {
    console.error('❌ Error in cleanupTestData:', error);
    return false;
  }
};

// Main function
const generateFakeListings = async () => {
  console.log('🚀 Starting fake listing generation...');
  console.log(`📊 Target: ${CONFIG.BATCH_SIZE} listings`);
  console.log(`🏷️ Test prefix: ${CONFIG.TEST_PREFIX}`);

  try {
    // Get active users
    const users = await getActiveUsers();
    if (users.length === 0) {
      console.error('❌ No active users found');
      return false;
    }

    // Generate listings
    const allListings = [];
    let totalGenerated = 0;

    for (const user of users) {
      if (totalGenerated >= CONFIG.BATCH_SIZE) break;

      const userListings = await generateUserListings(user);
      allListings.push(...userListings);
      totalGenerated += userListings.length;

      console.log(`📈 Progress: ${totalGenerated}/${CONFIG.BATCH_SIZE}`);
    }

    // Save to database
    if (allListings.length > 0) {
      const success = await saveListingsToDatabase(allListings);
      if (success) {
        console.log(`🎉 Successfully generated ${allListings.length} fake listings!`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Error in generateFakeListings:', error);
    return false;
  }
};

// CLI interface
const main = async () => {
  const command = process.argv[2];

  switch (command) {
    case 'generate':
      await generateFakeListings();
      break;
    case 'cleanup':
      const batchId = process.argv[3];
      await cleanupTestData(batchId);
      break;
    case 'cleanup-all':
      await cleanupTestData();
      break;
    default:
      console.log(`
🤖 Fake Listing Generator

Usage:
  node generate-fake-listings.js generate     # Generate fake listings
  node generate-fake-listings.js cleanup      # Cleanup all test data
  node generate-fake-listings.js cleanup-all  # Cleanup all test data

Configuration:
  - Test prefix: ${CONFIG.TEST_PREFIX}
  - Batch size: ${CONFIG.BATCH_SIZE}
  - Categories: ${CONFIG.CATEGORIES.join(', ')}
      `);
  }
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateFakeListings,
  cleanupTestData,
  CONFIG
}; 