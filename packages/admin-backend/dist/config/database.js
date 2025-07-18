"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = exports.supabase = void 0;
const supabase_1 = require("./supabase");
Object.defineProperty(exports, "supabase", { enumerable: true, get: function () { return supabase_1.supabase; } });
const databaseConfig = {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};
exports.databaseConfig = databaseConfig;
//# sourceMappingURL=database.js.map