"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingConfig = exports.redisConfig = exports.emailConfig = exports.uploadConfig = exports.databaseConfig = exports.jwtConfig = exports.securityConfig = exports.serverConfig = void 0;
exports.serverConfig = {
    port: parseInt(process.env.PORT || '3002'),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    host: process.env.HOST || 'localhost',
};
exports.securityConfig = {
    corsOrigin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : [
            'http://localhost:3003',
            'http://209.227.228.96:3003',
            'http://209.227.228.96:3000',
            'http://localhost:3000'
        ],
    rateLimitWindowMs: 15 * 60 * 1000,
    rateLimitMaxRequests: 100,
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: 12,
};
exports.jwtConfig = {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
exports.databaseConfig = {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/benalsam_admin',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
};
exports.uploadConfig = {
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
};
exports.emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@benalsam.com',
};
exports.redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
};
exports.loggingConfig = {
    level: process.env.LOG_LEVEL || 'info',
    filename: process.env.LOG_FILENAME || 'logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: process.env.LOG_MAX_FILES || '5',
};
//# sourceMappingURL=app.js.map