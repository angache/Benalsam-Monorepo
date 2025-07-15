import { supabase } from '@/lib/supabaseClient';

// Session management helper
const getSessionId = () => {
  let sessionId = localStorage.getItem('user_session_id');
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    localStorage.setItem('user_session_id', sessionId);
  }
  return sessionId;
};

// Error handling helper
const handleAnalyticsError = (error, eventType) => {
  console.error(`Error in trackEvent '${eventType}':`, error);
  // Analytics errors are non-critical, so we don't show toasts
};

export const trackEvent = async (eventType, eventData = {}, userId = null) => {
  if (!eventType) {
    console.error('trackEvent called without eventType');
    return;
  }

  try {
    const event = {
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

export const trackPageView = async (pageName, userId = null) => {
  await trackEvent('page_view', { page_name: pageName }, userId);
};

export const trackUserAction = async (action, details = {}, userId = null) => {
  await trackEvent('user_action', { action, ...details }, userId);
};

export const trackError = async (errorType, errorMessage, userId = null) => {
  await trackEvent('error', { error_type: errorType, error_message: errorMessage }, userId);
};