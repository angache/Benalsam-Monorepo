import { createClient } from '@supabase/supabase-js';
import logger from '../config/logger';

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
export interface CategoryAttribute {
  id: number;
  category_id: number;
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  options?: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  path: string;
  parent_id?: number;
  level: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subcategories?: Category[];
  attributes?: CategoryAttribute[];
  stats?: {
    subcategoryCount: number;
    totalSubcategories: number;
    attributeCount: number;
    totalAttributes: number;
  };
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  color?: string;
  parent_id?: number;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateAttributeRequest {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;
  options?: string[];
  sort_order?: number;
}

export interface UpdateAttributeRequest {
  key?: string;
  label?: string;
  type?: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;
  options?: string[];
  sort_order?: number;
}

export const categoryService = {
  // Get all categories with tree structure
  async getCategories(): Promise<Category[]> {
    try {
      logger.info('Fetching categories from Supabase');

      const { data: categories, error } = await supabase
        .from('categories')
        .select(`
          *,
          category_attributes (*)
        `)
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) {
        logger.error('Error fetching categories:', error);
        throw error;
      }

      // Build tree structure
      const categoryTree = this.buildCategoryTree(categories || []);

      // Add stats to each category
      const categoriesWithStats = categoryTree.map(category => ({
        ...category,
        stats: this.calculateCategoryStats(category)
      }));

      logger.info(`Fetched ${categoriesWithStats.length} main categories`);
      return categoriesWithStats;

    } catch (error) {
      logger.error('Error in getCategories:', error);
      throw error;
    }
  },

  // Get single category by ID
  async getCategory(id: string | number): Promise<Category | null> {
    try {
      const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
      logger.info(`Fetching category with ID: ${categoryId}`);

      const { data: category, error } = await supabase
        .from('categories')
        .select(`
          *,
          category_attributes (*)
        `)
        .eq('id', categoryId)
        .single();

      if (error) {
        logger.error('Error fetching category:', error);
        throw error;
      }

      if (!category) {
        return null;
      }

      // Get subcategories
      const { data: subcategories } = await supabase
        .from('categories')
        .select(`
          *,
          category_attributes (*)
        `)
        .eq('parent_id', categoryId)
        .order('sort_order', { ascending: true });

      // Get attributes for the current category
      const { data: attributes } = await supabase
        .from('category_attributes')
        .select('*')
        .eq('category_id', categoryId)
        .order('sort_order', { ascending: true });

      // Parse options for attributes
      const parsedAttributes = (attributes || []).map(attr => ({
        ...attr,
        options: attr.options ? JSON.parse(attr.options) : null
      }));

      const categoryWithSubcategories = {
        ...category,
        subcategories: subcategories || [],
        attributes: parsedAttributes,
        stats: this.calculateCategoryStats({
          ...category,
          subcategories: subcategories || [],
          attributes: parsedAttributes
        })
      };

      return categoryWithSubcategories;

    } catch (error) {
      logger.error('Error in getCategory:', error);
      throw error;
    }
  },

  // Get category by path
  async getCategoryByPath(path: string): Promise<Category | null> {
    try {
      logger.info(`Fetching category with path: ${path}`);

      const { data: category, error } = await supabase
        .from('categories')
        .select(`
          *,
          category_attributes (*)
        `)
        .eq('path', path)
        .single();

      if (error) {
        logger.error('Error fetching category by path:', error);
        throw error;
      }

      if (!category) {
        return null;
      }

      // Get subcategories
      const { data: subcategories } = await supabase
        .from('categories')
        .select(`
          *,
          category_attributes (*)
        `)
        .eq('parent_id', category.id)
        .order('sort_order', { ascending: true });

      // Get attributes for the current category
      const { data: attributes } = await supabase
        .from('category_attributes')
        .select('*')
        .eq('category_id', category.id)
        .order('sort_order', { ascending: true });

      // Parse options for attributes
      const parsedAttributes = (attributes || []).map(attr => ({
        ...attr,
        options: attr.options ? JSON.parse(attr.options) : null
      }));

      const categoryWithDetails = {
        ...category,
        subcategories: subcategories || [],
        attributes: parsedAttributes,
        stats: this.calculateCategoryStats({
          ...category,
          subcategories: subcategories || [],
          attributes: parsedAttributes
        })
      };

      return categoryWithDetails;

    } catch (error) {
      logger.error('Error in getCategoryByPath:', error);
      throw error;
    }
  },

