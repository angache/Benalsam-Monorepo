export declare const serverConfig: {
    port: number;
    nodeEnv: string;
    apiVersion: string;
    host: string;
};
export declare const securityConfig: {
    corsOrigin: string[];
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
};
export declare const jwtConfig: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
};
export declare const databaseConfig: {
    url: string;
    maxConnections: number;
    idleTimeout: number;
    connectionTimeout: number;
};
export declare const uploadConfig: {
    maxFileSize: number;
    allowedMimeTypes: string[];
    uploadPath: string;
};
export declare const emailConfig: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: string;
};
export declare const redisConfig: {
    host: string;
    port: number;
    password: string | undefined;
    db: number;
};
export declare const loggingConfig: {
    level: string;
    filename: string;
    maxSize: string;
    maxFiles: string;
};
//# sourceMappingURL=app.d.ts.map