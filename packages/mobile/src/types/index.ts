// ===========================
// MOBILE TYPES (Re-export from shared-types where possible)
// ===========================

// Re-export types that work with Metro bundler
// Note: Some types are re-defined locally to avoid Metro resolution issues

// ===========================
// ADMIN TYPES (Local definitions for mobile compatibility)
// ===========================

// Admin Role enum
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT',
  CATEGORY_MANAGER = 'CATEGORY_MANAGER',
  ANALYTICS_MANAGER = 'ANALYTICS_MANAGER',
  USER_MANAGER = 'USER_MANAGER',
  CONTENT_MANAGER = 'CONTENT_MANAGER'
}

// Admin Permission types
export interface AdminPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminRolePermission {
  id: string;
  role: AdminRole;
  permission_id: string;
  permission?: AdminPermission;
  created_at: string;
}

export interface AdminUserPermission {
  id: string;
  admin_id: string;
  permission_id: string;
  granted_by?: string;
  permission?: AdminPermission;
  created_at: string;
}

export interface AdminRoleDefinition {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Admin User types
export interface AdminUser {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: AdminRole;
  permissions: any[]; // JSONB array
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  admin_id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  department?: string;
  position?: string;
  permissions: any; // JSONB object
  is_active: boolean;
  last_activity?: string;
  created_at: string;
  updated_at: string;
}

// ===========================
// USER TYPES
// ===========================

// User related types
export interface User {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  app_metadata?: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata?: { 
    [key: string]: any;
  };
  aud?: string;
  role?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone_number: string | null;
  platform_preferences: PlatformPreferences;
  notification_preferences: NotificationPreferences;
  chat_preferences: ChatPreferences;
  created_at: string;
  updated_at: string;
}

// ===========================
// LISTING TYPES
// ===========================

// Listing related types
export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  main_image_url: string;
  additional_image_urls?: string[];
  image_url: string;
  expires_at?: string;
  auto_republish: boolean;
  contact_preference: 'email' | 'phone' | 'both';
  accept_terms: boolean;
  is_featured: boolean;
  is_urgent_premium: boolean;
  is_showcase: boolean;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'deleted' | 'expired';
  is_favorited?: boolean;
  user?: Partial<UserProfile>;
  condition: string[];
  attributes?: Record<string, string[]>; // Category-specific attributes
}

export interface ListingWithUser extends Listing {
  user: UserProfile;
  is_favorited: boolean;
  total_offers?: number;
  total_views?: number;
  popularity_score?: number;
}

// Listing Status enum for admin compatibility
export enum ListingStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  REJECTED = 'rejected',
  SOLD = 'sold',
  DELETED = 'deleted',
  EXPIRED = 'expired'
}

// ===========================
// MESSAGE AND CONVERSATION TYPES
// ===========================

// Message and Conversation types
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'system';
  created_at: string;
  is_read: boolean;
  sender?: UserProfile;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  offer_id?: string;
  listing_id?: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  user1?: UserProfile;
  user2?: UserProfile;
  listing?: Pick<Listing, 'id' | 'title'>;
  last_message?: Message;
}

// ===========================
// OFFER TYPES
// ===========================

// Offer related types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  main_image_url?: string;
  image_url?: string;
}

export interface Offer {
  id: string;
  listing_id: string;
  offering_user_id: string;
  offered_item_id?: string;
  offered_price?: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
  listing?: Listing;
  user?: UserProfile;
  inventory_item?: InventoryItem;
  attachments?: any;
  ai_suggestion?: string;
  conversation_id?: string;
  profiles?: UserProfile;
}

// Offer Attachment types
export interface OfferAttachment {
  id: string;
  offer_id: string;
  file_url: string;
  file_type: 'image' | 'document' | 'other';
  file_name: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  offer?: Offer;
}

// ===========================
// API RESPONSE TYPES
// ===========================

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Admin API Response types
export interface AdminApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// ===========================
// COMMON TYPES
// ===========================

// Common types
export type ID = string;

export interface Pagination {
  page: number;
  limit: number;
  total?: number;
}

export interface QueryFilters {
  search?: string;
  category?: string;
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  urgency?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  attributes?: Record<string, string[]>; // Attribute filters for category-specific filtering
}

// ===========================
// AUTH TYPES
// ===========================

