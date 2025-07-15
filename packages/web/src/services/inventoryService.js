import { supabase } from '@benalsam/shared-types';
import { toast } from '@/components/ui/use-toast';
import { processImagesForSupabase } from '@/services/imageService';

export const fetchInventoryItems = async (userId) => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory items:', error);
      if (error.message.toLowerCase().includes('failed to fetch')) {
        toast({ title: "Ağ Hatası", description: "Envanter yüklenemedi. İnternet bağlantınızı kontrol edin.", variant: "destructive" });
      } else {
        toast({ title: "Envanter Yüklenemedi", description: "Envanteriniz yüklenirken bir sorun oluştu.", variant: "destructive" });
      }
      return [];
    }
    return data;
  } catch (e) {
    console.error('Unexpected error in fetchInventoryItems:', e);
    toast({ title: "Beklenmedik Envanter Hatası", description: "Envanter yüklenirken beklenmedik bir sorun oluştu.", variant: "destructive" });
    return [];
  }
};

export const addInventoryItem = async (itemData, currentUserId, onProgress) => {
  try {
    const { mainImageUrl, additionalImageUrls } = await processImagesForSupabase(
      itemData.images,
      itemData.mainImageIndex,
      'item_images',
      'inventory',
      currentUserId,
      itemData.category,
      onProgress
    );

    const itemToInsert = {
      user_id: currentUserId,
      name: itemData.name,
      category: itemData.category,
      description: itemData.description,
      main_image_url: mainImageUrl,
      additional_image_urls: additionalImageUrls.length > 0 ? additionalImageUrls : null,
      image_url: mainImageUrl, 
    };

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([itemToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error adding inventory item:', error);
      toast({ title: "Envanter Eklenemedi", description: error.message, variant: "destructive" });
      return null;
    }
    return data;
  } catch (e) {
    console.error('Unexpected error in addInventoryItem:', e);
    toast({ title: "Beklenmedik Envanter Ekleme Hatası", description: "Envantere ürün eklenirken beklenmedik bir sorun oluştu.", variant: "destructive" });
    return null;
  }
};

export const updateInventoryItem = async (itemData, currentUserId, onProgress) => {
  try {
    const { mainImageUrl, additionalImageUrls } = await processImagesForSupabase(
      itemData.images,
      itemData.mainImageIndex,
      'item_images',
      'inventory',
      currentUserId,
      itemData.category,
      onProgress,
      itemData.initialImageUrls
    );
    
    const itemToUpdate = {
      name: itemData.name,
      category: itemData.category,
      description: itemData.description,
      main_image_url: mainImageUrl,
      additional_image_urls: additionalImageUrls.length > 0 ? additionalImageUrls : null,
      image_url: mainImageUrl,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('inventory_items')
      .update(itemToUpdate)
      .eq('id', itemData.id)
      .eq('user_id', currentUserId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating inventory item:', error);
      toast({ title: "Envanter Güncellenemedi", description: error.message, variant: "destructive" });
      return null;
    }
    return data;
  } catch (e) {
    console.error('Unexpected error in updateInventoryItem:', e);
    toast({ title: "Beklenmedik Envanter Güncelleme Hatası", description: "Envanter güncellenirken beklenmedik bir sorun oluştu.", variant: "destructive" });
    return null;
  }
};

export const deleteInventoryItem = async (itemId, currentUserId) => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', currentUserId);

    if (error) {
      toast({ title: "Envanter Silinemedi", description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  } catch (e) {
    console.error('Unexpected error in deleteInventoryItem:', e);
    toast({ title: "Beklenmedik Envanter Silme Hatası", description: "Envanter silinirken beklenmedik bir sorun oluştu.", variant: "destructive" });
    return false;
  }
};

export const getInventoryItemById = async (itemId) => {
  if (!itemId) return null;

  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) {
      console.error('Error fetching inventory item:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getInventoryItemById:', error);
    return null;
  }
};