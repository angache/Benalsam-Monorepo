export interface QueueJob {
    id: string;
    table: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    data: any;
    timestamp: string;
    retryCount?: number;
}
export interface QueueStats {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
}
export declare class MessageQueueService {
    private redis;
    private queueName;
    private processingQueueName;
    private completedQueueName;
    private failedQueueName;
    private isConnected;
    constructor(redisUrl?: string, queueName?: string);
    private setupEventHandlers;
    addJob(job: Omit<QueueJob, 'id' | 'timestamp'>): Promise<string>;
    getNextJob(): Promise<QueueJob | null>;
    completeJob(jobId: string): Promise<void>;
    failJob(jobId: string, error: string, maxRetries?: number): Promise<void>;
    getStats(): Promise<QueueStats>;
    clearQueue(queueType?: 'pending' | 'processing' | 'completed' | 'failed'): Promise<number>;
    retryFailedJobs(): Promise<number>;
    listenForJobs(callback: (job: QueueJob) => Promise<void>): Promise<void>;
    disconnect(): Promise<void>;
    isQueueConnected(): boolean;
    testConnection(): Promise<boolean>;
    private generateJobId;
}
//# sourceMappingURL=messageQueueService.d.ts.map