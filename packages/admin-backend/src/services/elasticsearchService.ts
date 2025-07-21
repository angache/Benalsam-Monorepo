import { Client } from '@elastic/elasticsearch';
import logger from '../config/logger';

export class AdminElasticsearchService {
  protected client: Client;
  protected indexName: string;
  protected isConnected: boolean = false;

  constructor(
    node: string = process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    indexName: string = process.env.ELASTICSEARCH_INDEX || 'benalsam_listings',
    username: string = process.env.ELASTICSEARCH_USERNAME || '',
    password: string = process.env.ELASTICSEARCH_PASSWORD || ''
  ) {
    this.client = new Client({ node, auth: username ? { username, password } : undefined });
    this.indexName = indexName;
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

  async createIndex(mapping?: any): Promise<boolean> {
    try {
      await this.client.indices.create({
        index: this.indexName,
        body: mapping ? mapping : undefined
      });
      return true;
    } catch (error) {
      logger.error('Create index error:', error);
      return false;
    }
  }

  async deleteIndex(): Promise<boolean> {
    try {
      await this.client.indices.delete({ index: this.indexName });
      return true;
    } catch (error) {
      logger.error('Delete index error:', error);
      return false;
    }
  }

  async recreateIndex(mapping?: any): Promise<boolean> {
    await this.deleteIndex();
    return this.createIndex(mapping);
  }

  async bulkIndex(documents: any[]): Promise<boolean> {
    try {
      const body = documents.flatMap(doc => [{ index: { _index: this.indexName } }, doc]);
      await this.client.bulk({ refresh: true, body });
      return true;
    } catch (error) {
      logger.error('Bulk index error:', error);
      return false;
    }
  }

  async indexDocument(id: string, document: any): Promise<boolean> {
    try {
      await this.client.index({
        index: this.indexName,
        id,
        body: document
      });
      return true;
    } catch (error) {
      logger.error('Index document error:', error);
      return false;
    }
  }

  async updateDocument(id: string, document: any): Promise<boolean> {
    try {
      await this.client.update({
        index: this.indexName,
        id,
        body: { doc: document }
      });
      return true;
    } catch (error) {
      logger.error('Update document error:', error);
      return false;
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      await this.client.delete({
        index: this.indexName,
        id
      });
      return true;
    } catch (error) {
      logger.error('Delete document error:', error);
      return false;
    }
  }

  async search(query: any): Promise<any> {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: query
      });
      return response;
    } catch (error) {
      logger.error('Search error:', error);
      throw error;
    }
  }

  async getIndexStats(): Promise<any> {
    try {
      const response = await this.client.indices.stats({ index: this.indexName });
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
        index: this.indexName,
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