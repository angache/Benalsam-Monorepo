import { supabase } from '@benalsam/shared-types';

// Kullanıcının aktif planını getir
export const getUserActivePlan = async (userId) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase.rpc('get_user_active_plan', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error getting user plan:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error getting user plan:', error);
    return null;
  }
};

// Kullanıcının aylık kullanım istatistiklerini getir
export const getUserMonthlyUsage = async (userId) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase.rpc('get_or_create_monthly_usage', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error getting user usage:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error getting user usage:', error);
    return null;
  }
};

// Kullanıcının premium durumunu kontrol et - Alternatif yöntem
export const checkUserPremiumStatus = async (userId) => {
  if (!userId) return false;
  
  try {
    // Önce RPC fonksiyonu ile dene
    const { data: planData, error: planError } = await supabase.rpc('get_user_active_plan', {
      p_user_id: userId
    });
    
    if (!planError && planData && planData.length > 0) {
      const plan = planData[0];
      // Eğer plan slug'ı 'basic' değilse premium'dur
      return plan.plan_slug !== 'basic';
    }
    
    // RPC başarısız olursa direkt sorgu yap
    const { data, error } = await supabase
      .from('premium_subscriptions')
      .select('id, status, expires_at, plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error) {
      // Kullanıcının aktif aboneliği yoksa false döndür
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error('Error checking premium status:', error);
      return false;
    }
    
    return data ? true : false;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};

// Kullanıcının premium bilgilerini detaylı getir
export const getUserPremiumDetails = async (userId) => {
  if (!userId) return null;
  
  try {
    // Önce RPC ile dene
    const planData = await getUserActivePlan(userId);
    if (planData) {
      return {
        isPremium: planData.plan_slug !== 'basic',
        plan: planData,
        expiresAt: planData.expires_at
      };
    }
    
    // RPC başarısız olursa manuel sorgu
    const { data, error } = await supabase
      .from('premium_subscriptions')
      .select('id, status, expires_at, plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) {
      return {
        isPremium: false,
        plan: null,
        expiresAt: null
      };
    }
    
    // Plan detaylarını ayrı olarak getir
    const { data: planDetails, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', data[0].plan_id)
      .single();
    
    if (planError) {
      console.error('Error getting plan details:', planError);
      return {
        isPremium: true,
        plan: null,
        expiresAt: data[0].expires_at
      };
    }
    
    return {
      isPremium: true,
      plan: {
        plan_id: planDetails.id,
        plan_name: planDetails.name,
        plan_slug: planDetails.slug,
        features: planDetails.features,
        limits: planDetails.limits,
        expires_at: data[0].expires_at
      },
      expiresAt: data[0].expires_at
    };
  } catch (error) {
    console.error('Error getting premium details:', error);
    return {
      isPremium: false,
      plan: null,
      expiresAt: null
    };
  }
};

// Tüm planları getir
export const getSubscriptionPlans = async () => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });
    
    if (error) {
      console.error('Error getting subscription plans:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    return [];
  }
};

// Premium özellik kontrolü
export const checkPremiumFeature = async (userId, feature) => {
  const plan = await getUserActivePlan(userId);
  if (!plan) return false;
  
  return plan.features?.[feature] === true;
};

// Limit kontrolü genel fonksiyonu
export const checkLimit = async (userId, limitType) => {
  const plan = await getUserActivePlan(userId);
  const usage = await getUserMonthlyUsage(userId);
  
  if (!plan || !usage) return false;
  
  const limit = plan.limits?.[limitType];
  if (limit === -1) return true; // Sınırsız
  
  const currentUsage = usage[limitType.replace('_per_month', '_count')] || 0;
  return currentUsage < limit;
};