import { Client } from '@elastic/elasticsearch';
export declare class AdminElasticsearchService {
    protected client: Client;
    protected defaultIndexName: string;
    protected isConnected: boolean;
    constructor(node?: string, defaultIndexName?: string, username?: string, password?: string);
    static getAllIndicesStats(): Promise<any>;
    getClient(): Client;
    testConnection(): Promise<boolean>;
    getHealth(): Promise<any>;
    createIndex(indexName?: string, mapping?: any): Promise<boolean>;
    deleteIndex(indexName?: string): Promise<boolean>;
    recreateIndex(indexName?: string, mapping?: any): Promise<boolean>;
    bulkIndex(documents: any[], indexName?: string): Promise<boolean>;
    indexDocument(id: string, document: any, indexName?: string): Promise<boolean>;
    updateDocument(id: string, document: any, indexName?: string): Promise<boolean>;
    deleteDocument(id: string, indexName?: string): Promise<boolean>;
    search(query: any, indexName?: string): Promise<any>;
    searchIndex(indexName: string, options?: {
        size?: number;
    }): Promise<any>;
    getIndexStats(): Promise<any>;
    reindexAllListings(): Promise<{
        success: boolean;
        count: number;
        errors: string[];
    }>;
    searchListings(params: {
        query?: string;
        filters?: any;
        sort?: any;
        page?: number;
        limit?: number;
    }): Promise<any>;
}
export declare const elasticsearchClient: Client;
//# sourceMappingURL=elasticsearchService.d.ts.map