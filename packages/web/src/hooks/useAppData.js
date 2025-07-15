import React, { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { 
  fetchListings as fetchListingsService, 
  fetchInventoryItems as fetchInventoryItemsService,
  createListing as createListingService,
  addInventoryItem as addInventoryItemService,
  updateInventoryItem as updateInventoryItemService,
  deleteInventoryItem as deleteInventoryItemService,
  addFavorite as addFavoriteService,
  removeFavorite as removeFavoriteService
} from '@/services/supabaseService';
import { createOffer } from '@/services/offerService';
import { seedListings as seedListingsService, clearAllSeedData as clearAllSeedDataService } from '@/lib/seedDatabase'; 

export const useAppData = (currentUser, loadingAuth, openAuthModal) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [isProcessingData, setIsProcessingData] = useState(false);
  const [isFetchingInventory, setIsFetchingInventory] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUserInventory = useCallback(async (userId) => {
    if (!userId) {
      setInventoryItems([]);
      return;
    }
    setIsFetchingInventory(true);
    try {
      const fetchedInventory = await fetchInventoryItemsService(userId);
      setInventoryItems(fetchedInventory);
    } catch (error) {
      setInventoryItems([]); 
    } finally {
      setIsFetchingInventory(false);
    }
  }, []); 

  const fetchNotifications = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.is_read).length);
  }, []);

  const loadInitialData = useCallback(async () => {
    const fetchedListings = await fetchListingsService(currentUser?.id);
    setListings(fetchedListings);
    
    if (currentUser?.id) {
      await fetchUserInventory(currentUser.id);
      await fetchNotifications(currentUser.id);
    } else {
      setInventoryItems([]);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [currentUser?.id, fetchUserInventory, fetchNotifications]);

  useEffect(() => {
    if (!loadingAuth) {
      loadInitialData();
    } else {
      setInventoryItems([]);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [loadingAuth, loadInitialData]);

  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase.channel(`realtime:notifications:${currentUser.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `recipient_user_id=eq.${currentUser.id}` 
        },
        (payload) => {
          const newNotification = payload.new;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: "Yeni Teklif Aldınız!",
            description: `${newNotification.data?.offerorName || 'Bir kullanıcı'}, "${newNotification.data?.listingTitle || 'ilanınız'}" için teklif yaptı.`,
            action: React.createElement(
              'button',
              {
                className: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm",
                onClick: () => navigate('/aldigim-teklifler')
              },
              'Görüntüle'
            )
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, navigate]);
  
  const handleUploadProgress = useCallback((progress) => {
    setUploadProgress(progress);
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.is_read) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, is_read: true} : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({...n, is_read: true})));
    setUnreadCount(0);

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_user_id', currentUser?.id)
      .eq('is_read', false);
  }, [currentUser?.id]);

  const handleCreateListing = useCallback(async (newListingData) => {
    if (!currentUser) {
      toast({ title: "Giriş Yapmalısınız!", description: "İlan oluşturmak için lütfen giriş yapın.", variant: "destructive" });
      if (typeof openAuthModal === 'function') openAuthModal('login');
      return null;
    }
    setIsUploading(true);
    setUploadProgress(0);
    const newFullListing = await createListingService(newListingData, currentUser.id, handleUploadProgress);
    setIsUploading(false);
    if (newFullListing) {
      setListings(prevListings => [newFullListing, ...prevListings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      toast({ title: "İlan Oluşturuldu! 🎉", description: "İlanınız başarıyla yayınlandı." });
      return newFullListing;
    } else {
      toast({ title: "İlan Oluşturulamadı", description: "Bir hata oluştu, lütfen tekrar deneyin.", variant: "destructive" });
      return null;
    }
  }, [currentUser, openAuthModal, handleUploadProgress]);

  const handleAddInventoryItem = useCallback(async (itemData) => {
    if (!currentUser) return null;
    setIsUploading(true);
    setUploadProgress(0);
    const newItem = await addInventoryItemService(itemData, currentUser.id, handleUploadProgress);
    setIsUploading(false);
    if (newItem) {
      await fetchUserInventory(currentUser.id); 
      toast({ title: "Envantere Eklendi!", description: `${newItem.name} envanterinize eklendi.` });
    } else {
      toast({ title: "Envanter Eklenemedi", description: "Bir hata oluştu, lütfen tekrar deneyin.", variant: "destructive" });
    }
    return newItem;
  }, [currentUser, handleUploadProgress, fetchUserInventory]);

  const handleUpdateInventoryItem = useCallback(async (updatedItemData) => {
    if (!currentUser) return null;
    setIsUploading(true);
    setUploadProgress(0);
    const updatedItem = await updateInventoryItemService(updatedItemData, currentUser.id, handleUploadProgress);
    setIsUploading(false);
    if (updatedItem) {
      await fetchUserInventory(currentUser.id); 
      toast({ title: "Envanter Güncellendi!", description: `${updatedItem.name} güncellendi.` });
    } else {
      toast({ title: "Envanter Güncellenemedi", description: "Bir hata oluştu, lütfen tekrar deneyin.", variant: "destructive" });
    }
    return updatedItem;
  }, [currentUser, handleUploadProgress, fetchUserInventory]);

  const handleDeleteInventoryItem = useCallback(async (itemId) => {
    if (!currentUser) return false;
    const success = await deleteInventoryItemService(itemId, currentUser.id);
    if (success) {
      await fetchUserInventory(currentUser.id); 
      toast({ title: "Envanterden Silindi!", description: `Ürün envanterinizden silindi.`, variant: "destructive" });
    }
    return success;
  }, [currentUser, fetchUserInventory]);

  const handleSubmitOffer = useCallback(async (offerData, listingTitle) => {
    if (!currentUser) {
      toast({ title: "Giriş Gerekli", description: "Teklif yapmak için giriş yapmalısınız.", variant: "destructive" });
      if (typeof openAuthModal === 'function') openAuthModal('login');
      return null;
    }
    
    setIsSubmittingOffer(true);
    
    const offerPayload = {
      listingId: offerData.listingId,
      offering_user_id: currentUser.id,
      offeredItemId: offerData.offeredItemId,
      offeredPrice: offerData.offeredPrice,
      message: offerData.message,
      attachments: offerData.attachments
    };
    
    const newOffer = await createOffer(offerPayload);
    setIsSubmittingOffer(false);
    
    if (newOffer) {
      toast({ title: "Teklif Gönderildi!", description: `Teklifiniz "${listingTitle}" ilanı için başarıyla gönderildi.` });
      setListings(prev => prev.map(l => l.id === offerData.listingId ? {...l, offers_count: (l.offers_count || 0) + 1} : l));

      const { data: listingData } = await supabase.from('listings').select('user_id').eq('id', offerData.listingId).single();
      if (listingData && listingData.user_id !== currentUser.id) {
        await supabase.from('notifications').insert({
          recipient_user_id: listingData.user_id,
          type: 'NEW_OFFER',
          data: {
            listingId: offerData.listingId,
            listingTitle: listingTitle,
            offerId: newOffer.id,
            offerorId: currentUser.id,
            offerorName: currentUser.user_metadata?.name || 'Bir kullanıcı'
          }
        });
      }
    } else {
      toast({ title: "Teklif Gönderilemedi", description: "Bir hata oluştu, lütfen tekrar deneyin.", variant: "destructive" });
    }
    return newOffer;
  }, [currentUser, openAuthModal]);

  const handleToggleFavorite = useCallback(async (listingId, shouldBeFavorited) => {
    if (!currentUser) {
      if (typeof openAuthModal === 'function') openAuthModal('login');
      return;
    }

    const originalListings = [...listings];
    
    setListings(prevListings => 
      prevListings.map(l => 
        l.id === listingId 
        ? { 
            ...l, 
            is_favorited: shouldBeFavorited, 
            favorites_count: shouldBeFavorited ? (l.favorites_count || 0) + 1 : Math.max(0, (l.favorites_count || 0) - 1)
          } 
        : l
      )
    );

    let success;
    if (shouldBeFavorited) {
      success = await addFavoriteService(currentUser.id, listingId);
    } else {
      success = await removeFavoriteService(currentUser.id, listingId);
    }

    if (!success || (typeof success === 'object' && success !== null && success.already_favorited && !shouldBeFavorited)) {
      setListings(originalListings);
    }
  }, [currentUser, listings, openAuthModal]);

  const handleSeedDatabase = useCallback(async () => {
    setIsProcessingData(true);
    toast({ title: "Veritabanı Dolduruluyor...", description: "100 sahte ilan oluşturuluyor, bu işlem biraz zaman alabilir." });
    const result = await seedListingsService(100);
    setIsProcessingData(false);
    if (result.success) {
      toast({ title: "Veritabanı Dolduruldu!", description: result.message });
      await loadInitialData(); 
    } else {
      toast({ title: "Veritabanı Doldurma Hatası", description: result.message, variant: "destructive" });
    }
  }, [loadInitialData]);

  const handleClearDatabase = useCallback(async () => {
    setIsProcessingData(true);
    const result = await clearAllSeedDataService();
    setIsProcessingData(false);
    if (result.success) {
      await loadInitialData();
    }
  }, [loadInitialData]);

  return {
    listings, setListings,
    inventoryItems, setInventoryItems,
    isUploading, uploadProgress, handleUploadProgress,
    isSubmittingOffer,
    isProcessingData,
    isFetchingInventory,
    notifications,
    unreadCount,
    loadInitialData,
    fetchUserInventory,
    handleCreateListing,
    handleAddInventoryItem,
    handleUpdateInventoryItem,
    handleDeleteInventoryItem,
    handleSubmitOffer,
    handleToggleFavorite,
    handleSeedDatabase,
    handleClearDatabase,
    markNotificationAsRead,
    markAllAsRead,
  };
};