const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
const envPath = './packages/mobile/.env';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
}

// Add service role key manually
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRud3JlY2twZWVuaGJkdGFwbXhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk5ODA3MCwiZXhwIjoyMDY1NTc0MDcwfQ.b6UNsncrPKXYB-17oyOEx8xY_hbofAx7ObwzKsyhsm4';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOffersCount() {
  console.log('🔍 Checking offers count for test listings...');
  
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, offers_count')
    .like('title', '[TEST_DATA]%')
    .limit(10);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`✅ Found ${data.length} test listings:`);
  data.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}: ${item.offers_count || 0} offers`);
  });
  
  // Update some listings with offers_count
  console.log('\n🔄 Updating offers_count for some listings...');
  
  const updatePromises = data.slice(0, 5).map((item, index) => {
    const offersCount = Math.floor(Math.random() * 10) + 1; // 1-10 arası
    return supabase
      .from('listings')
      .update({ offers_count: offersCount })
      .eq('id', item.id);
  });
  
  const results = await Promise.all(updatePromises);
  const successCount = results.filter(r => !r.error).length;
  
  console.log(`✅ Updated ${successCount} listings with random offers_count`);
  
  // Check again
  const { data: updatedData, error: updatedError } = await supabase
    .from('listings')
    .select('id, title, offers_count')
    .like('title', '[TEST_DATA]%')
    .gt('offers_count', 0)
    .order('offers_count', { ascending: false })
    .limit(5);
  
  if (updatedError) {
    console.error('❌ Error checking updated data:', updatedError);
    return;
  }
  
  console.log('\n📊 Updated listings with offers_count > 0:');
  updatedData.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}: ${item.offers_count} offers`);
  });
}

checkOffersCount().catch(console.error); 