const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://dnwreckpeenhbdtapmxr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateCategoriesToSupabase() {
  try {
    console.log('🚀 Starting category migration to Supabase...');

    // Read JSON file
    const jsonPath = path.join(__dirname, '../src/config/new-categories-no-input.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const categories = JSON.parse(jsonData);

    console.log(`📊 Found ${categories.length} main categories`);

    // Clear existing data
    console.log('🧹 Clearing existing category data...');
    await supabase.from('category_attributes').delete().neq('id', 0);
    await supabase.from('categories').delete().neq('id', 0);

    // Process categories recursively
    let totalCategories = 0;
    let totalAttributes = 0;

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const result = await processCategory(category, null, 0, '');
      totalCategories += result.categories;
      totalAttributes += result.attributes;
    }

    console.log(`✅ Migration completed successfully!`);
    console.log(`📈 Total categories inserted: ${totalCategories}`);
    console.log(`📈 Total attributes inserted: ${totalAttributes}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function processCategory(category, parentId, level, parentPath) {
  let categoriesCount = 0;
  let attributesCount = 0;

  // Create category path
  const categoryPath = parentPath ? `${parentPath}/${category.name}` : category.name;

  // Insert category
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .insert({
      name: category.name,
      icon: category.icon || null,
      color: category.color || null,
      path: categoryPath,
      parent_id: parentId,
      level: level,
      sort_order: level * 1000 + categoriesCount,
      is_active: true
    })
    .select()
    .single();

  if (categoryError) {
    console.error(`❌ Error inserting category ${categoryPath}:`, categoryError);
    throw categoryError;
  }

  categoriesCount++;
  console.log(`✅ Inserted category: ${categoryPath} (ID: ${categoryData.id})`);

  // Insert attributes if they exist
  if (category.attributes && category.attributes.length > 0) {
    const attributes = category.attributes.map((attr, index) => ({
      category_id: categoryData.id,
      key: attr.key,
      label: attr.label,
      type: attr.type,
      required: attr.required || false,
      options: attr.options ? JSON.stringify(attr.options) : null,
      sort_order: index
    }));

    const { error: attributesError } = await supabase
      .from('category_attributes')
      .insert(attributes);

    if (attributesError) {
      console.error(`❌ Error inserting attributes for ${categoryPath}:`, attributesError);
      throw attributesError;
    }

    attributesCount += attributes.length;
    console.log(`✅ Inserted ${attributes.length} attributes for ${categoryPath}`);
  }

  // Process subcategories recursively
  if (category.subcategories && category.subcategories.length > 0) {
    for (let i = 0; i < category.subcategories.length; i++) {
      const subcategory = category.subcategories[i];
      const result = await processCategory(subcategory, categoryData.id, level + 1, categoryPath);
      categoriesCount += result.categories;
      attributesCount += result.attributes;
    }
  }

  return { categories: categoriesCount, attributes: attributesCount };
}

// Helper function to get category tree
async function getCategoryTree() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      category_attributes (*)
    `)
    .order('level', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return null;
  }

  return buildCategoryTree(categories);
}

function buildCategoryTree(categories) {
  const categoryMap = new Map();
  const rootCategories = [];

  // Create map of all categories
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      subcategories: [],
      attributes: category.category_attributes || []
    });
  });

  // Build tree structure
  categories.forEach(category => {
    const categoryNode = categoryMap.get(category.id);
    
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.subcategories.push(categoryNode);
      }
    } else {
      rootCategories.push(categoryNode);
    }
  });

  return rootCategories;
}

// Export functions for use in other scripts
module.exports = {
  migrateCategoriesToSupabase,
  getCategoryTree,
  buildCategoryTree
};

// Run migration if called directly
if (require.main === module) {
  migrateCategoriesToSupabase();
} 