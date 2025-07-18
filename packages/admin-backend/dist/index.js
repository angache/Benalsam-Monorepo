"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const app_1 = require("./config/app");
const logger_1 = __importStar(require("./config/logger"));
const services_1 = require("./services");
dotenv_1.default.config();
const app = (0, express_1.default)();
let elasticsearchService;
let messageQueueService;
let indexerService;
let syncService;
async function initializeServices() {
    try {
        logger_1.default.info('🚀 Initializing Elasticsearch services...');
        elasticsearchService = new services_1.AdminElasticsearchService();
        await elasticsearchService.testConnection();
        logger_1.default.info('✅ Elasticsearch service initialized');
        messageQueueService = new services_1.MessageQueueService();
        await messageQueueService.testConnection();
        logger_1.default.info('✅ Message queue service initialized');
        indexerService = new services_1.IndexerService(elasticsearchService, messageQueueService);
        logger_1.default.info('✅ Indexer service initialized');
        syncService = new services_1.SyncService(elasticsearchService, messageQueueService, indexerService);
        await syncService.initialize();
        logger_1.default.info('✅ Sync service initialized');
        const shouldMigrate = process.env.ELASTICSEARCH_INITIAL_MIGRATION === 'true';
        if (shouldMigrate) {
            logger_1.default.info('🔄 Starting initial data migration...');
            await syncService.initialDataMigration();
            logger_1.default.info('✅ Initial data migration completed');
        }
    }
    catch (error) {
        logger_1.default.error('❌ Error initializing Elasticsearch services:', error);
    }
}
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: app_1.securityConfig.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: app_1.securityConfig.rateLimitWindowMs,
    max: app_1.securityConfig.rateLimitMaxRequests,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        error: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('combined', { stream: logger_1.logStream }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admin Backend API is running',
        timestamp: new Date().toISOString(),
        environment: app_1.serverConfig.nodeEnv,
        version: app_1.serverConfig.apiVersion,
    });
});
const routes_1 = __importDefault(require("./routes"));
app.use(`/api/${app_1.serverConfig.apiVersion}`, routes_1.default);
app.use((err, req, res, next) => {
    logger_1.default.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : 'INTERNAL_ERROR',
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        error: 'NOT_FOUND',
    });
});
const PORT = app_1.serverConfig.port;
const server = app.listen(PORT, async () => {
    logger_1.default.info(`🚀 Admin Backend API server running on port ${PORT}`);
    logger_1.default.info(`📊 Environment: ${app_1.serverConfig.nodeEnv}`);
    logger_1.default.info(`🔗 Health check: http://localhost:${PORT}/health`);
    logger_1.default.info(`📚 API version: ${app_1.serverConfig.apiVersion}`);
    await initializeServices();
});
async function gracefulShutdown(signal) {
    logger_1.default.info(`${signal} received, shutting down gracefully`);
    try {
        if (syncService) {
            await syncService.shutdown();
        }
        if (indexerService) {
            await indexerService.stop();
        }
        if (messageQueueService) {
            await messageQueueService.disconnect();
        }
        server.close(() => {
            logger_1.default.info('✅ Server closed');
            process.exit(0);
        });
        setTimeout(() => {
            logger_1.default.error('❌ Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    }
    catch (error) {
        logger_1.default.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
    }
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
//# sourceMappingURL=index.js.map