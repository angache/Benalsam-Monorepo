import { supabase } from '@/lib/supabaseClient.js';
import { toast } from '@/components/ui/use-toast.js';

export const followCategory = async (userId, categoryName) => {
  if (!userId || !categoryName) {
    toast({ title: "Hata", description: "Kullanıcı ID'si veya kategori adı eksik.", variant: "destructive" });
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('user_followed_categories')
      .insert([{ user_id: userId, category_name: categoryName }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast({ title: "Bilgi", description: "Bu kategoriyi zaten takip ediyorsunuz." });
        return { user_id: userId, category_name: categoryName, already_following: true };
      }
      console.error('Error following category:', error);
      toast({ title: "Kategori Takip Edilemedi", description: error.message, variant: "destructive" });
      return null;
    }
    toast({ title: "Kategori Takip Edildi", description: `"${categoryName}" kategorisi başarıyla takip edildi.` });
    return data;
  } catch (e) {
    console.error('Unexpected error in followCategory:', e);
    toast({ title: "Beklenmedik Hata", description: "Kategori takip edilirken bir hata oluştu.", variant: "destructive" });
    return null;
  }
};

export const unfollowCategory = async (userId, categoryName) => {
  if (!userId || !categoryName) {
    toast({ title: "Hata", description: "Kullanıcı ID'si veya kategori adı eksik.", variant: "destructive" });
    return false;
  }
  try {
    const { error } = await supabase
      .from('user_followed_categories')
      .delete()
      .eq('user_id', userId)
      .eq('category_name', categoryName);

    if (error) {
      console.error('Error unfollowing category:', error);
      toast({ title: "Kategori Takipten Çıkılamadı", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Kategori Takipten Çıkıldı", description: `"${categoryName}" kategorisi takipten çıkarıldı.` });
    return true;
  } catch (e) {
    console.error('Unexpected error in unfollowCategory:', e);
    toast({ title: "Beklenmedik Hata", description: "Kategori takipten çıkarılırken bir hata oluştu.", variant: "destructive" });
    return false;
  }
};

export const checkIfFollowingCategory = async (userId, categoryName) => {
  if (!userId || !categoryName) {
    return false;
  }
  try {
    const { count, error } = await supabase
      .from('user_followed_categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('category_name', categoryName);

    if (error) {
      console.error('Error checking category follow status:', error);
      return false;
    }
    return count > 0;
  } catch (e) {
    console.error('Unexpected error in checkIfFollowingCategory:', e);
    return false;
  }
};

export const fetchFollowedCategories = async (userId) => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('user_followed_categories')
      .select('category_name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching followed categories:', error);
      toast({ title: "Takip Edilen Kategoriler Yüklenemedi", description: error.message, variant: "destructive" });
      return [];
    }
    return data;
  } catch (e) {
    console.error('Unexpected error in fetchFollowedCategories:', e);
    toast({ title: "Beklenmedik Hata", description: "Takip edilen kategoriler yüklenirken bir hata oluştu.", variant: "destructive" });
    return [];
  }
};

export const fetchListingsForFollowedCategories = async (userId, limitPerCategory = 3, currentUserId = null) => {
  if (!userId) return [];
  try {
    const followedCategories = await fetchFollowedCategories(userId);
    if (!followedCategories || followedCategories.length === 0) {
      return [];
    }

    const listingsByCategories = await Promise.all(
      followedCategories.map(async (fc) => {
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('*, profiles (id, name, avatar_url, rating, total_ratings, rating_sum)')
          .ilike('category', `${fc.category_name}%`) // Kategori ve alt kategorilerini de alır
          .order('created_at', { ascending: false })
          .limit(limitPerCategory);

        if (listingsError) {
          console.error(`Error fetching listings for category ${fc.category_name}:`, listingsError);
          return { category_name: fc.category_name, listings: [] };
        }
        
        let listingsWithUser = listingsData.map(listing => ({
          ...listing,
          user: listing.profiles,
          is_favorited: false
        }));

        if (currentUserId && listingsWithUser.length > 0) {
          const listingIds = listingsWithUser.map(l => l.id);
          const { data: favoriteStatusesData, error: favError } = await supabase
            .from('user_favorites')
            .select('listing_id')
            .eq('user_id', currentUserId)
            .in('listing_id', listingIds);

          const favoriteStatuses = {};
          if (favoriteStatusesData) {
            favoriteStatusesData.forEach(fav => {
              favoriteStatuses[fav.listing_id] = true;
            });
          }
          
          listingsWithUser = listingsWithUser.map(l => ({
            ...l,
            is_favorited: favoriteStatuses[l.id] || false
          }));
        }

        return { category_name: fc.category_name, listings: listingsWithUser };
      })
    );
    return listingsByCategories.filter(cat => cat.listings.length > 0);
  } catch (e) {
    console.error('Unexpected error in fetchListingsForFollowedCategories:', e);
    toast({ title: "Beklenmedik Hata", description: "Takip edilen kategorilerin ilanları yüklenirken bir hata oluştu.", variant: "destructive" });
    return [];
  }
};