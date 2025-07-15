// ===========================
// BASE TYPES
// ===========================

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  rating?: number;
  total_ratings?: number;
  rating_sum?: number;
  trust_score?: number;
  trust_level?: 'bronze' | 'silver' | 'gold' | 'platinum';
  is_premium?: boolean;
  premium_expires_at?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: number;
  location: string;
  district?: string;
  neighborhood?: string;
  images: string[];
  main_image?: string;
  status: 'active' | 'sold' | 'expired' | 'draft';
  user_id: string;
  created_at: string;
  updated_at: string;
  is_urgent?: boolean;
  is_featured?: boolean;
  is_showcase?: boolean;
  upped_at?: string;
  view_count?: number;
  favorite_count?: number;
  offer_count?: number;
  condition?: string[];
  attributes?: Record<string, any>;
  user?: User;
  is_favorited?: boolean;
}

export interface Offer {
  id: string;
  listing_id: string;
  user_id: string;
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
  user?: User;
  listing?: Listing;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  listing?: Listing;
  buyer?: User;
  seller?: User;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: User;
}

export interface Category {
  name: string;
  label: string;
  icon?: string;
  color?: string;
  subcategories?: Category[];
  attributes?: CategoryAttribute[];
}

export interface CategoryAttribute {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
  required?: boolean;
  options?: string[];
}

export interface InventoryItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  images: string[];
  main_image?: string;
  created_at: string;
  updated_at: string;
  attributes?: Record<string, any>;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

// ===========================
// API RESPONSE TYPES
// ===========================

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
  nextCursor?: string;
}

// ===========================
// FORM TYPES
// ===========================

export interface CreateListingForm {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: number;
  location: string;
  district?: string;
  neighborhood?: string;
  images: File[];
  condition: string[];
  attributes: Record<string, any>;
}

export interface UpdateProfileForm {
  name?: string;
  username?: string;
  avatar_url?: string;
}

// ===========================
// FILTER TYPES
// ===========================

export interface ListingFilters {
  category?: string;
  subcategory?: string;
  location?: string;
  district?: string;
  minBudget?: number;
  maxBudget?: number;
  condition?: string[];
  keywords?: string;
  sortBy?: 'created_at' | 'budget' | 'view_count' | 'favorite_count';
  sortOrder?: 'asc' | 'desc';
}

// ===========================
// PREMIUM TYPES
// ===========================

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // days
  features: string[];
}

export interface UserPremium {
  user_id: string;
  feature_id: string;
  expires_at: string;
  created_at: string;
}

// ===========================
// ANALYTICS TYPES
// ===========================

export interface ListingAnalytics {
  listing_id: string;
  views: number;
  favorites: number;
  offers: number;
  conversations: number;
  period: 'day' | 'week' | 'month' | 'year';
  date: string;
}

export interface UserAnalytics {
  user_id: string;
  total_listings: number;
  total_views: number;
  total_favorites: number;
  total_offers: number;
  total_conversations: number;
  period: 'day' | 'week' | 'month' | 'year';
  date: string;
} 