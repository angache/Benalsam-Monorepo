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
        this.defaultIndexName = defaultIndexName;
        this.client = new elasticsearch_1.Client({
            node,
            auth: username && password ? { username, password } : undefined,
            tls: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
        });
    }
    getListingsIndexMapping() {
        return {
            settings: {
                analysis: {
                    analyzer: {
                        turkish_analyzer: {
                            type: 'turkish'
                        }
                    }
                },
                number_of_shards: 1,
                number_of_replicas: 0
            },
            mappings: {
                properties: {
                    id: { type: 'keyword' },
                    user_id: { type: 'keyword' },
                    title: { type: 'text', analyzer: 'turkish_analyzer' },
                    description: { type: 'text', analyzer: 'turkish_analyzer' },
                    category: { type: 'keyword' },
                    subcategory: { type: 'keyword' },
                    budget: {
                        type: 'object',
                        properties: {
                            min: { type: 'float' },
                            max: { type: 'float' },
                            currency: { type: 'keyword' }
                        }
                    },
                    location: {
                        type: 'object',
                        properties: {
                            province: { type: 'keyword' },
                            district: { type: 'keyword' },
                            neighborhood: { type: 'keyword' },
                            coordinates: { type: 'geo_point' }
                        }
                    },
                    condition: { type: 'keyword' },
                    urgency: { type: 'keyword' },
                    main_image_url: { type: 'keyword' },
                    additional_image_urls: { type: 'keyword' },
                    status: { type: 'keyword' },
                    created_at: { type: 'date' },
                    updated_at: { type: 'date' },
                    attributes: {
                        type: 'object',
                        dynamic: true,
                        properties: {
                            brand: { type: 'keyword' },
                            model: { type: 'keyword' },
                            ram: { type: 'keyword' },
                            storage: { type: 'keyword' },
                            color: { type: 'keyword' },
                            size: { type: 'keyword' },
                            year: { type: 'integer' },
                            rooms: { type: 'integer' },
                            square_meters: { type: 'float' },
                            mileage: { type: 'integer' },
                            fuel_type: { type: 'keyword' },
                            transmission: { type: 'keyword' },
                            material: { type: 'keyword' },
                            warranty: { type: 'keyword' },
                            original_box: { type: 'boolean' },
                            furnished: { type: 'boolean' },
                            parking: { type: 'boolean' },
                            balcony: { type: 'boolean' },
                            elevator: { type: 'boolean' },
                            air_conditioning: { type: 'boolean' },
                            energy_class: { type: 'keyword' },
                            engine_size: { type: 'keyword' },
                            body_type: { type: 'keyword' },
                            doors: { type: 'integer' },
                            seats: { type: 'integer' },
                            bathrooms: { type: 'integer' },
                            floor: { type: 'integer' },
                            total_floors: { type: 'integer' },
                            heating: { type: 'keyword' },
                            building_type: { type: 'keyword' },
                            view: { type: 'keyword' },
                            floor_heating: { type: 'boolean' },
                            security_system: { type: 'boolean' },
                            garden: { type: 'boolean' },
                            land_type: { type: 'keyword' },
                            zoning: { type: 'keyword' },
                            utilities: { type: 'keyword' },
                            road_access: { type: 'boolean' },
                            clothing_type: { type: 'keyword' },
                            fit: { type: 'keyword' },
                            original_price: { type: 'float' },
                            sport_type: { type: 'keyword' },
                            rarity: { type: 'keyword' },
                            autographed: { type: 'boolean' },
                            limited_edition: { type: 'boolean' },
                            author: { type: 'text', analyzer: 'turkish_analyzer' },
                            publisher: { type: 'keyword' },
                            isbn: { type: 'keyword' },
                            language: { type: 'keyword' },
                            format: { type: 'keyword' },
                            genre: { type: 'keyword' },
                            pages: { type: 'integer' },
                            subject: { type: 'keyword' },
                            edition: { type: 'keyword' },
                            service_type: { type: 'keyword' },
                            experience_years: { type: 'integer' },
                            certification: { type: 'keyword' },
                            availability: { type: 'keyword' },
                            location_type: { type: 'keyword' },
                            languages: { type: 'keyword' },
                            portfolio_url: { type: 'keyword' },
                            references: { type: 'boolean' },
                            insurance: { type: 'boolean' },
                            payment_methods: { type: 'keyword' },
                            hourly_rate: { type: 'float' },
                            instrument_type: { type: 'keyword' },
                            case_included: { type: 'boolean' },
                            equipment_type: { type: 'keyword' },
                            power_output: { type: 'keyword' },
                            connectivity: { type: 'keyword' },
                            artist: { type: 'text', analyzer: 'turkish_analyzer' },
                            style: { type: 'keyword' },
                            medium: { type: 'keyword' },
                            dimensions: { type: 'object' },
                            framed: { type: 'boolean' },
                            year_created: { type: 'integer' },
                            weight: { type: 'float' },
                            craft_type: { type: 'keyword' },
                            handmade: { type: 'boolean' },
                            techniques: { type: 'keyword' },
                            period: { type: 'keyword' },
                            provenance: { type: 'text' },
                            age: { type: 'integer' },
                            toy_type: { type: 'keyword' },
                            age_range: { type: 'keyword' },
                            educational: { type: 'boolean' },
                            safety_certified: { type: 'boolean' },
                            platform: { type: 'keyword' },
                            manual: { type: 'boolean' },
                            region: { type: 'keyword' },
                            player_count: { type: 'keyword' },
                            aid_type: { type: 'keyword' },
                            weight_capacity: { type: 'keyword' },
                            adjustable: { type: 'boolean' }
                        }
                    },
                    search_keywords: { type: 'keyword' },
                    popularity_score: { type: 'float' },
                    user_trust_score: { type: 'float' }
                }
            }
        };
    }
    getUserBehaviorsIndexMapping() {
        return {
            settings: {
                analysis: {
                    analyzer: {
                        turkish_analyzer: {
                            type: 'turkish'
                        }
                    }
                },
                number_of_shards: 1,
                number_of_replicas: 0
            },
            mappings: {
                properties: {
                    event_id: { type: 'keyword' },
                    event_name: { type: 'keyword' },
                    event_timestamp: { type: 'date' },
                    event_properties: { type: 'object', dynamic: true },
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'keyword' },
                            email: { type: 'keyword' },
                            name: { type: 'text', analyzer: 'turkish_analyzer' },
                            avatar: { type: 'keyword' },
                            properties: {
                                type: 'object',
                                properties: {
                                    registration_date: { type: 'date' },
                                    subscription_type: { type: 'keyword' },
                                    last_login: { type: 'date' },
                                    trust_score: { type: 'float' },
                                    verification_status: { type: 'keyword' }
                                }
                            }
                        }
                    },
                    session: {
                        type: 'object',
                        properties: {
                            id: { type: 'keyword' },
                            start_time: { type: 'date' },
                            duration: { type: 'long' },
                            page_views: { type: 'integer' },
                            events_count: { type: 'integer' }
                        }
                    },
                    device: {
                        type: 'object',
                        properties: {
                            platform: { type: 'keyword' },
                            version: { type: 'keyword' },
                            model: { type: 'keyword' },
                            screen_resolution: { type: 'keyword' },
                            app_version: { type: 'keyword' },
                            os_version: { type: 'keyword' },
                            browser: { type: 'keyword' },
                            user_agent: { type: 'text' }
                        }
                    },
                    context: {
                        type: 'object',
                        properties: {
                            ip_address: { type: 'keyword' },
                            user_agent: { type: 'text' },
                            referrer: { type: 'keyword' },
                            utm_source: { type: 'keyword' },
                            utm_medium: { type: 'keyword' },
                            utm_campaign: { type: 'keyword' },
                            utm_term: { type: 'keyword' },
                            utm_content: { type: 'keyword' },
                            language: { type: 'keyword' },
                            timezone: { type: 'keyword' }
                        }
                    }
                }
            }
        };
    }
    static async getAllIndicesStats() {
        try {
            const client = new elasticsearch_1.Client({
                node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
                auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD ? {
                    username: process.env.ELASTICSEARCH_USERNAME,
                    password: process.env.ELASTICSEARCH_PASSWORD
                } : undefined,
                tls: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
            });
            const response = await client.indices.stats();
            return response;
        }
        catch (error) {
            logger_1.default.error('Error getting indices stats:', error);
            throw error;
        }
    }
    static async searchIndexStatic(indexName, options = {}) {
        try {
            const client = new elasticsearch_1.Client({
                node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
                auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD ? {
                    username: process.env.ELASTICSEARCH_USERNAME,
                    password: process.env.ELASTICSEARCH_PASSWORD
                } : undefined,
                tls: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
            });
            const response = await client.search({
                index: indexName,
                size: options.size || 10,
                query: {
                    match_all: {}
                }
            });
            return response;
        }
        catch (error) {
            logger_1.default.error(`Error searching index ${indexName}:`, error);
            throw error;
        }
    }
    getClient() {
        return this.client;
    }
    async testConnection() {
        try {
            const response = await this.client.ping();
            this.isConnected = response;
            return response;
        }
        catch (error) {
            logger_1.default.error('Elasticsearch connection test failed:', error);
            this.isConnected = false;
            return false;
        }
    }
    async getHealth() {
        try {
            return await this.client.cluster.health();
        }
        catch (error) {
            logger_1.default.error('Error getting cluster health:', error);
            throw error;
        }
    }
    async createIndex(indexName, mapping) {
        try {
            const targetIndex = indexName || this.defaultIndexName;
            let enhancedMapping = mapping;
            if (!mapping) {
                if (targetIndex === 'benalsam_listings') {
                    enhancedMapping = this.getListingsIndexMapping();
                }
                else if (targetIndex === 'user_behaviors') {
                    enhancedMapping = this.getUserBehaviorsIndexMapping();
                }
            }
            await this.client.indices.create({
                index: targetIndex,
                body: enhancedMapping
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
            await this.client.indices.delete({
                index: targetIndex
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Delete index error:', error);
            return false;
        }
    }
    async recreateIndex(indexName, mapping) {
        try {
            const targetIndex = indexName || this.defaultIndexName;
            await this.deleteIndex(targetIndex);
            await this.createIndex(targetIndex, mapping);
            return true;
        }
        catch (error) {
            logger_1.default.error('Recreate index error:', error);
            return false;
        }
    }
    async bulkIndex(documents, indexName) {
        try {
            const targetIndex = indexName || this.defaultIndexName;
            const operations = documents.flatMap(doc => [
                { index: { _index: targetIndex, _id: doc.id } },
                doc
            ]);
            const response = await this.client.bulk({ body: operations });
            if (response.errors) {
                const errors = response.items
                    .filter((item) => item.index?.error)
                    .map((item) => item.index.error);
                logger_1.default.error('Bulk index errors:', errors);
                return false;
            }
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
                body: {
                    doc: document
                }
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
                size: options.size || 10,
                query: {
                    match_all: {}
                }
            });
            return response;
        }
        catch (error) {
            logger_1.default.error(`Error searching index ${indexName}:`, error);
            throw error;
        }
    }
    async getIndexStats() {
        try {
            const response = await this.client.indices.stats({
                index: this.defaultIndexName
            });
            return response;
        }
        catch (error) {
            logger_1.default.error('Error getting index stats:', error);
            throw error;
        }
    }
    async reindexAllListings() {
        try {
            const response = await this.client.search({
                index: 'benalsam_listings',
                size: 10000,
                query: { match_all: {} }
            });
            const documents = response.hits.hits.map((hit) => {
                const listing = hit._source;
                return this.transformListingForElasticsearch(listing);
            });
            const success = await this.bulkIndex(documents);
            return {
                success,
                count: documents.length,
                errors: success ? [] : ['Bulk indexing failed']
            };
        }
        catch (error) {
            logger_1.default.error('Reindex all listings error:', error);
            return {
                success: false,
                count: 0,
                errors: [error.message || 'Unknown error']
            };
        }
    }
    async searchListings(params) {
        try {
            const { query, filters, sort, page = 1, limit = 20 } = params;
            const searchQuery = {
                bool: {
                    must: [],
                    filter: []
                }
            };
            if (query) {
                searchQuery.bool.must.push({
                    multi_match: {
                        query,
                        fields: ['title^2', 'description', 'search_keywords'],
                        type: 'best_fields',
                        fuzziness: 'AUTO'
                    }
                });
            }
            if (filters) {
                if (filters.category) {
                    searchQuery.bool.filter.push({ term: { category: filters.category } });
                }
                if (filters.subcategory) {
                    searchQuery.bool.filter.push({ term: { subcategory: filters.subcategory } });
                }
                if (filters.location) {
                    searchQuery.bool.filter.push({ term: { 'location.province': filters.location } });
                }
                if (filters.minBudget || filters.maxBudget) {
                    const rangeQuery = { range: { 'budget.min': {} } };
                    if (filters.minBudget)
                        rangeQuery.range['budget.min'].gte = filters.minBudget;
                    if (filters.maxBudget)
                        rangeQuery.range['budget.min'].lte = filters.maxBudget;
                    searchQuery.bool.filter.push(rangeQuery);
                }
                if (filters.condition) {
                    searchQuery.bool.filter.push({ term: { condition: filters.condition } });
                }
                if (filters.urgency) {
                    searchQuery.bool.filter.push({ term: { urgency: filters.urgency } });
                }
                if (filters.attributes) {
                    Object.entries(filters.attributes).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            searchQuery.bool.filter.push({ term: { [`attributes.${key}`]: value } });
                        }
                    });
                }
            }
            let sortQuery = [];
            if (sort) {
                if (sort.field === 'relevance' && query) {
                    sortQuery.push({ _score: { order: 'desc' } });
                }
                else if (sort.field === 'price') {
                    sortQuery.push({ 'budget.min': { order: sort.order || 'asc' } });
                }
                else if (sort.field === 'date') {
                    sortQuery.push({ created_at: { order: sort.order || 'desc' } });
                }
                else if (sort.field === 'popularity') {
                    sortQuery.push({ popularity_score: { order: sort.order || 'desc' } });
                }
            }
            else {
                sortQuery.push({ created_at: { order: 'desc' } });
            }
            const response = await this.client.search({
                index: this.defaultIndexName,
                body: {
                    query: searchQuery,
                    sort: sortQuery,
                    from: (page - 1) * limit,
                    size: limit,
                    aggs: {
                        categories: {
                            terms: { field: 'category', size: 20 }
                        },
                        conditions: {
                            terms: { field: 'condition', size: 10 }
                        },
                        locations: {
                            terms: { field: 'location.province', size: 20 }
                        },
                        budget_ranges: {
                            range: {
                                field: 'budget.min',
                                ranges: [
                                    { to: 1000 },
                                    { from: 1000, to: 5000 },
                                    { from: 5000, to: 10000 },
                                    { from: 10000, to: 50000 },
                                    { from: 50000 }
                                ]
                            }
                        }
                    }
                }
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
                aggregations: response.aggregations,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            logger_1.default.error('Search listings error:', error);
            throw error;
        }
    }
    transformListingForElasticsearch(listing) {
        const locationParts = (listing.location || '').split(',').map((part) => part.trim());
        const location = {
            province: locationParts[0] || '',
            district: locationParts[1] || '',
            neighborhood: locationParts[2] || '',
            coordinates: listing.latitude && listing.longitude ? {
                lat: listing.latitude,
                lng: listing.longitude
            } : undefined
        };
        const budget = {
            min: listing.budget || 0,
            max: listing.budget || 0,
            currency: 'TRY'
        };
        const attributes = listing.attributes || {};
        const searchKeywords = this.generateSearchKeywords(listing, attributes);
        const popularityScore = this.calculatePopularityScore(listing);
        return {
            id: listing.id,
            user_id: listing.user_id,
            title: listing.title,
            description: listing.description,
            category: listing.category,
            subcategory: listing.subcategory,
            budget,
            location,
            condition: listing.condition || 'unknown',
            urgency: listing.urgency || 'medium',
            main_image_url: listing.main_image_url || listing.image_url || '',
            additional_image_urls: listing.additional_image_urls || [],
            status: listing.status || 'active',
            created_at: listing.created_at,
            updated_at: listing.updated_at,
            attributes,
            search_keywords: searchKeywords,
            popularity_score: popularityScore,
            user_trust_score: 0.5
        };
    }
    generateSearchKeywords(listing, attributes) {
        const keywords = new Set();
        if (listing.title) {
            keywords.add(listing.title.toLowerCase());
        }
        if (listing.description) {
            keywords.add(listing.description.toLowerCase());
        }
        if (listing.category) {
            keywords.add(listing.category.toLowerCase());
        }
        Object.entries(attributes).forEach(([key, value]) => {
            if (value && typeof value === 'string') {
                keywords.add(value.toLowerCase());
            }
        });
        return Array.from(keywords);
    }
    calculatePopularityScore(listing) {
        let score = 0;
        const createdAt = new Date(listing.created_at);
        const now = new Date();
        const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 10 - daysSinceCreation * 0.1);
        if (listing.is_premium)
            score += 5;
        if (listing.is_featured)
            score += 3;
        if (listing.is_urgent_premium)
            score += 2;
        if (listing.views)
            score += Math.min(listing.views * 0.01, 10);
        if (listing.favorites)
            score += listing.favorites * 0.5;
        if (listing.offers)
            score += listing.offers * 1;
        return Math.min(score, 100);
    }
}
exports.AdminElasticsearchService = AdminElasticsearchService;
exports.elasticsearchClient = new AdminElasticsearchService().getClient();
//# sourceMappingURL=elasticsearchService.js.map