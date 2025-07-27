import { supabase } from './supabaseClient';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

export interface UserBehaviorEvent {
  user_id: string;
  event_type: 'click' | 'scroll' | 'search' | 'favorite' | 'view' | 'share' | 'message' | 'offer' | 'performance';
  event_data: {
    screen_name?: string;
    section_name?: string;
    listing_id?: string;
    category_id?: string;
    search_term?: string;
    scroll_depth?: number;
    time_spent?: number;
    coordinates?: { x: number; y: number };
    metric_type?: string;
    value?: number;
    unit?: string;
    used_mb?: number;
    total_mb?: number;
    percentage?: number;
    endpoint?: string;
    duration_ms?: number;
    average_ms?: number;
    error_type?: string;
    context?: string;
    count?: number;
    message?: string;
    [key: string]: any;
  };
  timestamp: string;
  session_id?: string;
  device_info?: {
    platform: string;
    version: string;
    model?: string;
  };
}

export interface UserAnalytics {
  user_id: string;
  screen_name: string;
  scroll_depth: number;
  time_spent: number; // seconds
  sections_engaged: {
    [sectionName: string]: {
      time_spent: number;
      interactions: number;
    };
  };
  session_start: string;
  session_end?: string;
  bounce_rate: boolean;
}

class AnalyticsService {
  private sessionId: string | undefined = undefined;
  private sessionStartTime: number | undefined = undefined;
  private screenStartTime: number | undefined = undefined;
  private currentScreen: string | undefined = undefined;
  private scrollDepth: number = 0;
  private sectionsEngaged: { [key: string]: { time_spent: number; interactions: number } } = {};
  
