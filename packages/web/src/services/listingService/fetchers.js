
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { addPremiumSorting, processFetchedListings } from './core.js';
import { getListingHistory, getLastSearch } from '@/services/userActivityService.js';

export const fetchListings = async (currentUserId = null) => {
  try {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
      
    query = addPremiumSorting(query).order('created_at', { ascending: false });

    const { data: listingsData, error: listingsError } = await query;

    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
      if (listingsError.message.toLowerCase().includes('failed to fetch')) {
        toast({ title: "Ağ Hatası", description: "İlanlar yüklenemedi. İnternet bağlantınızı kontrol edin.", variant: "destructive" });
      } else {
        toast({ title: "Veri Çekme Hatası", description: "İlanlar yüklenirken bir sorun oluştu.", variant: "destructive" });
      }
      return [];
    }

    return await processFetchedListings(listingsData, currentUserId);

  } catch (e) {
    console.error('Unexpected error in fetchListings:', e);
    toast({ title: "Beklenmedik İlan Hatası", description: "İlanlar yüklenirken beklenmedik bir sorun oluştu.", variant: "destructive" });
    return [];
  }
};

export const fetchPopularListings = async (currentUserId = null) => {
  try {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .gt('popularity_score', 0)
      .limit(10);

    query = addPremiumSorting(query).order('popularity_score', { ascending: false, nullsFirst: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching popular listings:', error);
      toast({ title: "Popüler İlanlar Yüklenemedi", description: error.message, variant: "destructive" });
      return [];
    }
    return await processFetchedListings(data, currentUserId);
  } catch (e) {
    console.error('Unexpected error in fetchPopularListings:', e);
    toast({ title: "Beklenmedik Hata", description: "Popüler ilanlar yüklenirken bir sorun oluştu.", variant: "destructive" });
    return [];
  }
};

export const fetchMostOfferedListings = async (currentUserId = null) => {
  try {
    const { data: listingsData, error: listingsError } = await supabase
      .from('listings')
      .select(`
        *,
        offers!offers_listing_id_fkey!inner(listing_id)
      `)
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    if (listingsError) {
      console.error('Error fetching most offered listings:', listingsError);
      toast({ title: "En Çok Teklif Alanlar Yüklenemedi", description: listingsError.message, variant: "destructive" });
      return [];
    }

    const listingsWithOfferCounts = listingsData.reduce((acc, listing) => {
      const existingListing = acc.find(l => l.id === listing.id);
      if (existingListing) {
        existingListing.actual_offers_count = (existingListing.actual_offers_count || 0) + 1;
      } else {
        acc.push({
          ...listing,
          actual_offers_count: 1
        });
      }
      return acc;
    }, []);

    const sortedListings = listingsWithOfferCounts
      .filter(listing => listing.actual_offers_count > 0)
      .sort((a, b) => {
        if (a.is_urgent_premium !== b.is_urgent_premium) {
          return b.is_urgent_premium ? 1 : -1;
        }
        if (a.is_featured !== b.is_featured) {
          return b.is_featured ? 1 : -1;
        }
        if (a.is_showcase !== b.is_showcase) {
          return b.is_showcase ? 1 : -1;
        }
        return b.actual_offers_count - a.actual_offers_count;
      })
      .slice(0, 10);

    if (sortedListings.length === 0) {
      let fallbackQuery = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .limit(10);

      fallbackQuery = addPremiumSorting(fallbackQuery).order('created_at', { ascending: false });
      
      const { data: fallbackData, error: fallbackError } = await fallbackQuery;
      
      if (fallbackError) {
        console.error('Error fetching fallback listings:', fallbackError);
        return [];
      }
      
      return await processFetchedListings(fallbackData, currentUserId);
    }

    return await processFetchedListings(sortedListings, currentUserId);
  } catch (e) {
    console.error('Unexpected error in fetchMostOfferedListings:', e);
    toast({ title: "Beklenmedik Hata", description: "En çok teklif alan ilanlar yüklenirken bir sorun oluştu.", variant: "destructive" });
    return [];
  }
};

export const fetchTodaysDeals = async (currentUserId = null) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .gte('created_at', today.toISOString())
      .limit(10);

    query = addPremiumSorting(query).order('budget', { ascending: true, nullsFirst: false });
      
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching today\'s deals:', error);
      toast({ title: "Günün Fırsatları Yüklenemedi", description: error.message, variant: "destructive" });
      return [];
    }
    return await processFetchedListings(data, currentUserId);
  } catch (e) {
    console.error('Unexpected error in fetchTodaysDeals:', e);
    toast({ title: "Beklenmedik Hata", description: "Günün fırsatları yüklenirken bir sorun oluştu.", variant: "destructive" });
    return [];
  }
};

