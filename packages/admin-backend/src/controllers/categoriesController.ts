import { Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import type { AuthenticatedRequest } from '../types';
import logger from '../config/logger';

// Kategori tipleri
export interface CategoryAttribute {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  options?: string[];
}

export interface Category {
  name: string;
  icon: string;
  color: string;
  subcategories?: Category[];
  attributes?: CategoryAttribute[];
}

export const categoriesController = {
  // Tüm kategorileri getir
  async getCategories(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      logger.info('Fetching categories from JSON file');

      // JSON dosyasının yolu
      const jsonPath = path.join(__dirname, '../../../mobile/src/config/new-categories-no-input.json');
      
      // JSON dosyasını oku
      const jsonData = await fs.readFile(jsonPath, 'utf-8');
      const categories: Category[] = JSON.parse(jsonData);

      // Kategori istatistiklerini hesapla
      const categoriesWithStats = categories.map(category => {
        const stats = categoriesController.calculateCategoryStats(category);
        return {
          ...category,
          stats
        };
      });

      logger.info(`Fetched ${categories.length} main categories`);

      res.json({
        success: true,
        data: categoriesWithStats,
        message: 'Kategoriler başarıyla getirildi',
      });
    } catch (error) {
      logger.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Kategoriler getirilirken bir hata oluştu',
      });
    }
  },

  // Tek kategori getir (path ile)
  async getCategory(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const { path: categoryPath } = req.params;
      
      logger.info(`Fetching category with path: ${categoryPath}`);

      // JSON dosyasını oku
      const jsonPath = path.join(__dirname, '../../../mobile/src/config/new-categories-no-input.json');
      const jsonData = await fs.readFile(jsonPath, 'utf-8');
      const categories: Category[] = JSON.parse(jsonData);

      // Path'e göre kategoriyi bul
      const category = categoriesController.findCategoryByPath(categories, categoryPath);

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Kategori bulunamadı',
        });
        return;
      }

      res.json({
        success: true,
        data: category,
        message: 'Kategori başarıyla getirildi',
      });
    } catch (error) {
      logger.error('Error fetching category:', error);
      res.status(500).json({
        success: false,
        message: 'Kategori getirilirken bir hata oluştu',
      });
    }
  },

  // Kategori güncelle
  async updateCategory(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const { path: categoryPath } = req.params;
      const updateData = req.body;
      const admin = req.admin;

      logger.info(`Updating category with path: ${categoryPath}`, { admin: admin?.email });

      // JSON dosyasını oku
      const jsonPath = path.join(__dirname, '../../../mobile/src/config/new-categories-no-input.json');
      const jsonData = await fs.readFile(jsonPath, 'utf-8');
      const categories: Category[] = JSON.parse(jsonData);

      // Kategoriyi güncelle
      const updatedCategories = categoriesController.updateCategoryInTree(categories, categoryPath, updateData);

      // JSON dosyasını güncelle
      await fs.writeFile(jsonPath, JSON.stringify(updatedCategories, null, 2));

      // Admin aktivite logunu kaydet
      await categoriesController.logCategoryActivity(admin, 'UPDATE_CATEGORY', categoryPath, updateData);

      res.json({
        success: true,
        message: 'Kategori başarıyla güncellendi',
      });
    } catch (error) {
      logger.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        message: 'Kategori güncellenirken bir hata oluştu',
      });
    }
  },

  // Kategori sil
  async deleteCategory(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const { path: categoryPath } = req.params;
      const admin = req.admin;

      logger.info(`Deleting category with path: ${categoryPath}`, { admin: admin?.email });

      // JSON dosyasını oku
      const jsonPath = path.join(__dirname, '../../../mobile/src/config/new-categories-no-input.json');
      const jsonData = await fs.readFile(jsonPath, 'utf-8');
      const categories: Category[] = JSON.parse(jsonData);

      // Kategoriyi sil
      const updatedCategories = categoriesController.deleteCategoryFromTree(categories, categoryPath);

      // JSON dosyasını güncelle
      await fs.writeFile(jsonPath, JSON.stringify(updatedCategories, null, 2));

      // Admin aktivite logunu kaydet
      await categoriesController.logCategoryActivity(admin, 'DELETE_CATEGORY', categoryPath);

      res.json({
        success: true,
        message: 'Kategori başarıyla silindi',
      });
    } catch (error) {
      logger.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        message: 'Kategori silinirken bir hata oluştu',
      });
    }
  },

  // Kategori istatistiklerini hesapla
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
      totalAttributes,
    };
  },

  // Path'e göre kategoriyi bul
  findCategoryByPath(categories: Category[], path: string): Category | null {
    const pathParts = path.split('/');
    
    const findRecursive = (cats: Category[], parts: string[], index: number = 0): Category | null => {
      if (index >= parts.length) return null;
      
      const currentPart = decodeURIComponent(parts[index]);
      const category = cats.find(cat => cat.name === currentPart);
      
      if (!category) return null;
      
      if (index === parts.length - 1) {
        return category;
      }
      
      if (category.subcategories) {
        return findRecursive(category.subcategories, parts, index + 1);
      }
      
      return null;
    };

    return findRecursive(categories, pathParts);
  },

  // Kategori ağacında kategoriyi güncelle
  updateCategoryInTree(categories: Category[], path: string, updateData: Partial<Category>): Category[] {
    const pathParts = path.split('/');
    
    const updateRecursive = (cats: Category[], parts: string[], index: number = 0): Category[] => {
      if (index >= parts.length) return cats;
      
      const currentPart = decodeURIComponent(parts[index]);
      const categoryIndex = cats.findIndex(cat => cat.name === currentPart);
      
      if (categoryIndex === -1) return cats;
      
      if (index === parts.length - 1) {
        // Son seviyede güncelleme yap
        cats[categoryIndex] = { ...cats[categoryIndex], ...updateData };
      } else if (cats[categoryIndex].subcategories) {
        // Alt kategorilerde devam et
        cats[categoryIndex].subcategories = updateRecursive(
          cats[categoryIndex].subcategories!,
          parts,
          index + 1
        );
      }
      
      return cats;
    };

    return updateRecursive(categories, pathParts);
  },

  // Kategori ağacından kategoriyi sil
  deleteCategoryFromTree(categories: Category[], path: string): Category[] {
    const pathParts = path.split('/');
    
    const deleteRecursive = (cats: Category[], parts: string[], index: number = 0): Category[] => {
      if (index >= parts.length) return cats;
      
      const currentPart = decodeURIComponent(parts[index]);
      const categoryIndex = cats.findIndex(cat => cat.name === currentPart);
      
      if (categoryIndex === -1) return cats;
      
      if (index === parts.length - 1) {
        // Son seviyede silme yap
        return cats.filter((_, i) => i !== categoryIndex);
      } else if (cats[categoryIndex].subcategories) {
        // Alt kategorilerde devam et
        cats[categoryIndex].subcategories = deleteRecursive(
          cats[categoryIndex].subcategories!,
          parts,
          index + 1
        );
      }
      
      return cats;
    };

    return deleteRecursive(categories, pathParts);
  },

  // Admin aktivite logunu kaydet
  async logCategoryActivity(admin: any, action: string, categoryPath: string, details?: any): Promise<void> {
    try {
      const { supabase } = await import('../config/database');
      
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: admin?.id,
          action,
          resource: 'categories',
          resource_id: categoryPath,
          details: { categoryPath, ...details },
          ip_address: '127.0.0.1', // TODO: Get real IP
          user_agent: 'Admin Backend',
        });
    } catch (error) {
      logger.error('Error logging category activity:', error);
    }
  },
}; 