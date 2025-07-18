import { ElasticsearchService as BaseElasticsearchService } from '@benalsam/shared-types';
export declare class AdminElasticsearchService extends BaseElasticsearchService {
    constructor();
    reindexAllListings(): Promise<{
        success: boolean;
        count: number;
        errors: string[];
    }>;
    getIndexStats(): Promise<{
        cluster_health: import("@benalsam/shared-types").ElasticsearchHealth;
        index_name: string;
        timestamp: string;
        index: string;
        docs: {
            count: number;
            deleted: number;
        };
        store: {
            size_in_bytes: number;
            total_data_set_size_in_bytes: number;
        };
        indexing: {
            index_total: number;
            index_time_in_millis: number;
            index_current: number;
            index_failed: number;
        };
        search: {
            query_total: number;
            query_time_in_millis: number;
            query_current: number;
            fetch_total: number;
            fetch_time_in_millis: number;
            fetch_current: number;
        };
    }>;
    optimizeIndex(): Promise<boolean>;
    addTestDocument(): Promise<boolean>;
    searchListings(params: {
        query?: string;
        filters?: any;
        sort?: any;
        page?: number;
        limit?: number;
    }): Promise<any>;
    getIndexMapping(): Promise<any>;
    getIndexSettings(): Promise<any>;
    recreateIndex(): Promise<boolean>;
    clearIndex(): Promise<boolean>;
}
//# sourceMappingURL=elasticsearchService.d.ts.map