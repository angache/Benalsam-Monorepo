import { Client } from '@elastic/elasticsearch';
import logger from '../config/logger';

export class AdminElasticsearchService {
  protected client: Client;
  protected defaultIndexName: string;
  protected isConnected: boolean = false;

  constructor(
    node: string = process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    defaultIndexName: string = 'benalsam_listings', // Default index, artık environment variable kullanmıyoruz
    username: string = process.env.ELASTICSEARCH_USERNAME || '',
    password: string = process.env.ELASTICSEARCH_PASSWORD || ''
  ) {
    logger.info('🔧 ElasticsearchService constructor:', { node, defaultIndexName, username: username ? 'set' : 'not set' });
    this.client = new Client({ node, auth: username ? { username, password } : undefined });
    this.defaultIndexName = defaultIndexName;
  }

  // Static method to get all indices stats
  static async getAllIndicesStats(): Promise<any> {
    try {
      const node = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
      const username = process.env.ELASTICSEARCH_USERNAME || '';
      const password = process.env.ELASTICSEARCH_PASSWORD || '';
      
      logger.info('🔍 Static method: Getting all indices stats...');
      logger.info('🔧 Static method: Client config:', { node, username: username ? 'set' : 'not set' });
      
      // Create a new client instance for this operation
      const client = new Client({ 
        node, 
        auth: username ? { username, password } : undefined 
      });
      
      // Test connection first
      await client.ping();
      logger.info('✅ Static method: Elasticsearch connection successful');
      
      // First, get all indices using cat API
      const indicesResponse = await client.cat.indices({ 
        format: 'json',
        expand_wildcards: 'all'
      });
      logger.info('📋 Static method: Available indices:', indicesResponse.map((idx: any) => idx.index));
      
      // Get all indices stats
      const response = await client.indices.stats();
      logger.info('📊 Static method: Indices stats response keys:', Object.keys(response.indices || {}));
      
      return response;
    } catch (error) {
      logger.error('Static method: Get index stats error:', error);
      throw error;
    }
  }

  // Static method to search specific index
  static async searchIndexStatic(indexName: string, options: { size?: number } = {}): Promise<any> {
    try {
      const node = process.env.ELASTICSEARCH_URL || 'http://209.227.228.96:9200';
      const username = process.env.ELASTICSEARCH_USERNAME || '';
      const password = process.env.ELASTICSEARCH_PASSWORD || '';
      
      logger.info('🔍 Static method: Searching index:', indexName);
      logger.info('🔧 Static method: Client config:', { node, username: username ? 'set' : 'not set' });
      
      // Create a new client instance for this operation
      const client = new Client({ 
        node, 
        auth: username ? { username, password } : undefined 
      });
      
      // Index'e göre sıralama belirle
      let sortFields: any[];
      if (indexName === 'user_behaviors') {
        sortFields = [
          { timestamp: { order: 'desc' as const } },
          { _id: { order: 'desc' as const } }
        ];
      } else if (indexName === 'benalsam_listings') {
        sortFields = [
          { created_at: { order: 'desc' as const } },
          { _id: { order: 'desc' as const } }
        ];
      } else {
        // Default sıralama
        sortFields = [
          { _id: { order: 'desc' as const } }
        ];
      }
      
      const response = await client.search({
        index: indexName,
        body: {
          query: {
            match_all: {}
          },
          sort: sortFields,
          size: options.size || 20
        }
      });
      
      return response;
    } catch (error) {
      logger.error('Static method: Index search error:', error);
      throw error;
    }
  }

