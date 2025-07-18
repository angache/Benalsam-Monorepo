import { AdminElasticsearchService } from './elasticsearchService';
import { MessageQueueService } from './messageQueueService';
export interface IndexerConfig {
    batchSize: number;
    batchTimeout: number;
    maxRetries: number;
    retryDelay: number;
}
export interface IndexerStats {
    totalProcessed: number;
    totalSuccess: number;
    totalFailed: number;
    avgProcessingTime: number;
    lastProcessedAt: string | null;
    isRunning: boolean;
}
export declare class IndexerService {
    private elasticsearchService;
    private messageQueue;
    private config;
    private stats;
    private isRunning;
    private processingBatch;
    private batchTimer;
    constructor(elasticsearchService: AdminElasticsearchService, messageQueue: MessageQueueService, config?: Partial<IndexerConfig>);
    start(): Promise<void>;
    stop(): Promise<void>;
    private processJob;
    private processBatch;
    private transformJobToDocument;
    private transformListingJob;
    private transformProfileJob;
    private transformCategoryJob;
    private updateStats;
    getStats(): IndexerStats;
    isIndexerRunning(): boolean;
    getQueueStats(): Promise<import("./messageQueueService").QueueStats>;
    retryFailedJobs(): Promise<number>;
    clearQueue(queueType?: 'pending' | 'processing' | 'completed' | 'failed'): Promise<number>;
    manualSync(): Promise<{
        success: boolean;
        count: number;
        errors: string[];
    }>;
    healthCheck(): Promise<{
        indexer: boolean;
        elasticsearch: boolean;
        redis: boolean;
        stats: IndexerStats;
    }>;
}
//# sourceMappingURL=indexerService.d.ts.map