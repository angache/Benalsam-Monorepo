// ===========================
// SHARED TYPES EXPORT
// ===========================

// Export all types from the types module
export * from './types/index';

// Export Supabase client and services
export { supabase, db } from './services/supabaseClient';

// ===========================
// SHARED UTILITIES
// ===========================

/**
 * Format price with Turkish Lira symbol
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format date to Turkish locale
 */
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format relative time (e.g., "2 saat önce")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Az önce';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  }

  return formatDate(date);
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
};

/**
 * Generate avatar URL with fallback
 */
export const getAvatarUrl = (avatarUrl?: string | null, userId?: string): string => {
  if (avatarUrl) {
    return avatarUrl;
  }
  
  // Fallback to UI Avatars service
  const initials = userId ? getInitials(userId) : 'U';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=200`;
};

/**
 * Check if user is premium
 */
export const isPremiumUser = (user?: { is_premium?: boolean; premium_expires_at?: string }): boolean => {
  if (!user) return false;
  
  if (!user.is_premium) return false;
  
  if (user.premium_expires_at) {
    const expiryDate = new Date(user.premium_expires_at);
    return expiryDate > new Date();
  }
  
  return true;
};

/**
 * Calculate trust score level
 */
export const getTrustLevel = (trustScore: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
  if (trustScore >= 1000) return 'platinum';
  if (trustScore >= 500) return 'gold';
  if (trustScore >= 100) return 'silver';
  return 'bronze';
};

/**
 * Get trust level color
 */
export const getTrustLevelColor = (level: 'bronze' | 'silver' | 'gold' | 'platinum'): string => {
  switch (level) {
    case 'platinum': return '#E5E4E2';
    case 'gold': return '#FFD700';
    case 'silver': return '#C0C0C0';
    case 'bronze': return '#CD7F32';
    default: return '#C0C0C0';
  }
}; 