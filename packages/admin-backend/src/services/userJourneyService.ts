import { Client } from '@elastic/elasticsearch';
import logger from '../config/logger';

export interface UserJourneyEvent {
  user_id: string;
  session_id: string;
  event_type: 'page_view' | 'click' | 'scroll' | 'search' | 'favorite' | 'message' | 'offer' | 'conversion' | 'drop_off';
  event_data: {
    page_name: string;
    section_name?: string;
    element_id?: string;
    element_type?: string;
    coordinates?: { x: number; y: number };
    scroll_depth?: number;
    time_spent?: number;
    search_term?: string;
    listing_id?: string;
    category_id?: string;
    conversion_value?: number;
    drop_off_reason?: string;
    [key: string]: any;
  };
  timestamp: string;
  device_info?: {
    platform: string;
    version: string;
    model?: string;
    screen_size?: string;
  };
  user_profile?: {
    id: string;
    email: string;
    name: string;
    registration_date: string;
    subscription_type?: string;
    location?: string;
  };
}

export interface UserJourney {
  user_id: string;
  session_id: string;
  journey_id: string;
  start_time: string;
  end_time?: string;
  duration: number; // seconds
  events: UserJourneyEvent[];
  conversion_achieved: boolean;
  conversion_value?: number;
  drop_off_point?: string;
  drop_off_reason?: string;
  engagement_score: number; // 0-100
  path_efficiency: number; // 0-100
}

export interface JourneyAnalysis {
  total_journeys: number;
  conversion_rate: number;
  average_duration: number;
  drop_off_points: Array<{
    page_name: string;
    drop_off_count: number;
    drop_off_rate: number;
    common_reasons: string[];
  }>;
  popular_paths: Array<{
    path: string[];
    frequency: number;
    conversion_rate: number;
    average_duration: number;
  }>;
  user_segments: Array<{
    segment_name: string;
    user_count: number;
    conversion_rate: number;
    average_engagement: number;
  }>;
}

export interface JourneyOptimization {
  bottleneck_identification: Array<{
    page_name: string;
    issue_type: 'high_drop_off' | 'low_engagement' | 'slow_load' | 'poor_ux';
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact_score: number;
    recommendations: string[];
  }>;
  conversion_optimization: Array<{
    page_name: string;
    current_conversion_rate: number;
    target_conversion_rate: number;
    optimization_opportunities: string[];
    estimated_impact: number;
  }>;
  user_experience_improvements: Array<{
    area: string;
    current_score: number;
    improvement_suggestions: string[];
    priority: 'low' | 'medium' | 'high';
  }>;
}

export class UserJourneyService {
  private client: Client;
  private journeyIndex: string = 'user_journeys';
  private analysisIndex: string = 'journey_analysis';

