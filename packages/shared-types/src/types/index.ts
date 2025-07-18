// Icon type for both React Native and Web
export type IconType = any; // Will be replaced with proper icon type based on platform

// ===========================
// ADMIN TYPES
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

// Backward compatibility aliases for admin-backend
export type Permission = AdminPermission;
export type RolePermission = AdminRolePermission;
export type UserPermission = AdminUserPermission;

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

// Admin Activity Log types
export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Admin Workflow Assignment types
export interface AdminWorkflowAssignment {
  id: string;
  admin_profile_id?: string;
  workflow_type: string;
  resource_id?: string;
  resource_type?: string;
  priority: number;
  status: string;
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  performance_rating?: number;
}

// Admin Performance Metrics types
export interface AdminPerformanceMetric {
  id: string;
  admin_id: string;
  metric_type: string;
  target_value: number;
  achieved_percentage: number;
  created_at: string;
}

// Admin Department types
export interface AdminDepartment {
  id: string;
  name: string;
  description?: string;
  created_at: string;
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
// CONFIG TYPES
// ===========================

// Server configuration types
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

// Pagination types
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

// Admin DTOs for backend compatibility
export interface LoginDto {
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
  icon: IconType;
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