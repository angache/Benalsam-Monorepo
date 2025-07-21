"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.elasticsearchClient = exports.AdminElasticsearchService = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const logger_1 = __importDefault(require("../config/logger"));
class AdminElasticsearchService {
    client;
    indexName;
    isConnected = false;
    constructor(node = process.env.ELASTICSEARCH_URL || 'http://localhost:9200', indexName = process.env.ELASTICSEARCH_INDEX || 'benalsam_listings', username = process.env.ELASTICSEARCH_USERNAME || '', password = process.env.ELASTICSEARCH_PASSWORD || '') {
        this.client = new elasticsearch_1.Client({ node, auth: username ? { username, password } : undefined });
        this.indexName = indexName;
    }
    getClient() {
        return this.client;
    }
    async testConnection() {
        try {
            await this.client.ping();
            this.isConnected = true;
            return true;
        }
        catch (error) {
            this.isConnected = false;
            logger_1.default.error('❌ Elasticsearch connection failed:', error);
            return false;
        }
    }
    async getHealth() {
        const response = await this.client.cluster.health();
        return response;
    }
    async createIndex(mapping) {
        try {
            await this.client.indices.create({
                index: this.indexName,
                body: mapping ? mapping : undefined
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Create index error:', error);
            return false;
        }
    }
    async deleteIndex() {
        try {
            await this.client.indices.delete({ index: this.indexName });
            return true;
        }
        catch (error) {
            logger_1.default.error('Delete index error:', error);
            return false;
        }
    }
    async recreateIndex(mapping) {
        await this.deleteIndex();
        return this.createIndex(mapping);
    }
    async bulkIndex(documents) {
        try {
            const body = documents.flatMap(doc => [{ index: { _index: this.indexName } }, doc]);
            await this.client.bulk({ refresh: true, body });
            return true;
        }
        catch (error) {
            logger_1.default.error('Bulk index error:', error);
            return false;
        }
    }
    async indexDocument(id, document) {
        try {
            await this.client.index({
                index: this.indexName,
                id,
                body: document
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Index document error:', error);
            return false;
        }
    }
    async updateDocument(id, document) {
        try {
            await this.client.update({
                index: this.indexName,
                id,
                body: { doc: document }
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Update document error:', error);
            return false;
        }
    }
    async deleteDocument(id) {
        try {
            await this.client.delete({
                index: this.indexName,
                id
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Delete document error:', error);
            return false;
        }
    }
    async search(query) {
        try {
            const response = await this.client.search({
                index: this.indexName,
                body: query
            });
            return response;
        }
        catch (error) {
            logger_1.default.error('Search error:', error);
            throw error;
        }
    }
    async getIndexStats() {
        try {
            const response = await this.client.indices.stats({ index: this.indexName });
            return response;
        }
        catch (error) {
            logger_1.default.error('Get index stats error:', error);
            throw error;
        }
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
                    title: listing.title,
                    description: listing.description,
                    category: listing.category,
                    budget: listing.budget,
                    location: listing.location || '',
                    latitude: listing.latitude || null,
                    longitude: listing.longitude || null,
                    urgency: listing.urgency,
                    attributes: listing.attributes,
                    user_id: listing.user_id,
                    status: listing.status,
                    created_at: listing.created_at,
                    updated_at: listing.updated_at,
                    popularity_score: listing.popularity_score || 0,
                    is_premium: listing.is_premium || false,
                    tags: listing.tags || [],
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
                errors,
            };
        }
        catch (error) {
            logger_1.default.error('❌ Error during reindex:', error);
            throw error;
        }
    }
    async searchListings(params) {
        try {
            const { query = '', filters = {}, sort = {}, page = 1, limit = 20, } = params;
            const searchBody = {
                query: {
                    bool: {
                        must: [],
                        filter: [],
                    },
                },
                sort: [
                    { _score: { order: 'desc' } },
                    { created_at: { order: 'desc' } },
                ],
                from: (page - 1) * limit,
                size: limit,
            };
            if (query.trim()) {
                searchBody.query.bool.must.push({
                    multi_match: {
                        query,
                        fields: ['title^3', 'description^2', 'category', 'tags'],
                        type: 'best_fields',
                        fuzziness: 'AUTO',
                    },
                });
            }
            if (filters.category) {
                searchBody.query.bool.filter.push({
                    term: { category: filters.category },
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
                            lon: filters.location.lon,
                        },
                    },
                });
            }
            if (filters.isPremium !== undefined) {
                searchBody.query.bool.filter.push({
                    term: { is_premium: filters.isPremium },
                });
            }
            if (sort.field && sort.order) {
                searchBody.sort.unshift({ [sort.field]: { order: sort.order } });
            }
            const response = await this.client.search({
                index: this.indexName,
                body: searchBody,
            });
            const total = typeof response.hits.total === 'number'
                ? response.hits.total
                : response.hits.total?.value || 0;
            return {
                hits: response.hits.hits.map((hit) => ({
                    id: hit._id,
                    score: hit._score,
                    ...hit._source,
                })),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.default.error('❌ Error searching listings:', error);
            throw error;
        }
    }
}
exports.AdminElasticsearchService = AdminElasticsearchService;
exports.elasticsearchClient = new AdminElasticsearchService().getClient();
//# sourceMappingURL=elasticsearchService.js.map