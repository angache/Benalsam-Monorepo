import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/app';
import type { JwtPayload } from '../types';

export const jwtUtils = {
  // Sign JWT token
  sign(payload: JwtPayload): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    } as any);
  },

  // Sign refresh token
  signRefresh(payload: JwtPayload): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    } as any);
  },

  // Verify JWT token
  verify(token: string): JwtPayload {
    return jwt.verify(token, jwtConfig.secret) as JwtPayload;
  },

  // Decode JWT token without verification
  decode(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}; 