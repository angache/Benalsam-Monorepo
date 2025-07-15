import { supabase } from '@benalsam/shared-types';

const getSessionId = () => {
  let sessionId = localStorage.getItem('user_session_id');
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    localStorage.setItem('user_session_id', sessionId);
  }
  return sessionId;
};

export const trackEvent = async (eventType, eventData = {}, userId = null) => {
  try {
    const event = {
      event_type: eventType,
      event_data: eventData,
      user_id: userId,
      session_id: getSessionId(),
    };

    const { error } = await supabase.from('user_events').insert(event);

    if (error) {
      console.error(`Error tracking event '${eventType}':`, error.message);
    }
  } catch (e) {
    console.error('Unexpected error in trackEvent:', e);
  }
};