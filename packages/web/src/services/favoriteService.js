import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast.js';

// Error handling helper
const handleError = (error, title = "Hata", description = "Bir sorun oluştu") => {
  console.error(`Error in ${title}:`, error);
  toast({ 
    title: title, 
    description: error?.message || description, 
    variant: "destructive" 
  });
  return null;
};

// Validation helper
const validateFavoriteData = (userId, listingId) => {
  if (!userId || !listingId) {
    toast({ title: "Eksik Bilgi", description: "Kullanıcı veya ilan ID'si eksik.", variant: "destructive" });
    return false;
  }
  return true;
};

export const addFavorite = async (userId, listingId) => {
  if (!validateFavoriteData(userId, listingId)) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert([{ user_id: userId, listing_id: listingId }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast({ title: "Bilgi", description: "Bu ilan zaten favorilerinizde." });
        return { listing_id: listingId, user_id: userId, already_favorited: true };
      }
      return handleError(error, "Favori Eklenemedi", error.message);
    }

    toast({ 
      title: "Favorilere Eklendi! ❤️", 
      description: "İlan favorilerinize eklendi." 
    });

    return data;
  } catch (error) {
    return handleError(error, "Beklenmedik Hata", "Favori eklenirken bir hata oluştu");
  }
};

export const removeFavorite = async (userId, listingId) => {
  if (!validateFavoriteData(userId, listingId)) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId);

    if (error) {
      return handleError(error, "Favori Kaldırılamadı", error.message);
    }

    toast({ 
      title: "Favorilerden Kaldırıldı", 
      description: "İlan favorilerinizden kaldırıldı." 
    });

    return true;
  } catch (error) {
    return handleError(error, "Beklenmedik Hata", "Favori kaldırılırken bir hata oluştu");
  }
};

export const fetchUserFavoriteStatusForListings = async (userId, listingIds) => {
  if (!userId || !listingIds || listingIds.length === 0) {
    return {};
  }
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('listing_id')
      .eq('user_id', userId)
      .in('listing_id', listingIds);

    if (error) {
      console.error('Error fetching favorite statuses:', error);
      return {};
    }

    const favoritedMap = {};
    data.forEach(fav => {
      favoritedMap[fav.listing_id] = true;
    });
    return favoritedMap;
  } catch (e) {
    console.error('Unexpected error in fetchUserFavoriteStatusForListings:', e);
    return {};
  }
};


export const fetchUserFavoriteListings = async (userId) => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        listing_id,
        created_at,
        listings (
          *,
          profiles:profiles!listings_user_id_fkey (id, name, avatar_url, rating)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorite listings:', error);
      toast({ title: "Favori İlanlar Yüklenemedi", description: error.message, variant: "destructive" });
      return [];
    }
    
    return data.map(fav => ({
        ...fav.listings,
        user: fav.listings.profiles,
        favorited_at: fav.created_at 
    }));
  } catch (e) {
    console.error('Unexpected error in fetchUserFavoriteListings:', e);
    toast({ title: "Beklenmedik Hata", description: "Favori ilanlar yüklenirken bir hata oluştu.", variant: "destructive" });
    return [];
  }
};