export interface SearchParams {
    query?: string;
    categories?: string[];
    location?: string;
    urgency?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    attributes?: Record<string, string[]>;
}
export interface SearchResult {
    data: any[];
    totalCount: number;
    searchEngine: 'elasticsearch' | 'supabase';
    responseTime: number;
    cached: boolean;
    pagination: {
        page: number;
        pageSize: number;
        totalPages: number;
    };
    metadata: {
        query?: string;
        filters: any;
        timestamp: string;
    };
}
export declare class SearchService {
    private supabase;
    private elasticsearchClient;
    private redisClient;
    private isElasticsearchAvailable;
    constructor();
    private getSupabaseClient;
    private initializeElasticsearch;
    private initializeRedis;
    searchListings(params: SearchParams): Promise<SearchResult>;
    private elasticsearchSearch;
    private supabaseSearch;
    private getCachedResult;
    private cacheResult;
    getSuggestions(query: string): Promise<string[]>;
    getAnalytics(): Promise<any>;
    healthCheck(): Promise<{
        elasticsearch: boolean;
        redis: boolean;
        supabase: boolean;
    }>;
}
export declare const searchService: SearchService;
//# sourceMappingURL=searchService.d.ts.map