export const fetchRecentlyViewedListings = async (currentUserId) => {
  const history = getListingHistory();
  if (!history || history.length === 0 || !currentUserId) {
    return [];
  }

  try {
    let query = supabase
      .from('listings')
      .select('*')
      .in('id', history)
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    query = addPremiumSorting(query);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recently viewed listings:', error);
      return [];
    }

    const listingsMap = new Map(data.map(l => [l.id, l]));
    const orderedListingsData = history.map(id => listingsMap.get(id)).filter(Boolean);

    return await processFetchedListings(orderedListingsData, currentUserId);
  } catch (e) {
    console.error('Unexpected error in fetchRecentlyViewedListings:', e);
    return [];
  }
};

export const fetchListingsMatchingLastSearch = async (currentUserId) => {
  const searchCriteria = getLastSearch();
  if (!searchCriteria || !currentUserId) {
    return { listings: [], totalCount: 0 };
  }

  try {
    const { query, categories, filters } = searchCriteria;
    
    const allKeywords = [query, filters?.keywords].filter(Boolean).join(' ').trim();
    
    let categoryPaths = null;
    if (categories && categories.length > 0) {
        const pathString = categories.map(c => c.name).join(' > ');
        categoryPaths = [pathString + '%'];
    }

    const { data, error } = await supabase.rpc('search_listings_with_count', {
      search_query: allKeywords,
      p_categories: categoryPaths,
      p_location: filters?.location,
      p_urgency: filters?.urgency || 'Tümü',
      min_price: filters?.priceRange?.[0],
      max_price: filters?.priceRange?.[1],
      p_page: 1,
      p_page_size: 10,
      sort_key: 'created_at',
      sort_direction: 'desc'
    });
    
    if (error) {
      console.error('Error fetching listings by last search:', error);
      return { listings: [], totalCount: 0 };
    }

    if (!data || data.length === 0) {
      return { listings: [], totalCount: 0 };
    }
    
    const listings = await processFetchedListings(data, currentUserId);
    const totalCount = data[0]?.total_count || 0;

    return { listings, totalCount };
  } catch (e) {
    console.error('Unexpected error in fetchListingsMatchingLastSearch:', e);
    return { listings: [], totalCount: 0 };
  }
};


export const fetchFilteredListings = async (filterParams, currentUserId = null, page = 1, pageSize = 20) => {
  try {
    const { searchQuery, selectedCategories, priceRange, location, urgency, keywords, sortOption } = filterParams;
    
    const allKeywords = [searchQuery, keywords].filter(Boolean).join(' ').trim();
    
    let categoryPaths = null;
    if (selectedCategories && selectedCategories.length > 0) {
        const pathString = selectedCategories.map(c => c.name).join(' > ');
        categoryPaths = [pathString + '%'];
    }

    const [sortKey, sortDir] = (sortOption || 'created_at-desc').split('-');

    const { data, error } = await supabase.rpc('search_listings_with_count', {
      search_query: allKeywords || null,
      p_categories: categoryPaths,
      p_location: location || null,
      p_urgency: urgency || 'Tümü',
      min_price: priceRange ? priceRange[0] : null,
      max_price: priceRange ? priceRange[1] : null,
      p_page: page,
      p_page_size: pageSize,
      sort_key: sortKey,
      sort_direction: sortDir
    });

    if (error) {
      console.error('Error fetching filtered listings:', error);
      toast({ title: "Filtreleme Hatası", description: "İlanlar filtrelenirken bir sorun oluştu: " + error.message, variant: "destructive" });
      return { listings: [], totalCount: 0 };
    }

    if (!data || data.length === 0) {
      return { listings: [], totalCount: 0 };
    }
    
    const listings = await processFetchedListings(data, currentUserId);
    const totalCount = data[0]?.total_count || 0;

    return { listings, totalCount };
  } catch (e) {
    console.error('Unexpected error in fetchFilteredListings:', e);
    toast({ title: "Beklenmedik Filtreleme Hatası", description: "İlanlar filtrelenirken beklenmedik bir sorun oluştu.", variant: "destructive" });
    return { listings: [], totalCount: 0 };
  }
};
