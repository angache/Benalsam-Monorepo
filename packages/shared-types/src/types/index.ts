// Icon type for both React Native and Web
export type IconType = any; // Will be replaced with proper icon type based on platform

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

// Review related types
export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  listing_id?: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  reviewer?: UserProfile;
  reviewed?: UserProfile;
  listing?: Pick<Listing, 'id' | 'title'>;
}

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

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

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

// Auth types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  username: string;
}

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
  user?: UserProfile;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export interface District {
  code: string;
  name: string;
}

export interface Province {
  code: string;
  name: string;
  districts: District[];
}

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

export interface Category {
  code: string;
  name: string;
  icon: IconType;
}

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