import { AdminElasticsearchService } from './elasticsearchService';
import { MessageQueueService } from './messageQueueService';
import { IndexerService } from './indexerService';
export interface SyncConfig {
    enabled: boolean;
    batchSize: number;
    syncInterval: number;
    maxRetries: number;
    retryDelay: number;
}
export interface SyncStatus {
    isRunning: boolean;
    lastSyncAt: string | null;
    nextSyncAt: string | null;
    totalSynced: number;
    errors: string[];
    progress: number;
}
export interface SyncStats {
    totalDocuments: number;
    syncedDocuments: number;
    failedDocuments: number;
    syncDuration: number;
    avgSyncTime: number;
}
export declare class SyncService {
    private elasticsearchService;
    private messageQueue;
    private indexer;
    private config;
    private syncStatus;
    private syncInterval;
    private isInitialized;
    constructor(elasticsearchService: AdminElasticsearchService, messageQueue: MessageQueueService, indexer: IndexerService, config?: Partial<SyncConfig>);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    initialDataMigration(): Promise<{
        success: boolean;
        count: number;
        errors: string[];
    }>;
    incrementalSync(): Promise<{
        success: boolean;
        count: number;
        errors: string[];
    }>;
    private startSyncInterval;
    stopSyncInterval(): void;
    restartSyncInterval(): void;
    getSyncStatus(): SyncStatus;
    getSyncStats(): Promise<SyncStats>;
    triggerManualSync(): Promise<{
        success: boolean;
        count: number;
        errors: string[];
    }>;
    updateConfig(newConfig: Partial<SyncConfig>): void;
    getConfig(): SyncConfig;
    healthCheck(): Promise<{
        syncService: boolean;
        indexer: boolean;
        elasticsearch: boolean;
        redis: boolean;
        status: SyncStatus;
    }>;
    retryFailedJobs(): Promise<number>;
    clearQueue(queueType?: 'pending' | 'processing' | 'completed' | 'failed'): Promise<number>;
    isServiceInitialized(): boolean;
}
//# sourceMappingURL=syncService.d.ts.map