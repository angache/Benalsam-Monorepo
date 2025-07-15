import { supabase } from '@benalsam/shared-types';

// Kullanım artırma
export const incrementUserUsage = async (userId, type) => {
  if (!userId || !type) return false;
  
  try {
    const { data, error } = await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_type: type
    });
    
    if (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return false;
  }
};