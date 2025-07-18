"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const logger_1 = __importDefault(require("../config/logger"));
class SyncService {
    elasticsearchService;
    messageQueue;
    indexer;
    config;
    syncStatus;
    syncInterval = null;
    isInitialized = false;
    constructor(elasticsearchService, messageQueue, indexer, config = {}) {
        this.elasticsearchService = elasticsearchService;
        this.messageQueue = messageQueue;
        this.indexer = indexer;
        this.config = {
            enabled: config.enabled ?? true,
            batchSize: config.batchSize || 100,
            syncInterval: config.syncInterval || 300000,
            maxRetries: config.maxRetries || 3,
            retryDelay: config.retryDelay || 1000,
        };
        this.syncStatus = {
            isRunning: false,
            lastSyncAt: null,
            nextSyncAt: null,
            totalSynced: 0,
            errors: [],
            progress: 0,
        };
    }
    async initialize() {
        try {
            if (this.isInitialized) {
                logger_1.default.warn('⚠️ Sync service already initialized');
                return;
            }
            logger_1.default.info('🚀 Initializing sync service...');
            await this.elasticsearchService.testConnection();
            logger_1.default.info('✅ Elasticsearch connection verified');
            if (!this.messageQueue.isQueueConnected()) {
                throw new Error('Redis not connected');
            }
            logger_1.default.info('✅ Redis connection verified');
            await this.indexer.start();
            logger_1.default.info('✅ Indexer started');
            if (this.config.enabled) {
                this.startSyncInterval();
            }
            this.isInitialized = true;
            logger_1.default.info('✅ Sync service initialized successfully');
        }
        catch (error) {
            logger_1.default.error('❌ Error initializing sync service:', error);
            throw error;
        }
    }
    async shutdown() {
        try {
            logger_1.default.info('🛑 Shutting down sync service...');
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
                this.syncInterval = null;
            }
            await this.indexer.stop();
            this.isInitialized = false;
            this.syncStatus.isRunning = false;
            logger_1.default.info('✅ Sync service shut down successfully');
        }
        catch (error) {
            logger_1.default.error('❌ Error shutting down sync service:', error);
            throw error;
        }
    }
    async initialDataMigration() {
        try {
            if (this.syncStatus.isRunning) {
                throw new Error('Sync already running');
            }
            this.syncStatus.isRunning = true;
            this.syncStatus.progress = 0;
            this.syncStatus.errors = [];
            logger_1.default.info('🔄 Starting initial data migration...');
            await this.elasticsearchService.createIndex();
            this.syncStatus.progress = 10;
            const result = await this.elasticsearchService.reindexAllListings();
            this.syncStatus.progress = 90;
            if (result.success) {
                this.syncStatus.totalSynced = result.count;
                this.syncStatus.lastSyncAt = new Date().toISOString();
                this.syncStatus.progress = 100;
                logger_1.default.info(`✅ Initial migration completed: ${result.count} documents`);
            }
            else {
                this.syncStatus.errors = result.errors;
                logger_1.default.error(`❌ Initial migration failed: ${result.errors.length} errors`);
            }
            this.syncStatus.isRunning = false;
            return result;
        }
        catch (error) {
            this.syncStatus.isRunning = false;
            this.syncStatus.errors.push(error instanceof Error ? error.message : 'Unknown error');
            logger_1.default.error('❌ Initial migration failed:', error);
            throw error;
        }
    }
    async incrementalSync() {
        try {
            if (this.syncStatus.isRunning) {
                logger_1.default.warn('⚠️ Sync already running, skipping incremental sync');
                return { success: false, count: 0, errors: ['Sync already running'] };
            }
            this.syncStatus.isRunning = true;
            this.syncStatus.progress = 0;
            logger_1.default.info('🔄 Starting incremental sync...');
            const queueStats = await this.messageQueue.getStats();
            const pendingJobs = queueStats.pending;
            if (pendingJobs > 0) {
                logger_1.default.info(`📥 Processing ${pendingJobs} pending jobs`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                this.syncStatus.progress = 100;
                this.syncStatus.totalSynced += pendingJobs;
            }
            else {
                logger_1.default.info('📭 No pending jobs to process');
                this.syncStatus.progress = 100;
            }
            this.syncStatus.lastSyncAt = new Date().toISOString();
            this.syncStatus.isRunning = false;
            logger_1.default.info('✅ Incremental sync completed');
            return { success: true, count: pendingJobs, errors: [] };
        }
        catch (error) {
            this.syncStatus.isRunning = false;
            this.syncStatus.errors.push(error instanceof Error ? error.message : 'Unknown error');
            logger_1.default.error('❌ Incremental sync failed:', error);
            throw error;
        }
    }
    startSyncInterval() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        this.syncInterval = setInterval(async () => {
            try {
                await this.incrementalSync();
            }
            catch (error) {
                logger_1.default.error('❌ Error in sync interval:', error);
            }
        }, this.config.syncInterval);
        this.syncStatus.nextSyncAt = new Date(Date.now() + this.config.syncInterval).toISOString();
        logger_1.default.info(`⏰ Sync interval started: ${this.config.syncInterval / 1000}s`);
    }
    stopSyncInterval() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            this.syncStatus.nextSyncAt = null;
            logger_1.default.info('⏰ Sync interval stopped');
        }
    }
    restartSyncInterval() {
        this.stopSyncInterval();
        this.startSyncInterval();
    }
    getSyncStatus() {
        return { ...this.syncStatus };
    }
    async getSyncStats() {
        try {
            const indexerStats = this.indexer.getStats();
            const queueStats = await this.messageQueue.getStats();
            return {
                totalDocuments: indexerStats.totalProcessed,
                syncedDocuments: indexerStats.totalSuccess,
                failedDocuments: indexerStats.totalFailed,
                syncDuration: indexerStats.avgProcessingTime,
                avgSyncTime: indexerStats.avgProcessingTime,
            };
        }
        catch (error) {
            logger_1.default.error('❌ Error getting sync stats:', error);
            throw error;
        }
    }
    async triggerManualSync() {
        try {
            logger_1.default.info('🔧 Manual sync triggered');
            const result = await this.incrementalSync();
            this.restartSyncInterval();
            return result;
        }
        catch (error) {
            logger_1.default.error('❌ Manual sync failed:', error);
            throw error;
        }
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (this.config.enabled) {
            this.restartSyncInterval();
        }
        else {
            this.stopSyncInterval();
        }
        logger_1.default.info('⚙️ Sync configuration updated');
    }
    getConfig() {
        return { ...this.config };
    }
    async healthCheck() {
        try {
            const indexerHealth = await this.indexer.healthCheck();
            return {
                syncService: this.isInitialized,
                indexer: indexerHealth.indexer,
                elasticsearch: indexerHealth.elasticsearch,
                redis: indexerHealth.redis,
                status: this.getSyncStatus(),
            };
        }
        catch (error) {
            logger_1.default.error('❌ Health check failed:', error);
            throw error;
        }
    }
    async retryFailedJobs() {
        return await this.indexer.retryFailedJobs();
    }
    async clearQueue(queueType = 'completed') {
        return await this.indexer.clearQueue(queueType);
    }
    isServiceInitialized() {
        return this.isInitialized;
    }
}
exports.SyncService = SyncService;
//# sourceMappingURL=syncService.js.map