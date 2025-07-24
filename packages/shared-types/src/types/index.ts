// Icon type for both React Native and Web
export type IconType = any; // Will be replaced with proper icon type based on platform

// ===========================
// STATUS ENUMS
// ===========================

export const MessageStatus = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
} as const;

export type MessageStatusType = typeof MessageStatus[keyof typeof MessageStatus];

export const PremiumSubscriptionStatus = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PENDING: 'pending'
} as const;

export type PremiumSubscriptionStatusType = typeof PremiumSubscriptionStatus[keyof typeof PremiumSubscriptionStatus];

export const ProfileStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const;

export type ProfileStatusType = typeof ProfileStatus[keyof typeof ProfileStatus];

export const ReportStatus = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed'
} as const;

export type ReportStatusType = typeof ReportStatus[keyof typeof ReportStatus];

// ===========================
// USER TYPES
// ===========================

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
  status?: ProfileStatusType;
}

// ===========================
// PREMIUM SUBSCRIPTION TYPES
// ===========================

export interface PremiumSubscription {
  id: string;
  user_id: string;
  plan_type: 'monthly' | 'yearly' | 'lifetime';
  status: PremiumSubscriptionStatusType;
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  payment_method?: string;
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

// ===========================
// REPORT TYPES
// ===========================

export interface ListingReport {
  id: string;
  listing_id: string;
  reporter_id: string;
  report_type: 'inappropriate' | 'spam' | 'fake' | 'duplicate' | 'other';
  reason: string;
  status: ReportStatusType;
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  listing?: Listing;
  reporter?: UserProfile;
}

// ===========================
// USER ACTIVITY TYPES
// ===========================

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'login' | 'listing_created' | 'listing_updated' | 'offer_made' | 'offer_received' | 'message_sent' | 'profile_updated';
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: UserProfile;
}

// ===========================
// ADMIN PANEL TYPES
// ===========================

export interface AdminListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  images: string[];
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string;
  role: string;
  is_active: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  created_at: string;
  updated_at: string;
  last_login?: string;
  lastLoginAt?: string;
  roleDetails?: any;
  userPermissions?: any[];
  permissions?: any[];
}

export interface AdminRole {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAnalyticsData {
  totalListings: number;
  totalUsers: number;
  totalRevenue: number;
  pendingListings: number;
  activeListings: number;
  rejectedListings: number;
  monthlyStats: {
    month: string;
    listings: number;
    users: number;
    revenue: number;
  }[];
}

// ===========================
// LISTING TYPES
// ===========================

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

// Omit the user field from Listing first, then extend it with our own user field
export interface ListingWithFavorite extends Omit<Listing, 'user'> {
  user: Pick<UserProfile, 'id' | 'full_name' | 'avatar_url'>;
  is_favorited: boolean;
}

export const ListingStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  REJECTED: 'REJECTED',
  SOLD: 'SOLD',
  DELETED: 'DELETED',
  EXPIRED: 'EXPIRED'
} as const;

export type ListingStatusType = typeof ListingStatus[keyof typeof ListingStatus];

// ===========================
// MESSAGE AND CONVERSATION TYPES
// ===========================

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'system';
  created_at: string;
  is_read: boolean;
  status?: MessageStatusType;
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

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// ===========================
// COMMON TYPES
// ===========================

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
// CONFIG TYPES
// ===========================

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  apiVersion: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface SecurityConfig {
  bcryptRounds: number;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ===========================
// AUTH TYPES
// ===========================

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  admin: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    permissions: any[];
    is_active: boolean;
    last_login: string;
    created_at: string;
    updated_at: string;
  };
}

// ===========================
// ADMIN PANEL TYPES
// ===========================

export interface AdminListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  images: string[];
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string;
  role: string;
  is_active: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  created_at: string;
  updated_at: string;
  last_login?: string;
  lastLoginAt?: string;
  roleDetails?: any;
  userPermissions?: any[];
  permissions?: any[];
}

export interface AdminRole {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAnalyticsData {
  totalListings: number;
  totalUsers: number;
  totalRevenue: number;
  pendingListings: number;
  activeListings: number;
  rejectedListings: number;
  monthlyStats: {
    month: string;
    listings: number;
    users: number;
    revenue: number;
  }[];
}

// ===========================
// ADMIN MANAGEMENT TYPES
// ===========================

export interface Role {
  id: string;
  name: string;
  display_name: string;
  displayName?: string; // For backward compatibility
  description?: string;
  level: number;
  is_active: boolean;
  isActive?: boolean; // For backward compatibility
  created_at: string;
  createdAt?: string; // For backward compatibility
  updated_at: string;
  updatedAt?: string; // For backward compatibility
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  totalListings: number;
  totalUsers: number;
  totalRevenue: number;
  pendingListings: number;
  activeListings: number;
  rejectedListings: number;
  monthlyStats: {
    month: string;
    listings: number;
    users: number;
    revenue: number;
  }[];
}

// ===========================
// API PARAMETER TYPES
// ===========================

export interface GetListingsParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    status?: string;
    category?: string;
    userId?: string;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// ===========================
// USER FEEDBACK TYPES
// ===========================

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

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// ===========================
// LOCATION TYPES
// ===========================

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

export interface Category {
  code: string;
  name: string;
  icon: IconType;
}

// ===========================
// PREFERENCE TYPES
// ===========================

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
