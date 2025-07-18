"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesController = void 0;
const logger_1 = __importDefault(require("../config/logger"));
const categoryService_1 = require("../services/categoryService");
exports.categoriesController = {
    async getCategories(req, res) {
        try {
            logger_1.default.info('Fetching categories from Supabase');
            const categories = await categoryService_1.categoryService.getCategories();
            logger_1.default.info(`Fetched ${categories.length} main categories`);
            res.json({
                success: true,
                data: categories,
                message: 'Kategoriler başarıyla getirildi',
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching categories:', error);
            res.status(500).json({
                success: false,
                message: 'Kategoriler getirilirken bir hata oluştu',
            });
        }
    },
    async getCategory(req, res) {
        try {
            const { id } = req.params;
            logger_1.default.info(`Fetching category with ID/Path: ${id}`);
            let category = await categoryService_1.categoryService.getCategoryByPath(decodeURIComponent(id));
            if (!category) {
                category = await categoryService_1.categoryService.getCategory(id);
            }
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
        }
        catch (error) {
            logger_1.default.error('Error fetching category:', error);
            res.status(500).json({
                success: false,
                message: 'Kategori getirilirken bir hata oluştu',
            });
        }
    },
    async createCategory(req, res) {
        try {
            const createData = req.body;
            const admin = req.admin;
            logger_1.default.info('Creating new category:', { admin: admin?.email, data: createData });
            const category = await categoryService_1.categoryService.createCategory(createData);
            await exports.categoriesController.logCategoryActivity(admin, 'CREATE_CATEGORY', category.path, createData);
            res.json({
                success: true,
                data: category,
                message: 'Kategori başarıyla oluşturuldu',
            });
        }
        catch (error) {
            logger_1.default.error('Error creating category:', error);
            res.status(500).json({
                success: false,
                message: 'Kategori oluşturulurken bir hata oluştu',
            });
        }
    },
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const admin = req.admin;
            logger_1.default.info(`Updating category ${id}`, { admin: admin?.email });
            const category = await categoryService_1.categoryService.updateCategory(id, updateData);
            await exports.categoriesController.logCategoryActivity(admin, 'UPDATE_CATEGORY', category.path, updateData);
            res.json({
                success: true,
                data: category,
                message: 'Kategori başarıyla güncellendi',
            });
        }
        catch (error) {
            logger_1.default.error('Error updating category:', error);
            res.status(500).json({
                success: false,
                message: 'Kategori güncellenirken bir hata oluştu',
            });
        }
    },
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const admin = req.admin;
            logger_1.default.info(`Deleting category ${id}`, { admin: admin?.email });
            const category = await categoryService_1.categoryService.getCategory(id);
            const categoryPath = category?.path || id;
            await categoryService_1.categoryService.deleteCategory(id);
            await exports.categoriesController.logCategoryActivity(admin, 'DELETE_CATEGORY', categoryPath);
            res.json({
                success: true,
                message: 'Kategori başarıyla silindi',
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting category:', error);
            res.status(500).json({
                success: false,
                message: 'Kategori silinirken bir hata oluştu',
            });
        }
    },
    async createAttribute(req, res) {
        try {
            const { categoryId } = req.params;
            const createData = req.body;
            const admin = req.admin;
            logger_1.default.info(`Creating attribute for category ${categoryId}`, { admin: admin?.email });
            const attribute = await categoryService_1.categoryService.createAttribute(categoryId, createData);
            await exports.categoriesController.logCategoryActivity(admin, 'CREATE_ATTRIBUTE', categoryId, createData);
            res.json({
                success: true,
                data: attribute,
                message: 'Attribute başarıyla oluşturuldu',
            });
        }
        catch (error) {
            logger_1.default.error('Error creating attribute:', error);
            res.status(500).json({
                success: false,
                message: 'Attribute oluşturulurken bir hata oluştu',
            });
        }
    },
    async updateAttribute(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const admin = req.admin;
            logger_1.default.info(`Updating attribute ${id}`, { admin: admin?.email });
            const attribute = await categoryService_1.categoryService.updateAttribute(id, updateData);
            await exports.categoriesController.logCategoryActivity(admin, 'UPDATE_ATTRIBUTE', id, updateData);
            res.json({
                success: true,
                data: attribute,
                message: 'Attribute başarıyla güncellendi',
            });
        }
        catch (error) {
            logger_1.default.error('Error updating attribute:', error);
            res.status(500).json({
                success: false,
                message: 'Attribute güncellenirken bir hata oluştu',
            });
        }
    },
    async deleteAttribute(req, res) {
        try {
            const { id } = req.params;
            const admin = req.admin;
            logger_1.default.info(`Deleting attribute ${id}`, { admin: admin?.email });
            await categoryService_1.categoryService.deleteAttribute(id);
            await exports.categoriesController.logCategoryActivity(admin, 'DELETE_ATTRIBUTE', id);
            res.json({
                success: true,
                message: 'Attribute başarıyla silindi',
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting attribute:', error);
            res.status(500).json({
                success: false,
                message: 'Attribute silinirken bir hata oluştu',
            });
        }
    },
    async logCategoryActivity(admin, action, categoryPath, details) {
        try {
            logger_1.default.info('Category activity logged', {
                admin: admin?.email,
                action,
                categoryPath,
                details
            });
        }
        catch (error) {
            logger_1.default.error('Error logging category activity:', error);
        }
    }
};
//# sourceMappingURL=categoriesController.js.map