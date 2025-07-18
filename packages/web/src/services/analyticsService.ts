import { supabase } from '@/lib/supabaseClient';

// Event interface
interface AnalyticsEvent {
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string | null;
  session_id: string;
  created_at?: string;
}

// Session management helper
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('user_session_id');
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    localStorage.setItem('user_session_id', sessionId);
  }
  return sessionId;
};

// Error handling helper
const handleAnalyticsError = (error: any, eventType: string): void => {
  console.error(`Error in trackEvent '${eventType}':`, error);
  // Analytics errors are non-critical, so we don't show toasts
};

export const trackEvent = async (
  eventType: string, 
  eventData: Record<string, any> = {}, 
  userId: string | null = null
): Promise<void> => {
  if (!eventType) {
    console.error('trackEvent called without eventType');
    return;
  }

  try {
    const event: AnalyticsEvent = {
      event_type: eventType,
      event_data: eventData,
      user_id: userId,
      session_id: getSessionId(),
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('user_events').insert(event);

    if (error) {
      handleAnalyticsError(error, eventType);
    }
  } catch (error) {
    handleAnalyticsError(error, eventType);
  }
};

export const trackPageView = async (pageName: string, userId: string | null = null): Promise<void> => {
  await trackEvent('page_view', { page_name: pageName }, userId);
};

export const trackUserAction = async (
  action: string, 
  details: Record<string, any> = {}, 
  userId: string | null = null
): Promise<void> => {
  await trackEvent('user_action', { action, ...details }, userId);
};

export const trackError = async (
  errorType: string, 
  errorMessage: string, 
  userId: string | null = null
): Promise<void> => {
  await trackEvent('error', { error_type: errorType, error_message: errorMessage }, userId);
};

// Additional analytics functions
export const trackListingView = async (
  listingId: string, 
  listingTitle: string, 
  category: string, 
  userId: string | null = null
): Promise<void> => {
  await trackEvent('listing_view', {
    listing_id: listingId,
    listing_title: listingTitle,
    category: category
  }, userId);
};

export const trackOfferCreated = async (
  offerId: string, 
  listingId: string, 
  amount: number, 
  userId: string | null = null
): Promise<void> => {
  await trackEvent('offer_created', {
    offer_id: offerId,
    listing_id: listingId,
    amount: amount
  }, userId);
};

export const trackUserRegistration = async (
  userId: string, 
  registrationMethod: string
): Promise<void> => {
  await trackEvent('user_registration', {
    registration_method: registrationMethod
  }, userId);
};

export const trackUserLogin = async (
  userId: string, 
  loginMethod: string
): Promise<void> => {
  await trackEvent('user_login', {
    login_method: loginMethod
  }, userId);
};

export const trackSearchQuery = async (
  query: string, 
  filters: Record<string, any>, 
  resultsCount: number, 
  userId: string | null = null
): Promise<void> => {
  await trackEvent('search_query', {
    query: query,
    filters: filters,
    results_count: resultsCount
  }, userId);
};

export const trackCategoryView = async (
  category: string, 
  subcategory?: string, 
  userId: string | null = null
): Promise<void> => {
  await trackEvent('category_view', {
    category: category,
    subcategory: subcategory
  }, userId);
};

export const trackPremiumUpgrade = async (
  userId: string, 
  plan: string, 
  amount: number
): Promise<void> => {
  await trackEvent('premium_upgrade', {
    plan: plan,
    amount: amount
  }, userId);
};

export const trackConversationStarted = async (
  conversationId: string, 
  listingId: string, 
  userId: string | null = null
): Promise<void> => {
  await trackEvent('conversation_started', {
    conversation_id: conversationId,
    listing_id: listingId
  }, userId);
};

export const trackFavoriteAdded = async (
  listingId: string, 
  userId: string | null = null
): Promise<void> => {
  await trackEvent('favorite_added', {
    listing_id: listingId
  }, userId);
};

export const trackProfileView = async (
  profileId: string, 
  viewerId: string | null = null
): Promise<void> => {
  await trackEvent('profile_view', {
    profile_id: profileId
  }, viewerId);
}; 