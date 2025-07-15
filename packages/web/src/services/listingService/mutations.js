import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { addUserActivity } from '@/services/premiumService';
import { processImagesForSupabase } from '@/services/imageService';

export const createListing = async (listingData, currentUserId, onProgress) => {
  if (!listingData || !currentUserId) {
    toast({ title: "Hata", description: "İlan oluşturmak için eksik bilgi.", variant: "destructive" });
    return null;
  }

  try {
    const { mainImageUrl, additionalImageUrls } = await processImagesForSupabase(
      listingData.images,
      listingData.mainImageIndex,
      'item_images',
      'listings',
      currentUserId,
      listingData.category,
      onProgress
    );

    let expiresAt = null;
    if (listingData.duration && listingData.duration > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + listingData.duration);
    }

    const listingToInsert = {
      user_id: currentUserId,
      title: listingData.title,
      description: listingData.description,
      category: listingData.category,
      budget: listingData.budget,
      location: listingData.location,
      urgency: listingData.urgency,
      main_image_url: mainImageUrl,
      additional_image_urls: additionalImageUrls.length > 0 ? additionalImageUrls : null,
      image_url: mainImageUrl,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      auto_republish: listingData.autoRepublish,
      contact_preference: listingData.contactPreference,
      accept_terms: listingData.acceptTerms,
      is_featured: listingData.is_featured || false,
      is_urgent_premium: listingData.is_urgent_premium || false,
      is_showcase: listingData.is_showcase || false,
      geolocation: listingData.geolocation,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('listings')
      .insert(listingToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      toast({ title: "İlan Oluşturulamadı", description: error.message, variant: "destructive" });
      return null;
    }

    await addUserActivity(
      currentUserId,
      'listing_created',
      'Yeni ilan oluşturuldu',
      `"${listingData.title}" ilanı oluşturuldu`,
      data.id
    );

    return data;
  } catch (error) {
    console.error('Error in createListing:', error);
    toast({ title: "Beklenmedik Hata", description: "İlan oluşturulurken bir sorun oluştu.", variant: "destructive" });
    return null;
  }
};

export const updateListing = async (listingId, updates, userId) => {
  if (!listingId || !updates || !userId) {
    toast({ title: "Hata", description: "İlan güncellemek için eksik bilgi.", variant: "destructive" });
    return null;
  }

  try {
    const dbUpdates = {
      title: updates.title,
      description: updates.description,
      category: updates.category,
      budget: updates.budget,
      location: updates.location,
      urgency: updates.urgency,
      contact_preference: updates.contactPreference,
      auto_republish: updates.autoRepublish,
      accept_terms: updates.acceptTerms,
      is_featured: updates.is_featured,
      is_urgent_premium: updates.is_urgent_premium,
      is_showcase: updates.is_showcase,
      geolocation: updates.geolocation,
      updated_at: new Date().toISOString()
    };

    if (updates.mainImageUrl !== undefined) {
      dbUpdates.main_image_url = updates.mainImageUrl;
      dbUpdates.image_url = updates.mainImageUrl;
    }
    if (updates.additionalImageUrls !== undefined) {
      dbUpdates.additional_image_urls = updates.additionalImageUrls;
    }

    const { data, error } = await supabase
      .from('listings')
      .update(dbUpdates)
      .eq('id', listingId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating listing:', error);
      toast({ title: "İlan Güncellenemedi", description: error.message, variant: "destructive" });
      return null;
    }

    await addUserActivity(
      userId,
      'listing_updated',
      'İlan güncellendi',
      `"${data.title}" ilanı güncellendi`,
      data.id
    );

    return data;
  } catch (error) {
    console.error('Error in updateListing:', error);
    toast({ title: "Beklenmedik Hata", description: "İlan güncellenirken bir sorun oluştu.", variant: "destructive" });
    return null;
  }
};

export const updateListingStatus = async (listingId, userId, status, reason = null) => {
  if (!listingId || !userId || !status) {
    toast({ title: "Hata", description: "İlan durumu güncellemek için eksik bilgi.", variant: "destructive" });
    return null;
  }

  try {
    const updateData = {
      status: status,
      updated_at: new Date().toISOString()
    };

    if (reason) {
      updateData.rejection_reason = reason;
    }

    const { data, error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', listingId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating listing status:', error);
      toast({ title: "Durum Güncellenemedi", description: error.message, variant: "destructive" });
      return null;
    }

    let statusText = '';
    switch (status) {
      case 'active':
        statusText = 'aktif edildi';
        break;
      case 'inactive':
        statusText = 'pasif edildi';
        break;
      case 'pending_approval':
        statusText = 'onay bekliyor';
        break;
      case 'rejected':
        statusText = 'reddedildi';
        break;
      default:
        statusText = 'güncellendi';
    }

    await addUserActivity(
      userId,
      'listing_status_changed',
      `İlan ${statusText}`,
      `"${data.title}" ilanı ${statusText}`,
      data.id
    );

    return data;
  } catch (error) {
    console.error('Error in updateListingStatus:', error);
    toast({ title: "Beklenmedik Hata", description: "İlan durumu güncellenirken bir sorun oluştu.", variant: "destructive" });
    return null;
  }
};

export const deleteListing = async (listingId, userId) => {
  if (!listingId || !userId) {
    toast({ title: "Hata", description: "İlan silmek için eksik bilgi.", variant: "destructive" });
    return false;
  }

  try {
    const { data: listingData, error: fetchError } = await supabase
      .from('listings')
      .select('title')
      .eq('id', listingId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching listing for deletion:', fetchError);
      toast({ title: "İlan Bulunamadı", description: "Silinecek ilan bulunamadı.", variant: "destructive" });
      return false;
    }

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting listing:', error);
      toast({ title: "İlan Silinemedi", description: error.message, variant: "destructive" });
      return false;
    }

    await addUserActivity(
      userId,
      'listing_deleted',
      'İlan silindi',
      `"${listingData.title}" ilanı silindi`,
      listingId
    );

    return true;
  } catch (error) {
    console.error('Error in deleteListing:', error);
    toast({ title: "Beklenmedik Hata", description: "İlan silinirken bir sorun oluştu.", variant: "destructive" });
    return false;
  }
};

export const toggleListingStatus = async (listingId, newStatus, userId) => {
  if (!listingId || !newStatus || !userId) {
    toast({ title: "Hata", description: "İlan durumu değiştirmek için eksik bilgi.", variant: "destructive" });
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('listings')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating listing status:', error);
      toast({ title: "Durum Güncellenemedi", description: error.message, variant: "destructive" });
      return null;
    }

    const statusText = newStatus === 'active' ? 'aktif edildi' : 'pasif edildi';
    await addUserActivity(
      userId,
      'listing_status_changed',
      `İlan ${statusText}`,
      `"${data.title}" ilanı ${statusText}`,
      data.id
    );

    return data;
  } catch (error) {
    console.error('Error in toggleListingStatus:', error);
    toast({ title: "Beklenmedik Hata", description: "İlan durumu değiştirilirken bir sorun oluştu.", variant: "destructive" });
    return null;
  }
};