  constructor(
    node: string = process.env.ELASTICSEARCH_URL || 'http://209.227.228.96:9200',
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
      // User Journeys Index
      await this.client.indices.create({
        index: this.journeyIndex,
        body: {
          mappings: {
            properties: {
              journey_id: { type: 'keyword' },
              user_id: { type: 'keyword' },
              session_id: { type: 'keyword' },
              start_time: { type: 'date' },
              end_time: { type: 'date' },
              duration: { type: 'long' },
              conversion_achieved: { type: 'boolean' },
              conversion_value: { type: 'float' },
              drop_off_point: { type: 'keyword' },
              drop_off_reason: { type: 'text' },
              engagement_score: { type: 'float' },
              path_efficiency: { type: 'float' },
              events: {
                type: 'nested',
                properties: {
                  event_type: { type: 'keyword' },
                  timestamp: { type: 'date' },
                  page_name: { type: 'keyword' },
                  section_name: { type: 'keyword' },
                  element_id: { type: 'keyword' },
                  element_type: { type: 'keyword' },
                  scroll_depth: { type: 'float' },
                  time_spent: { type: 'long' },
                  search_term: { type: 'text' },
                  listing_id: { type: 'keyword' },
                  category_id: { type: 'keyword' },
                  conversion_value: { type: 'float' },
                  drop_off_reason: { type: 'text' }
                }
              },
              user_profile: {
                type: 'object',
                properties: {
                  id: { type: 'keyword' },
                  email: { type: 'keyword' },
                  name: { type: 'text' },
                  registration_date: { type: 'date' },
                  subscription_type: { type: 'keyword' },
                  location: { type: 'keyword' }
                }
              },
              device_info: {
                type: 'object',
                properties: {
                  platform: { type: 'keyword' },
                  version: { type: 'keyword' },
                  model: { type: 'keyword' },
                  screen_size: { type: 'keyword' }
                }
              }
            }
          }
        }
      });

      // Journey Analysis Index
      await this.client.indices.create({
        index: this.analysisIndex,
        body: {
          mappings: {
            properties: {
              analysis_id: { type: 'keyword' },
              analysis_type: { type: 'keyword' },
              timestamp: { type: 'date' },
              date_range: {
                type: 'object',
                properties: {
                  start_date: { type: 'date' },
                  end_date: { type: 'date' }
                }
              },
              metrics: { type: 'object', dynamic: true },
              insights: { type: 'object', dynamic: true },
              recommendations: { type: 'object', dynamic: true }
            }
          }
        }
      });

      logger.info('User Journey indexes initialized successfully');
      return true;
    } catch (error: any) {
      if (error.message.includes('resource_already_exists_exception')) {
        logger.info('User Journey indexes already exist');
        return true;
      }
      logger.error('Error initializing user journey indexes:', error);
      return false;
    }
  }

  async trackJourneyEvent(event: UserJourneyEvent): Promise<boolean> {
    try {
      const journeyId = `${event.user_id}_${event.session_id}`;
      
      // Check if journey exists
      const existingJourney = await this.client.search({
        index: this.journeyIndex,
        body: {
          query: {
            bool: {
              must: [
                { term: { journey_id: journeyId } }
              ]
            }
          },
          size: 1
        }
      });

      if (existingJourney.hits.hits.length > 0) {
        // Update existing journey
        const journeyDoc = existingJourney.hits.hits[0];
        const journey = journeyDoc._source as any;
        
        journey.events.push(event);
        journey.end_time = event.timestamp;
        journey.duration = Math.floor((new Date(event.timestamp).getTime() - new Date(journey.start_time).getTime()) / 1000);
        
        // Update conversion status
        if (event.event_type === 'conversion') {
          journey.conversion_achieved = true;
          journey.conversion_value = event.event_data.conversion_value || 0;
        }
        
        // Update drop-off point
        if (event.event_type === 'drop_off') {
          journey.drop_off_point = event.event_data.page_name;
          journey.drop_off_reason = event.event_data.drop_off_reason;
        }
        
        // Recalculate engagement score
        journey.engagement_score = this.calculateEngagementScore(journey.events);
        journey.path_efficiency = this.calculatePathEfficiency(journey.events);

        await this.client.update({
          index: this.journeyIndex,
          id: journeyDoc._id!,
          body: {
            doc: journey
          }
        });
      } else {
        // Create new journey
        const newJourney: UserJourney = {
          journey_id: journeyId,
          user_id: event.user_id,
          session_id: event.session_id,
          start_time: event.timestamp,
          end_time: event.timestamp,
          duration: 0,
          events: [event],
          conversion_achieved: event.event_type === 'conversion',
          conversion_value: event.event_type === 'conversion' ? (event.event_data.conversion_value || 0) : undefined,
          drop_off_point: event.event_type === 'drop_off' ? event.event_data.page_name : undefined,
          drop_off_reason: event.event_type === 'drop_off' ? event.event_data.drop_off_reason : undefined,
          engagement_score: this.calculateEngagementScore([event]),
          path_efficiency: this.calculatePathEfficiency([event])
        };

        await this.client.index({
          index: this.journeyIndex,
          body: newJourney
        });
      }

      return true;
    } catch (error: any) {
      logger.error('Error tracking journey event:', error);
      return false;
    }
  }

  private calculateEngagementScore(events: UserJourneyEvent[]): number {
    let score = 0;
    
    events.forEach(event => {
      switch (event.event_type) {
        case 'page_view':
          score += 1;
          break;
        case 'click':
          score += 2;
          break;
        case 'scroll':
          score += Math.min(event.event_data.scroll_depth || 0, 100) / 100 * 3;
          break;
        case 'search':
          score += 5;
          break;
        case 'favorite':
          score += 8;
          break;
        case 'message':
          score += 10;
          break;
        case 'offer':
          score += 15;
          break;
        case 'conversion':
          score += 50;
          break;
      }
      
      // Time spent bonus
      if (event.event_data.time_spent) {
        score += Math.min(event.event_data.time_spent / 60, 10); // Max 10 points for time spent
      }
    });
    
    return Math.min(score, 100); // Cap at 100
  }

  private calculatePathEfficiency(events: UserJourneyEvent[]): number {
    if (events.length < 2) return 100;
    
    const pageViews = events.filter(e => e.event_type === 'page_view');
    const conversions = events.filter(e => e.event_type === 'conversion');
    
    if (conversions.length === 0) return 0;
    
    // Ideal path length (example: 3-5 pages for conversion)
    const idealPathLength = 4;
    const actualPathLength = pageViews.length;
    
    const efficiency = Math.max(0, 100 - Math.abs(actualPathLength - idealPathLength) * 10);
    return Math.min(efficiency, 100);
  }

  async analyzeUserJourneys(days: number = 7): Promise<JourneyAnalysis> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const response = await this.client.search({
        index: this.journeyIndex,
        body: {
          query: {
            range: {
              start_time: {
                gte: startDate.toISOString()
              }
            }
          },
          size: 1000,
          aggs: {
            total_journeys: { value_count: { field: 'journey_id' } },
            conversion_rate: {
              filter: { term: { conversion_achieved: true } }
            },
            avg_duration: { avg: { field: 'duration' } },
            drop_off_points: {
              terms: { field: 'drop_off_point', size: 10 },
              aggs: {
                drop_off_rate: {
                  bucket_script: {
                    buckets_path: { count: '_count' },
                    script: 'params.count / params.total * 100'
                  }
                }
              }
            },
            popular_paths: {
              nested: { path: 'events' },
              aggs: {
                page_sequences: {
                  terms: { field: 'events.page_name', size: 20 }
                }
              }
            }
          }
        }
      });

      const totalJourneys = (response.aggregations?.total_journeys as any)?.value || 0;
      const conversionCount = (response.aggregations?.conversion_rate as any)?.doc_count || 0;
      const conversionRate = totalJourneys > 0 ? (conversionCount / totalJourneys) * 100 : 0;
      const averageDuration = (response.aggregations?.avg_duration as any)?.value || 0;

      // Process drop-off points
      const dropOffPoints = ((response.aggregations?.drop_off_points as any)?.buckets || []).map((bucket: any) => ({
        page_name: bucket.key,
        drop_off_count: bucket.doc_count,
        drop_off_rate: bucket.drop_off_rate?.value || 0,
        common_reasons: [] // Would need additional analysis for reasons
      }));

      // Process popular paths (simplified)
      const popularPaths = [
        {
          path: ['Home', 'Search', 'Listing', 'Contact'],
          frequency: Math.floor(totalJourneys * 0.3),
          conversion_rate: 25,
          average_duration: 180
        }
      ];

      // User segments (simplified)
      const userSegments = [
        {
          segment_name: 'New Users',
          user_count: Math.floor(totalJourneys * 0.4),
          conversion_rate: 15,
          average_engagement: 65
        },
        {
          segment_name: 'Returning Users',
          user_count: Math.floor(totalJourneys * 0.6),
          conversion_rate: 35,
          average_engagement: 85
        }
      ];

      return {
        total_journeys: totalJourneys,
        conversion_rate: conversionRate,
        average_duration: averageDuration,
        drop_off_points: dropOffPoints,
        popular_paths: popularPaths,
        user_segments: userSegments
      };
    } catch (error: any) {
      logger.error('Error analyzing user journeys:', error);
      throw error;
    }
  }

  async getJourneyOptimizationRecommendations(days: number = 7): Promise<JourneyOptimization> {
    try {
      const analysis = await this.analyzeUserJourneys(days);
      
      // Identify bottlenecks
      const bottlenecks = analysis.drop_off_points.map(point => ({
        page_name: point.page_name,
        issue_type: 'high_drop_off' as const,
        severity: point.drop_off_rate > 50 ? 'critical' as const : 
                 point.drop_off_rate > 30 ? 'high' as const :
                 point.drop_off_rate > 15 ? 'medium' as const : 'low' as const,
        impact_score: point.drop_off_rate,
        recommendations: [
          'Improve page load speed',
          'Simplify user interface',
          'Add clear call-to-action buttons',
          'Optimize mobile responsiveness'
        ]
      }));

      // Conversion optimization
      const conversionOptimization = [
        {
          page_name: 'Listing Detail',
          current_conversion_rate: 25,
          target_conversion_rate: 40,
          optimization_opportunities: [
            'Add trust indicators (reviews, ratings)',
            'Improve contact form design',
            'Add urgency elements',
            'Show related listings'
          ],
          estimated_impact: 15
        }
      ];

      // User experience improvements
      const userExperienceImprovements = [
        {
          area: 'Navigation',
          current_score: 75,
          improvement_suggestions: [
            'Add breadcrumb navigation',
            'Improve search functionality',
            'Add quick filters',
            'Optimize menu structure'
          ],
          priority: 'high' as const
        },
        {
          area: 'Mobile Experience',
          current_score: 80,
          improvement_suggestions: [
            'Optimize touch targets',
            'Improve loading times',
            'Add swipe gestures',
            'Enhance mobile forms'
          ],
          priority: 'medium' as const
        }
      ];

      return {
        bottleneck_identification: bottlenecks,
        conversion_optimization: conversionOptimization,
        user_experience_improvements: userExperienceImprovements
      };
    } catch (error: any) {
      logger.error('Error getting journey optimization recommendations:', error);
      throw error;
    }
  }

  async getUserJourney(userId: string, days: number = 7): Promise<UserJourney[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const response = await this.client.search({
        index: this.journeyIndex,
        body: {
          query: {
            bool: {
              must: [
                { term: { user_id: userId } },
                {
                  range: {
                    start_time: {
                      gte: startDate.toISOString()
                    }
                  }
                }
              ]
            }
          },
          sort: [{ start_time: { order: 'desc' } }],
          size: 50
        }
      });

      return response.hits.hits.map((hit: any) => hit._source as UserJourney);
    } catch (error: any) {
      logger.error('Error getting user journey:', error);
      throw error;
    }
  }

  async getRealTimeJourneyMetrics(): Promise<any> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const response = await this.client.search({
        index: this.journeyIndex,
        body: {
          query: {
            range: {
              start_time: {
                gte: oneHourAgo.toISOString()
              }
            }
          },
          size: 0,
          aggs: {
            active_journeys: { value_count: { field: 'journey_id' } },
            conversions_last_hour: {
              filter: { term: { conversion_achieved: true } }
            },
            avg_engagement: { avg: { field: 'engagement_score' } },
            top_pages: {
              nested: { path: 'events' },
              aggs: {
                page_views: {
                  terms: { field: 'events.page_name', size: 5 }
                }
              }
            }
          }
        }
      });

      return {
        active_journeys: (response.aggregations?.active_journeys as any)?.value || 0,
        conversions_last_hour: (response.aggregations?.conversions_last_hour as any)?.doc_count || 0,
        avg_engagement: (response.aggregations?.avg_engagement as any)?.value || 0,
        top_pages: (((response.aggregations?.top_pages as any)?.page_views as any)?.buckets || []).map((bucket: any) => ({
          page_name: bucket.key,
          views: bucket.doc_count
        }))
      };
    } catch (error: any) {
      logger.error('Error getting real-time journey metrics:', error);
      throw error;
    }
  }
}

export default new UserJourneyService(); 