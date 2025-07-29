import { AnalyticsEventTypeType } from './enums';

// ===========================
// STANDARDIZED ANALYTICS TYPES
// ===========================

// Analytics User Interface
export interface AnalyticsUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  properties?: {
    registration_date?: string;
    subscription_type?: 'free' | 'premium' | 'lifetime';
    last_login?: string;
    trust_score?: number;
    verification_status?: 'unverified' | 'verified' | 'premium';
  };
}

// Analytics Session Interface
export interface AnalyticsSession {
  id: string;
  start_time: string;
  duration?: number;
  page_views?: number;
  events_count?: number;
}

// Analytics Device Interface
export interface AnalyticsDevice {
  platform: 'ios' | 'android' | 'web' | 'desktop';
  version?: string;
  model?: string;
  screen_resolution?: string;
  app_version?: string;
  os_version?: string;
  browser?: string;
  user_agent?: string;
}

// Analytics Context Interface
export interface AnalyticsContext {
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  language?: string;
  timezone?: string;
}

// Main Analytics Event Interface
export interface AnalyticsEvent {
  event_id: string;
  event_name: AnalyticsEventTypeType;
  event_timestamp: string;
  event_properties: Record<string, any>;
  user: AnalyticsUser;
  session: AnalyticsSession;
  device: AnalyticsDevice;
  context?: AnalyticsContext;
} 