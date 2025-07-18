"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = require("../controllers/searchController");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const searchRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Çok fazla arama isteği gönderildi. Lütfen daha sonra tekrar deneyin.',
        error: 'SEARCH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.use(searchRateLimit);
router.post('/listings', searchController_1.SearchController.searchListings);
router.get('/suggestions', searchController_1.SearchController.getSuggestions);
router.get('/analytics', searchController_1.SearchController.getAnalytics);
router.get('/health', searchController_1.SearchController.healthCheck);
router.post('/reindex', searchController_1.SearchController.reindex);
exports.default = router;
//# sourceMappingURL=search.js.map