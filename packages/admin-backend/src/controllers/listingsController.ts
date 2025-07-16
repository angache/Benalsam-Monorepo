import { Response } from 'express';
import { supabase } from '../config/database';
import type { AuthenticatedRequest } from '../types';
import logger from '../config/logger';

export const listingsController = {
  // Get all listings with filters
  async getListings(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        category,
        userId,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      logger.info(`Fetching listings with filters:`, { page: pageNum, limit: limitNum, search, status, category });

      // Build Supabase query
      let query = supabase
        .from('listings')
        .select('*');

      // Apply filters
      if (search) {
        const searchLower = search.toString().toLowerCase();
        query = query.or(`title.ilike.%${searchLower}%,description.ilike.%${searchLower}%`);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (category) {
        query = query.eq('category', category);
      }
      
      if (userId) {
        query = query.eq('user_id', userId);
      }

      // Apply sorting
      query = query.order(sortBy as string, { ascending: sortOrder === 'asc' });

      // Get total count for pagination
      const { count } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

      // Apply pagination
      query = query.range(offset, offset + limitNum - 1);

      const { data: listings, error } = await query;

      if (error) {
        logger.error('Error fetching listings:', error);
        res.status(500).json({
          success: false,
          message: 'İlanlar getirilirken bir hata oluştu',
        });
        return;
      }

      // Transform data for frontend
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
        images: listing.main_image_url ? [listing.main_image_url] : [],
        location: listing.location ? {
          city: listing.location.split(' / ')[0] || '',
          district: listing.location.split(' / ')[1] || '',
          neighborhood: listing.location.split(' / ')[2] || '',
        } : null,
        user: {
          id: listing.user_id,
          email: 'user@example.com',
          name: 'Test User'
        },
      }));

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limitNum);

      logger.info(`Fetched ${transformedListings.length} listings out of ${totalCount} total`);

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
    } catch (error) {
      logger.error('Error fetching listings:', error);
      res.status(500).json({
        success: false,
        message: 'İlanlar getirilirken bir hata oluştu',
      });
    }
  },

  // Get single listing
  async getListing(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;

      logger.info(`Fetching listing with ID: ${id}`);

      const { data: listing, error } = await supabase
        .from('listings')
        .select(`
          *,
          users:user_id(id, email, name, avatar),
          listing_images(id, url, order),
          listing_locations(id, city, district, neighborhood)
        `)
        .eq('id', id)
        .single();

      if (error || !listing) {
        logger.error(`Listing not found: ${id}`, error);
        res.status(404).json({
          success: false,
          message: 'İlan bulunamadı',
        });
        return;
      }

      const transformedListing = {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        status: listing.status,
        views: listing.views || 0,
        favorites: listing.favorites || 0,
        createdAt: listing.created_at,
        updatedAt: listing.updated_at,
        userId: listing.user_id,
        images: listing.listing_images?.map((img: any) => img.url).sort((a: any, b: any) => a.order - b.order) || [],
        location: listing.listing_locations ? {
          city: listing.listing_locations.city,
          district: listing.listing_locations.district,
          neighborhood: listing.listing_locations.neighborhood,
        } : null,
        user: listing.users,
      };

      res.json({
        success: true,
        data: transformedListing,
      });
    } catch (error) {
      logger.error('Error fetching listing:', error);
      res.status(500).json({
        success: false,
        message: 'İlan getirilirken bir hata oluştu',
      });
    }
  },

  // Update listing
  async updateListing(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      logger.info(`Updating listing with ID: ${id}`, updateData);

      const { data: listing, error } = await supabase
        .from('listings')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          users:user_id(id, email, name, avatar),
          listing_images(id, url, order),
          listing_locations(id, city, district, neighborhood)
        `)
        .single();

      if (error || !listing) {
        logger.error(`Error updating listing: ${id}`, error);
        res.status(404).json({
          success: false,
          message: 'İlan bulunamadı veya güncellenemedi',
        });
        return;
      }

      const transformedListing = {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        status: listing.status,
        views: listing.views || 0,
        favorites: listing.favorites || 0,
        createdAt: listing.created_at,
        updatedAt: listing.updated_at,
        userId: listing.user_id,
        images: listing.listing_images?.map((img: any) => img.url).sort((a: any, b: any) => a.order - b.order) || [],
        location: listing.listing_locations ? {
          city: listing.listing_locations.city,
          district: listing.listing_locations.district,
          neighborhood: listing.listing_locations.neighborhood,
        } : null,
        user: listing.users,
      };

      res.json({
        success: true,
        data: transformedListing,
        message: 'İlan başarıyla güncellendi',
      });
    } catch (error) {
      logger.error('Error updating listing:', error);
      res.status(500).json({
        success: false,
        message: 'İlan güncellenirken bir hata oluştu',
      });
    }
  },

  // Delete listing
  async deleteListing(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;

      logger.info(`Deleting listing with ID: ${id}`);

      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error(`Error deleting listing: ${id}`, error);
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
    } catch (error) {
      logger.error('Error deleting listing:', error);
      res.status(500).json({
        success: false,
        message: 'İlan silinirken bir hata oluştu',
      });
    }
  },

  // Moderate listing (approve/reject)
  async moderateListing(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const admin = req.admin;

      logger.info(`Moderating listing ${id} to status: ${status}`, { admin: admin?.email, reason });

      const { data: listing, error } = await supabase
        .from('listings')
        .update({
          status,
          moderated_at: new Date().toISOString(),
          moderated_by: admin?.id,
          moderation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          users:user_id(id, email, name, avatar),
          listing_images(id, url, order),
          listing_locations(id, city, district, neighborhood)
        `)
        .single();

      if (error || !listing) {
        logger.error(`Error moderating listing: ${id}`, error);
        res.status(404).json({
          success: false,
          message: 'İlan bulunamadı veya moderasyon işlemi başarısız',
        });
        return;
      }

      // Log moderation activity
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: admin?.id,
          action: 'MODERATE_LISTING',
          resource: 'listings',
          resource_id: id,
          details: { status, reason },
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
        });

      const transformedListing = {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        status: listing.status,
        views: listing.views || 0,
        favorites: listing.favorites || 0,
        createdAt: listing.created_at,
        updatedAt: listing.updated_at,
        userId: listing.user_id,
        images: listing.listing_images?.map((img: any) => img.url).sort((a: any, b: any) => a.order - b.order) || [],
        location: listing.listing_locations ? {
          city: listing.listing_locations.city,
          district: listing.listing_locations.district,
          neighborhood: listing.listing_locations.neighborhood,
        } : null,
        user: listing.users,
      };

      res.json({
        success: true,
        data: transformedListing,
        message: `İlan başarıyla ${status === 'ACTIVE' ? 'onaylandı' : 'reddedildi'}`,
      });
    } catch (error) {
      logger.error('Error moderating listing:', error);
      res.status(500).json({
        success: false,
        message: 'Moderasyon işlemi sırasında bir hata oluştu',
      });
    }
  },
}; 