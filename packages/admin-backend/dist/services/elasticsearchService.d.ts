import { Client } from '@elastic/elasticsearch';
export declare class AdminElasticsearchService {
    protected client: Client;
    protected indexName: string;
    protected isConnected: boolean;
    constructor(node?: string, indexName?: string, username?: string, password?: string);
    getClient(): Client;
    testConnection(): Promise<boolean>;
    getHealth(): Promise<any>;
    createIndex(mapping?: any): Promise<boolean>;
    deleteIndex(): Promise<boolean>;
    recreateIndex(mapping?: any): Promise<boolean>;
    bulkIndex(documents: any[]): Promise<boolean>;
    indexDocument(id: string, document: any): Promise<boolean>;
    updateDocument(id: string, document: any): Promise<boolean>;
    deleteDocument(id: string): Promise<boolean>;
    search(query: any): Promise<any>;
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