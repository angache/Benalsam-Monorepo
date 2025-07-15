import { supabase } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getSessionId = async () => {
  let sessionId = await AsyncStorage.getItem('user_session_id');
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    await AsyncStorage.setItem('user_session_id', sessionId);
  }
  return sessionId;
};

export const trackEvent = async (eventType: string, eventData: any = {}, userId: string | null = null) => {
  try {
    const sessionId = await getSessionId();
    const event = {
      event_type: eventType,
      event_data: eventData,
      user_id: userId,
      session_id: sessionId,
    };

    const { error } = await supabase.from('user_events').insert(event);

    if (error) {
      console.error(`Error tracking event '${eventType}':`, error.message);
    }
  } catch (e) {
    console.error('Unexpected error in trackEvent:', e);
  }
}; 