import { Client } from '@elastic/elasticsearch';
import logger from '../config/logger';

export interface UserBehaviorEvent {
  user_id: string;
  event_type: 'click' | 'scroll' | 'search' | 'favorite' | 'view' | 'share' | 'message' | 'offer';
  event_data: {
    screen_name?: string;
    section_name?: string;
    listing_id?: string;
    category_id?: string;
    search_term?: string;
    scroll_depth?: number;
    time_spent?: number;
    coordinates?: { x: number; y: number };
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

export class UserBehaviorService {
  private client: Client;
  private behaviorIndex: string = 'user_behaviors';
  private analyticsIndex: string = 'user_analytics';

  constructor(
    node: string = process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    username: string = process.env.ELASTICSEARCH_USERNAME || '',
    password: string = process.env.ELASTICSEARCH_PASSWORD || ''
  ) {
    this.client = new Client({ 
      node, 
      auth: username ? { username, password } : undefined 
    });
  }

  async initializeIndexes(): Promise<boolean> {
    try {
      // User Behaviors Index
      await this.client.indices.create({
        index: this.behaviorIndex,
        body: {
          mappings: {
            properties: {
              user_id: { type: 'keyword' },
              event_type: { type: 'keyword' },
              event_data: { type: 'object' },
              timestamp: { type: 'date' },
              session_id: { type: 'keyword' },
              device_info: { type: 'object' }
            }
          },
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0
          }
        }
      });

      // User Analytics Index
      await this.client.indices.create({
        index: this.analyticsIndex,
        body: {
          mappings: {
            properties: {
              user_id: { type: 'keyword' },
              screen_name: { type: 'keyword' },
              scroll_depth: { type: 'integer' },
              time_spent: { type: 'integer' },
              sections_engaged: { type: 'object' },
              session_start: { type: 'date' },
              session_end: { type: 'date' },
              bounce_rate: { type: 'boolean' }
            }
          },
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0
          }
        }
      });

      logger.info('✅ User behavior indexes created successfully');
      return true;
    } catch (error: any) {
      if (error.message?.includes('resource_already_exists_exception')) {
        logger.info('ℹ️ User behavior indexes already exist');
        return true;
      }
      logger.error('❌ Error creating user behavior indexes:', error);
      return false;
    }
  }

  async trackUserBehavior(event: UserBehaviorEvent): Promise<boolean> {
    try {
      await this.client.index({
        index: this.behaviorIndex,
        body: {
          ...event,
          timestamp: event.timestamp || new Date().toISOString()
        }
      });
      
      logger.info(`📊 User behavior tracked: ${event.event_type} for user ${event.user_id}`);
      return true;
    } catch (error) {
      logger.error('❌ Error tracking user behavior:', error);
      return false;
    }
  }

  async trackUserAnalytics(analytics: UserAnalytics): Promise<boolean> {
    try {
      await this.client.index({
        index: this.analyticsIndex,
        body: {
          ...analytics,
          session_start: analytics.session_start || new Date().toISOString()
        }
      });
      
      logger.info(`📈 User analytics tracked for user ${analytics.user_id}`);
      return true;
    } catch (error) {
      logger.error('❌ Error tracking user analytics:', error);
      return false;
    }
  }

  async getUserBehaviorStats(userId: string, days: number = 30): Promise<any> {
    try {
      const response = await this.client.search({
        index: this.behaviorIndex,
        body: {
          query: {
            bool: {
              must: [
                { term: { user_id: userId } },
                {
                  range: {
                    timestamp: {
                      gte: `now-${days}d`
                    }
                  }
                }
              ]
            }
          },
          aggs: {
            event_types: {
              terms: { field: 'event_type' }
            },
            daily_activity: {
              date_histogram: {
                field: 'timestamp',
                calendar_interval: 'day'
              }
            },
            popular_sections: {
              terms: { field: 'event_data.section_name' }
            }
          }
        }
      });

      return response;
    } catch (error) {
      logger.error('❌ Error getting user behavior stats:', error);
      return null;
    }
  }

  async getPopularSections(days: number = 7): Promise<any> {
    try {
      const response = await this.client.search({
        index: this.behaviorIndex,
        body: {
          query: {
            range: {
              timestamp: {
                gte: `now-${days}d`
              }
            }
          },
          aggs: {
            popular_sections: {
              terms: { field: 'event_data.section_name', size: 10 }
            },
            event_types: {
              terms: { field: 'event_type' }
            }
          }
        }
      });

      return response;
    } catch (error) {
      logger.error('❌ Error getting popular sections:', error);
      return null;
    }
  }

  async getBounceRateStats(days: number = 7): Promise<any> {
    try {
      const response = await this.client.search({
        index: this.analyticsIndex,
        body: {
          query: {
            range: {
              session_start: {
                gte: `now-${days}d`
              }
            }
          },
          aggs: {
            bounce_rate: {
              terms: { field: 'bounce_rate' }
            },
            avg_time_spent: {
              avg: { field: 'time_spent' }
            },
            avg_scroll_depth: {
              avg: { field: 'scroll_depth' }
            }
          }
        }
      });

      return response;
    } catch (error) {
      logger.error('❌ Error getting bounce rate stats:', error);
      return null;
    }
  }

  async getIndexStats(): Promise<any> {
    try {
      const behaviorStats = await this.client.indices.stats({ index: this.behaviorIndex });
      const analyticsStats = await this.client.indices.stats({ index: this.analyticsIndex });
      
      return {
        behavior_index: behaviorStats,
        analytics_index: analyticsStats
      };
    } catch (error) {
      logger.error('❌ Error getting index stats:', error);
      return null;
    }
  }

  async getPerformanceMetrics(days: number = 7, eventType: string = 'performance'): Promise<any> {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const response = await this.client.search({
        index: this.behaviorIndex,
        body: {
          query: {
            bool: {
              must: [
                { term: { event_type: eventType } },
                { range: { timestamp: { gte: fromDate.toISOString() } } }
              ]
            }
          },
          aggs: {
            metric_types: {
              terms: { field: 'event_data.metric_type.keyword' },
              aggs: {
                avg_value: { avg: { field: 'event_data.value' } },
                avg_percentage: { avg: { field: 'event_data.percentage' } },
                avg_duration: { avg: { field: 'event_data.duration_ms' } },
                error_count: { sum: { field: 'event_data.count' } }
              }
            },
            device_platforms: {
              terms: { field: 'device_info.platform.keyword' }
            },
            hourly_distribution: {
              date_histogram: {
                field: 'timestamp',
                calendar_interval: 'hour'
              }
            }
          },
          size: 0
        }
      });

      return {
        metric_types: (response.aggregations?.metric_types as any)?.buckets || [],
        device_platforms: (response.aggregations?.device_platforms as any)?.buckets || [],
        hourly_distribution: (response.aggregations?.hourly_distribution as any)?.buckets || [],
        total_events: (response.hits?.total as any)?.value || 0
      };
    } catch (error) {
      logger.error('❌ Error getting performance metrics:', error);
      return null;
    }
  }
}

export default new UserBehaviorService(); 