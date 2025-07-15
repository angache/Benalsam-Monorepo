import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

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
const validateUserId = (userId) => {
  if (!userId) {
    console.error('Function called with no userId');
    return false;
  }
  return true;
};

export const fetchUserProfile = async (userId) => {
  if (!validateUserId(userId)) {
    return null;
  }

  try {
    const { data, error, status } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && status !== 406) { 
      console.error('Error in fetchUserProfile:', { message: error.message, details: error.details, hint: error.hint, code: error.code });
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
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    toast({ title: "Beklenmedik Profil Hatası", description: "Profil yüklenirken beklenmedik bir sorun oluştu.", variant: "destructive" });
    return null;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  if (!validateUserId(userId)) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return handleError(error, "Profil Güncellenemedi", error.message);
    }

    toast({ 
      title: "Profil Güncellendi! ✅", 
      description: "Profil bilgileriniz başarıyla güncellendi." 
    });

    return data;
  } catch (error) {
    return handleError(error, "Beklenmedik Hata", "Profil güncellenirken bir sorun oluştu");
  }
};

export const incrementProfileView = async (userId) => {
  if (!validateUserId(userId)) return;

  try {
    const { error } = await supabase.functions.invoke('increment-profile-view', {
      body: { userId },
    });
    if (error) throw error;
  } catch (error) {
    // This is a non-critical background task.
    // We log the error for debugging but don't show a toast to the user.
    console.error('Error in incrementProfileView:', error.message);
  }
};