"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("../config/app");
exports.jwtUtils = {
    sign(payload) {
        return jsonwebtoken_1.default.sign(payload, app_1.jwtConfig.secret, {
            expiresIn: app_1.jwtConfig.expiresIn,
        });
    },
    signRefresh(payload) {
        return jsonwebtoken_1.default.sign(payload, app_1.jwtConfig.secret, {
            expiresIn: app_1.jwtConfig.refreshExpiresIn,
        });
    },
    verify(token) {
        return jsonwebtoken_1.default.verify(token, app_1.jwtConfig.secret);
    },
    verifySupabaseToken(token) {
        try {
            if (!token || token.trim() === '') {
                throw new Error('Empty token');
            }
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!decoded || typeof decoded === 'string') {
                throw new Error('Invalid token format');
            }
            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < now) {
                throw new Error('Token expired');
            }
            return decoded;
        }
        catch (error) {
            throw new Error('Invalid Supabase token');
        }
    },
    decode(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch (error) {
            return null;
        }
    }
};
//# sourceMappingURL=jwt.js.map