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
    defaultIndexName;
    isConnected = false;
    constructor(node = process.env.ELASTICSEARCH_URL || 'http://localhost:9200', defaultIndexName = 'benalsam_listings', username = process.env.ELASTICSEARCH_USERNAME || '', password = process.env.ELASTICSEARCH_PASSWORD || '') {
        logger_1.default.info('🔧 ElasticsearchService constructor:', { node, defaultIndexName, username: username ? 'set' : 'not set' });
        this.client = new elasticsearch_1.Client({ node, auth: username ? { username, password } : undefined });
        this.defaultIndexName = defaultIndexName;
    }
    static async getAllIndicesStats() {
        try {
            const node = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
            const username = process.env.ELASTICSEARCH_USERNAME || '';
            const password = process.env.ELASTICSEARCH_PASSWORD || '';
            logger_1.default.info('🔍 Static method: Getting all indices stats...');
            logger_1.default.info('🔧 Static method: Client config:', { node, username: username ? 'set' : 'not set' });
            const client = new elasticsearch_1.Client({
                node,
                auth: username ? { username, password } : undefined
            });
            const indicesResponse = await client.cat.indices({
                format: 'json',
                expand_wildcards: 'all'
            });
            logger_1.default.info('📋 Static method: Available indices:', indicesResponse.map((idx) => idx.index));
            const response = await client.indices.stats();
            logger_1.default.info('📊 Static method: Indices stats response keys:', Object.keys(response.indices || {}));
            return response;
        }
        catch (error) {
            logger_1.default.error('Static method: Get index stats error:', error);
            throw error;
        }
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
    async createIndex(indexName, mapping) {
        try {
            const targetIndex = indexName || this.defaultIndexName;
            await this.client.indices.create({
                index: targetIndex,
                body: mapping ? mapping : undefined
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Create index error:', error);
            return false;
        }
    }
    async deleteIndex(indexName) {
        try {
            const targetIndex = indexName || this.defaultIndexName;
            await this.client.indices.delete({ index: targetIndex });
            return true;
        }
        catch (error) {
            logger_1.default.error('Delete index error:', error);
            return false;
        }
    }
    async recreateIndex(indexName, mapping) {
        const targetIndex = indexName || this.defaultIndexName;
        await this.deleteIndex(targetIndex);
        return this.createIndex(targetIndex, mapping);
    }
    async bulkIndex(documents, indexName) {
        try {
            const targetIndex = indexName || this.defaultIndexName;
            const body = documents.flatMap(doc => [{ index: { _index: targetIndex } }, doc]);
            await this.client.bulk({ refresh: true, body });
            return true;
        }
        catch (error) {
            logger_1.default.error('Bulk index error:', error);
            return false;
        }
    }
    async indexDocument(id, document, indexName) {
        try {
            const targetIndex = indexName || this.defaultIndexName;
            await this.client.index({
                index: targetIndex,
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
    async updateDocument(id, document, indexName) {
        try {
            const targetIndex = indexName || this.defaultIndexName;
            await this.client.update({
                index: targetIndex,
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
    async deleteDocument(id, indexName) {
        try {
            const targetIndex = indexName || this.defaultIndexName;
            await this.client.delete({
                index: targetIndex,
                id
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Delete document error:', error);
            return false;
        }
    }
    async search(query, indexName) {
        try {
            const targetIndex = indexName || this.defaultIndexName;
            const response = await this.client.search({
                index: targetIndex,
                body: query
            });
            return response;
        }
        catch (error) {
            logger_1.default.error('Search error:', error);
            throw error;
        }
    }
    async searchIndex(indexName, options = {}) {
        try {
            const response = await this.client.search({
                index: indexName,
                body: {
                    query: {
                        match_all: {}
                    },
                    sort: [{ _id: { order: 'desc' } }],
                    size: options.size || 20
                }
            });
            return response;
        }
        catch (error) {
            logger_1.default.error('Index search error:', error);
            throw error;
        }
    }
    async getIndexStats() {
        try {
            logger_1.default.info('🔍 Getting all indices stats...');
            logger_1.default.info('🔧 Client config:', { node: this.client.connectionPool.connections[0]?.url });
            const response = await this.client.indices.stats();
            logger_1.default.info('📊 Indices stats response keys:', Object.keys(response.indices || {}));
            logger_1.default.info('📊 Indices stats response:', JSON.stringify(response, null, 2));
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
                index: this.defaultIndexName,
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