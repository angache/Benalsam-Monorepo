"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const logger_1 = __importDefault(require("../config/logger"));
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
exports.categoryService = {
    async getCategories() {
        try {
            logger_1.default.info('Fetching categories from Supabase');
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
            const { data: category, error } = await supabase
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
            const { data: subcategories } = await supabase
                .from('categories')
                .select(`
          *,
          category_attributes (*)
        `)
                .eq('parent_id', categoryId)
                .order('sort_order', { ascending: true });
            const { data: attributes } = await supabase
                .from('category_attributes')
                .select('*')
                .eq('category_id', categoryId)
                .order('sort_order', { ascending: true });
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
        }
        catch (error) {
            logger_1.default.error('Error in getCategory:', error);
            throw error;
        }
    },
    async getCategoryByPath(path) {
        try {
            logger_1.default.info(`Fetching category with path: ${path}`);
            const { data: category, error } = await supabase
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
            const { data: subcategories } = await supabase
                .from('categories')
                .select(`
          *,
          category_attributes (*)
        `)
                .eq('parent_id', category.id)
                .order('sort_order', { ascending: true });
            const { data: attributes } = await supabase
                .from('category_attributes')
                .select('*')
                .eq('category_id', category.id)
                .order('sort_order', { ascending: true });
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
                logger_1.default.error('Error creating category:', error);
                throw error;
            }
            logger_1.default.info(`Created category: ${category.name} (ID: ${category.id})`);
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
            logger_1.default.info(`Updating category ${categoryId}:`, data);
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
                logger_1.default.error('Error updating category:', error);
                throw error;
            }
            logger_1.default.info(`Updated category: ${category.name}`);
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
            logger_1.default.info(`Deleting category ${categoryId}`);
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
                logger_1.default.error('Error deleting category:', error);
                throw error;
            }
            logger_1.default.info(`Deleted category ${categoryId}`);
        }
        catch (error) {
            logger_1.default.error('Error in deleteCategory:', error);
            throw error;
        }
    },
    async createAttribute(categoryId, data) {
        try {
            logger_1.default.info(`Creating attribute for category ${categoryId}:`, data);
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
                logger_1.default.error('Error creating attribute:', error);
                throw error;
            }
            logger_1.default.info(`Created attribute: ${attribute.key}`);
            return attribute;
        }
        catch (error) {
            logger_1.default.error('Error in createAttribute:', error);
            throw error;
        }
    },
    async updateAttribute(id, data) {
        try {
            logger_1.default.info(`Updating attribute ${id}:`, data);
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
                logger_1.default.error('Error updating attribute:', error);
                throw error;
            }
            logger_1.default.info(`Updated attribute: ${attribute.key}`);
            return attribute;
        }
        catch (error) {
            logger_1.default.error('Error in updateAttribute:', error);
            throw error;
        }
    },
    async deleteAttribute(id) {
        try {
            logger_1.default.info(`Deleting attribute ${id}`);
            const { error } = await supabase
                .from('category_attributes')
                .delete()
                .eq('id', id);
            if (error) {
                logger_1.default.error('Error deleting attribute:', error);
                throw error;
            }
            logger_1.default.info(`Deleted attribute ${id}`);
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
            const parsedAttributes = (category.category_attributes || []).map((attr) => ({
                ...attr,
                options: attr.options ? JSON.parse(attr.options) : null
            }));
            categoryMap.set(category.id, {
                ...category,
                subcategories: [],
                attributes: parsedAttributes
            });
        });
        categories.forEach(category => {
            const categoryNode = categoryMap.get(category.id);
            if (category.parent_id) {
                const parent = categoryMap.get(category.parent_id);
                if (parent) {
                    parent.subcategories.push(categoryNode);
                }
            }
            else {
                rootCategories.push(categoryNode);
            }
        });
        return rootCategories;
    },
    calculateCategoryStats(category) {
        let subcategoryCount = 0;
        let totalSubcategories = 0;
        let attributeCount = 0;
        let totalAttributes = 0;
        const countRecursive = (cat, level = 0) => {
            if (level === 1)
                subcategoryCount++;
            if (level > 0)
                totalSubcategories++;
            if (cat.attributes) {
                if (level === 0)
                    attributeCount = cat.attributes.length;
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
//# sourceMappingURL=categoryService.js.map