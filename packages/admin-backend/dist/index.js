"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = require("dotenv");
const supabase_js_1 = require("@supabase/supabase-js");
const index_js_1 = __importDefault(require("./routes/auth/index.js"));
const listings_js_1 = require("./routes/listings.js");
const users_js_1 = require("./routes/users.js");
const categories_js_1 = require("./routes/categories.js");
const health_js_1 = __importDefault(require("./routes/health.js"));
const monitoring_js_1 = __importDefault(require("./routes/monitoring.js"));
const elasticsearch_js_1 = __importDefault(require("./routes/elasticsearch.js"));
const index_js_2 = __importDefault(require("./routes/admin-management/index.js"));
const elasticsearchService_js_1 = require("./services/elasticsearchService.js");
const queueProcessorService_1 = __importDefault(require("./services/queueProcessorService"));
const auth_1 = require("./middleware/auth");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = __importDefault(require("./config/logger"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const elasticsearchService = new elasticsearchService_js_1.AdminElasticsearchService();
const queueProcessor = new queueProcessorService_1.default();
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
const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3003'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
    logger_1.default.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    next();
});
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Admin Backend API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: 'v1'
    });
});
app.use('/api/v1/auth', index_js_1.default);
app.use('/api/v1/listings', auth_1.authenticateToken, listings_js_1.listingsRouter);
app.use('/api/v1/users', auth_1.authenticateToken, users_js_1.usersRouter);
app.use('/api/v1/categories', auth_1.authenticateToken, categories_js_1.categoriesRouter);
app.use('/api/v1/health', health_js_1.default);
app.use('/api/v1/monitoring', monitoring_js_1.default);
app.use('/api/v1/elasticsearch', elasticsearch_js_1.default);
app.use('/api/v1/admin-management', auth_1.authenticateToken, index_js_2.default);
app.use(errorHandler_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});
const startServer = async () => {
    try {
        const { data, error } = await exports.supabase.from('admin_users').select('count').limit(1);
        if (error) {
            logger_1.default.error('❌ Database connection failed:', error);
            process.exit(1);
        }
        logger_1.default.info('✅ Database connection verified');
        try {
            await elasticsearchService.getHealth();
            logger_1.default.info('✅ Elasticsearch connection verified');
        }
        catch (error) {
            logger_1.default.warn('⚠️ Elasticsearch connection failed:', error);
        }
        try {
            await queueProcessor.startProcessing(10000);
            logger_1.default.info('✅ Queue processor started');
        }
        catch (error) {
            logger_1.default.error('❌ Queue processor failed to start:', error);
        }
        app.listen(PORT, () => {
            logger_1.default.info(`🚀 Admin Backend API running on port ${PORT}`);
            logger_1.default.info(`📊 Environment: ${process.env.NODE_ENV}`);
            logger_1.default.info(`🔗 Health check: http://localhost:${PORT}/health`);
            logger_1.default.info(`📚 API version: v1`);
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', async () => {
    logger_1.default.info('🛑 SIGTERM received, shutting down gracefully...');
    try {
        await queueProcessor.stopProcessing();
        logger_1.default.info('✅ Queue processor stopped');
    }
    catch (error) {
        logger_1.default.error('❌ Error stopping queue processor:', error);
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.default.info('🛑 SIGINT received, shutting down gracefully...');
    try {
        await queueProcessor.stopProcessing();
        logger_1.default.info('✅ Queue processor stopped');
    }
    catch (error) {
        logger_1.default.error('❌ Error stopping queue processor:', error);
    }
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map