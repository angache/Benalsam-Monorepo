"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageQueueService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("../config/logger"));
class MessageQueueService {
    redis;
    queueName;
    processingQueueName;
    completedQueueName;
    failedQueueName;
    isConnected = false;
    constructor(redisUrl = process.env.REDIS_URL || 'redis://localhost:6379', queueName = 'elasticsearch_sync') {
        this.redis = new ioredis_1.default(redisUrl, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });
        this.queueName = queueName;
        this.processingQueueName = `${queueName}:processing`;
        this.completedQueueName = `${queueName}:completed`;
        this.failedQueueName = `${queueName}:failed`;
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.redis.on('connect', () => {
            this.isConnected = true;
            logger_1.default.info('✅ Redis connected for message queue');
        });
        this.redis.on('error', (error) => {
            this.isConnected = false;
            logger_1.default.error('❌ Redis connection error:', error);
        });
        this.redis.on('close', () => {
            this.isConnected = false;
            logger_1.default.warn('⚠️ Redis connection closed');
        });
        this.redis.on('reconnecting', () => {
            logger_1.default.info('🔄 Redis reconnecting...');
        });
    }
    async addJob(job) {
        try {
            if (!this.isConnected) {
                throw new Error('Redis not connected');
            }
            const jobId = this.generateJobId();
            const fullJob = {
                ...job,
                id: jobId,
                timestamp: new Date().toISOString(),
                retryCount: 0,
            };
            await this.redis.lpush(this.queueName, JSON.stringify(fullJob));
            logger_1.default.info(`✅ Job added to queue: ${jobId} (${job.operation} on ${job.table})`);
            return jobId;
        }
        catch (error) {
            logger_1.default.error('❌ Error adding job to queue:', error);
            throw error;
        }
    }
    async getNextJob() {
        try {
            if (!this.isConnected) {
                throw new Error('Redis not connected');
            }
            const jobData = await this.redis.brpop(this.queueName, 5);
            if (!jobData || !jobData[1]) {
                return null;
            }
            const job = JSON.parse(jobData[1]);
            await this.redis.lpush(this.processingQueueName, JSON.stringify(job));
            logger_1.default.info(`🔄 Job moved to processing: ${job.id}`);
            return job;
        }
        catch (error) {
            logger_1.default.error('❌ Error getting next job:', error);
            throw error;
        }
    }
    async completeJob(jobId) {
        try {
            if (!this.isConnected) {
                throw new Error('Redis not connected');
            }
            const processingJobs = await this.redis.lrange(this.processingQueueName, 0, -1);
            const jobIndex = processingJobs.findIndex((job) => {
                const parsedJob = JSON.parse(job);
                return parsedJob.id === jobId;
            });
            if (jobIndex !== -1) {
                const jobData = processingJobs[jobIndex];
                await this.redis.lrem(this.processingQueueName, 1, jobData);
                await this.redis.lpush(this.completedQueueName, jobData);
                logger_1.default.info(`✅ Job completed: ${jobId}`);
            }
            else {
                logger_1.default.warn(`⚠️ Job not found in processing queue: ${jobId}`);
            }
        }
        catch (error) {
            logger_1.default.error('❌ Error completing job:', error);
            throw error;
        }
    }
    async failJob(jobId, error, maxRetries = 3) {
        try {
            if (!this.isConnected) {
                throw new Error('Redis not connected');
            }
            const processingJobs = await this.redis.lrange(this.processingQueueName, 0, -1);
            const jobIndex = processingJobs.findIndex((job) => {
                const parsedJob = JSON.parse(job);
                return parsedJob.id === jobId;
            });
            if (jobIndex !== -1) {
                const jobData = processingJobs[jobIndex];
                const job = JSON.parse(jobData);
                await this.redis.lrem(this.processingQueueName, 1, jobData);
                if (job.retryCount && job.retryCount < maxRetries) {
                    job.retryCount++;
                    await this.redis.lpush(this.queueName, JSON.stringify(job));
                    logger_1.default.warn(`🔄 Job retry ${job.retryCount}/${maxRetries}: ${jobId}`);
                }
                else {
                    job.retryCount = job.retryCount || 0;
                    const failedJob = { ...job, error };
                    await this.redis.lpush(this.failedQueueName, JSON.stringify(failedJob));
                    logger_1.default.error(`❌ Job failed permanently: ${jobId} (${error})`);
                }
            }
            else {
                logger_1.default.warn(`⚠️ Job not found in processing queue: ${jobId}`);
            }
        }
        catch (error) {
            logger_1.default.error('❌ Error failing job:', error);
            throw error;
        }
    }
    async getStats() {
        try {
            if (!this.isConnected) {
                throw new Error('Redis not connected');
            }
            const [pending, processing, completed, failed] = await Promise.all([
                this.redis.llen(this.queueName),
                this.redis.llen(this.processingQueueName),
                this.redis.llen(this.completedQueueName),
                this.redis.llen(this.failedQueueName),
            ]);
            return {
                pending,
                processing,
                completed,
                failed,
                total: pending + processing + completed + failed,
            };
        }
        catch (error) {
            logger_1.default.error('❌ Error getting queue stats:', error);
            throw error;
        }
    }
    async clearQueue(queueType = 'completed') {
        try {
            if (!this.isConnected) {
                throw new Error('Redis not connected');
            }
            let queueToClear;
            switch (queueType) {
                case 'pending':
                    queueToClear = this.queueName;
                    break;
                case 'processing':
                    queueToClear = this.processingQueueName;
                    break;
                case 'completed':
                    queueToClear = this.completedQueueName;
                    break;
                case 'failed':
                    queueToClear = this.failedQueueName;
                    break;
                default:
                    throw new Error('Invalid queue type');
            }
            const count = await this.redis.llen(queueToClear);
            await this.redis.del(queueToClear);
            logger_1.default.info(`🧹 Cleared ${queueType} queue: ${count} jobs`);
            return count;
        }
        catch (error) {
            logger_1.default.error('❌ Error clearing queue:', error);
            throw error;
        }
    }
    async retryFailedJobs() {
        try {
            if (!this.isConnected) {
                throw new Error('Redis not connected');
            }
            const failedJobs = await this.redis.lrange(this.failedQueueName, 0, -1);
            let retryCount = 0;
            for (const jobData of failedJobs) {
                const job = JSON.parse(jobData);
                job.retryCount = 0;
                await this.redis.lpush(this.queueName, JSON.stringify(job));
                retryCount++;
            }
            if (retryCount > 0) {
                await this.redis.del(this.failedQueueName);
            }
            logger_1.default.info(`🔄 Retried ${retryCount} failed jobs`);
            return retryCount;
        }
        catch (error) {
            logger_1.default.error('❌ Error retrying failed jobs:', error);
            throw error;
        }
    }
    async listenForJobs(callback) {
        try {
            if (!this.isConnected) {
                throw new Error('Redis not connected');
            }
            logger_1.default.info('👂 Listening for jobs...');
            while (this.isConnected) {
                try {
                    const job = await this.getNextJob();
                    if (job) {
                        logger_1.default.info(`📥 Processing job: ${job.id}`);
                        try {
                            await callback(job);
                            await this.completeJob(job.id);
                            logger_1.default.info(`✅ Job processed successfully: ${job.id}`);
                        }
                        catch (error) {
                            await this.failJob(job.id, error instanceof Error ? error.message : 'Unknown error');
                            logger_1.default.error(`❌ Job processing failed: ${job.id}`, error);
                        }
                    }
                }
                catch (error) {
                    logger_1.default.error('❌ Error in job listener:', error);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        catch (error) {
            logger_1.default.error('❌ Error starting job listener:', error);
            throw error;
        }
    }
    async disconnect() {
        try {
            this.isConnected = false;
            await this.redis.quit();
            logger_1.default.info('🔌 Redis connection closed');
        }
        catch (error) {
            logger_1.default.error('❌ Error disconnecting Redis:', error);
            throw error;
        }
    }
    isQueueConnected() {
        return this.isConnected;
    }
    async testConnection() {
        try {
            await this.redis.ping();
            logger_1.default.info('✅ Redis connection test successful');
            return true;
        }
        catch (error) {
            logger_1.default.error('❌ Redis connection test failed:', error);
            throw error;
        }
    }
    generateJobId() {
        return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.MessageQueueService = MessageQueueService;
//# sourceMappingURL=messageQueueService.js.map