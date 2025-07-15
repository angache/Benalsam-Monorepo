import { supabase } from '@benalsam/shared-types';
import { toast } from '@/components/ui/use-toast';
import { fetchUserFavoriteStatusForListings } from '@/services/favoriteService.js';

export const addPremiumSorting = (query) => {
  return query
    .order('is_urgent_premium', { ascending: false, nullsLast: true })
    .order('is_featured', { ascending: false, nullsLast: true })
    .order('is_showcase', { ascending: false, nullsLast: true })
    .order('upped_at', { ascending: false, nullsLast: true });
};

export const processFetchedListings = async (listingsData, currentUserId) => {
  if (!listingsData || listingsData.length === 0) {
    return [];
  }

  const userIds = [...new Set(listingsData.map(l => l.user_id).filter(id => id))];
  
  let profilesMap = new Map();
  if (userIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, rating, total_ratings, rating_sum')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles for listings:', profilesError);
      toast({ title: "Profil Bilgisi Hatası", description: "İlan sahiplerinin bilgileri yüklenirken bir sorun oluştu.", variant: "destructive" });
    } else {
      profilesMap = new Map(profilesData.map(p => [p.id, p]));
    }
  }
  
  let listingsWithUser = listingsData.map(listing => ({
    ...listing,
    user: profilesMap.get(listing.user_id) || null,
    is_favorited: false 
  }));

  if (currentUserId && listingsWithUser.length > 0) {
    const listingIds = listingsWithUser.map(l => l.id);
    const favoriteStatuses = await fetchUserFavoriteStatusForListings(currentUserId, listingIds);
    listingsWithUser = listingsWithUser.map(l => ({
      ...l,
      is_favorited: favoriteStatuses[l.id] || false
    }));
  }
  
  return listingsWithUser;
};