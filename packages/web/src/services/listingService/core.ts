import { db } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { fetchUserFavoriteStatusForListings } from '@/services/favoriteService.js';
import type { Listing, User, ApiResponse, ListingFilters, PaginatedResponse } from '@/types';

// ===========================
// LISTING SERVICE TYPES
// ===========================

export interface ListingWithUser extends Omit<Listing, 'user'> {
  user: User | null;
  is_favorited: boolean;
}

export interface CreateListingData {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: number;
  location: string;
  district?: string;
  neighborhood?: string;
  images: string[];
  main_image?: string;
  condition?: string[];
  attributes?: Record<string, any>;
}

export interface UpdateListingData extends Partial<CreateListingData> {
  status?: 'active' | 'sold' | 'expired' | 'draft';
}

// ===========================
// LISTING SERVICE CORE
// ===========================

export class ListingService {
  /**
   * Premium sıralama ekle
   */
  static addPremiumSorting(query: any) {
    return query
      .order('is_urgent_premium', { ascending: false, nullsLast: true })
      .order('is_featured', { ascending: false, nullsLast: true })
      .order('is_showcase', { ascending: false, nullsLast: true })
      .order('upped_at', { ascending: false, nullsLast: true });
  }

  /**
   * İlanları kullanıcı bilgileri ile işle
   */
  static async processFetchedListings(
    listingsData: Partial<Listing>[],
    currentUserId?: string
  ): Promise<ListingWithUser[]> {
    if (!listingsData || listingsData.length === 0) {
      return [];
    }

    const userIds = [...new Set(listingsData.map(l => l.user_id).filter(id => id))];
    
    let profilesMap = new Map<string, User>();
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await db.profiles()
        .select('id, name, avatar_url, rating, total_ratings, rating_sum')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles for listings:', profilesError);
        toast({ 
          title: "Profil Bilgisi Hatası", 
          description: "İlan sahiplerinin bilgileri yüklenirken bir sorun oluştu.", 
          variant: "destructive" 
        });
      } else if (profilesData) {
        profilesMap = new Map(profilesData.map(p => [p.id, p]));
      }
    }
    
    let listingsWithUser: ListingWithUser[] = listingsData.map(listing => ({
      ...listing,
      user: listing.user_id ? profilesMap.get(listing.user_id) || null : null,
      is_favorited: false 
    })) as ListingWithUser[];

    if (currentUserId && listingsWithUser.length > 0) {
      const listingIds = listingsWithUser.map(l => l.id);
      const favoriteStatuses = await fetchUserFavoriteStatusForListings(currentUserId, listingIds);
      listingsWithUser = listingsWithUser.map(l => ({
        ...l,
        is_favorited: favoriteStatuses[l.id] || false
      }));
    }
    
    return listingsWithUser;
  }

  /**
   * İlanları getir
   */
  static async fetchListings(
    filters: ListingFilters = {},
    currentUserId?: string,
    limit = 20,
    offset = 0
  ): Promise<ApiResponse<PaginatedResponse<ListingWithUser>>> {
    try {
      let query = db.listings()
        .select(`
          *,
          user:profiles!listings_user_id_fkey (
            id,
            name,
            avatar_url,
            rating,
            total_ratings,
            rating_sum
          )
        `)
        .eq('status', 'active');

      // Filtreleri uygula
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }
      if (filters.location) {
        query = query.eq('location', filters.location);
      }
      if (filters.district) {
        query = query.eq('district', filters.district);
      }
      if (filters.minBudget) {
        query = query.gte('budget', filters.minBudget);
      }
      if (filters.maxBudget) {
        query = query.lte('budget', filters.maxBudget);
      }
      if (filters.condition && filters.condition.length > 0) {
        query = query.overlaps('condition', filters.condition);
      }
      if (filters.keywords) {
        query = query.textSearch('fts', filters.keywords);
      }

      // Sıralama
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Premium sıralama ekle
      query = this.addPremiumSorting(query);

      // Sayfalama
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      // İlanları işle
      const processedListings = await this.processFetchedListings(data || [], currentUserId);

      return {
        data: {
          data: processedListings,
          count: count || 0,
          hasMore: (data?.length || 0) === limit,
          nextCursor: String(offset + limit)
        }
      };
    } catch (error) {
      console.error('Fetch listings error:', error);
      return { error: { message: 'İlanlar getirilemedi' } };
    }
  }

  /**
   * Tekil ilan getir
   */
  static async fetchListing(
    listingId: string,
    currentUserId?: string
  ): Promise<ApiResponse<ListingWithUser>> {
    try {
      const { data, error } = await db.listings()
        .select(`
          *,
          user:profiles!listings_user_id_fkey (
            id,
            name,
            avatar_url,
            rating,
            total_ratings,
            rating_sum
          )
        `)
        .eq('id', listingId)
        .single();

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      if (!data) {
        return { error: { message: 'İlan bulunamadı' } };
      }

      // İlanı işle
      const processedListings = await this.processFetchedListings([data], currentUserId);
      const listing = processedListings[0];

      return { data: listing };
    } catch (error) {
      console.error('Fetch listing error:', error);
      return { error: { message: 'İlan getirilemedi' } };
    }
  }

  /**
   * İlan oluştur
   */
  static async createListing(
    userId: string,
    listingData: CreateListingData
  ): Promise<ApiResponse<ListingWithUser>> {
    try {
      const { data, error } = await db.listings()
        .insert({
          ...listingData,
          user_id: userId,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      // İlanı işle
      const processedListings = await this.processFetchedListings([data], userId);
      const listing = processedListings[0];

      return { data: listing };
    } catch (error) {
      console.error('Create listing error:', error);
      return { error: { message: 'İlan oluşturulamadı' } };
    }
  }

  /**
   * İlan güncelle
   */
  static async updateListing(
    listingId: string,
    userId: string,
    updates: UpdateListingData
  ): Promise<ApiResponse<ListingWithUser>> {
    try {
      // İlanın sahibi olduğunu kontrol et
      const { data: existingListing, error: checkError } = await db.listings()
        .select('user_id')
        .eq('id', listingId)
        .single();

      if (checkError) {
        return { error: { message: 'İlan bulunamadı' } };
      }

      if (existingListing.user_id !== userId) {
        return { error: { message: 'Bu işlem için yetkiniz yok' } };
      }

      const { data, error } = await db.listings()
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId)
        .select()
        .single();

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      // İlanı işle
      const processedListings = await this.processFetchedListings([data], userId);
      const listing = processedListings[0];

      return { data: listing };
    } catch (error) {
      console.error('Update listing error:', error);
      return { error: { message: 'İlan güncellenemedi' } };
    }
  }

  /**
   * İlan sil
   */
  static async deleteListing(
    listingId: string,
    userId: string
  ): Promise<ApiResponse<void>> {
    try {
      // İlanın sahibi olduğunu kontrol et
      const { data: existingListing, error: checkError } = await db.listings()
        .select('user_id')
        .eq('id', listingId)
        .single();

      if (checkError) {
        return { error: { message: 'İlan bulunamadı' } };
      }

      if (existingListing.user_id !== userId) {
        return { error: { message: 'Bu işlem için yetkiniz yok' } };
      }

      const { error } = await db.listings()
        .delete()
        .eq('id', listingId);

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      return { data: undefined };
    } catch (error) {
      console.error('Delete listing error:', error);
      return { error: { message: 'İlan silinemedi' } };
    }
  }

  /**
   * İlan durumunu güncelle
   */
  static async updateListingStatus(
    listingId: string,
    userId: string,
    status: 'active' | 'sold' | 'expired' | 'draft'
  ): Promise<ApiResponse<ListingWithUser>> {
    return this.updateListing(listingId, userId, { status });
  }

  /**
   * Kullanıcının ilanlarını getir
   */
  static async fetchUserListings(
    userId: string,
    currentUserId?: string,
    status?: 'active' | 'sold' | 'expired' | 'draft'
  ): Promise<ApiResponse<ListingWithUser[]>> {
    try {
      let query = db.listings()
        .select(`
          *,
          user:profiles!listings_user_id_fkey (
            id,
            name,
            avatar_url,
            rating,
            total_ratings,
            rating_sum
          )
        `)
        .eq('user_id', userId);

      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      // İlanları işle
      const processedListings = await this.processFetchedListings(data || [], currentUserId);

      return { data: processedListings };
    } catch (error) {
      console.error('Fetch user listings error:', error);
      return { error: { message: 'Kullanıcı ilanları getirilemedi' } };
    }
  }
}

export default ListingService; 