import { ServerConfig, JwtConfig, SecurityConfig } from '@/types';
export declare const serverConfig: ServerConfig;
export declare const jwtConfig: JwtConfig;
export declare const securityConfig: SecurityConfig;
export declare const fileUploadConfig: {
    maxSize: number;
    allowedTypes: string[];
    uploadPath: string;
};
export declare const emailConfig: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
};
export declare const awsConfig: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket: string;
};
export declare const stripeConfig: {
    secretKey: string;
    webhookSecret: string;
};
export declare const supabaseConfig: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
};
export declare const redisConfig: {
    url: string;
};
export declare const adminConfig: {
    defaultEmail: string;
    defaultPassword: string;
};
//# sourceMappingURL=app.d.ts.map