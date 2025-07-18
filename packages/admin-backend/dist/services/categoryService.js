"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const logger_1 = __importDefault(require("../config/logger"));
let supabase = null;
function getSupabaseClient() {
    if (!supabase) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase configuration missing. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
        }
        supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
    }
    return supabase;
}
exports.categoryService = {
    async getCategories() {
        try {
            logger_1.default.info('Fetching categories from Supabase');
            const { data: categories, error } = await getSupabaseClient()
                .from('categories')
                .select(`
          *,
          category_attributes (*)
        `)
                .eq('is_active', true)
                .order('level', { ascending: true })
                .order('sort_order', { ascending: true });
            if (error) {
                logger_1.default.error('Error fetching categories:', error);
                throw error;
            }
            const categoryTree = this.buildCategoryTree(categories || []);
            const categoriesWithStats = categoryTree.map(category => ({
                ...category,
                stats: this.calculateCategoryStats(category)
            }));
            logger_1.default.info(`Fetched ${categoriesWithStats.length} main categories`);
            return categoriesWithStats;
        }
        catch (error) {
            logger_1.default.error('Error in getCategories:', error);
            throw error;
        }
    },
    async getCategory(id) {
        try {
            const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
            logger_1.default.info(`Fetching category with ID: ${categoryId}`);
            const { data: category, error } = await getSupabaseClient()
                .from('categories')
                .select(`
          *,
          category_attributes (*)
        `)
                .eq('id', categoryId)
                .single();
            if (error) {
                logger_1.default.error('Error fetching category:', error);
                throw error;
            }
            if (!category) {
                return null;
            }
            const { data: subcategories } = await getSupabaseClient()
                .from('categories')
                .select(`
          *,
          category_attributes (*)
        `)
                .eq('parent_id', categoryId)
                .order('sort_order', { ascending: true });
            const { data: attributes } = await getSupabaseClient()
                .from('category_attributes')
                .select('*')
                .eq('category_id', categoryId)
                .order('sort_order', { ascending: true });
            const parsedAttributes = (attributes || []).map((attr) => ({
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
        }
        catch (error) {
            logger_1.default.error('Error in getCategory:', error);
            throw error;
        }
    },
    async getCategoryByPath(path) {
        try {
            logger_1.default.info(`Fetching category with path: ${path}`);
            const { data: category, error } = await getSupabaseClient()
                .from('categories')
                .select(`
          *,
          category_attributes (*)
        `)
                .eq('path', path)
                .single();
            if (error) {
                logger_1.default.error('Error fetching category by path:', error);
                throw error;
            }
            if (!category) {
                return null;
            }
            const { data: subcategories } = await getSupabaseClient()
                .from('categories')
                .select(`
          *,
          category_attributes (*)
        `)
                .eq('parent_id', category.id)
                .order('sort_order', { ascending: true });
            const { data: attributes } = await getSupabaseClient()
                .from('category_attributes')
                .select('*')
                .eq('category_id', category.id)
                .order('sort_order', { ascending: true });
            const parsedAttributes = (attributes || []).map((attr) => ({
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
        }
        catch (error) {
            logger_1.default.error('Error in getCategoryByPath:', error);
            throw error;
        }
    },
    async createCategory(data) {
        try {
            logger_1.default.info('Creating new category:', data);
            let path = data.name;
            let level = 0;
            if (data.parent_id) {
                const parent = await this.getCategory(data.parent_id);
                if (!parent) {
                    throw new Error('Parent category not found');
                }
                path = `${parent.path} > ${data.name}`;
                level = parent.level + 1;
            }
            const { data: category, error } = await getSupabaseClient()
                .from('categories')
                .insert({
                ...data,
                path,
                level,
                sort_order: data.sort_order || 0,
                is_active: data.is_active !== false
            })
                .select()
                .single();
            if (error) {
                logger_1.default.error('Error creating category:', error);
                throw error;
            }
            logger_1.default.info('Category created successfully:', category.id);
            return category;
        }
        catch (error) {
            logger_1.default.error('Error in createCategory:', error);
            throw error;
        }
    },
    async updateCategory(id, data) {
        try {
            const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
            logger_1.default.info(`Updating category with ID: ${categoryId}`);
            const { data: category, error } = await getSupabaseClient()
                .from('categories')
                .update({
                ...data,
                updated_at: new Date().toISOString()
            })
                .eq('id', categoryId)
                .select()
                .single();
            if (error) {
                logger_1.default.error('Error updating category:', error);
                throw error;
            }
            logger_1.default.info('Category updated successfully:', category.id);
            return category;
        }
        catch (error) {
            logger_1.default.error('Error in updateCategory:', error);
            throw error;
        }
    },
    async deleteCategory(id) {
        try {
            const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
            logger_1.default.info(`Deleting category with ID: ${categoryId}`);
            const { data: subcategories } = await getSupabaseClient()
                .from('categories')
                .select('id')
                .eq('parent_id', categoryId);
            if (subcategories && subcategories.length > 0) {
                throw new Error('Cannot delete category with subcategories');
            }
            const { error } = await getSupabaseClient()
                .from('categories')
                .delete()
                .eq('id', categoryId);
            if (error) {
                logger_1.default.error('Error deleting category:', error);
                throw error;
            }
            logger_1.default.info('Category deleted successfully:', categoryId);
        }
        catch (error) {
            logger_1.default.error('Error in deleteCategory:', error);
            throw error;
        }
    },
    async createAttribute(categoryId, data) {
        try {
            const catId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
            logger_1.default.info(`Creating attribute for category ${catId}:`, data);
            const { data: attribute, error } = await getSupabaseClient()
                .from('category_attributes')
                .insert({
                category_id: catId,
                ...data,
                options: data.options ? JSON.stringify(data.options) : null,
                sort_order: data.sort_order || 0
            })
                .select()
                .single();
            if (error) {
                logger_1.default.error('Error creating attribute:', error);
                throw error;
            }
            logger_1.default.info('Attribute created successfully:', attribute.id);
            return attribute;
        }
        catch (error) {
            logger_1.default.error('Error in createAttribute:', error);
            throw error;
        }
    },
    async updateAttribute(id, data) {
        try {
            const attributeId = typeof id === 'string' ? parseInt(id, 10) : id;
            logger_1.default.info(`Updating attribute with ID: ${attributeId}`);
            const { data: attribute, error } = await getSupabaseClient()
                .from('category_attributes')
                .update({
                ...data,
                options: data.options ? JSON.stringify(data.options) : undefined,
                updated_at: new Date().toISOString()
            })
                .eq('id', attributeId)
                .select()
                .single();
            if (error) {
                logger_1.default.error('Error updating attribute:', error);
                throw error;
            }
            logger_1.default.info('Attribute updated successfully:', attribute.id);
            return attribute;
        }
        catch (error) {
            logger_1.default.error('Error in updateAttribute:', error);
            throw error;
        }
    },
    async deleteAttribute(id) {
        try {
            const attributeId = typeof id === 'string' ? parseInt(id, 10) : id;
            logger_1.default.info(`Deleting attribute with ID: ${attributeId}`);
            const { error } = await getSupabaseClient()
                .from('category_attributes')
                .delete()
                .eq('id', attributeId);
            if (error) {
                logger_1.default.error('Error deleting attribute:', error);
                throw error;
            }
            logger_1.default.info('Attribute deleted successfully:', attributeId);
        }
        catch (error) {
            logger_1.default.error('Error in deleteAttribute:', error);
            throw error;
        }
    },
    buildCategoryTree(categories) {
        const categoryMap = new Map();
        const rootCategories = [];
        categories.forEach(category => {
            categoryMap.set(category.id, {
                ...category,
                subcategories: [],
                attributes: category.category_attributes || []
            });
        });
        categories.forEach(category => {
            const categoryWithSubcategories = categoryMap.get(category.id);
            if (category.parent_id && categoryMap.has(category.parent_id)) {
                const parent = categoryMap.get(category.parent_id);
                parent.subcategories.push(categoryWithSubcategories);
            }
            else {
                rootCategories.push(categoryWithSubcategories);
            }
        });
        return rootCategories;
    },
    calculateCategoryStats(category) {
        const countRecursive = (cat, level = 0) => {
            let subcategoryCount = cat.subcategories?.length || 0;
            let totalSubcategories = subcategoryCount;
            let attributeCount = cat.attributes?.length || 0;
            let totalAttributes = attributeCount;
            if (cat.subcategories) {
                for (const subcategory of cat.subcategories) {
                    const subStats = countRecursive(subcategory, level + 1);
                    totalSubcategories += subStats.totalSubcategories;
                    totalAttributes += subStats.totalAttributes;
                }
            }
            return {
                subcategoryCount,
                totalSubcategories,
                attributeCount,
                totalAttributes
            };
        };
        return countRecursive(category);
    }
};
//# sourceMappingURL=categoryService.js.map