import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { addUserActivity } from '@/services/userActivityService.js';

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
const validateOfferData = (offerData) => {
  if (!offerData.listingId || !offerData.offering_user_id) {
    toast({ title: "Eksik Bilgi", description: "Teklif oluşturmak için gerekli bilgiler eksik.", variant: "destructive" });
    return false;
  }

  if (!offerData.offeredItemId && !offerData.offeredPrice) {
    toast({ title: "Eksik Teklif", description: "En az bir ürün seçin veya nakit teklifi yapın.", variant: "destructive" });
    return false;
  }

  return true;
};

export const createOffer = async (offerData) => {
  if (!validateOfferData(offerData)) {
    return null;
  }

  try {
    const insertPayload = {
      listing_id: offerData.listingId,
      offering_user_id: offerData.offering_user_id,
      message: offerData.message || '',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (offerData.offeredItemId) {
      insertPayload.offered_item_id = offerData.offeredItemId;
    }

    if (offerData.offeredPrice) {
      insertPayload.offered_price = parseFloat(offerData.offeredPrice);
    }
    
    if (offerData.attachments && offerData.attachments.length > 0) {
      insertPayload.attachments = JSON.stringify(offerData.attachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })));
    }

    if (offerData.aiSuggestion) {
      insertPayload.ai_suggestion = offerData.aiSuggestion;
    }

    const { data, error } = await supabase
      .from('offers')
      .insert([insertPayload])
      .select(`
        *,
        listings (
          id,
          title,
          main_image_url,
          user_id,
          profiles!listings_user_id_fkey (
            id,
            name,
            avatar_url
          )
        ),
        profiles (
          id,
          name,
          avatar_url
        ),
        inventory_items!offers_offered_item_id_fkey (
          id,
          name,
          category,
          main_image_url,
          image_url
        )
      `)
      .single();

    if (error) {
      return handleError(error, "Teklif Gönderilemedi", "Teklif oluşturulamadı");
    }

    if (!data) {
      return handleError(null, "Teklif Gönderilemedi", "Teklif oluşturulamadı");
    }

    // Add user activity
    await addUserActivity(
      offerData.offering_user_id,
      'offer_sent',
      'Teklif gönderildi',
      `Bir ilana teklif gönderildi`,
      data.id
    );

    // Format data like mobile version
    const formattedData = {
      ...data,
      listing: {
        ...data.listings,
        user: data.listings?.profiles
      },
      user: data.profiles,
      inventory_item: data.inventory_items
    };

    toast({ 
      title: "Teklif Gönderildi! 🎉", 
      description: "Teklifiniz başarıyla gönderildi." 
    });

    return formattedData;
  } catch (error) {
    return handleError(error, "Beklenmedik Hata", "Teklif gönderilirken bir sorun oluştu");
  }
};

