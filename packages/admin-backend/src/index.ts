import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { serverConfig, securityConfig } from './config/app';
import logger, { logStream } from './config/logger';

// Elasticsearch Services
import { 
  AdminElasticsearchService, 
  MessageQueueService, 
  IndexerService, 
  SyncService 
} from './services';

// Load environment variables
dotenv.config();

const app = express();

// Initialize Elasticsearch Services
let elasticsearchService: AdminElasticsearchService;
let messageQueueService: MessageQueueService;
let indexerService: IndexerService;
let syncService: SyncService;

// Initialize services
async function initializeServices() {
  try {
    logger.info('🚀 Initializing Elasticsearch services...');

    // Initialize Elasticsearch Service
    elasticsearchService = new AdminElasticsearchService();
    await elasticsearchService.testConnection();
    logger.info('✅ Elasticsearch service initialized');

    // Initialize Message Queue Service
    messageQueueService = new MessageQueueService();
    await messageQueueService.testConnection();
    logger.info('✅ Message queue service initialized');

    // Initialize Indexer Service
    indexerService = new IndexerService(elasticsearchService, messageQueueService);
    logger.info('✅ Indexer service initialized');

    // Initialize Sync Service
    syncService = new SyncService(elasticsearchService, messageQueueService, indexerService);
    await syncService.initialize();
    logger.info('✅ Sync service initialized');

    // Start initial data migration if needed
    const shouldMigrate = process.env.ELASTICSEARCH_INITIAL_MIGRATION === 'true';
    if (shouldMigrate) {
      logger.info('🔄 Starting initial data migration...');
      await syncService.initialDataMigration();
      logger.info('✅ Initial data migration completed');
    }

  } catch (error) {
    logger.error('❌ Error initializing Elasticsearch services:', error);
    // Don't throw error, continue with app startup
  }
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: securityConfig.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: securityConfig.rateLimitWindowMs,
  max: securityConfig.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', { stream: logStream }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin Backend API is running',
    timestamp: new Date().toISOString(),
    environment: serverConfig.nodeEnv,
    version: serverConfig.apiVersion,
  });
});

// Import routes
import routes from './routes';

// API routes
app.use(`/api/${serverConfig.apiVersion}`, routes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'INTERNAL_ERROR',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: 'NOT_FOUND',
  });
});

// Start server
const PORT = serverConfig.port;

const server = app.listen(PORT, async () => {
  logger.info(`🚀 Admin Backend API server running on port ${PORT}`);
  logger.info(`📊 Environment: ${serverConfig.nodeEnv}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`📚 API version: ${serverConfig.apiVersion}`);

  // Initialize Elasticsearch services after server starts
  await initializeServices();
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully`);
  
  try {
    // Stop sync service
    if (syncService) {
      await syncService.shutdown();
    }

    // Stop indexer service
    if (indexerService) {
      await indexerService.stop();
    }

    // Disconnect message queue
    if (messageQueueService) {
      await messageQueueService.disconnect();
    }

    // Close server
    server.close(() => {
      logger.info('✅ Server closed');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);

  } catch (error) {
    logger.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

