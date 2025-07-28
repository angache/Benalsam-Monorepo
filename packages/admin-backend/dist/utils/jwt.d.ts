import type { JwtPayload } from '../types';
export declare const jwtUtils: {
    sign(payload: JwtPayload): string;
    signRefresh(payload: JwtPayload): string;
    verify(token: string): JwtPayload;
    verifySupabaseToken(token: string): any;
    decode(token: string): JwtPayload | null;
};
//# sourceMappingURL=jwt.d.ts.map