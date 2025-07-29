import { supabase } from '@/lib/supabaseClient';
import { AnalyticsEventType } from '@benalsam/shared-types';
import type { 
  AnalyticsEvent as StandardizedAnalyticsEvent, 
  AnalyticsUser, 
  AnalyticsSession, 
  AnalyticsDevice, 
  AnalyticsContext 
} from '@benalsam/shared-types';

// Legacy event interface for backward compatibility
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

// Enhanced analytics methods with standardized format
export const trackAnalyticsEvent = async (
  eventName: keyof typeof AnalyticsEventType,
  eventProperties: Record<string, any> = {},
  userId: string | null = null
): Promise<boolean> => {
  try {
    // Get user data
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create analytics user object
    const analyticsUser: AnalyticsUser = {
      id: user?.id || 'anonymous',
      email: user?.email || '',
      name: user?.user_metadata?.name || user?.email || 'Anonymous User',
      avatar: user?.user_metadata?.avatar_url || undefined,
      properties: {
        registration_date: user?.created_at,
        subscription_type: 'free', // TODO: Get from user profile
        last_login: new Date().toISOString(),
        trust_score: 0, // TODO: Calculate trust score
        verification_status: 'unverified' // TODO: Get from user profile
      }
    };

    // Create analytics session object
    const sessionId = getSessionId();
    const analyticsSession: AnalyticsSession = {
      id: sessionId,
      start_time: new Date().toISOString(),
      duration: undefined, // Will be calculated when session ends
      page_views: 0, // TODO: Track page views
      events_count: 0 // TODO: Track event count
    };

    // Create analytics device object
    const analyticsDevice: AnalyticsDevice = {
      platform: 'web',
      version: navigator.userAgent,
      model: undefined,
      screen_resolution: `${screen.width}x${screen.height}`,
      app_version: '1.0.0', // TODO: Get from app config
      os_version: undefined,
      browser: navigator.userAgent.includes('Chrome') ? 'chrome' : 
               navigator.userAgent.includes('Firefox') ? 'firefox' : 
               navigator.userAgent.includes('Safari') ? 'safari' : 'other',
      user_agent: navigator.userAgent
    };

    // Create analytics context object
    const analyticsContext: AnalyticsContext = {
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Create standardized analytics event
    const analyticsEvent: StandardizedAnalyticsEvent = {
      event_id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event_name: AnalyticsEventType[eventName],
      event_timestamp: new Date().toISOString(),
      event_properties: eventProperties,
      user: analyticsUser,
      session: analyticsSession,
      device: analyticsDevice,
      context: analyticsContext
    };

    // Send to backend
    const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/v1/analytics/track-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsEvent)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return false;
  }
};

// Helper methods for specific event types
export const trackScreenViewNew = async (screenName: string, properties: Record<string, any> = {}): Promise<boolean> => {
  return trackAnalyticsEvent('SCREEN_VIEW', {
    screen_name: screenName,
    ...properties
  });
};

export const trackButtonClickNew = async (buttonName: string, properties: Record<string, any> = {}): Promise<boolean> => {
  return trackAnalyticsEvent('BUTTON_CLICK', {
    button_name: buttonName,
    ...properties
  });
};

export const trackSearchNew = async (searchTerm: string, properties: Record<string, any> = {}): Promise<boolean> => {
  return trackAnalyticsEvent('SEARCH', {
    search_term: searchTerm,
    ...properties
  });
};

export const trackListingViewNew = async (listingId: string, properties: Record<string, any> = {}): Promise<boolean> => {
  return trackAnalyticsEvent('LISTING_VIEW', {
    listing_id: listingId,
    ...properties
  });
};

export const trackListingCreateNew = async (listingId: string, properties: Record<string, any> = {}): Promise<boolean> => {
  return trackAnalyticsEvent('LISTING_CREATE', {
    listing_id: listingId,
    ...properties
  });
};

export const trackOfferSentNew = async (offerId: string, properties: Record<string, any> = {}): Promise<boolean> => {
  return trackAnalyticsEvent('OFFER_SENT', {
    offer_id: offerId,
    ...properties
  });
};

export const trackMessageSentNew = async (messageId: string, properties: Record<string, any> = {}): Promise<boolean> => {
  return trackAnalyticsEvent('MESSAGE_SENT', {
    message_id: messageId,
    ...properties
  });
};

export const trackAppLoadNew = async (properties: Record<string, any> = {}): Promise<boolean> => {
  return trackAnalyticsEvent('APP_LOAD', {
    load_time_ms: Date.now() - performance.timing.navigationStart,
    ...properties
  });
};

export const trackApiCallNew = async (endpoint: string, duration: number, properties: Record<string, any> = {}): Promise<boolean> => {
  return trackAnalyticsEvent('API_CALL', {
    endpoint,
    duration_ms: duration,
    ...properties
  });
};

export const trackErrorNew = async (errorType: string, errorMessage: string, properties: Record<string, any> = {}): Promise<boolean> => {
  return trackAnalyticsEvent('ERROR_OCCURRED', {
    error_type: errorType,
    error_message: errorMessage,
    ...properties
  });
}; 