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
const validateReviewData = (reviewData) => {
  const { reviewer_id, reviewee_id, offer_id, rating } = reviewData;
  
  if (!reviewer_id || !reviewee_id || !offer_id || !rating) {
    toast({ title: "Eksik Bilgi", description: "Yorum oluşturmak için gerekli tüm alanlar doldurulmalıdır.", variant: "destructive" });
    return false;
  }
  return true;
};

export const createReview = async (reviewData) => {
  if (!validateReviewData(reviewData)) {
    return null;
  }

  const { reviewer_id, reviewee_id, offer_id, rating, comment } = reviewData;

  try {
    const { data, error } = await supabase
      .from('user_reviews')
      .insert([{ reviewer_id, reviewee_id, offer_id, rating, comment }])
      .select(`
        *,
        reviewer:profiles!reviewer_id (id, name, avatar_url),
        reviewee:profiles!reviewee_id (id, name, avatar_url),
        offers (
          id,
          listing_id,
          listings(id, title)
        )
      `)
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return handleError(error, "Yorum Zaten Var", "Bu takas için daha önce yorum yaptınız");
      } else {
        return handleError(error, "Yorum Oluşturulamadı", error.message);
      }
    }

    toast({ 
      title: "Yorum Gönderildi! ⭐", 
      description: "Yorumunuz başarıyla gönderildi." 
    });

    return data;
  } catch (error) {
    return handleError(error, "Beklenmedik Hata", "Yorum oluşturulurken bir sorun oluştu");
  }
};

export const fetchUserReviews = async (userId) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('user_reviews')
      .select(`
        *,
        reviewer:profiles!reviewer_id (id, name, avatar_url),
        reviewee:profiles!reviewee_id (id, name, avatar_url),
        offers (id, listing_id, listings(id, title))
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in fetchUserReviews:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchUserReviews:', error);
    return [];
  }
};

export const canUserReview = async (reviewerId, offerId) => {
  if (!reviewerId || !offerId) return false;
  
  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .select('listing_id, listings(user_id), offering_user_id, status')
    .eq('id', offerId)
    .single();

  if (offerError || !offer) {
    console.error("Error fetching offer for review check or offer not found:", offerError);
    return false;
  }

  if (offer.status !== 'accepted') {
    console.log("Review check: Offer not accepted.");
    return false; // Only allow reviews for accepted offers
  }
  
  let revieweeId;
  if (reviewerId === offer.offering_user_id) { 
    revieweeId = offer.listings.user_id; 
  } else if (reviewerId === offer.listings.user_id) { 
    revieweeId = offer.offering_user_id; 
  } else {
    console.log("Review check: Reviewer is not part of this offer.");
    return false; 
  }

  if (reviewerId === revieweeId) {
    console.log("Review check: User cannot review themselves.");
    return false; 
  }

  const { data: existingReview, error: reviewError } = await supabase
    .from('user_reviews')
    .select('id')
    .eq('offer_id', offerId)
    .eq('reviewer_id', reviewerId)
    .eq('reviewee_id', revieweeId) 
    .maybeSingle();

  if (reviewError) {
    console.error("Error checking existing review:", reviewError);
    return false;
  }

  return !existingReview;
};