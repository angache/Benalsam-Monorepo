import { Request, Response } from 'express';
export declare class ElasticsearchController {
    private elasticsearchService;
    private messageQueueService;
    private indexerService;
    private syncService;
    constructor();
    getHealth(req: Request, res: Response): Promise<void>;
    searchListings(req: Request, res: Response): Promise<void>;
    getIndexStats(req: Request, res: Response): Promise<void>;
    reindexAll(req: Request, res: Response): Promise<void>;
    getSyncStatus(req: Request, res: Response): Promise<void>;
    triggerManualSync(req: Request, res: Response): Promise<void>;
    getQueueStats(req: Request, res: Response): Promise<void>;
    retryFailedJobs(req: Request, res: Response): Promise<void>;
    clearQueue(req: Request, res: Response): Promise<void>;
    getSyncConfig(req: Request, res: Response): Promise<void>;
    updateSyncConfig(req: Request, res: Response): Promise<void>;
    getHealthCheck(req: Request, res: Response): Promise<void>;
    testConnection(req: Request, res: Response): Promise<void>;
    testRedisConnection(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=elasticsearchController.d.ts.map