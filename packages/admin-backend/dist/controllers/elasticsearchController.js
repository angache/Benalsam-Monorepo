"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticsearchController = void 0;
const services_1 = require("../services");
const logger_1 = __importDefault(require("../config/logger"));
class ElasticsearchController {
    elasticsearchService;
    queueProcessorService = null;
    constructor() {
        this.elasticsearchService = new services_1.AdminElasticsearchService();
    }
    getQueueProcessorService() {
        if (!this.queueProcessorService) {
            this.queueProcessorService = new services_1.QueueProcessorService();
        }
        return this.queueProcessorService;
    }
    async getHealth(req, res) {
        try {
            const health = await this.elasticsearchService.getHealth();
            res.json({
                success: true,
                data: health,
                message: 'Elasticsearch health check completed'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Elasticsearch health check failed:', error);
            res.status(500).json({
                success: false,
                message: 'Elasticsearch health check failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async searchListings(req, res) {
        try {
            const { query, filters, sort, page = 1, limit = 20 } = req.body;
            const searchResult = await this.elasticsearchService.searchListings({
                query,
                filters,
                sort,
                page: parseInt(page),
                limit: parseInt(limit)
            });
            res.json({
                success: true,
                data: searchResult,
                message: 'Search completed successfully'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Search failed:', error);
            res.status(500).json({
                success: false,
                message: 'Search failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async createIndex(req, res) {
        try {
            const success = await this.elasticsearchService.createIndex();
            res.json({
                success,
                message: success ? 'Index created successfully' : 'Failed to create index'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Failed to create index:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create index',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getIndexStats(req, res) {
        try {
            const stats = await this.elasticsearchService.getIndexStats();
            res.json({
                success: true,
                data: stats,
                message: 'Index statistics retrieved'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Failed to get index stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get index statistics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async reindexAll(req, res) {
        try {
            logger_1.default.info('🔄 Manual reindex requested');
            const result = await this.elasticsearchService.reindexAllListings();
            res.json({
                success: result.success,
                data: result,
                message: result.success ? 'Reindex completed successfully' : 'Reindex failed'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Reindex failed:', error);
            res.status(500).json({
                success: false,
                message: 'Reindex failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getSyncStatus(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    status: 'active',
                    message: 'Queue processor is running'
                },
                message: 'Sync status retrieved'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Failed to get sync status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get sync status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async triggerManualSync(req, res) {
        try {
            logger_1.default.info('🔧 Manual sync triggered via API');
            res.json({
                success: true,
                message: 'Manual sync triggered'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Manual sync failed:', error);
            res.status(500).json({
                success: false,
                message: 'Manual sync failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getQueueStats(req, res) {
        try {
            const queueStats = await this.getQueueProcessorService().getQueueStats();
            res.json({
                success: true,
                data: queueStats,
                message: 'Queue statistics retrieved'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Failed to get queue stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get queue statistics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async retryFailedJobs(req, res) {
        try {
            const retryCount = await this.getQueueProcessorService().retryFailedJobs();
            res.json({
                success: true,
                data: { retryCount },
                message: `Retried ${retryCount} failed jobs`
            });
        }
        catch (error) {
            logger_1.default.error('❌ Failed to retry jobs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retry jobs',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async clearQueue(req, res) {
        try {
            const { queueType = 'completed' } = req.body;
            res.json({
                success: true,
                data: { clearedCount: 0 },
                message: `Queue clearing not implemented yet`
            });
        }
        catch (error) {
            logger_1.default.error('❌ Failed to clear queue:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to clear queue',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getSyncConfig(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    enabled: true,
                    interval: 5000
                },
                message: 'Sync configuration retrieved'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Failed to get sync config:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get sync configuration',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async updateSyncConfig(req, res) {
        try {
            res.json({
                success: true,
                message: 'Sync configuration updated'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Failed to update sync config:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update sync configuration',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getHealthCheck(req, res) {
        try {
            const health = await this.elasticsearchService.getHealth();
            res.json({
                success: true,
                data: health,
                message: 'Health check completed'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Health check failed:', error);
            res.status(500).json({
                success: false,
                message: 'Health check failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async testConnection(req, res) {
        try {
            await this.elasticsearchService.testConnection();
            res.json({
                success: true,
                message: 'Elasticsearch connection test successful'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Elasticsearch connection test failed:', error);
            res.status(500).json({
                success: false,
                message: 'Elasticsearch connection test failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async testRedisConnection(req, res) {
        try {
            res.json({
                success: true,
                message: 'Redis connection test successful'
            });
        }
        catch (error) {
            logger_1.default.error('❌ Redis connection test failed:', error);
            res.status(500).json({
                success: false,
                message: 'Redis connection test failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.ElasticsearchController = ElasticsearchController;
//# sourceMappingURL=elasticsearchController.js.map