"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexerService = void 0;
const logger_1 = __importDefault(require("../config/logger"));
class IndexerService {
    elasticsearchService;
    messageQueue;
    config;
    stats;
    isRunning = false;
    processingBatch = [];
    batchTimer = null;
    constructor(elasticsearchService, messageQueue, config = {}) {
        this.elasticsearchService = elasticsearchService;
        this.messageQueue = messageQueue;
        this.config = {
            batchSize: config.batchSize || 10,
            batchTimeout: config.batchTimeout || 5000,
            maxRetries: config.maxRetries || 3,
            retryDelay: config.retryDelay || 1000,
        };
        this.stats = {
            totalProcessed: 0,
            totalSuccess: 0,
            totalFailed: 0,
            avgProcessingTime: 0,
            lastProcessedAt: null,
            isRunning: false,
        };
    }
    async start() {
        try {
            if (this.isRunning) {
                logger_1.default.warn('⚠️ Indexer already running');
                return;
            }
            this.isRunning = true;
            this.stats.isRunning = true;
            logger_1.default.info('🚀 Starting Elasticsearch indexer...');
            await this.messageQueue.listenForJobs(async (job) => {
                await this.processJob(job);
            });
        }
        catch (error) {
            this.isRunning = false;
            this.stats.isRunning = false;
            logger_1.default.error('❌ Error starting indexer:', error);
            throw error;
        }
    }
    async stop() {
        try {
            this.isRunning = false;
            this.stats.isRunning = false;
            if (this.batchTimer) {
                clearTimeout(this.batchTimer);
                this.batchTimer = null;
            }
            if (this.processingBatch.length > 0) {
                await this.processBatch();
            }
            logger_1.default.info('🛑 Elasticsearch indexer stopped');
        }
        catch (error) {
            logger_1.default.error('❌ Error stopping indexer:', error);
            throw error;
        }
    }
    async processJob(job) {
        const startTime = Date.now();
        try {
            logger_1.default.info(`📥 Processing job: ${job.id} (${job.operation} on ${job.table})`);
            this.processingBatch.push(job);
            if (this.batchTimer) {
                clearTimeout(this.batchTimer);
            }
            if (this.processingBatch.length >= this.config.batchSize) {
                await this.processBatch();
            }
            else {
                this.batchTimer = setTimeout(async () => {
                    if (this.processingBatch.length > 0) {
                        await this.processBatch();
                    }
                }, this.config.batchTimeout);
            }
            const processingTime = Date.now() - startTime;
            this.updateStats(processingTime, true);
            logger_1.default.info(`✅ Job processed successfully: ${job.id} (${processingTime}ms)`);
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.updateStats(processingTime, false);
            logger_1.default.error(`❌ Job processing failed: ${job.id}`, error);
            throw error;
        }
    }
    async processBatch() {
        if (this.processingBatch.length === 0) {
            return;
        }
        const batch = [...this.processingBatch];
        this.processingBatch = [];
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
        logger_1.default.info(`🔄 Processing batch of ${batch.length} jobs`);
        try {
            const documents = batch.map(job => this.transformJobToDocument(job));
            const success = await this.elasticsearchService.bulkIndex(documents);
            if (success) {
                logger_1.default.info(`✅ Batch processed successfully: ${batch.length} jobs`);
            }
            else {
                throw new Error('Bulk indexing failed');
            }
        }
        catch (error) {
            logger_1.default.error(`❌ Batch processing failed: ${batch.length} jobs`, error);
            for (const job of batch) {
                await this.messageQueue.failJob(job.id, error instanceof Error ? error.message : 'Unknown error');
            }
            throw error;
        }
    }
    transformJobToDocument(job) {
        const { table, operation, data } = job;
        switch (table) {
            case 'listings':
                return this.transformListingJob(job);
            case 'profiles':
                return this.transformProfileJob(job);
            case 'categories':
                return this.transformCategoryJob(job);
            default:
                throw new Error(`Unknown table: ${table}`);
        }
    }
    transformListingJob(job) {
        const { operation, data } = job;
        if (operation === 'DELETE') {
            return {
                id: data.id,
                document: null
            };
        }
        const listing = operation === 'UPDATE' ? data.new : data;
        return {
            id: listing.id,
            document: {
                id: listing.id,
                title: listing.title,
                description: listing.description,
                category: listing.category,
                budget: listing.budget,
                location: listing.location ? {
                    lat: listing.location.lat,
                    lon: listing.location.lon,
                    text: listing.location.text
                } : null,
                urgency: listing.urgency,
                attributes: listing.attributes,
                user_id: listing.user_id,
                status: listing.status,
                created_at: listing.created_at,
                updated_at: listing.updated_at,
                popularity_score: listing.popularity_score || 0,
                is_premium: listing.is_premium || false,
                tags: listing.tags || []
            }
        };
    }
    transformProfileJob(job) {
        const { operation, data } = job;
        if (operation === 'DELETE') {
            return {
                id: data.id,
                document: null
            };
        }
        const profile = operation === 'UPDATE' ? data.new : data;
        return {
            id: profile.id,
            document: {
                id: profile.id,
                user_id: profile.user_id,
                full_name: profile.full_name,
                email: profile.email,
                phone: profile.phone,
                avatar_url: profile.avatar_url,
                trust_score: profile.trust_score || 0,
                is_premium: profile.is_premium || false,
                premium_expires_at: profile.premium_expires_at,
                created_at: profile.created_at,
                updated_at: profile.updated_at
            }
        };
    }
    transformCategoryJob(job) {
        const { operation, data } = job;
        if (operation === 'DELETE') {
            return {
                id: data.id,
                document: null
            };
        }
        const category = operation === 'UPDATE' ? data.new : data;
        return {
            id: category.id,
            document: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                parent_id: category.parent_id,
                level: category.level,
                path: category.path,
                attributes: category.attributes,
                created_at: category.created_at,
                updated_at: category.updated_at
            }
        };
    }
    updateStats(processingTime, success) {
        this.stats.totalProcessed++;
        if (success) {
            this.stats.totalSuccess++;
        }
        else {
            this.stats.totalFailed++;
        }
        const totalTime = this.stats.avgProcessingTime * (this.stats.totalProcessed - 1) + processingTime;
        this.stats.avgProcessingTime = totalTime / this.stats.totalProcessed;
        this.stats.lastProcessedAt = new Date().toISOString();
    }
    getStats() {
        return { ...this.stats };
    }
    isIndexerRunning() {
        return this.isRunning;
    }
    async getQueueStats() {
        return await this.messageQueue.getStats();
    }
    async retryFailedJobs() {
        return await this.messageQueue.retryFailedJobs();
    }
    async clearQueue(queueType = 'completed') {
        return await this.messageQueue.clearQueue(queueType);
    }
    async manualSync() {
        try {
            logger_1.default.info('🔄 Starting manual sync...');
            await this.stop();
            const result = await this.elasticsearchService.reindexAllListings();
            await this.start();
            logger_1.default.info(`✅ Manual sync completed: ${result.count} documents indexed`);
            return result;
        }
        catch (error) {
            logger_1.default.error('❌ Manual sync failed:', error);
            throw error;
        }
    }
    async healthCheck() {
        try {
            const elasticsearchHealth = await this.elasticsearchService.getHealth();
            const redisConnected = this.messageQueue.isQueueConnected();
            return {
                indexer: this.isRunning,
                elasticsearch: elasticsearchHealth.status === 'green' || elasticsearchHealth.status === 'yellow',
                redis: redisConnected,
                stats: this.getStats()
            };
        }
        catch (error) {
            logger_1.default.error('❌ Health check failed:', error);
            throw error;
        }
    }
}
exports.IndexerService = IndexerService;
//# sourceMappingURL=indexerService.js.map