  // Create new category
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    try {
      logger.info('Creating new category:', data);

      // Get parent category to build path
      let path = data.name;
      let level = 0;

      if (data.parent_id) {
        const parent = await this.getCategory(data.parent_id);
        if (parent) {
          path = `${parent.path}/${data.name}`;
          level = parent.level + 1;
        }
      }

      const { data: category, error } = await supabase
        .from('categories')
        .insert({
          name: data.name,
          icon: data.icon,
          color: data.color,
          path,
          parent_id: data.parent_id,
          level,
          sort_order: data.sort_order || level * 1000,
          is_active: data.is_active !== false
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating category:', error);
        throw error;
      }

      logger.info(`Created category: ${category.name} (ID: ${category.id})`);
      return category;

    } catch (error) {
      logger.error('Error in createCategory:', error);
      throw error;
    }
  },

  // Update category
  async updateCategory(id: string | number, data: UpdateCategoryRequest): Promise<Category> {
    try {
      const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
      logger.info(`Updating category ${categoryId}:`, data);

      const { data: category, error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          icon: data.icon,
          color: data.color,
          sort_order: data.sort_order,
          is_active: data.is_active
        })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating category:', error);
        throw error;
      }

      logger.info(`Updated category: ${category.name}`);
      return category;

    } catch (error) {
      logger.error('Error in updateCategory:', error);
      throw error;
    }
  },

  // Delete category
  async deleteCategory(id: string | number): Promise<void> {
    try {
      const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
      logger.info(`Deleting category ${categoryId}`);

      // Check if category has subcategories
      const { data: subcategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', categoryId);

      if (subcategories && subcategories.length > 0) {
        throw new Error('Cannot delete category with subcategories');
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        logger.error('Error deleting category:', error);
        throw error;
      }

      logger.info(`Deleted category ${categoryId}`);

    } catch (error) {
      logger.error('Error in deleteCategory:', error);
      throw error;
    }
  },

  // Create attribute
  async createAttribute(categoryId: string, data: CreateAttributeRequest): Promise<CategoryAttribute> {
    try {
      logger.info(`Creating attribute for category ${categoryId}:`, data);

      const { data: attribute, error } = await supabase
        .from('category_attributes')
        .insert({
          category_id: categoryId,
          key: data.key,
          label: data.label,
          type: data.type,
          required: data.required || false,
          options: data.options ? JSON.stringify(data.options) : null,
          sort_order: data.sort_order || 0
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating attribute:', error);
        throw error;
      }

      logger.info(`Created attribute: ${attribute.key}`);
      return attribute;

    } catch (error) {
      logger.error('Error in createAttribute:', error);
      throw error;
    }
  },

  // Update attribute
  async updateAttribute(id: string, data: UpdateAttributeRequest): Promise<CategoryAttribute> {
    try {
      logger.info(`Updating attribute ${id}:`, data);

      const { data: attribute, error } = await supabase
        .from('category_attributes')
        .update({
          key: data.key,
          label: data.label,
          type: data.type,
          required: data.required,
          options: data.options ? JSON.stringify(data.options) : null,
          sort_order: data.sort_order
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating attribute:', error);
        throw error;
      }

      logger.info(`Updated attribute: ${attribute.key}`);
      return attribute;

    } catch (error) {
      logger.error('Error in updateAttribute:', error);
      throw error;
    }
  },

  // Delete attribute
  async deleteAttribute(id: string): Promise<void> {
    try {
      logger.info(`Deleting attribute ${id}`);

      const { error } = await supabase
        .from('category_attributes')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting attribute:', error);
        throw error;
      }

      logger.info(`Deleted attribute ${id}`);

    } catch (error) {
      logger.error('Error in deleteAttribute:', error);
      throw error;
    }
  },

  // Helper: Build category tree
  buildCategoryTree(categories: any[]): Category[] {
    const categoryMap = new Map();
    const rootCategories: Category[] = [];

    // Create map of all categories
    categories.forEach(category => {
      // Parse options for attributes
      const parsedAttributes = (category.category_attributes || []).map((attr: any) => ({
        ...attr,
        options: attr.options ? JSON.parse(attr.options) : null
      }));

      categoryMap.set(category.id, {
        ...category,
        subcategories: [],
        attributes: parsedAttributes
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
  },

  // Helper: Calculate category stats
  calculateCategoryStats(category: Category): {
    subcategoryCount: number;
    totalSubcategories: number;
    attributeCount: number;
    totalAttributes: number;
  } {
    let subcategoryCount = 0;
    let totalSubcategories = 0;
    let attributeCount = 0;
    let totalAttributes = 0;

    const countRecursive = (cat: Category, level: number = 0) => {
      if (level === 1) subcategoryCount++;
      if (level > 0) totalSubcategories++;
      
      if (cat.attributes) {
        if (level === 0) attributeCount = cat.attributes.length;
        totalAttributes += cat.attributes.length;
      }

      if (cat.subcategories) {
        cat.subcategories.forEach(sub => countRecursive(sub, level + 1));
      }
    };

    countRecursive(category);

    return {
      subcategoryCount,
      totalSubcategories,
      attributeCount,
      totalAttributes
    };
  }
}; 