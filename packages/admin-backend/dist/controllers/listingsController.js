"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingsController = void 0;
const database_1 = require("../config/database");
const logger_1 = __importDefault(require("../config/logger"));
exports.listingsController = {
    async getListings(req, res) {
        try {
            const { page = 1, limit = 10, search, status, category, userId, sortBy = 'created_at', sortOrder = 'desc', } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const offset = (pageNum - 1) * limitNum;
            logger_1.default.info(`Fetching listings with filters:`, { page: pageNum, limit: limitNum, search, status, category });
            console.log('🔍 Fetching listings from Supabase...');
            let query = database_1.supabase
                .from('listings')
                .select(`*`);
            if (search) {
                query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
            }
            if (status && typeof status === 'string') {
                query = query.eq('status', status.toLowerCase());
            }
            if (category) {
                query = query.eq('category', category);
            }
            if (userId) {
                query = query.eq('user_id', userId);
            }
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });
            const { count } = await database_1.supabase
                .from('listings')
                .select('*', { count: 'exact', head: true });
            query = query.range(offset, offset + limitNum - 1);
            const { data: listings, error } = await query;
            if (error) {
                logger_1.default.error('Error fetching listings:', error);
                console.error('❌ Supabase error:', error);
                res.status(500).json({
                    success: false,
                    message: 'İlanlar getirilirken bir hata oluştu',
                });
                return;
            }
            const userIds = [...new Set(listings?.map(l => l.user_id).filter(Boolean) || [])];
            const userEmails = new Map();
            for (const userId of userIds) {
                try {
                    const { data: authUser, error: authError } = await database_1.supabase.auth.admin.getUserById(userId);
                    if (!authError && authUser?.user) {
                        userEmails.set(userId, authUser.user.email || 'Bilinmiyor');
                    }
                    else {
                        userEmails.set(userId, 'Bilinmiyor');
                    }
                }
                catch (error) {
                    userEmails.set(userId, 'Bilinmiyor');
                }
            }
            const { data: profiles } = await database_1.supabase
                .from('profiles')
                .select('id, name, avatar_url')
                .in('id', userIds);
            const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
            const transformedListings = (listings || []).map(listing => ({
                id: listing.id,
                title: listing.title,
                description: listing.description,
                price: listing.budget || 0,
                category: listing.category,
                status: listing.status?.toUpperCase() || 'PENDING',
                views: listing.views_count || 0,
                favorites: listing.favorites_count || 0,
                createdAt: listing.created_at,
                updatedAt: listing.updated_at,
                userId: listing.user_id,
                images: listing.main_image_url ? [listing.main_image_url, ...(listing.additional_image_urls || [])] : [],
                user: {
                    id: listing.user_id,
                    email: userEmails.get(listing.user_id) || 'Bilinmiyor',
                    name: profilesMap.get(listing.user_id)?.name || 'Bilinmiyor'
                },
            }));
            const totalCount = count || 0;
            const totalPages = Math.ceil(totalCount / limitNum);
            logger_1.default.info(`Fetched ${transformedListings.length} listings out of ${totalCount} total`);
            console.log(`✅ Fetched ${transformedListings.length} listings out of ${totalCount} total`);
            res.json({
                success: true,
                data: transformedListings,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: totalCount,
                    totalPages,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching listings:', error);
            res.status(500).json({
                success: false,
                message: 'İlanlar getirilirken bir hata oluştu',
            });
        }
    },
    async getListing(req, res) {
        try {
            const { id } = req.params;
            logger_1.default.info(`Fetching listing with ID: ${id}`);
            const { data: listing, error } = await database_1.supabase
                .from('listings')
                .select(`*`)
                .eq('id', id)
                .single();
            if (error || !listing) {
                logger_1.default.error(`Listing not found: ${id}`, error);
                res.status(404).json({
                    success: false,
                    message: 'İlan bulunamadı',
                });
                return;
            }
            let userEmail = 'Bilinmiyor';
            if (listing.user_id) {
                const { data: authUser, error: authError } = await database_1.supabase.auth.admin.getUserById(listing.user_id);
                if (!authError && authUser?.user) {
                    userEmail = authUser.user.email || 'Bilinmiyor';
                }
            }
            const { data: profile } = await database_1.supabase
                .from('profiles')
                .select('name, avatar_url')
                .eq('id', listing.user_id)
                .single();
            const transformedListing = {
                id: listing.id,
                title: listing.title,
                description: listing.description,
                price: listing.budget || 0,
                category: listing.category,
                status: listing.status?.toUpperCase() || 'PENDING',
                views: listing.views_count || 0,
                favorites: listing.favorites_count || 0,
                createdAt: listing.created_at,
                updatedAt: listing.updated_at,
                userId: listing.user_id,
                images: listing.main_image_url ? [listing.main_image_url, ...(listing.additional_image_urls || [])] : [],
                user: {
                    id: listing.user_id,
                    email: userEmail,
                    name: profile?.name || 'Bilinmiyor'
                },
            };
            res.json({
                success: true,
                data: transformedListing,
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching listing:', error);
            res.status(500).json({
                success: false,
                message: 'İlan getirilirken bir hata oluştu',
            });
        }
    },
    async updateListing(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            logger_1.default.info(`Updating listing with ID: ${id}`, updateData);
            const { data: listing, error } = await database_1.supabase
                .from('listings')
                .update({
                ...updateData,
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select(`*`)
                .single();
            if (error || !listing) {
                logger_1.default.error(`Error updating listing: ${id}`, error);
                res.status(404).json({
                    success: false,
                    message: 'İlan bulunamadı veya güncellenemedi',
                });
                return;
            }
            let userEmail = 'Bilinmiyor';
            if (listing.user_id) {
                const { data: authUser, error: authError } = await database_1.supabase.auth.admin.getUserById(listing.user_id);
                if (!authError && authUser?.user) {
                    userEmail = authUser.user.email || 'Bilinmiyor';
                }
            }
            const { data: profile } = await database_1.supabase
                .from('profiles')
                .select('name, avatar_url')
                .eq('id', listing.user_id)
                .single();
            const transformedListing = {
                id: listing.id,
                title: listing.title,
                description: listing.description,
                price: listing.budget || 0,
                category: listing.category,
                status: listing.status?.toUpperCase() || 'PENDING',
                views: listing.views_count || 0,
                favorites: listing.favorites_count || 0,
                createdAt: listing.created_at,
                updatedAt: listing.updated_at,
                userId: listing.user_id,
                images: listing.main_image_url ? [listing.main_image_url, ...(listing.additional_image_urls || [])] : [],
                user: {
                    id: listing.user_id,
                    email: userEmail,
                    name: profile?.name || 'Bilinmiyor'
                },
            };
            res.json({
                success: true,
                data: transformedListing,
                message: 'İlan başarıyla güncellendi',
            });
        }
        catch (error) {
            logger_1.default.error('Error updating listing:', error);
            res.status(500).json({
                success: false,
                message: 'İlan güncellenirken bir hata oluştu',
            });
        }
    },
    async deleteListing(req, res) {
        try {
            const { id } = req.params;
            logger_1.default.info(`Deleting listing with ID: ${id}`);
            const { error } = await database_1.supabase
                .from('listings')
                .delete()
                .eq('id', id);
            if (error) {
                logger_1.default.error(`Error deleting listing: ${id}`, error);
                res.status(404).json({
                    success: false,
                    message: 'İlan bulunamadı veya silinemedi',
                });
                return;
            }
            res.json({
                success: true,
                message: 'İlan başarıyla silindi',
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting listing:', error);
            res.status(500).json({
                success: false,
                message: 'İlan silinirken bir hata oluştu',
            });
        }
    },
    async moderateListing(req, res) {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;
            const admin = req.admin;
            logger_1.default.info(`Moderating listing ${id} to status: ${status}`, { admin: admin?.email, reason });
            const { data: adminProfile } = await database_1.supabase
                .from('admin_profiles')
                .select('id')
                .eq('admin_id', admin?.id)
                .eq('is_active', true)
                .single();
            const { data: listing, error } = await database_1.supabase
                .from('listings')
                .update({
                status: status.toLowerCase(),
                reviewed_at: new Date().toISOString(),
                reviewed_by: adminProfile?.id || admin?.id,
                rejection_reason: reason,
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select('*')
                .single();
            if (error || !listing) {
                logger_1.default.error(`Error moderating listing: ${id}`, error);
                res.status(404).json({
                    success: false,
                    message: 'İlan bulunamadı veya moderasyon işlemi başarısız',
                });
                return;
            }
            await database_1.supabase
                .from('admin_activity_logs')
                .insert({
                admin_id: admin?.id,
                admin_profile_id: adminProfile?.id,
                action: 'MODERATE_LISTING',
                resource: 'listings',
                resource_id: id,
                details: { status, reason },
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
            });
            let userEmail = 'Bilinmiyor';
            if (listing.user_id) {
                const { data: authUser, error: authError } = await database_1.supabase.auth.admin.getUserById(listing.user_id);
                if (!authError && authUser?.user) {
                    userEmail = authUser.user.email || 'Bilinmiyor';
                }
            }
            const { data: profile } = await database_1.supabase
                .from('profiles')
                .select('name, avatar_url')
                .eq('id', listing.user_id)
                .single();
            const transformedListing = {
                id: listing.id,
                title: listing.title,
                description: listing.description,
                price: listing.budget || 0,
                category: listing.category,
                status: listing.status?.toUpperCase() || 'PENDING',
                views: listing.views_count || 0,
                favorites: listing.favorites_count || 0,
                createdAt: listing.created_at,
                updatedAt: listing.updated_at,
                userId: listing.user_id,
                images: listing.main_image_url ? [listing.main_image_url, ...(listing.additional_image_urls || [])] : [],
                location: listing.city && listing.district ? {
                    city: listing.city,
                    district: listing.district,
                    neighborhood: listing.neighborhood,
                } : null,
                user: {
                    id: listing.user_id,
                    email: userEmail,
                    name: profile?.name || 'Bilinmiyor'
                },
            };
            res.json({
                success: true,
                data: transformedListing,
                message: `İlan başarıyla ${status === 'ACTIVE' ? 'onaylandı' : 'reddedildi'}`,
            });
        }
        catch (error) {
            logger_1.default.error('Error moderating listing:', error);
            res.status(500).json({
                success: false,
                message: 'Moderasyon işlemi sırasında bir hata oluştu',
            });
        }
    },
    async reEvaluateListing(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const admin = req.admin;
            logger_1.default.info(`Re-evaluating listing ${id}`, { admin: admin?.email, reason });
            const { data: adminProfile } = await database_1.supabase
                .from('admin_profiles')
                .select('id')
                .eq('admin_id', admin?.id)
                .eq('is_active', true)
                .single();
            const { data: listing, error } = await database_1.supabase
                .from('listings')
                .update({
                status: 'pending',
                reviewed_at: new Date().toISOString(),
                reviewed_by: adminProfile?.id || admin?.id,
                rejection_reason: reason,
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select('*')
                .single();
            if (error || !listing) {
                logger_1.default.error(`Error re-evaluating listing: ${id}`, error);
                res.status(404).json({
                    success: false,
                    message: 'İlan bulunamadı veya tekrar değerlendirme işlemi başarısız',
                });
                return;
            }
            await database_1.supabase
                .from('admin_activity_logs')
                .insert({
                admin_id: admin?.id,
                admin_profile_id: adminProfile?.id,
                action: 'RE_EVALUATE_LISTING',
                resource: 'listings',
                resource_id: id,
                details: { reason },
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
            });
            let userEmail = 'Bilinmiyor';
            if (listing.user_id) {
                const { data: authUser, error: authError } = await database_1.supabase.auth.admin.getUserById(listing.user_id);
                if (!authError && authUser?.user) {
                    userEmail = authUser.user.email || 'Bilinmiyor';
                }
            }
            const { data: profile } = await database_1.supabase
                .from('profiles')
                .select('name, avatar_url')
                .eq('id', listing.user_id)
                .single();
            const transformedListing = {
                id: listing.id,
                title: listing.title,
                description: listing.description,
                price: listing.budget || 0,
                category: listing.category,
                status: listing.status?.toUpperCase() || 'PENDING',
                views: listing.views_count || 0,
                favorites: listing.favorites_count || 0,
                createdAt: listing.created_at,
                updatedAt: listing.updated_at,
                userId: listing.user_id,
                images: listing.main_image_url ? [listing.main_image_url, ...(listing.additional_image_urls || [])] : [],
                location: listing.city && listing.district ? {
                    city: listing.city,
                    district: listing.district,
                    neighborhood: listing.neighborhood,
                } : null,
                user: {
                    id: listing.user_id,
                    email: userEmail,
                    name: profile?.name || 'Bilinmiyor'
                },
            };
            res.json({
                success: true,
                data: transformedListing,
                message: 'İlan başarıyla tekrar değerlendirme sürecine alındı',
            });
        }
        catch (error) {
            logger_1.default.error('Error re-evaluating listing:', error);
            res.status(500).json({
                success: false,
                message: 'Tekrar değerlendirme işlemi sırasında bir hata oluştu',
            });
        }
    },
};
//# sourceMappingURL=listingsController.js.map