  getClient() {
    return this.client;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.ping();
      this.isConnected = true;
      return true;
    } catch (error) {
      this.isConnected = false;
      logger.error('❌ Elasticsearch connection failed:', error);
      return false;
    }
  }

  async getHealth(): Promise<any> {
    const response = await this.client.cluster.health();
    return response;
  }

  async createIndex(indexName?: string, mapping?: any): Promise<boolean> {
    try {
      const targetIndex = indexName || this.defaultIndexName;
      await this.client.indices.create({
        index: targetIndex,
        body: mapping ? mapping : undefined
      });
      return true;
    } catch (error) {
      logger.error('Create index error:', error);
      return false;
    }
  }

  async deleteIndex(indexName?: string): Promise<boolean> {
    try {
      const targetIndex = indexName || this.defaultIndexName;
      await this.client.indices.delete({ index: targetIndex });
      return true;
    } catch (error) {
      logger.error('Delete index error:', error);
      return false;
    }
  }

  async recreateIndex(indexName?: string, mapping?: any): Promise<boolean> {
    const targetIndex = indexName || this.defaultIndexName;
    await this.deleteIndex(targetIndex);
    return this.createIndex(targetIndex, mapping);
  }

  async bulkIndex(documents: any[], indexName?: string): Promise<boolean> {
    try {
      const targetIndex = indexName || this.defaultIndexName;
      const body = documents.flatMap(doc => [{ index: { _index: targetIndex } }, doc]);
      await this.client.bulk({ refresh: true, body });
      return true;
    } catch (error) {
      logger.error('Bulk index error:', error);
      return false;
    }
  }

  async indexDocument(id: string, document: any, indexName?: string): Promise<boolean> {
    try {
      const targetIndex = indexName || this.defaultIndexName;
      await this.client.index({
        index: targetIndex,
        id,
        body: document
      });
      return true;
    } catch (error) {
      logger.error('Index document error:', error);
      return false;
    }
  }

  async updateDocument(id: string, document: any, indexName?: string): Promise<boolean> {
    try {
      const targetIndex = indexName || this.defaultIndexName;
      await this.client.update({
        index: targetIndex,
        id,
        body: { doc: document }
      });
      return true;
    } catch (error) {
      logger.error('Update document error:', error);
      return false;
    }
  }

  async deleteDocument(id: string, indexName?: string): Promise<boolean> {
    try {
      const targetIndex = indexName || this.defaultIndexName;
      await this.client.delete({
        index: targetIndex,
        id
      });
      return true;
    } catch (error) {
      logger.error('Delete document error:', error);
      return false;
    }
  }

  async search(query: any, indexName?: string): Promise<any> {
    try {
      const targetIndex = indexName || this.defaultIndexName;
      const response = await this.client.search({
        index: targetIndex,
        body: query
      });
      return response;
    } catch (error) {
      logger.error('Search error:', error);
      throw error;
    }
  }

  async searchIndex(indexName: string, options: { size?: number } = {}): Promise<any> {
    try {
      // Index'e göre sıralama belirle
      let sortFields: any[];
      if (indexName === 'user_behaviors') {
        sortFields = [
          { timestamp: { order: 'desc' as const } },
          { _id: { order: 'desc' as const } }
        ];
      } else if (indexName === 'benalsam_listings') {
        sortFields = [
          { created_at: { order: 'desc' as const } },
          { _id: { order: 'desc' as const } }
        ];
      } else {
        // Default sıralama
        sortFields = [
          { _id: { order: 'desc' as const } }
        ];
      }

      const response = await this.client.search({
        index: indexName,
        body: {
          query: {
            match_all: {}
          },
          sort: sortFields,
          size: options.size || 20
        }
      });
      return response;
    } catch (error) {
      logger.error('Index search error:', error);
      throw error;
    }
  }

  async getIndexStats(): Promise<any> {
    try {
      logger.info('🔍 Getting all indices stats...');
      logger.info('🔧 Client config:', { node: this.client.connectionPool.connections[0]?.url });
      
      // Tüm indexlerin stats'ini al
      const response = await this.client.indices.stats();
      logger.info('📊 Indices stats response keys:', Object.keys(response.indices || {}));
      logger.info('📊 Indices stats response:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      logger.error('Get index stats error:', error);
      throw error;
    }
  }

  async reindexAllListings(): Promise<{ success: boolean; count: number; errors: string[] }> {
    try {
      logger.info('🔄 Starting full reindex of all listings...');

      // Önce index'i sil ve yeniden oluştur
      await this.deleteIndex();
      await this.createIndex();

      // Supabase'den tüm listings'i al
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      let page = 0;
      const limit = 100;
      let totalIndexed = 0;
      const errors: string[] = [];

      while (true) {
        const { data: listings, error } = await supabase
          .from('listings')
          .select('*')
          .range(page * limit, (page + 1) * limit - 1)
          .eq('status', 'active');

        if (error) {
          logger.error('❌ Error fetching listings from Supabase:', error);
          errors.push(`Supabase error: ${error.message}`);
          break;
        }

        if (!listings || listings.length === 0) {
          break;
        }

        // Listings'i Elasticsearch formatına çevir
        const documents = listings.map((listing: any) => ({
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

        // Bulk index
        const success = await this.bulkIndex(documents);
        if (success) {
          totalIndexed += documents.length;
          logger.info(
            `✅ Indexed ${documents.length} listings (total: ${totalIndexed})`
          );
        } else {
          errors.push(`Failed to index batch ${page + 1}`);
        }

        page++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      logger.info(
        `✅ Reindex completed. Total indexed: ${totalIndexed}, Errors: ${errors.length}`
      );

      return {
        success: errors.length === 0,
        count: totalIndexed,
        errors,
      };
    } catch (error) {
      logger.error('❌ Error during reindex:', error);
      throw error;
    }
  }

  async searchListings(params: {
    query?: string;
    filters?: any;
    sort?: any;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const {
        query = '',
        filters = {},
        sort = {},
        page = 1,
        limit = 20,
      } = params;

      const searchBody: any = {
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

      // Text search
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

      // Filters
      if (filters.category) {
        searchBody.query.bool.filter.push({
          term: { category: filters.category },
        });
      }

      if (filters.minBudget || filters.maxBudget) {
        const rangeFilter: any = { budget: {} };
        if (filters.minBudget) rangeFilter.budget.gte = filters.minBudget;
        if (filters.maxBudget) rangeFilter.budget.lte = filters.maxBudget;
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

      // Custom sort
      if (sort.field && sort.order) {
        searchBody.sort.unshift({ [sort.field]: { order: sort.order } });
      }

      const response = await this.client.search({
        index: this.defaultIndexName,
        body: searchBody,
      });

      const total =
        typeof response.hits.total === 'number'
          ? response.hits.total
          : response.hits.total?.value || 0;

      return {
        hits: response.hits.hits.map((hit: any) => ({
          id: hit._id,
          score: hit._score,
          ...hit._source,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('❌ Error searching listings:', error);
      throw error;
    }
  }
}

// Export elasticsearch client instance for health checks
export const elasticsearchClient = new AdminElasticsearchService().getClient(); 