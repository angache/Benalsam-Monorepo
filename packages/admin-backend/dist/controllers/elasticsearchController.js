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
    messageQueueService;
    indexerService;
    syncService;
    constructor() {
        this.elasticsearchService = new services_1.AdminElasticsearchService();
        this.messageQueueService = new services_1.MessageQueueService();
        this.indexerService = new services_1.IndexerService(this.elasticsearchService, this.messageQueueService);
        this.syncService = new services_1.SyncService(this.elasticsearchService, this.messageQueueService, this.indexerService);
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
            const status = this.syncService.getSyncStatus();
            const stats = await this.syncService.getSyncStats();
            res.json({
                success: true,
                data: {
                    status,
                    stats
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
            const result = await this.syncService.triggerManualSync();
            res.json({
                success: result.success,
                data: result,
                message: result.success ? 'Manual sync completed' : 'Manual sync failed'
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
            const queueStats = await this.messageQueueService.getStats();
            const indexerStats = this.indexerService.getStats();
            res.json({
                success: true,
                data: {
                    queue: queueStats,
                    indexer: indexerStats
                },
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
            const retryCount = await this.indexerService.retryFailedJobs();
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
            const clearedCount = await this.indexerService.clearQueue(queueType);
            res.json({
                success: true,
                data: { clearedCount },
                message: `Cleared ${clearedCount} jobs from ${queueType} queue`
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
            const config = this.syncService.getConfig();
            res.json({
                success: true,
                data: config,
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
            const { enabled, batchSize, syncInterval, maxRetries, retryDelay } = req.body;
            this.syncService.updateConfig({
                enabled,
                batchSize,
                syncInterval,
                maxRetries,
                retryDelay
            });
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
            const health = await this.syncService.healthCheck();
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
            await this.messageQueueService.testConnection();
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