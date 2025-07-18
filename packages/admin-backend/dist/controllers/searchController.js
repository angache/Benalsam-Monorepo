"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const searchService_1 = require("../services/searchService");
const logger_1 = __importDefault(require("../config/logger"));
class SearchController {
    static async searchListings(req, res) {
        try {
            const { query, categories, location, urgency, minPrice, maxPrice, page = 1, pageSize = 20, sortBy = 'created_at', sortOrder = 'desc', attributes } = req.body;
            if (page < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Page must be greater than 0',
                    error: 'INVALID_PAGE'
                });
            }
            if (pageSize < 1 || pageSize > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Page size must be between 1 and 100',
                    error: 'INVALID_PAGE_SIZE'
                });
            }
            const searchParams = {
                query,
                categories,
                location,
                urgency,
                minPrice,
                maxPrice,
                page,
                pageSize,
                sortBy,
                sortOrder,
                attributes
            };
            logger_1.default.info('Search request:', searchParams);
            const result = await searchService_1.searchService.searchListings(searchParams);
            return res.status(200).json({
                success: true,
                data: result.data,
                totalCount: result.totalCount,
                searchEngine: result.searchEngine,
                responseTime: result.responseTime,
                cached: result.cached,
                pagination: result.pagination,
                metadata: result.metadata
            });
        }
        catch (error) {
            logger_1.default.error('Search listings error:', error);
            return res.status(500).json({
                success: false,
                message: 'Search operation failed',
                error: 'SEARCH_ERROR'
            });
        }
    }
    static async getSuggestions(req, res) {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Query parameter is required',
                    error: 'MISSING_QUERY'
                });
            }
            const suggestions = await searchService_1.searchService.getSuggestions(q);
            return res.status(200).json({
                success: true,
                data: suggestions
            });
        }
        catch (error) {
            logger_1.default.error('Get suggestions error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get suggestions',
                error: 'SUGGESTIONS_ERROR'
            });
        }
    }
    static async getAnalytics(req, res) {
        try {
            const analytics = await searchService_1.searchService.getAnalytics();
            return res.status(200).json({
                success: true,
                data: analytics
            });
        }
        catch (error) {
            logger_1.default.error('Get analytics error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get analytics',
                error: 'ANALYTICS_ERROR'
            });
        }
    }
    static async healthCheck(req, res) {
        try {
            const health = await searchService_1.searchService.healthCheck();
            return res.status(200).json({
                success: true,
                data: health,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.default.error('Health check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Health check failed',
                error: 'HEALTH_CHECK_ERROR'
            });
        }
    }
    static async reindex(req, res) {
        try {
            logger_1.default.info('Reindex request received');
            return res.status(200).json({
                success: true,
                message: 'Reindex operation started',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.default.error('Reindex error:', error);
            return res.status(500).json({
                success: false,
                message: 'Reindex operation failed',
                error: 'REINDEX_ERROR'
            });
        }
    }
}
exports.SearchController = SearchController;
//# sourceMappingURL=searchController.js.map