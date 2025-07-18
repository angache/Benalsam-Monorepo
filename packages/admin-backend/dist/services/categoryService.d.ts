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
export declare const categoryService: {
    getCategories(): Promise<Category[]>;
    getCategory(id: string | number): Promise<Category | null>;
    getCategoryByPath(path: string): Promise<Category | null>;
    createCategory(data: CreateCategoryRequest): Promise<Category>;
    updateCategory(id: string | number, data: UpdateCategoryRequest): Promise<Category>;
    deleteCategory(id: string | number): Promise<void>;
    createAttribute(categoryId: string, data: CreateAttributeRequest): Promise<CategoryAttribute>;
    updateAttribute(id: string, data: UpdateAttributeRequest): Promise<CategoryAttribute>;
    deleteAttribute(id: string): Promise<void>;
    buildCategoryTree(categories: any[]): Category[];
    calculateCategoryStats(category: Category): {
        subcategoryCount: number;
        totalSubcategories: number;
        attributeCount: number;
        totalAttributes: number;
    };
};
//# sourceMappingURL=categoryService.d.ts.map