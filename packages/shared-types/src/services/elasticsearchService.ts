import { Client } from '@elastic/elasticsearch';
import {
  SearchQuery,
  SearchResult,
  SearchFilters,
  SearchAggregations,
  ElasticsearchIndexMapping,
  ElasticsearchHealth,
  ElasticsearchIndexStats,
  SearchSuggestions
} from '../types/search';

export class ElasticsearchService {
  protected client: Client;
  protected indexName: string;
  protected isConnected: boolean = false;

  constructor(
    node: string = process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    indexName: string = process.env.ELASTICSEARCH_INDEX || 'benalsam_listings'
  ) {
    this.client = new Client({
      node,
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || '',
        password: process.env.ELASTICSEARCH_PASSWORD || ''
      },
      tls: {
        rejectUnauthorized: false // Development için
      }
    });
    this.indexName = indexName;
  }

  /**
   * Get Elasticsearch client instance
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * Elasticsearch bağlantısını test et
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.ping();
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('❌ Elasticsearch connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Cluster health durumunu al
   */
  async getHealth(): Promise<ElasticsearchHealth> {
    try {
      const response = await this.client.cluster.health();
      return response as ElasticsearchHealth;
    } catch (error) {
      console.error('❌ Error getting cluster health:', error);
      throw error;
    }
  }

  /**
   * Index oluştur
   */
  async createIndex(mapping?: ElasticsearchIndexMapping): Promise<boolean> {
    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      
      if (exists) {
        console.log(`✅ Index ${this.indexName} already exists`);
        return true;
      }

      const indexConfig = {
        index: this.indexName,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                turkish_analyzer: {
                  type: 'turkish'
                }
              }
            }
          },
          mappings: mapping?.properties || {
            properties: {
              id: { type: 'keyword' },
              title: {
                type: 'text',
                analyzer: 'turkish_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                  suggest: { type: 'completion' }
                }
              },
              description: {
                type: 'text',
                analyzer: 'turkish_analyzer'
              },
              category: {
                type: 'keyword',
                fields: {
                  text: { type: 'text', analyzer: 'turkish_analyzer' }
                }
              },
              budget: { type: 'float' },
              location: { type: 'text', analyzer: 'turkish_analyzer' },
              latitude: { type: 'float' },
              longitude: { type: 'float' },
              urgency: { type: 'keyword' },
              attributes: { type: 'object' },
              user_id: { type: 'keyword' },
              status: { type: 'keyword' },
              created_at: { type: 'date' },
              popularity_score: { type: 'integer' },
              is_premium: { type: 'boolean' },
              tags: { type: 'keyword' }
            }
          }
        }
      };

      await this.client.indices.create(indexConfig);
      console.log(`✅ Index ${this.indexName} created successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating index ${this.indexName}:`, error);
      throw error;
    }
  }

  /**
   * Index'i sil
   */
  async deleteIndex(): Promise<boolean> {
    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      
      if (!exists) {
        console.log(`✅ Index ${this.indexName} does not exist`);
        return true;
      }

      await this.client.indices.delete({ index: this.indexName });
      console.log(`✅ Index ${this.indexName} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting index ${this.indexName}:`, error);
      throw error;
    }
  }

  /**
   * Document'ı index'e ekle
   */
  async indexDocument(id: string, document: any): Promise<boolean> {
    try {
      await this.client.index({
        index: this.indexName,
        id,
        body: document
      });
      return true;
    } catch (error) {
      console.error(`❌ Error indexing document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Document'ı güncelle
   */
  async updateDocument(id: string, document: any): Promise<boolean> {
    try {
      await this.client.update({
        index: this.indexName,
        id,
        body: {
          doc: document
        }
      });
      return true;
    } catch (error) {
      console.error(`❌ Error updating document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Document'ı sil
   */
  async deleteDocument(id: string): Promise<boolean> {
    try {
      await this.client.delete({
        index: this.indexName,
        id
      });
      return true;
    } catch (error) {
      console.error(`❌ Error deleting document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Arama yap
   */
  async search<T = any>(searchQuery: SearchQuery): Promise<SearchResult<T>> {
    try {
      const { query, filters, sort, page = 1, limit = 20, aggregations } = searchQuery;
      
      const body: any = {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: [
                    'title^3',
                    'description^2',
                    'category^1.5',
                    'tags^1'
                  ],
                  type: 'best_fields',
                  fuzziness: 'AUTO',
                  operator: 'and'
                }
              }
            ],
            filter: []
          }
        },
        sort: sort || [
          { is_premium: { order: 'desc' } },
          { popularity_score: { order: 'desc' } },
          { created_at: { order: 'desc' } }
        ],
        from: (page - 1) * limit,
        size: limit
      };

      // Filtreleri ekle
      if (filters) {
        this.addFilters(body.query.bool.filter, filters);
      }

      // Aggregations ekle
      if (aggregations && aggregations.length > 0) {
        body.aggs = this.buildAggregations(aggregations);
      }

      const response = await this.client.search({
        index: this.indexName,
        body
      });

      return {
        hits: response.hits.hits.map((hit: any) => ({
          id: hit._id,
          score: hit._score,
          source: hit._source,
          highlights: hit.highlight
        })),
        total: typeof response.hits.total === 'number' ? response.hits.total : response.hits.total?.value || 0,
        page,
        limit,
        aggregations: response.aggregations,
        took: response.took
      };
    } catch (error) {
      console.error('❌ Error performing search:', error);
      throw error;
    }
  }

  /**
   * Autocomplete suggestions
   */
  async getSuggestions(query: string): Promise<SearchSuggestions> {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          suggest: {
            'listing-suggest': {
              prefix: query,
              completion: {
                field: 'title.suggest',
                size: 5,
                skip_duplicates: true
              }
            },
            'category-suggest': {
              prefix: query,
              completion: {
                field: 'category.suggest',
                size: 3
              }
            }
          }
        }
      });

      const suggestions: SearchSuggestions = {
        listings: [],
        categories: [],
        tags: []
      };

      if (response.suggest && response.suggest['listing-suggest'] && response.suggest['listing-suggest'][0]) {
        const listingSuggest = response.suggest['listing-suggest'][0];
        if (Array.isArray(listingSuggest.options)) {
          suggestions.listings = listingSuggest.options.map((opt: any) => ({
            text: opt.text,
            score: opt.score,
            category: 'listing'
          }));
        }
      }

      if (response.suggest && response.suggest['category-suggest'] && response.suggest['category-suggest'][0]) {
        const categorySuggest = response.suggest['category-suggest'][0];
        if (Array.isArray(categorySuggest.options)) {
          suggestions.categories = categorySuggest.options.map((opt: any) => ({
            text: opt.text,
            score: opt.score,
            category: 'category'
          }));
        }
      }

      return suggestions;
    } catch (error) {
      console.error('❌ Error getting suggestions:', error);
      throw error;
    }
  }

  /**
   * Index istatistiklerini al
   */
  async getIndexStats(): Promise<ElasticsearchIndexStats> {
    try {
      const response = await this.client.indices.stats({
        index: this.indexName
      });
      
      if (!response.indices || !response.indices[this.indexName]) {
        throw new Error(`Index ${this.indexName} not found`);
      }

      const indexStats = response.indices[this.indexName];
      const total = indexStats.total;

      if (!total) {
        throw new Error(`No stats available for index ${this.indexName}`);
      }

      return {
        index: this.indexName,
        docs: {
          count: total.docs?.count || 0,
          deleted: total.docs?.deleted || 0
        },
        store: {
          size_in_bytes: total.store?.size_in_bytes || 0,
          total_data_set_size_in_bytes: total.store?.total_data_set_size_in_bytes || 0
        },
        indexing: {
          index_total: total.indexing?.index_total || 0,
          index_time_in_millis: total.indexing?.index_time_in_millis || 0,
          index_current: total.indexing?.index_current || 0,
          index_failed: total.indexing?.index_failed || 0
        },
        search: {
          query_total: total.search?.query_total || 0,
          query_time_in_millis: total.search?.query_time_in_millis || 0,
          query_current: total.search?.query_current || 0,
          fetch_total: total.search?.fetch_total || 0,
          fetch_time_in_millis: total.search?.fetch_time_in_millis || 0,
          fetch_current: total.search?.fetch_current || 0
        }
      };
    } catch (error) {
      console.error('❌ Error getting index stats:', error);
      throw error;
    }
  }

  /**
   * Bulk indexing
   */
  async bulkIndex(documents: Array<{ id: string; document: any }>): Promise<boolean> {
    try {
      const body = documents.flatMap(({ id, document }) => [
        { index: { _index: this.indexName, _id: id } },
        document
      ]);

      const response = await this.client.bulk({ body });
      
      if (response.errors) {
        const errors = response.items.filter((item: any) => item.index?.error);
        console.error('❌ Bulk indexing errors:', errors);
        return false;
      }

      console.log(`✅ Bulk indexed ${documents.length} documents`);
      return true;
    } catch (error) {
      console.error('❌ Error bulk indexing:', error);
      throw error;
    }
  }

  /**
   * Filtreleri query'ye ekle
   */
  private addFilters(filterArray: any[], filters: SearchFilters): void {
    if (filters.category) {
      if (Array.isArray(filters.category)) {
        filterArray.push({
          terms: { category: filters.category }
        });
      } else {
        filterArray.push({
          term: { category: filters.category }
        });
      }
    }

    if (filters.budget) {
      const range: any = { budget: {} };
      if (filters.budget.min !== undefined) range.budget.gte = filters.budget.min;
      if (filters.budget.max !== undefined) range.budget.lte = filters.budget.max;
      filterArray.push({ range });
    }

    if (filters.location) {
      filterArray.push({
        geo_distance: {
          location: {
            lat: filters.location.lat,
            lon: filters.location.lon
          },
          distance: filters.location.distance || '50km'
        }
      });
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        filterArray.push({
          terms: { status: filters.status }
        });
      } else {
        filterArray.push({
          term: { status: filters.status }
        });
      }
    }

    if (filters.is_premium !== undefined) {
      filterArray.push({
        term: { is_premium: filters.is_premium }
      });
    }

    if (filters.created_after || filters.created_before) {
      const range: any = { created_at: {} };
      if (filters.created_after) range.created_at.gte = filters.created_after;
      if (filters.created_before) range.created_at.lte = filters.created_before;
      filterArray.push({ range });
    }
  }

  /**
   * Aggregations oluştur
   */
  private buildAggregations(aggregationNames: string[]): Record<string, any> {
    const aggs: Record<string, any> = {};

    aggregationNames.forEach(name => {
      switch (name) {
        case 'price_ranges':
          aggs.price_ranges = {
            range: {
              field: 'budget',
              ranges: [
                { to: 5000 },
                { from: 5000, to: 10000 },
                { from: 10000, to: 20000 },
                { from: 20000 }
              ]
            }
          };
          break;
        case 'categories':
          aggs.categories = {
            terms: {
              field: 'category',
              size: 10
            }
          };
          break;
        case 'conditions':
          aggs.conditions = {
            terms: {
              field: 'condition',
              size: 5
            }
          };
          break;
        case 'locations':
          aggs.locations = {
            terms: {
              field: 'location.text',
              size: 10
            }
          };
          break;
      }
    });

    return aggs;
  }
} 