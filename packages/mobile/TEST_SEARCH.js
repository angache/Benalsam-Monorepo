// Basit arama test fonksiyonu
// Bu dosyayı Node.js ile çalıştırın

const { createClient } = require('@supabase/supabase-js');

async function testSearch() {
  console.log('🧪 Testing search functionality...');
  
  // Supabase URL ve key'lerini buraya ekleyin
  const supabaseUrl = 'https://dnwreckpeenhbdtapmxr.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRud3JlY2twZWVuaGJkdGFwbXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTgwNzAsImV4cCI6MjA2NTU3NDA3MH0.2lzsxTj4hoKTcZeoCGMsUC3Cmsm1pgcqXP-3j_GV_Ys';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test 1: Basit arama
    console.log('🧪 Test 1: Basic search for "iPhone"');
    const { data: basicData, error: basicError } = await supabase.rpc('search_listings_with_attributes', {
      search_query: 'iPhone',
      p_page: 1,
      p_page_size: 5
    });
    
    console.log('Basic search result:', { 
      count: basicData?.length || 0, 
      error: basicError,
      titles: basicData?.map(item => item.title) || []
    });
    
    // Test 2: Kategori ile arama (düzeltilmiş)
    console.log('🧪 Test 2: Category search for "Elektronik > Telefon"');
    const { data: categoryData, error: categoryError } = await supabase.rpc('search_listings_with_attributes', {
      search_query: 'iPhone',
      p_categories: ['Elektronik > Telefon'],
      p_page: 1,
      p_page_size: 5
    });
    
    console.log('Category search result:', { 
      count: categoryData?.length || 0, 
      error: categoryError,
      titles: categoryData?.map(item => item.title) || []
    });
    
    // Test 3: Boş attribute ile arama
    console.log('🧪 Test 3: Empty attribute search');
    const { data: attrData, error: attrError } = await supabase.rpc('search_listings_with_attributes', {
      search_query: 'iPhone',
      p_attributes: null,
      p_page: 1,
      p_page_size: 5
    });
    
    console.log('Attribute search result:', { 
      count: attrData?.length || 0, 
      error: attrError,
      titles: attrData?.map(item => item.title) || []
    });
    
    // Test 4: Sadece kategori araması
    console.log('🧪 Test 4: Only category search');
    const { data: onlyCategoryData, error: onlyCategoryError } = await supabase.rpc('search_listings_with_attributes', {
      p_categories: ['Elektronik'],
      p_page: 1,
      p_page_size: 5
    });
    
    console.log('Only category search result:', { 
      count: onlyCategoryData?.length || 0, 
      error: onlyCategoryError,
      titles: onlyCategoryData?.map(item => item.title) || []
    });
    
    // Test 5: Tüm sonuçları getir
    console.log('🧪 Test 5: Get all results');
    const { data: allData, error: allError } = await supabase.rpc('search_listings_with_attributes', {
      p_page: 1,
      p_page_size: 10
    });
    
    console.log('All results:', { 
      count: allData?.length || 0, 
      error: allError,
      categories: [...new Set(allData?.map(item => item.category) || [])]
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test fonksiyonunu çalıştır
testSearch(); 