  // Scroll tracking optimization
  private scrollTimeout: NodeJS.Timeout | null = null;
  private lastScrollTime: number = 0;
  private scrollThrottleMs: number = 1000; // 1 saniye
  private scrollDebounceMs: number = 500; // 500ms

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version?.toString() || 'unknown',
      model: Device.modelName || 'unknown'
    };
  }

  private async getAuthToken(): Promise<string> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || '';
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
      return '';
    }
  }

  // Track user behavior event
  async trackEvent(event: Omit<UserBehaviorEvent, 'user_id' | 'timestamp' | 'session_id' | 'device_info'>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⚠️ No user found for analytics tracking');
        return false;
      }

      const fullEvent: UserBehaviorEvent = {
        ...event,
        user_id: user.id,
        timestamp: new Date().toISOString(),
        session_id: this.sessionId,
        device_info: this.getDeviceInfo()
      };

      // Send to Elasticsearch via admin-backend
      try {
        const authToken = await this.getAuthToken();
        console.log('🔐 Auth token for analytics:', authToken ? 'Token exists' : 'No token');
        
                      const response = await fetch('http://192.168.1.6:3002/api/v1/analytics/track-behavior', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            event_type: fullEvent.event_type,
            event_data: fullEvent.event_data,
            session_id: fullEvent.session_id,
            device_info: fullEvent.device_info
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to track analytics to Elasticsearch:', errorText);
          return false;
        }

        console.log(`📊 Analytics tracked to Elasticsearch: ${event.event_type}`);
        return true;
      } catch (error) {
        console.error('❌ Elasticsearch analytics error:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error tracking analytics:', error);
      return false;
    }
  }

  // Track screen view
  async trackScreenView(screenName: string): Promise<void> {
    // End previous screen session
    if (this.currentScreen && this.screenStartTime) {
      const timeSpent = Math.floor((Date.now() - this.screenStartTime) / 1000);
      await this.trackEvent({
        event_type: 'view',
        event_data: {
          screen_name: this.currentScreen,
          time_spent: timeSpent,
          scroll_depth: this.scrollDepth
        }
      });
    }

    // Start new screen session
    this.currentScreen = screenName;
    this.screenStartTime = Date.now();
    this.scrollDepth = 0;
    this.sectionsEngaged = {};

    console.log(`📱 Screen view tracked: ${screenName}`);
  }

  // Track scroll depth with optimization
  async trackScrollDepth(depth: number, sectionName?: string): Promise<void> {
    const now = Date.now();
    
    // Throttle: Minimum 1 saniye aralıkla
    if (now - this.lastScrollTime < this.scrollThrottleMs) {
      return;
    }
    
    this.scrollDepth = Math.max(this.scrollDepth, depth);
    
    if (sectionName) {
      if (!this.sectionsEngaged[sectionName]) {
        this.sectionsEngaged[sectionName] = { time_spent: 0, interactions: 0 };
      }
      this.sectionsEngaged[sectionName].interactions++;
    }

    // Clear previous timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Debounce: Scroll durduktan 500ms sonra track et
    this.scrollTimeout = setTimeout(async () => {
      this.lastScrollTime = Date.now();
      
      await this.trackEvent({
        event_type: 'scroll',
        event_data: {
          screen_name: this.currentScreen,
          section_name: sectionName,
          scroll_depth: depth
        }
      });
    }, this.scrollDebounceMs);
  }

  // Track click
  async trackClick(sectionName: string, listingId?: string, categoryId?: string): Promise<void> {
    if (this.sectionsEngaged[sectionName]) {
      this.sectionsEngaged[sectionName].interactions++;
    }

    await this.trackEvent({
      event_type: 'click',
      event_data: {
        screen_name: this.currentScreen,
        section_name: sectionName,
        listing_id: listingId,
        category_id: categoryId
      }
    });
  }

  // Track search
  async trackSearch(searchTerm: string): Promise<void> {
    await this.trackEvent({
      event_type: 'search',
      event_data: {
        screen_name: this.currentScreen,
        search_term: searchTerm
      }
    });
  }

  // Track favorite
  async trackFavorite(listingId: string, action: 'add' | 'remove'): Promise<void> {
    await this.trackEvent({
      event_type: 'favorite',
      event_data: {
        screen_name: this.currentScreen,
        listing_id: listingId,
        action: action
      }
    });
  }

  // Track listing view
  async trackListingView(listingId: string, categoryId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'view',
      event_data: {
        screen_name: this.currentScreen,
        listing_id: listingId,
        category_id: categoryId
      }
    });
  }

  // Track share
  async trackShare(listingId: string, method: string): Promise<void> {
    await this.trackEvent({
      event_type: 'share',
      event_data: {
        screen_name: this.currentScreen,
        listing_id: listingId,
        method: method
      }
    });
  }

  // Track message
  async trackMessage(listingId: string, conversationId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'message',
      event_data: {
        screen_name: this.currentScreen,
        listing_id: listingId,
        conversation_id: conversationId
      }
    });
  }

  // Track offer
  async trackOffer(listingId: string, offerAmount: number): Promise<void> {
    await this.trackEvent({
      event_type: 'offer',
      event_data: {
        screen_name: this.currentScreen,
        listing_id: listingId,
        offer_amount: offerAmount
      }
    });
  }

  // End session and send analytics
  async endSession(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !this.sessionStartTime) return;

      // End current screen session
      if (this.currentScreen && this.screenStartTime) {
        const timeSpent = Math.floor((Date.now() - this.screenStartTime) / 1000);
        await this.trackEvent({
          event_type: 'view',
          event_data: {
            screen_name: this.currentScreen,
            time_spent: timeSpent,
            scroll_depth: this.scrollDepth
          }
        });
      }

      // Calculate session analytics
      const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      const bounceRate = sessionDuration < 10; // Less than 10 seconds = bounce

      const analytics: UserAnalytics = {
        user_id: user.id,
        screen_name: this.currentScreen || 'unknown',
        scroll_depth: this.scrollDepth,
        time_spent: sessionDuration,
        sections_engaged: this.sectionsEngaged,
        session_start: new Date(this.sessionStartTime).toISOString(),
        session_end: new Date().toISOString(),
        bounce_rate: bounceRate
      };

      // Send analytics to admin-backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_ADMIN_BACKEND_URL}/api/v1/analytics/track-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(analytics)
      });

      if (response.ok) {
        console.log('📈 Session analytics sent successfully');
      } else {
        console.error('❌ Failed to send session analytics:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error ending session:', error);
    }
  }

  // Get user behavior stats (for debugging)
  async getUserStats(days: number = 30): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const response = await fetch(`${process.env.EXPO_PUBLIC_ADMIN_BACKEND_URL}/api/v1/analytics/user-stats/${user.id}?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        console.error('❌ Failed to get user stats:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting user stats:', error);
      return null;
    }
  }
}

export default new AnalyticsService(); 