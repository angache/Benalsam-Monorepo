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

// Analytics Event Types
export const AnalyticsEventType = {
  // Core Events
  PAGE_VIEW: 'page_view',
  SCREEN_VIEW: 'screen_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  SEARCH: 'search',
  LISTING_VIEW: 'listing_view',
  LISTING_CREATE: 'listing_create',
  OFFER_SENT: 'offer_sent',
  MESSAGE_SENT: 'message_sent',
  
  // Performance Events
  APP_LOAD: 'app_load',
  API_CALL: 'api_call',
  ERROR_OCCURRED: 'error_occurred',
  CRASH: 'crash',
  
  // Business Events
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  PREMIUM_UPGRADED: 'premium_upgraded',
  PAYMENT_COMPLETED: 'payment_completed'
} as const;

export type AnalyticsEventTypeType = typeof AnalyticsEventType[keyof typeof AnalyticsEventType]; 