export const fetchOfferDetails = async (offerId) => {
  if (!offerId) {
    toast({ title: "Eksik Bilgi", description: "Teklif ID'si gerekli.", variant: "destructive" });
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        profiles:offering_user_id(id, name, avatar_url, rating, total_ratings),
        listings!offers_listing_id_fkey(
          id,
          title,
          main_image_url,
          image_url,
          budget,
          status,
          user_id,
          profiles:user_id(id, name, avatar_url, rating, total_ratings)
        ),
        inventory_items!offers_offered_item_id_fkey(id, name, category, main_image_url, image_url)
      `)
      .eq('id', offerId)
      .single();

    if (error) {
      console.error('Error fetching offer details:', error);
      toast({ title: "Teklif Bulunamadı", description: "Teklif detayları alınamadı.", variant: "destructive" });
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchOfferDetails:', error);
    toast({ title: "Beklenmedik Hata", description: "Teklif detayları yüklenirken bir sorun oluştu.", variant: "destructive" });
    return null;
  }
};

export const updateOfferStatus = async (offerId, newStatus, userId) => {
  if (!offerId || !newStatus || !userId) {
    toast({ title: "Eksik Bilgi", description: "Teklif durumu güncellemek için gerekli bilgiler eksik.", variant: "destructive" });
    return null;
  }

  try {
    const { data: offer, error: fetchError } = await supabase
      .from('offers')
      .select(`
        *,
        listing:listings!offers_listing_id_fkey(id, title, user_id, status)
      `)
      .eq('id', offerId)
      .single();

    if (fetchError) {
      console.error('Error fetching offer:', fetchError);
      toast({ title: "Teklif Bulunamadı", description: "Güncellenecek teklif bulunamadı.", variant: "destructive" });
      return null;
    }

    if (!offer.listing || offer.listing.user_id !== userId) {
      toast({ title: "Yetki Hatası", description: "Bu teklifi güncelleme yetkiniz yok.", variant: "destructive" });
      return null;
    }

    if (newStatus === 'accepted') {
      if (offer.listing.status === 'in_transaction' || offer.listing.status === 'sold') {
        toast({ title: "İşlem Reddedildi", description: "Bu ilan için zaten başka bir teklif kabul edilmiş veya ilan satılmış.", variant: "destructive" });
        return null;
      }
      
      const { error: listingUpdateError } = await supabase
        .from('listings')
        .update({
          status: 'in_transaction',
          offer_accepted_at: new Date().toISOString(),
          accepted_offer_id: offerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', offer.listing.id);

      if (listingUpdateError) {
        console.error('Error updating listing to in_transaction:', listingUpdateError);
        toast({ title: "Hata", description: "İlan durumu güncellenirken bir hata oluştu.", variant: "destructive"});
        return null;
      }

      await supabase
        .from('offers')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('listing_id', offer.listing.id)
        .eq('status', 'pending');
    }

    const { data, error } = await supabase
      .from('offers')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', offerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating offer status:', error);
      toast({ title: "Teklif Güncellenemedi", description: error.message, variant: "destructive" });
      return null;
    }
    
    if (newStatus === 'accepted') {
        await addUserActivity(
            userId,
            'offer_accepted',
            'Teklif kabul edildi',
            `"${offer.listing.title}" ilanı için bir teklif kabul edildi`,
            offer.listing.id
        );

        await addUserActivity(
            offer.offering_user_id,
            'offer_received',
            'Teklifiniz kabul edildi',
            `"${offer.listing.title}" ilanı için teklifiniz kabul edildi`,
            offer.listing.id
        );

        toast({ 
            title: "Teklif Kabul Edildi! 🎉", 
            description: "Alışveriş süreci başladı. İlanınız 1 gün sonra otomatik olarak yayından kaldırılacak." 
        });
    } else if (newStatus === 'rejected') {
        await addUserActivity(
            offer.offering_user_id,
            'offer_rejected',
            'Teklifiniz reddedildi',
            `"${offer.listing.title}" ilanı için teklifiniz reddedildi`,
            offer.listing.id
        );
    }

    return data;
  } catch (error) {
    console.error('Error in updateOfferStatus:', error);
    toast({ title: "Beklenmedik Hata", description: "Teklif durumu güncellenirken bir sorun oluştu.", variant: "destructive" });
    return null;
  }
};

export const fetchSentOffers = async (userId) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        listings!offers_listing_id_fkey(
          id,
          title,
          main_image_url,
          image_url,
          budget,
          status,
          user_id,
          profiles:user_id(id, name, avatar_url)
        ),
        inventory_items!offers_offered_item_id_fkey(id, name, category, main_image_url, image_url)
      `)
      .eq('offering_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sent offers:', error);
      toast({ title: "Gönderilen Teklifler Yüklenemedi", description: error.message, variant: "destructive" });
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchSentOffers:', error);
    toast({ title: "Beklenmedik Hata", description: "Gönderilen teklifler yüklenirken bir sorun oluştu.", variant: "destructive" });
    return [];
  }
};

export const fetchReceivedOffers = async (userId) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        profiles:offering_user_id(id, name, avatar_url, rating, total_ratings),
        listings!offers_listing_id_fkey!inner(id, title, main_image_url, image_url, budget, status, user_id),
        inventory_items!offers_offered_item_id_fkey(id, name, category, main_image_url, image_url)
      `)
      .eq('listings.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching received offers:', error);
      toast({ title: "Gelen Teklifler Yüklenemedi", description: error.message, variant: "destructive" });
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchReceivedOffers:', error);
    toast({ title: "Beklenmedik Hata", description: "Gelen teklifler yüklenirken bir sorun oluştu.", variant: "destructive" });
    return [];
  }
};

export const deleteOffer = async (offerId, userId) => {
  if (!offerId || !userId) {
    toast({ title: "Eksik Bilgi", description: "Teklif silmek için gerekli bilgiler eksik.", variant: "destructive" });
    return false;
  }

  try {
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', offerId)
      .eq('offering_user_id', userId);

    if (error) {
      console.error('Error deleting offer:', error);
      toast({ title: "Teklif Silinemedi", description: error.message, variant: "destructive" });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteOffer:', error);
    toast({ title: "Beklenmedik Hata", description: "Teklif silinirken bir sorun oluştu.", variant: "destructive" });
    return false;
  }
};