import { Client } from '@elastic/elasticsearch';
import { SearchQuery, SearchResult, ElasticsearchIndexMapping, ElasticsearchHealth, ElasticsearchIndexStats, SearchSuggestions } from '../types/search';
export declare class ElasticsearchService {
    protected client: Client;
    protected indexName: string;
    protected isConnected: boolean;
    constructor(node?: string, indexName?: string);
    /**
     * Elasticsearch bağlantısını test et
     */
    testConnection(): Promise<boolean>;
    /**
     * Cluster health durumunu al
     */
    getHealth(): Promise<ElasticsearchHealth>;
    /**
     * Index oluştur
     */
    createIndex(mapping?: ElasticsearchIndexMapping): Promise<boolean>;
    /**
     * Index'i sil
     */
    deleteIndex(): Promise<boolean>;
    /**
     * Document'ı index'e ekle
     */
    indexDocument(id: string, document: any): Promise<boolean>;
    /**
     * Document'ı güncelle
     */
    updateDocument(id: string, document: any): Promise<boolean>;
    /**
     * Document'ı sil
     */
    deleteDocument(id: string): Promise<boolean>;
    /**
     * Arama yap
     */
    search<T = any>(searchQuery: SearchQuery): Promise<SearchResult<T>>;
    /**
     * Autocomplete suggestions
     */
    getSuggestions(query: string): Promise<SearchSuggestions>;
    /**
     * Index istatistiklerini al
     */
    getIndexStats(): Promise<ElasticsearchIndexStats>;
    /**
     * Bulk indexing
     */
    bulkIndex(documents: Array<{
        id: string;
        document: any;
    }>): Promise<boolean>;
    /**
     * Filtreleri query'ye ekle
     */
    private addFilters;
    /**
     * Aggregations oluştur
     */
    private buildAggregations;
}
//# sourceMappingURL=elasticsearchService.d.ts.map