// Auth types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  username: string;
}

// Admin Auth types
export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  success: boolean;
  data: {
    admin: AdminUser;
    token: string;
    refreshToken: string;
  };
  message: string;
}

// ===========================
// USER FEEDBACK TYPES
// ===========================

// User Feedback types
export type FeedbackType = 'bug_report' | 'feature_request' | 'general_feedback' | 'complaint' | 'praise';

export interface UserFeedback {
  id: string;
  user_id: string;
  feedback_type: FeedbackType;
  content: string;
  status: 'pending' | 'in_review' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

// ===========================
// USER STATISTICS TYPES
// ===========================

// User Statistics types
export interface UserStatistics {
  id: string;
  user_id: string;
  total_offers: number;
  accepted_offers: number;
  rejected_offers: number;
  pending_offers: number;
  total_views: number;
  total_messages_sent: number;
  total_messages_received: number;
  avg_response_time_hours: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

// Monthly Usage Stats types
export interface MonthlyUsageStats {
  id: string;
  user_id: string;
  month: string;  // YYYY-MM format
  total_listings_created: number;
  total_offers_made: number;
  total_offers_received: number;
  total_messages_sent: number;
  total_reviews_given: number;
  total_reviews_received: number;
  total_successful_trades: number;
  total_views_received: number;
  total_favorites_received: number;
  created_at: string;
  updated_at: string;
}

// ===========================
// ERROR TYPES
// ===========================

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// ===========================
// LOCATION TYPES
// ===========================

// Location types
export interface District {
  code: string;
  name: string;
}

export interface Province {
  code: string;
  name: string;
  districts: District[];
}

// ===========================
// INTERNATIONALIZATION TYPES
// ===========================

// Internationalization types
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

// ===========================
// CATEGORY TYPES
// ===========================

// Category types
export interface Category {
  code: string;
  name: string;
  icon: any; // IconType for mobile
}

// ===========================
// PREFERENCE TYPES
// ===========================

// Preference types
export interface NotificationPreferences {
  new_offer_push: boolean;
  new_offer_email: boolean;
  new_message_push: boolean;
  new_message_email: boolean;
  review_push: boolean;
  review_email: boolean;
  summary_emails: 'daily' | 'weekly' | 'never';
}

export interface ChatPreferences {
  read_receipts: boolean;
  show_last_seen: boolean;
  auto_scroll_messages: boolean;
}

export interface PlatformPreferences {
  language: string;
  currency: string;
  default_location_province?: string;
  default_location_district?: string;
  default_category?: string;
}

// ===========================
// UTILITY FUNCTIONS (Local implementations)
// ===========================

// Format price with Turkish Lira symbol
export const formatPrice = (price: number): string => {
  return `₺${price.toLocaleString('tr-TR')}`;
};

// Format date to Turkish format
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format relative time (e.g., "2 saat önce")
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

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

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} hafta önce`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ay önce`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} yıl önce`;
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Generate initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ===========================
// ADDITIONAL UTILITY FUNCTIONS
// ===========================

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get avatar URL with fallback
export const getAvatarUrl = (user: { avatar_url?: string | null; full_name?: string }): string => {
  if (user.avatar_url) {
    return user.avatar_url;
  }
  // Return a default avatar or generate one based on name
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=random`;
};

// Check if user is premium
export const isPremiumUser = (user: any): boolean => {
  return user?.is_premium === true || user?.premium_status === 'active';
};

// Get trust level based on user stats
export const getTrustLevel = (userStats?: UserStatistics): 'new' | 'trusted' | 'verified' => {
  if (!userStats) return 'new';
  
  if (userStats.success_rate >= 0.8 && userStats.total_offers >= 10) {
    return 'verified';
  } else if (userStats.success_rate >= 0.6 && userStats.total_offers >= 5) {
    return 'trusted';
  }
  return 'new';
};

// Get trust level color
export const getTrustLevelColor = (trustLevel: 'new' | 'trusted' | 'verified'): string => {
  switch (trustLevel) {
    case 'verified':
      return '#10B981'; // Green
    case 'trusted':
      return '#3B82F6'; // Blue
    case 'new':
    default:
      return '#6B7280'; // Gray
  }
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Turkish phone numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  
  return phone; // Return original if can't format
}; 