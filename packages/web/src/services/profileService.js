import { supabase } from '@benalsam/shared-types';
import { toast } from '@/components/ui/use-toast';

export const fetchUserProfile = async (userId) => {
  if (!userId) {
    console.error('fetchUserProfile called with no userId');
    return null;
  }
  try {
    const { data, error, status } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && status !== 406) { 
      console.error('Error fetching profile:', { message: error.message, details: error.details, hint: error.hint, code: error.code });
      if (error.message.toLowerCase().includes('failed to fetch')) {
        toast({ title: "Ağ Hatası", description: "Profil bilgileri çekilemedi. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.", variant: "destructive", duration: 7000 });
      } else {
        toast({ title: "Profil Hatası", description: `Profil yüklenirken bir sorun oluştu: ${error.message}`, variant: "destructive" });
      }
      return null;
    }
    if (!data) {
      console.warn(`No profile found for userId: ${userId}`);
      return null;
    }
    return data;
  } catch (e) {
    console.error('Unexpected error in fetchUserProfile:', e);
    toast({ title: "Beklenmedik Profil Hatası", description: "Profil yüklenirken beklenmedik bir sorun oluştu.", variant: "destructive" });
    return null;
  }
};

export const incrementProfileView = async (userId) => {
  if (!userId) return;
  try {
    const { error } = await supabase.functions.invoke('increment-profile-view', {
      body: { userId },
    });
    if (error) throw error;
  } catch (error) {
    // This is a non-critical background task.
    // We log the error for debugging but don't show a toast to the user.
    console.error('Failed to increment profile view count:', error.message);
  }
};