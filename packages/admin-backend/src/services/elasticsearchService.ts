import { ElasticsearchService as BaseElasticsearchService } from '@benalsam/shared-types';
import logger from '../config/logger';

export class AdminElasticsearchService extends BaseElasticsearchService {
  constructor() {
    super(
      process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      process.env.ELASTICSEARCH_INDEX || 'benalsam_listings'
    );
  }

  /**
   * Admin-specific: Tüm listings'i yeniden index'le
   */
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

        // Bulk index
        const success = await this.bulkIndex(documents);
        if (success) {
          totalIndexed += documents.length;
          logger.info(`✅ Indexed ${documents.length} listings (total: ${totalIndexed})`);
        } else {
          errors.push(`Failed to index batch ${page + 1}`);
        }

        page++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      logger.info(`✅ Reindex completed. Total indexed: ${totalIndexed}, Errors: ${errors.length}`);

      return {
        success: errors.length === 0,
        count: totalIndexed,
        errors
      };
    } catch (error) {
      logger.error('❌ Error during reindex:', error);
      throw error;
    }
  }

  /**
   * Admin-specific: Index istatistiklerini al
   */
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
    } catch (error) {
      logger.error('❌ Error getting index stats:', error);
      throw error;
    }
  }

  /**
   * Admin-specific: Index'i optimize et
   */
  async optimizeIndex(): Promise<boolean> {
    try {
      logger.info('🔄 Optimizing index...');
      
      // Force merge segments
      await this.client.indices.forcemerge({
        index: this.indexName,
        max_num_segments: 1
      });

      // Refresh index
      await this.client.indices.refresh({
        index: this.indexName
      });

      logger.info('✅ Index optimization completed');
      return true;
    } catch (error) {
      logger.error('❌ Error optimizing index:', error);
      throw error;
    }
  }

  /**
   * Admin-specific: Test document ekle
   */
  async addTestDocument(): Promise<boolean> {
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
      logger.info('✅ Test document added successfully');
      return true;
    } catch (error) {
      logger.error('❌ Error adding test document:', error);
      throw error;
    }
  }

  /**
   * Admin-specific: Listings arama
   */
  async searchListings(params: {
    query?: string;
    filters?: any;
    sort?: any;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const { query = '', filters = {}, sort = {}, page = 1, limit = 20 } = params;
      
      const searchBody: any = {
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

      // Text search
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

      // Filters
      if (filters.category) {
        searchBody.query.bool.filter.push({
          term: { category: filters.category }
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

      // Custom sort
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
        hits: response.hits.hits.map((hit: any) => ({
          id: hit._id,
          score: hit._score,
          ...hit._source
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('❌ Error searching listings:', error);
      throw error;
    }
  }

  /**
   * Admin-specific: Index mapping'ini al
   */
  async getIndexMapping(): Promise<any> {
    try {
      const response = await this.client.indices.getMapping({
        index: this.indexName
      });
      
      return response[this.indexName]?.mappings || {};
    } catch (error) {
      logger.error('❌ Error getting index mapping:', error);
      throw error;
    }
  }

  /**
   * Admin-specific: Index settings'ini al
   */
  async getIndexSettings(): Promise<any> {
    try {
      const response = await this.client.indices.getSettings({
        index: this.indexName
      });
      
      return response[this.indexName]?.settings || {};
    } catch (error) {
      logger.error('❌ Error getting index settings:', error);
      throw error;
    }
  }

  /**
   * Admin-specific: Index'i yeniden oluştur
   */
  async recreateIndex(): Promise<boolean> {
    try {
      logger.info('🔄 Recreating index...');
      
      await this.deleteIndex();
      await this.createIndex();
      
      logger.info('✅ Index recreated successfully');
      return true;
    } catch (error) {
      logger.error('❌ Error recreating index:', error);
      throw error;
    }
  }

  /**
   * Admin-specific: Index'teki tüm document'ları sil
   */
  async clearIndex(): Promise<boolean> {
    try {
      logger.info('🔄 Clearing index...');
      
      await this.client.deleteByQuery({
        index: this.indexName,
        body: {
          query: {
            match_all: {}
          }
        }
      });

      // Refresh index
      await this.client.indices.refresh({
        index: this.indexName
      });
      
      logger.info('✅ Index cleared successfully');
      return true;
    } catch (error) {
      logger.error('❌ Error clearing index:', error);
      throw error;
    }
  }
}

// Export elasticsearch client instance for health checks
export const elasticsearchClient = new AdminElasticsearchService().getClient(); 