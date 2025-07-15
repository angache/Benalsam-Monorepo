import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores';
import { fetchInventoryItems } from '@/services/inventoryService';
import { supabase } from '@/lib/supabaseClient';
import { 
  checkOfferLimit, 
  incrementUserUsage, 
  showPremiumUpgradeToast, 
  getUserActivePlan,
  addOfferAttachment
} from '@/services/premiumService';
import PremiumModal from '@/components/PremiumModal.jsx';
import MakeOfferForm from './MakeOfferPage/MakeOfferForm.jsx';
import PlanInfoCard from './MakeOfferPage/PlanInfoCard.jsx';

const MakeOfferPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  
  const [listing, setListing] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingListing, setLoadingListing] = useState(false);
  const [isFetchingInventory, setIsFetchingInventory] = useState(false);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [userPlan, setUserPlan] = useState(null);

  useEffect(() => {
    // Kullanıcı yoksa loading'i durdur
    if (!currentUser) {
      setLoadingListing(false);
      return;
    }
    
    const fetchData = async () => {
      setLoadingListing(true);
      
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, description, budget, user_id, status')
        .eq('id', listingId)
        .single();

      if (error || !data) {
        toast({ title: "İlan Bulunamadı", description: "Teklif yapılacak ilan bulunamadı.", variant: "destructive" });
        navigate(-1);
        return;
      }
      
      if (data.user_id === currentUser.id) {
        toast({ title: "Kendi İlanınız", description: "Kendi ilanınıza teklif yapamazsınız.", variant: "info" });
        navigate(-1);
        return;
      }

      if (data.status === 'in_transaction' || data.status === 'sold') {
        toast({ title: "Teklif Yapılamaz", description: "Bu ilan için bir teklif kabul edilmiş veya ilan satılmış.", variant: "info" });
        navigate(`/ilan/${listingId}`);
        return;
      }
      
      setListing(data);
      
      const plan = await getUserActivePlan(currentUser.id);
      setUserPlan(plan);
      
      setLoadingListing(false);
    };

    fetchData();
  }, [currentUser?.id, listingId]);

  // Envanter yükleme
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchInventory = async () => {
      setIsFetchingInventory(true);
      try {
        const data = await fetchInventoryItems(currentUser.id);
        console.log('Inventory data loaded:', data);
        setInventoryItems(data || []);
      } catch (error) {
        console.error('Inventory yükleme hatası:', error);
        setInventoryItems([]);
      } finally {
        setIsFetchingInventory(false);
      }
    };

    fetchInventory();
  }, [currentUser?.id]);

  const handleOfferSubmit = useCallback(async (offerData) => {
    if (!currentUser) {
      toast({ title: "Giriş Gerekli", description: "Teklif yapmak için giriş yapmalısınız.", variant: "destructive" });
      return;
    }

    const canMakeOffer = await checkOfferLimit(currentUser.id);
    if (!canMakeOffer) {
      showPremiumUpgradeToast('offer', 0, userPlan?.limits?.offers_per_month || 10);
      setIsPremiumModalOpen(true);
      return;
    }

    setIsSubmittingOffer(true);
    try {
      const { data, error } = await supabase
        .from('offers')
        .insert([{
          listing_id: listing.id,
          offering_user_id: currentUser.id,
          offered_item_id: offerData.selectedItemId,
          message: offerData.message,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        toast({ title: "Teklif Gönderilemedi", description: error.message, variant: "destructive" });
        return;
      }

      if (offerData.attachments && offerData.attachments.length > 0) {
        for (const file of offerData.attachments) {
          await addOfferAttachment(data.id, file);
        }
      }
      
      await incrementUserUsage(currentUser.id, 'offer');
      toast({ title: "Başarılı!", description: "Teklifiniz başarıyla gönderildi." });
      navigate(`/ilan/${listing.id}`);
    } catch (error) {
      console.error('Teklif gönderme hatası:', error);
      toast({ title: "Hata", description: "Teklif gönderilirken bir sorun oluştu.", variant: "destructive" });
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [currentUser?.id, userPlan, listing]);

  const isLoading = useMemo(() => {
    return loadingListing || isFetchingInventory || !listing;
  }, [loadingListing, isFetchingInventory, listing]);

  const loadingText = useMemo(() => {
    if (loadingListing) return 'İlan yükleniyor...';
    if (isFetchingInventory) return 'Envanter yükleniyor...';
    return 'Yükleniyor...';
  }, [loadingListing, isFetchingInventory]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto px-4 py-12"
      >
        <div className="flex items-center mb-8">
           <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-4 text-muted-foreground hover:text-foreground" disabled={isSubmittingOffer}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-gradient truncate">Teklif Yap: {listing.title}</h1>
        </div>

        <PlanInfoCard userPlan={userPlan} />
        
        <MakeOfferForm
          listing={listing}
          inventoryItems={inventoryItems}
          userPlan={userPlan}
          currentUser={currentUser}
          onSubmit={handleOfferSubmit}
          isSubmitting={isSubmittingOffer}
          onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
        />
      </motion.div>

      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onOpenChange={setIsPremiumModalOpen}
        feature="offer"
      />
    </>
  );
};

export default MakeOfferPage;