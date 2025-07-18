"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchService = exports.SearchService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const logger_1 = __importDefault(require("../config/logger"));
class SearchService {
    supabase = null;
    elasticsearchClient = null;
    redisClient = null;
    isElasticsearchAvailable = false;
    constructor() {
        this.initializeElasticsearch();
        this.initializeRedis();
    }
    getSupabaseClient() {
        if (!this.supabase) {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (!supabaseUrl || !supabaseServiceKey) {
                throw new Error('Supabase configuration missing. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
            }
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
        }
        return this.supabase;
    }
    async initializeElasticsearch() {
        try {
            logger_1.default.info('Elasticsearch client initialized');
        }
        catch (error) {
            logger_1.default.warn('Elasticsearch not available, using Supabase fallback');
            this.isElasticsearchAvailable = false;
        }
    }
    async initializeRedis() {
        try {
            logger_1.default.info('Redis client initialized');
        }
        catch (error) {
            logger_1.default.warn('Redis not available, caching disabled');
        }
    }
    async searchListings(params) {
        const startTime = Date.now();
        try {
            const cached = await this.getCachedResult(params);
            if (cached) {
                return {
                    ...cached,
                    responseTime: Date.now() - startTime,
                    cached: true
                };
            }
            if (this.isElasticsearchAvailable) {
                try {
                    const result = await this.elasticsearchSearch(params);
                    await this.cacheResult(params, result);
                    return {
                        ...result,
                        responseTime: Date.now() - startTime,
                        cached: false
                    };
                }
                catch (error) {
                    logger_1.default.warn('Elasticsearch search failed, falling back to Supabase:', error);
                }
            }
            const result = await this.supabaseSearch(params);
            await this.cacheResult(params, result);
            return {
                ...result,
                responseTime: Date.now() - startTime,
                cached: false
            };
        }
        catch (error) {
            logger_1.default.error('Search failed:', error);
            throw new Error('Search operation failed');
        }
    }
    async elasticsearchSearch(params) {
        throw new Error('Elasticsearch not implemented yet');
    }
    async supabaseSearch(params) {
        try {
            const { query, categories, location, urgency = 'Tümü', minPrice, maxPrice, page = 1, pageSize = 20, sortBy = 'created_at', sortOrder = 'desc', attributes } = params;
            const rpcParams = {
                search_query: query || null,
                p_categories: categories || null,
                p_location: location || null,
                p_urgency: urgency,
                min_price: minPrice || null,
                max_price: maxPrice || null,
                p_attributes: attributes ? JSON.stringify(attributes) : null,
                p_page: page,
                p_page_size: pageSize,
                sort_key: sortBy,
                sort_direction: sortOrder
            };
            logger_1.default.info('Searching with Supabase RPC:', rpcParams);
            const { data, error } = await this.getSupabaseClient().rpc('search_listings_with_attributes', rpcParams);
            if (error) {
                logger_1.default.error('Supabase search error:', error);
                throw new Error(`Supabase search failed: ${error.message}`);
            }
            if (!data || data.length === 0) {
                return {
                    data: [],
                    totalCount: 0,
                    searchEngine: 'supabase',
                    responseTime: 0,
                    cached: false,
                    pagination: {
                        page,
                        pageSize,
                        totalPages: 0
                    },
                    metadata: {
                        query,
                        filters: { categories, location, urgency, minPrice, maxPrice, attributes },
                        timestamp: new Date().toISOString()
                    }
                };
            }
            const totalCount = data[0]?.total_count || 0;
            const totalPages = Math.ceil(totalCount / pageSize);
            return {
                data: data.map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    category: item.category,
                    budget: item.budget,
                    location: item.location,
                    urgency: item.urgency,
                    main_image_url: item.main_image_url,
                    additional_image_urls: item.additional_image_urls,
                    status: item.status,
                    views_count: item.views_count,
                    offers_count: item.offers_count,
                    favorites_count: item.favorites_count,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    expires_at: item.expires_at,
                    is_featured: item.is_featured,
                    is_urgent_premium: item.is_urgent_premium,
                    is_showcase: item.is_showcase,
                    has_bold_border: item.has_bold_border
                })),
                totalCount,
                searchEngine: 'supabase',
                responseTime: 0,
                cached: false,
                pagination: {
                    page,
                    pageSize,
                    totalPages
                },
                metadata: {
                    query,
                    filters: { categories, location, urgency, minPrice, maxPrice, attributes },
                    timestamp: new Date().toISOString()
                }
            };
        }
        catch (error) {
            logger_1.default.error('Supabase search error:', error);
            throw error;
        }
    }
    async getCachedResult(params) {
        if (!this.redisClient)
            return null;
        try {
            const cacheKey = `search:${JSON.stringify(params)}`;
            const cached = await this.redisClient.get(cacheKey);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            logger_1.default.warn('Cache get error:', error);
            return null;
        }
    }
    async cacheResult(params, result) {
        if (!this.redisClient)
            return;
        try {
            const cacheKey = `search:${JSON.stringify(params)}`;
            const ttl = parseInt(process.env.SEARCH_CACHE_TTL || '300');
            await this.redisClient.setEx(cacheKey, ttl, JSON.stringify(result));
        }
        catch (error) {
            logger_1.default.warn('Cache set error:', error);
        }
    }
    async getSuggestions(query) {
        try {
            return [];
        }
        catch (error) {
            logger_1.default.error('Get suggestions error:', error);
            return [];
        }
    }
    async getAnalytics() {
        try {
            return {
                totalSearches: 0,
                popularQueries: [],
                averageResponseTime: 0,
                cacheHitRate: 0
            };
        }
        catch (error) {
            logger_1.default.error('Get analytics error:', error);
            return {};
        }
    }
    async healthCheck() {
        return {
            elasticsearch: this.isElasticsearchAvailable,
            redis: !!this.redisClient,
            supabase: !!this.supabase
        };
    }
}
exports.SearchService = SearchService;
exports.searchService = new SearchService();
//# sourceMappingURL=searchService.js.map