"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminElasticsearchService = void 0;
const shared_types_1 = require("@benalsam/shared-types");
const logger_1 = __importDefault(require("../config/logger"));
class AdminElasticsearchService extends shared_types_1.ElasticsearchService {
    constructor() {
        super(process.env.ELASTICSEARCH_URL || 'http://localhost:9200', process.env.ELASTICSEARCH_INDEX || 'benalsam_listings');
    }
    async reindexAllListings() {
        try {
            logger_1.default.info('🔄 Starting full reindex of all listings...');
            await this.deleteIndex();
            await this.createIndex();
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
            let page = 0;
            const limit = 100;
            let totalIndexed = 0;
            const errors = [];
            while (true) {
                const { data: listings, error } = await supabase
                    .from('listings')
                    .select('*')
                    .range(page * limit, (page + 1) * limit - 1)
                    .eq('status', 'active');
                if (error) {
                    logger_1.default.error('❌ Error fetching listings from Supabase:', error);
                    errors.push(`Supabase error: ${error.message}`);
                    break;
                }
                if (!listings || listings.length === 0) {
                    break;
                }
                const documents = listings.map((listing) => ({
                    id: listing.id,
                    document: {
                        id: listing.id,
                        title: listing.title,
                        description: listing.description,
                        category: listing.category,
                        budget: listing.budget,
                        location: listing.location ? {
                            lat: listing.location.lat,
                            lon: listing.location.lon,
                            text: listing.location.text
                        } : null,
                        urgency: listing.urgency,
                        attributes: listing.attributes,
                        user_id: listing.user_id,
                        status: listing.status,
                        created_at: listing.created_at,
                        updated_at: listing.updated_at,
                        popularity_score: listing.popularity_score || 0,
                        is_premium: listing.is_premium || false,
                        tags: listing.tags || []
                    }
                }));
                const success = await this.bulkIndex(documents);
                if (success) {
                    totalIndexed += documents.length;
                    logger_1.default.info(`✅ Indexed ${documents.length} listings (total: ${totalIndexed})`);
                }
                else {
                    errors.push(`Failed to index batch ${page + 1}`);
                }
                page++;
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            logger_1.default.info(`✅ Reindex completed. Total indexed: ${totalIndexed}, Errors: ${errors.length}`);
            return {
                success: errors.length === 0,
                count: totalIndexed,
                errors
            };
        }
        catch (error) {
            logger_1.default.error('❌ Error during reindex:', error);
            throw error;
        }
    }
    async getIndexStats() {
        try {
            const stats = await super.getIndexStats();
            const health = await this.getHealth();
            return {
                ...stats,
                cluster_health: health,
                index_name: this.indexName,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            logger_1.default.error('❌ Error getting index stats:', error);
            throw error;
        }
    }
    async optimizeIndex() {
        try {
            logger_1.default.info('🔄 Optimizing index...');
            await this.client.indices.forcemerge({
                index: this.indexName,
                max_num_segments: 1
            });
            await this.client.indices.refresh({
                index: this.indexName
            });
            logger_1.default.info('✅ Index optimization completed');
            return true;
        }
        catch (error) {
            logger_1.default.error('❌ Error optimizing index:', error);
            throw error;
        }
    }
    async addTestDocument() {
        try {
            const testDocument = {
                id: 'test-' + Date.now(),
                title: 'Test İlanı',
                description: 'Bu bir test ilanıdır',
                category: 'Test > Kategori',
                budget: 1000,
                location: {
                    lat: 41.0082,
                    lon: 28.9784,
                    text: 'İstanbul, Türkiye'
                },
                urgency: 'normal',
                attributes: {
                    condition: 'Yeni',
                    brand: 'Test Brand'
                },
                user_id: 'test-user-id',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                popularity_score: 10,
                is_premium: false,
                tags: ['test', 'demo']
            };
            await this.indexDocument(testDocument.id, testDocument);
            logger_1.default.info('✅ Test document added successfully');
            return true;
        }
        catch (error) {
            logger_1.default.error('❌ Error adding test document:', error);
            throw error;
        }
    }
    async searchListings(params) {
        try {
            const { query = '', filters = {}, sort = {}, page = 1, limit = 20 } = params;
            const searchBody = {
                query: {
                    bool: {
                        must: [],
                        filter: []
                    }
                },
                sort: [
                    { _score: { order: 'desc' } },
                    { created_at: { order: 'desc' } }
                ],
                from: (page - 1) * limit,
                size: limit
            };
            if (query.trim()) {
                searchBody.query.bool.must.push({
                    multi_match: {
                        query,
                        fields: ['title^3', 'description^2', 'category', 'tags'],
                        type: 'best_fields',
                        fuzziness: 'AUTO'
                    }
                });
            }
            if (filters.category) {
                searchBody.query.bool.filter.push({
                    term: { category: filters.category }
                });
            }
            if (filters.minBudget || filters.maxBudget) {
                const rangeFilter = { budget: {} };
                if (filters.minBudget)
                    rangeFilter.budget.gte = filters.minBudget;
                if (filters.maxBudget)
                    rangeFilter.budget.lte = filters.maxBudget;
                searchBody.query.bool.filter.push({ range: rangeFilter });
            }
            if (filters.location) {
                searchBody.query.bool.filter.push({
                    geo_distance: {
                        distance: filters.location.radius || '10km',
                        location: {
                            lat: filters.location.lat,
                            lon: filters.location.lon
                        }
                    }
                });
            }
            if (filters.isPremium !== undefined) {
                searchBody.query.bool.filter.push({
                    term: { is_premium: filters.isPremium }
                });
            }
            if (sort.field && sort.order) {
                searchBody.sort.unshift({ [sort.field]: { order: sort.order } });
            }
            const response = await this.client.search({
                index: this.indexName,
                body: searchBody
            });
            const total = typeof response.hits.total === 'number'
                ? response.hits.total
                : response.hits.total?.value || 0;
            return {
                hits: response.hits.hits.map((hit) => ({
                    id: hit._id,
                    score: hit._score,
                    ...hit._source
                })),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            logger_1.default.error('❌ Error searching listings:', error);
            throw error;
        }
    }
    async getIndexMapping() {
        try {
            const response = await this.client.indices.getMapping({
                index: this.indexName
            });
            return response[this.indexName]?.mappings || {};
        }
        catch (error) {
            logger_1.default.error('❌ Error getting index mapping:', error);
            throw error;
        }
    }
    async getIndexSettings() {
        try {
            const response = await this.client.indices.getSettings({
                index: this.indexName
            });
            return response[this.indexName]?.settings || {};
        }
        catch (error) {
            logger_1.default.error('❌ Error getting index settings:', error);
            throw error;
        }
    }
    async recreateIndex() {
        try {
            logger_1.default.info('🔄 Recreating index...');
            await this.deleteIndex();
            await this.createIndex();
            logger_1.default.info('✅ Index recreated successfully');
            return true;
        }
        catch (error) {
            logger_1.default.error('❌ Error recreating index:', error);
            throw error;
        }
    }
    async clearIndex() {
        try {
            logger_1.default.info('🔄 Clearing index...');
            await this.client.deleteByQuery({
                index: this.indexName,
                body: {
                    query: {
                        match_all: {}
                    }
                }
            });
            await this.client.indices.refresh({
                index: this.indexName
            });
            logger_1.default.info('✅ Index cleared successfully');
            return true;
        }
        catch (error) {
            logger_1.default.error('❌ Error clearing index:', error);
            throw error;
        }
    }
}
exports.AdminElasticsearchService = AdminElasticsearchService;
//# sourceMappingURL=elasticsearchService.js.map