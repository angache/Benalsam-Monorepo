"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = require("../controllers/searchController");
const searchCacheService_1 = __importDefault(require("../services/searchCacheService"));
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
router.get('/cache/stats', async (req, res) => {
    try {
        const stats = searchCacheService_1.default.getStats();
        return res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Search cache stats alınamadı'
        });
    }
});
router.get('/cache/popular', async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        const popular = await searchCacheService_1.default.getPopularSearches(sessionId);
        return res.json({
            success: true,
            data: popular
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Popular searches alınamadı'
        });
    }
});
router.post('/cache/clear', async (req, res) => {
    try {
        await searchCacheService_1.default.clearAll();
        return res.json({
            success: true,
            message: 'Search cache temizlendi'
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Search cache temizlenemedi'
        });
    }
});
router.post('/cache/warm', async (req, res) => {
    try {
        const { queries } = req.body;
        if (!queries || !Array.isArray(queries)) {
            return res.status(400).json({
                success: false,
                error: 'Queries array gerekli'
            });
        }
        await searchCacheService_1.default.warmSearchCache(queries);
        return res.json({
            success: true,
            message: `${queries.length} adet query warmed`
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Search cache warming başarısız'
        });
    }
});
exports.default = router;
//# sourceMappingURL=search.js.map