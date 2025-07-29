import { Client } from '@elastic/elasticsearch';
import logger from '../config/logger';
import os from 'os';
import { performance } from 'perf_hooks';

export interface PerformanceMetric {
  timestamp: string;
  metric_type: 'api' | 'elasticsearch' | 'system' | 'database';
  metric_name: string;
  value: number;
  unit: string;
  tags?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: {
    bytes_sent: number;
    bytes_received: number;
  };
  uptime: number;
  load_average: number[];
}

export interface APIMetrics {
  endpoint: string;
  method: string;
  response_time: number;
  status_code: number;
  request_size: number;
  response_size: number;
  timestamp: string;
}

export interface ElasticsearchMetrics {
  cluster_health: string;
  index_count: number;
  document_count: number;
  query_response_time: number;
  indexing_rate: number;
  search_rate: number;
  memory_usage: number;
  cpu_usage: number;
}

export class PerformanceMonitoringService {
  private client: Client;
  private metricsIndex: string = 'performance_metrics';
  private alertsIndex: string = 'performance_alerts';

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
      // Performance Metrics Index
      await this.client.indices.create({
        index: this.metricsIndex,
        body: {
          mappings: {
            properties: {
              timestamp: { type: 'date' },
              metric_type: { type: 'keyword' },
              metric_name: { type: 'keyword' },
              value: { type: 'float' },
              unit: { type: 'keyword' },
              tags: { type: 'object', dynamic: true },
              metadata: { type: 'object', dynamic: true }
            }
          },
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            "index.lifecycle.name": "performance_metrics_policy",
            "index.lifecycle.rollover_alias": "performance_metrics"
          }
        }
      });

      // Performance Alerts Index
      await this.client.indices.create({
        index: this.alertsIndex,
        body: {
          mappings: {
            properties: {
              timestamp: { type: 'date' },
              alert_type: { type: 'keyword' },
              severity: { type: 'keyword' },
              metric_name: { type: 'keyword' },
              threshold: { type: 'float' },
              current_value: { type: 'float' },
              message: { type: 'text' },
              status: { type: 'keyword' },
              resolved_at: { type: 'date' }
            }
          }
        }
      });

      logger.info('Performance monitoring indexes initialized successfully');
      return true;
    } catch (error: any) {
      if (error.message?.includes('resource_already_exists_exception')) {
        logger.info('Performance monitoring indexes already exist');
        return true;
      }
      logger.error('Failed to initialize performance monitoring indexes:', error);
      return false;
    }
  }

  // System Performance Monitoring
  async getSystemMetrics(): Promise<SystemMetrics> {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

    const cpus = os.cpus();
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a: number, b: number) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0) / cpus.length;

    return {
      cpu_usage: Math.round(cpuUsage * 100) / 100,
      memory_usage: Math.round(memoryUsage * 100) / 100,
      disk_usage: 0, // TODO: Implement disk usage monitoring
      network_io: {
        bytes_sent: 0, // TODO: Implement network monitoring
        bytes_received: 0
      },
      uptime: os.uptime(),
      load_average: os.loadavg()
    };
  }

  async trackSystemMetrics(): Promise<boolean> {
    try {
      const metrics = await this.getSystemMetrics();
      const timestamp = new Date().toISOString();

      const performanceMetrics: PerformanceMetric[] = [
        {
          timestamp,
          metric_type: 'system',
          metric_name: 'cpu_usage',
          value: metrics.cpu_usage,
          unit: 'percentage',
          tags: { host: os.hostname() }
        },
        {
          timestamp,
          metric_type: 'system',
          metric_name: 'memory_usage',
          value: metrics.memory_usage,
          unit: 'percentage',
          tags: { host: os.hostname() }
        },
        {
          timestamp,
          metric_type: 'system',
          metric_name: 'uptime',
          value: metrics.uptime,
          unit: 'seconds',
          tags: { host: os.hostname() }
        }
      ];

      await this.client.bulk({
        body: performanceMetrics.flatMap(metric => [
          { index: { _index: this.metricsIndex } },
          metric
        ])
      });

      return true;
    } catch (error) {
      logger.error('Failed to track system metrics:', error);
      return false;
    }
  }

  // API Performance Monitoring
  async trackAPIMetrics(apiMetrics: APIMetrics): Promise<boolean> {
    try {
      const performanceMetric: PerformanceMetric = {
        timestamp: apiMetrics.timestamp,
        metric_type: 'api',
        metric_name: 'response_time',
        value: apiMetrics.response_time,
        unit: 'milliseconds',
        tags: {
          endpoint: apiMetrics.endpoint,
          method: apiMetrics.method,
          status_code: apiMetrics.status_code
        },
        metadata: {
          request_size: apiMetrics.request_size,
          response_size: apiMetrics.response_size
        }
      };

      await this.client.index({
        index: this.metricsIndex,
        body: performanceMetric
      });

      return true;
    } catch (error) {
      logger.error('Failed to track API metrics:', error);
      return false;
    }
  }

  // Elasticsearch Performance Monitoring
  async getElasticsearchMetrics(): Promise<ElasticsearchMetrics> {
    try {
      const startTime = performance.now();
      
      // Get cluster health
      const healthResponse = await this.client.cluster.health();
      
      // Get cluster stats
      const statsResponse = await this.client.cluster.stats();
      
      // Get indices stats
      const indicesResponse = await this.client.indices.stats();
      
      const endTime = performance.now();
      const queryResponseTime = endTime - startTime;

      return {
        cluster_health: (healthResponse as any).body?.status || 'unknown',
        index_count: Object.keys((indicesResponse as any).body?.indices || {}).length,
        document_count: (statsResponse as any).body?.indices?.docs?.count || 0,
        query_response_time: queryResponseTime,
        indexing_rate: (statsResponse as any).body?.indices?.indexing?.index_total || 0,
        search_rate: (statsResponse as any).body?.indices?.search?.query_total || 0,
        memory_usage: 0, // TODO: Get from cluster stats
        cpu_usage: 0 // TODO: Get from cluster stats
      };
    } catch (error) {
      logger.error('Failed to get Elasticsearch metrics:', error);
      throw error;
    }
  }

  async trackElasticsearchMetrics(): Promise<boolean> {
    try {
      const metrics = await this.getElasticsearchMetrics();
      const timestamp = new Date().toISOString();

      const performanceMetrics: PerformanceMetric[] = [
        {
          timestamp,
          metric_type: 'elasticsearch',
          metric_name: 'query_response_time',
          value: metrics.query_response_time,
          unit: 'milliseconds'
        },
        {
          timestamp,
          metric_type: 'elasticsearch',
          metric_name: 'index_count',
          value: metrics.index_count,
          unit: 'count'
        },
        {
          timestamp,
          metric_type: 'elasticsearch',
          metric_name: 'document_count',
          value: metrics.document_count,
          unit: 'count'
        }
      ];

      await this.client.bulk({
        body: performanceMetrics.flatMap(metric => [
          { index: { _index: this.metricsIndex } },
          metric
        ])
      });

      return true;
    } catch (error) {
      logger.error('Failed to track Elasticsearch metrics:', error);
      return false;
    }
  }

  // Performance Alerts
  async checkPerformanceAlerts(): Promise<any[]> {
    try {
      const alerts: any[] = [];
      const timestamp = new Date().toISOString();

      // Check system metrics
      const systemMetrics = await this.getSystemMetrics();
      
      if (systemMetrics.cpu_usage > 80) {
        alerts.push({
          timestamp,
          alert_type: 'high_cpu_usage',
          severity: 'warning',
          metric_name: 'cpu_usage',
          threshold: 80,
          current_value: systemMetrics.cpu_usage,
          message: `High CPU usage detected: ${systemMetrics.cpu_usage}%`,
          status: 'active'
        });
      }

      if (systemMetrics.memory_usage > 85) {
        alerts.push({
          timestamp,
          alert_type: 'high_memory_usage',
          severity: 'critical',
          metric_name: 'memory_usage',
          threshold: 85,
          current_value: systemMetrics.memory_usage,
          message: `High memory usage detected: ${systemMetrics.memory_usage}%`,
          status: 'active'
        });
      }

      // Check API response times
      const apiMetrics = await this.getAPIMetrics(5); // Last 5 minutes
      const avgResponseTime = apiMetrics.reduce((acc, metric) => acc + metric.response_time, 0) / apiMetrics.length;
      
      if (avgResponseTime > 500) {
        alerts.push({
          timestamp,
          alert_type: 'slow_api_response',
          severity: 'warning',
          metric_name: 'api_response_time',
          threshold: 500,
          current_value: avgResponseTime,
          message: `Slow API response time detected: ${avgResponseTime}ms`,
          status: 'active'
        });
      }

      // Store alerts
      if (alerts.length > 0) {
        await this.client.bulk({
          body: alerts.flatMap(alert => [
            { index: { _index: this.alertsIndex } },
            alert
          ])
        });
      }

      return alerts;
    } catch (error) {
      logger.error('Failed to check performance alerts:', error);
      return [];
    }
  }

  // Get Performance Metrics
  async getPerformanceMetrics(params: {
    metric_type?: string;
    metric_name?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<any> {
    try {
      const query: any = {
        bool: {
          must: []
        }
      };

      if (params.metric_type) {
        query.bool.must.push({ term: { metric_type: params.metric_type } });
      }

      if (params.metric_name) {
        query.bool.must.push({ term: { metric_name: params.metric_name } });
      }

      if (params.start_date || params.end_date) {
        const range: any = {};
        if (params.start_date) range.gte = params.start_date;
        if (params.end_date) range.lte = params.end_date;
        query.bool.must.push({ range: { timestamp: range } });
      }

      const response = await this.client.search({
        index: this.metricsIndex,
        body: {
          query,
          sort: [{ timestamp: { order: 'desc' } }],
          size: params.limit || 100
        }
      });

      return {
        total: (response as any).body?.hits?.total?.value || 0,
        metrics: (response as any).body?.hits?.hits?.map((hit: any) => ({
          ...hit._source,
          id: hit._id
        })) || []
      };
    } catch (error) {
      logger.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  async getAPIMetrics(minutes: number = 5): Promise<APIMetrics[]> {
    try {
      const startDate = new Date(Date.now() - minutes * 60 * 1000).toISOString();
      
      const response = await this.client.search({
        index: this.metricsIndex,
        body: {
          query: {
            bool: {
              must: [
                { term: { metric_type: 'api' } },
                { range: { timestamp: { gte: startDate } } }
              ]
            }
          },
          sort: [{ timestamp: { order: 'desc' } }]
        }
      });

      return (response as any).body?.hits?.hits?.map((hit: any) => ({
        endpoint: hit._source.tags.endpoint,
        method: hit._source.tags.method,
        response_time: hit._source.value,
        status_code: hit._source.tags.status_code,
        request_size: hit._source.metadata?.request_size || 0,
        response_size: hit._source.metadata?.response_size || 0,
        timestamp: hit._source.timestamp
      })) || [];
    } catch (error) {
      logger.error('Failed to get API metrics:', error);
      return [];
    }
  }

  async getActiveAlerts(): Promise<any[]> {
    try {
      const response = await this.client.search({
        index: this.alertsIndex,
        body: {
          query: {
            term: { status: 'active' }
          },
          sort: [{ timestamp: { order: 'desc' } }]
        }
      });

      return (response as any).body?.hits?.hits?.map((hit: any) => ({
        ...hit._source,
        id: hit._id
      })) || [];
    } catch (error) {
      logger.error('Failed to get active alerts:', error);
      return [];
    }
  }

  // Real-time Performance Dashboard
  async getRealTimePerformanceDashboard(): Promise<any> {
    try {
      const [systemMetrics, elasticsearchMetrics, activeAlerts] = await Promise.all([
        this.getSystemMetrics(),
        this.getElasticsearchMetrics(),
        this.getActiveAlerts()
      ]);

      const apiMetrics = await this.getAPIMetrics(5);
      const avgResponseTime = apiMetrics.length > 0 
        ? apiMetrics.reduce((acc, metric) => acc + metric.response_time, 0) / apiMetrics.length 
        : 0;

      return {
        system: {
          cpu_usage: systemMetrics.cpu_usage,
          memory_usage: systemMetrics.memory_usage,
          uptime: systemMetrics.uptime,
          load_average: systemMetrics.load_average
        },
        elasticsearch: {
          cluster_health: elasticsearchMetrics.cluster_health,
          query_response_time: elasticsearchMetrics.query_response_time,
          document_count: elasticsearchMetrics.document_count,
          index_count: elasticsearchMetrics.index_count
        },
        api: {
          avg_response_time: avgResponseTime,
          total_requests: apiMetrics.length,
          error_rate: apiMetrics.filter(m => m.status_code >= 400).length / apiMetrics.length * 100
        },
        alerts: {
          active_count: activeAlerts.length,
          critical_count: activeAlerts.filter(a => a.severity === 'critical').length,
          warning_count: activeAlerts.filter(a => a.severity === 'warning').length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get real-time performance dashboard:', error);
      throw error;
    }
  }
} 