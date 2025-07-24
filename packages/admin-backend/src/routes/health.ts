import express, { IRouter } from 'express';
import { redis } from '../config/redis';
import { elasticsearchClient } from '../services/elasticsearchService';
import { supabase } from '../config/supabase';

const router: IRouter = express.Router();

// Ana health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'unknown',
        redis: 'unknown',
        elasticsearch: 'unknown'
      }
    };

    // Database health check
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      healthStatus.services.database = 'healthy';
    } catch (error) {
      healthStatus.services.database = 'unhealthy';
      healthStatus.status = 'degraded';
    }

    // Redis health check
    try {
      await redis.ping();
      healthStatus.services.redis = 'healthy';
    } catch (error) {
      healthStatus.services.redis = 'unhealthy';
      healthStatus.status = 'degraded';
    }

    // Elasticsearch health check
    try {
      const health = await elasticsearchClient.cluster.health();
      if (health.status === 'red') {
        healthStatus.services.elasticsearch = 'unhealthy';
        healthStatus.status = 'degraded';
      } else {
        healthStatus.services.elasticsearch = 'healthy';
      }
    } catch (error) {
      healthStatus.services.elasticsearch = 'unhealthy';
      healthStatus.status = 'degraded';
    }

    // Eğer herhangi bir servis unhealthy ise genel durum degraded
    const unhealthyServices = Object.values(healthStatus.services).filter(
      status => status === 'unhealthy'
    ).length;

    if (unhealthyServices > 0) {
      healthStatus.status = 'degraded';
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
      services: {
        database: 'unknown',
        redis: 'unknown',
        elasticsearch: 'unknown'
      }
    });
  }
});

// Detaylı health check endpoint
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: 'unknown',
          responseTime: 0,
          details: {}
        },
        redis: {
          status: 'unknown',
          responseTime: 0,
          details: {}
        },
        elasticsearch: {
          status: 'unknown',
          responseTime: 0,
          details: {}
        }
      }
    };

    // Database detailed check
    const dbStart = Date.now();
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);
      
      const dbResponseTime = Date.now() - dbStart;
      
      if (error) throw error;
      
      detailedHealth.services.database = {
        status: 'healthy',
        responseTime: dbResponseTime,
        details: {
          connection: 'active',
          queryTime: `${dbResponseTime}ms`
        }
      };
    } catch (error) {
      detailedHealth.services.database = {
        status: 'unhealthy',
        responseTime: Date.now() - dbStart,
        details: {
          error: (error as Error).message,
          connection: 'failed'
        }
      };
      detailedHealth.status = 'degraded';
    }

    // Redis detailed check
    const redisStart = Date.now();
    try {
      const redisPing = await redis.ping();
      const redisResponseTime = Date.now() - redisStart;
      
      detailedHealth.services.redis = {
        status: 'healthy',
        responseTime: redisResponseTime,
        details: {
          connection: 'active',
          pingResponse: redisPing,
          responseTime: `${redisResponseTime}ms`
        }
      };
    } catch (error) {
      detailedHealth.services.redis = {
        status: 'unhealthy',
        responseTime: Date.now() - redisStart,
        details: {
          error: (error as Error).message,
          connection: 'failed'
        }
      };
      detailedHealth.status = 'degraded';
    }

    // Elasticsearch detailed check
    const esStart = Date.now();
    try {
      const health = await elasticsearchClient.cluster.health();
      const esResponseTime = Date.now() - esStart;
      
      detailedHealth.services.elasticsearch = {
        status: health.status === 'red' ? 'unhealthy' : 'healthy',
        responseTime: esResponseTime,
        details: {
          clusterStatus: health.status,
          numberOfNodes: health.number_of_nodes,
          activeShards: health.active_shards,
          responseTime: `${esResponseTime}ms`
        }
      };
      
      if (health.status === 'red') {
        detailedHealth.status = 'degraded';
      }
    } catch (error) {
      detailedHealth.services.elasticsearch = {
        status: 'unhealthy',
        responseTime: Date.now() - esStart,
        details: {
          error: (error as Error).message,
          connection: 'failed'
        }
      };
      detailedHealth.status = 'degraded';
    }

    const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(detailedHealth);

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
      services: {
        database: { status: 'unknown', responseTime: 0, details: {} },
        redis: { status: 'unknown', responseTime: 0, details: {} },
        elasticsearch: { status: 'unknown', responseTime: 0, details: {} }
      }
    });
  }
});

// Sadece database health check
router.get('/database', async (req, res) => {
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);
    
    const responseTime = Date.now() - start;
    
    if (error) throw error;
    
    res.json({
      status: 'healthy',
      service: 'database',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'database',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

// Sadece Redis health check
router.get('/redis', async (req, res) => {
  try {
    const start = Date.now();
    const pingResponse = await redis.ping();
    const responseTime = Date.now() - start;
    
    res.json({
      status: 'healthy',
      service: 'redis',
      pingResponse,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'redis',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

// Sadece Elasticsearch health check
router.get('/elasticsearch', async (req, res) => {
  try {
    const start = Date.now();
    const health = await elasticsearchClient.cluster.health();
    const responseTime = Date.now() - start;
    
    const status = health.status === 'red' ? 'unhealthy' : 'healthy';
    const statusCode = status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      status,
      service: 'elasticsearch',
      clusterStatus: health.status,
      numberOfNodes: health.number_of_nodes,
      activeShards: health.active_shards,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'elasticsearch',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 