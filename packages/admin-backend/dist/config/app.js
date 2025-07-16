"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminConfig = exports.redisConfig = exports.supabaseConfig = exports.stripeConfig = exports.awsConfig = exports.emailConfig = exports.fileUploadConfig = exports.securityConfig = exports.jwtConfig = exports.serverConfig = void 0;
exports.serverConfig = {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
};
exports.jwtConfig = {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
exports.securityConfig = {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
};
exports.fileUploadConfig = {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    allowedTypes: process.env.ALLOWED_IMAGE_TYPES?.split(',') || [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif'
    ],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
};
exports.emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@benalsam.com',
};
exports.awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'eu-west-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'benalsam-admin-uploads',
};
exports.stripeConfig = {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};
exports.supabaseConfig = {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};
exports.redisConfig = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
};
exports.adminConfig = {
    defaultEmail: process.env.ADMIN_DEFAULT_EMAIL || 'admin@benalsam.com',
    defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'admin123456',
};
//# sourceMappingURL=app.js.map