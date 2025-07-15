import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth.js';
import { useAppData } from '@/hooks/useAppData.js';
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
  const { currentUser, loadingAuth } = useAuth();
  const { inventoryItems, handleSubmitOffer, isSubmittingOffer, isFetchingInventory, fetchUserInventory } = useAppData(currentUser, loadingAuth, () => navigate('/auth?action=login'));
  
  const [listing, setListing] = useState(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [userPlan, setUserPlan] = useState(null);

  useEffect(() => {
    if (loadingAuth || !currentUser) {
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
    if (currentUser.id) {
      fetchUserInventory(currentUser.id);
    }
  }, [currentUser, listingId, navigate, loadingAuth, fetchUserInventory]);

  const handleOfferSubmit = async (offerData) => {
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

    const createdOffer = await handleSubmitOffer(offerData, listing.title);
    if (createdOffer) {
      if (offerData.attachments && offerData.attachments.length > 0) {
        for (const file of offerData.attachments) {
          await addOfferAttachment(createdOffer.id, file);
        }
      }
      
      await incrementUserUsage(currentUser.id, 'offer');
      navigate(`/ilan/${listing.id}`);
    }
  };

  if (loadingAuth || isFetchingInventory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{loadingAuth ? 'Kimlik doğrulanıyor...' : 'Envanter yükleniyor...'}</p>
        </div>
      </div>
    );
  }

  if (loadingListing || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">İlan yükleniyor...</p>
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