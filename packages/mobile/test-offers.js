const { createClient } = require('@supabase/supabase-js');

// Supabase client'ı oluştur (gerçek URL ve key'leri kullan)
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

async function testOffers() {
  console.log('=== TEKLİF VERİLERİNİ TEST EDİYORUZ ===\n');

  // 1. Tüm ilanları listele
  console.log('1. TÜM İLANLAR:');
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, title, user_id, created_at');
  
  if (listingsError) {
    console.error('İlanlar alınırken hata:', listingsError);
  } else {
    console.log('İlanlar:', listings);
  }

  console.log('\n2. TÜM TEKLİFLER:');
  const { data: offers, error: offersError } = await supabase
    .from('offers')
    .select('id, listing_id, offering_user_id, status, created_at');
  
  if (offersError) {
    console.error('Teklifler alınırken hata:', offersError);
  } else {
    console.log('Teklifler:', offers);
  }

  // 3. İlk kullanıcının gönderdiği teklifler
  if (listings && listings.length > 0) {
    const firstUserId = listings[0].user_id;
    console.log(`\n3. KULLANICI ${firstUserId} GÖNDERDİĞİ TEKLİFLER:`);
    
    const { data: sentOffers, error: sentError } = await supabase
      .from('offers')
      .select('*')
      .eq('offering_user_id', firstUserId);
    
    if (sentError) {
      console.error('Gönderilen teklifler alınırken hata:', sentError);
    } else {
      console.log('Gönderilen teklifler:', sentOffers);
    }

    // 4. İlk kullanıcının aldığı teklifler
    console.log(`\n4. KULLANICI ${firstUserId} ALDIĞI TEKLİFLER:`);
    
    // Önce kullanıcının ilanlarını bul
    const { data: userListings, error: userListingsError } = await supabase
      .from('listings')
      .select('id')
      .eq('user_id', firstUserId);

    if (userListingsError) {
      console.error('Kullanıcı ilanları alınırken hata:', userListingsError);
    } else if (userListings && userListings.length > 0) {
      const listingIds = userListings.map(l => l.id);
      
      const { data: receivedOffers, error: receivedError } = await supabase
        .from('offers')
        .select('*')
        .in('listing_id', listingIds);
      
      if (receivedError) {
        console.error('Alınan teklifler alınırken hata:', receivedError);
      } else {
        console.log('Alınan teklifler:', receivedOffers);
      }
    } else {
      console.log('Bu kullanıcının ilanı yok');
    }
  }
}

testOffers().catch(console.error); 