"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const database_1 = require("../config/database");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../config/logger"));
exports.usersController = {
    async getUsers(req, res) {
        try {
            const { page = 1, limit = 20, search, filters } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            let query = database_1.supabase
                .from('profiles')
                .select('*', { count: 'exact' });
            if (search) {
                query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
            }
            if (filters && typeof filters === 'object' && 'status' in filters) {
                query = query.eq('status', filters.status);
            }
            query = query.range(offset, offset + Number(limit) - 1);
            const { data: users, error, count } = await query;
            if (error) {
                logger_1.default.error('Error fetching users:', error);
                return response_1.ApiResponseUtil.internalServerError(res, 'Kullanıcılar getirilirken bir hata oluştu');
            }
            const totalPages = Math.ceil((count || 0) / Number(limit));
            res.json({
                success: true,
                data: users,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count || 0,
                    totalPages
                },
                message: 'Kullanıcılar başarıyla getirildi'
            });
        }
        catch (error) {
            logger_1.default.error('Error in getUsers:', error);
            response_1.ApiResponseUtil.internalServerError(res, 'Kullanıcılar getirilirken bir hata oluştu');
        }
    },
    async getUser(req, res) {
        try {
            const { id } = req.params;
            const { data: user, error } = await database_1.supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                logger_1.default.error('Error fetching user:', error);
                return response_1.ApiResponseUtil.notFound(res, 'Kullanıcı bulunamadı');
            }
            res.json({
                success: true,
                data: user,
                message: 'Kullanıcı başarıyla getirildi'
            });
        }
        catch (error) {
            logger_1.default.error('Error in getUser:', error);
            response_1.ApiResponseUtil.internalServerError(res, 'Kullanıcı getirilirken bir hata oluştu');
        }
    },
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const admin = req.admin;
            logger_1.default.info(`Updating user ${id}`, { admin: admin?.email, updateData });
            const { data: user, error } = await database_1.supabase
                .from('profiles')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                logger_1.default.error('Error updating user:', error);
                return response_1.ApiResponseUtil.internalServerError(res, 'Kullanıcı güncellenirken bir hata oluştu');
            }
            res.json({
                success: true,
                data: user,
                message: 'Kullanıcı başarıyla güncellendi'
            });
        }
        catch (error) {
            logger_1.default.error('Error in updateUser:', error);
            response_1.ApiResponseUtil.internalServerError(res, 'Kullanıcı güncellenirken bir hata oluştu');
        }
    },
    async banUser(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const admin = req.admin;
            logger_1.default.info(`Banning user ${id}`, { admin: admin?.email, reason });
            const { data: user, error } = await database_1.supabase
                .from('profiles')
                .update({
                status: 'BANNED',
                banned_at: new Date().toISOString(),
                banned_by: admin?.id,
                ban_reason: reason
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                logger_1.default.error('Error banning user:', error);
                return response_1.ApiResponseUtil.internalServerError(res, 'Kullanıcı yasaklanırken bir hata oluştu');
            }
            res.json({
                success: true,
                data: user,
                message: 'Kullanıcı başarıyla yasaklandı'
            });
        }
        catch (error) {
            logger_1.default.error('Error in banUser:', error);
            response_1.ApiResponseUtil.internalServerError(res, 'Kullanıcı yasaklanırken bir hata oluştu');
        }
    },
    async unbanUser(req, res) {
        try {
            const { id } = req.params;
            const admin = req.admin;
            logger_1.default.info(`Unbanning user ${id}`, { admin: admin?.email });
            const { data: user, error } = await database_1.supabase
                .from('profiles')
                .update({
                status: 'ACTIVE',
                banned_at: null,
                banned_by: null,
                ban_reason: null
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                logger_1.default.error('Error unbanning user:', error);
                return response_1.ApiResponseUtil.internalServerError(res, 'Kullanıcı yasağı kaldırılırken bir hata oluştu');
            }
            res.json({
                success: true,
                data: user,
                message: 'Kullanıcı yasağı başarıyla kaldırıldı'
            });
        }
        catch (error) {
            logger_1.default.error('Error in unbanUser:', error);
            response_1.ApiResponseUtil.internalServerError(res, 'Kullanıcı yasağı kaldırılırken bir hata oluştu');
        }
    },
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const admin = req.admin;
            logger_1.default.info(`Deleting user ${id}`, { admin: admin?.email });
            const { error } = await database_1.supabase
                .from('profiles')
                .delete()
                .eq('id', id);
            if (error) {
                logger_1.default.error('Error deleting user:', error);
                return response_1.ApiResponseUtil.internalServerError(res, 'Kullanıcı silinirken bir hata oluştu');
            }
            res.json({
                success: true,
                message: 'Kullanıcı başarıyla silindi'
            });
        }
        catch (error) {
            logger_1.default.error('Error in deleteUser:', error);
            response_1.ApiResponseUtil.internalServerError(res, 'Kullanıcı silinirken bir hata oluştu');
        }
    }
};
//# sourceMappingURL=usersController.js.map