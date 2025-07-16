import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast.js';

export const followUser = async (followerId, followingId) => {
  if (!followerId || !followingId) {
    toast({ title: "Hata", description: "Takip eden veya takip edilen kullanıcı ID'si eksik.", variant: "destructive" });
    return null;
  }
  if (followerId === followingId) {
    toast({ title: "Hata", description: "Kullanıcı kendini takip edemez.", variant: "destructive" });
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .insert([{ follower_id: followerId, following_id: followingId }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { 
        toast({ title: "Bilgi", description: "Bu kullanıcıyı zaten takip ediyorsunuz." });
        return { follower_id: followerId, following_id: followingId, already_following: true };
      }
      console.error('Error following user:', error);
      toast({ title: "Takip Edilemedi", description: error.message, variant: "destructive" });
      return null;
    }
    toast({ title: "Takip Edildi", description: "Kullanıcı başarıyla takip edildi." });
    return data;
  } catch (e) {
    console.error('Unexpected error in followUser:', e);
    toast({ title: "Beklenmedik Hata", description: "Kullanıcı takip edilirken bir hata oluştu.", variant: "destructive" });
    return null;
  }
};

export const unfollowUser = async (followerId, followingId) => {
  if (!followerId || !followingId) {
    toast({ title: "Hata", description: "Takip eden veya takip edilen kullanıcı ID'si eksik.", variant: "destructive" });
    return false;
  }
  try {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error unfollowing user:', error);
      toast({ title: "Takipten Çıkılamadı", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Takipten Çıkıldı", description: "Kullanıcı takipten çıkarıldı." });
    return true;
  } catch (e) {
    console.error('Unexpected error in unfollowUser:', e);
    toast({ title: "Beklenmedik Hata", description: "Kullanıcı takipten çıkarılırken bir hata oluştu.", variant: "destructive" });
    return false;
  }
};

export const checkIfFollowing = async (followerId, followingId) => {
  if (!followerId || !followingId) {
    return false;
  }
  try {
    const { data, error, count } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
    return count > 0;
  } catch (e) {
    console.error('Unexpected error in checkIfFollowing:', e);
    return false;
  }
};

export const fetchFollowingUsers = async (userId) => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        following_id,
        created_at,
        profiles:following_id (id, name, avatar_url, bio, followers_count, following_count)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching following users:', error);
      toast({ title: "Takip Edilenler Yüklenemedi", description: error.message, variant: "destructive" });
      return [];
    }
    
    return data.map(follow => ({
        ...follow.profiles,
        followed_at: follow.created_at 
    }));
  } catch (e) {
    console.error('Unexpected error in fetchFollowingUsers:', e);
    toast({ title: "Beklenmedik Hata", description: "Takip edilenler yüklenirken bir hata oluştu.", variant: "destructive" });
    return [];
  }
};

export const fetchFollowers = async (userId) => {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          follower_id,
          created_at,
          profiles:follower_id (id, name, avatar_url, bio, followers_count, following_count)
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('Error fetching followers:', error);
        toast({ title: "Takipçiler Yüklenemedi", description: error.message, variant: "destructive" });
        return [];
      }
      
      return data.map(follow => ({
          ...follow.profiles,
          followed_at: follow.created_at 
      }));
    } catch (e) {
      console.error('Unexpected error in fetchFollowers:', e);
      toast({ title: "Beklenmedik Hata", description: "Takipçiler yüklenirken bir hata oluştu.", variant: "destructive" });
      return [];
    }
  };