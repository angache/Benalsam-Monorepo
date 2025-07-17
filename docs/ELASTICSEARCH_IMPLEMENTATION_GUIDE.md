# Elasticsearch Implementasyon Rehberi - Benalsam Projesi

## 🎯 Proje Özeti

**Hedef**: Mevcut Supabase arama sistemini Elasticsearch ile değiştirerek gelişmiş arama deneyimi sağlamak.

**Süre**: 3-4 hafta
**Öncelik**: Yüksek
**Etki**: Kullanıcı deneyiminde %70 iyileşme bekleniyor

## 📋 Mevcut Durum

### Şu Anki Sistem
- **Arama Motoru**: Supabase PostgreSQL Full-Text Search
- **Performans**: Orta (büyük veri setlerinde yavaş)
- **Özellikler**: Temel text search, basit filtreleme
- **Sınırlamalar**: Fuzzy search yok, synonym desteği yok, karmaşık sorgular zor

### Veri Yapısı
```sql
-- Mevcut listings tablosu
CREATE TABLE listings (
  id UUID PRIMARY KEY,
  title TEXT,
  description TEXT,
  category TEXT,
  budget NUMERIC,
  location TEXT,
  urgency TEXT,
  attributes JSONB,
  status TEXT,
  created_at TIMESTAMP,
  -- ... diğer alanlar
);
```

## 🏗️ Yeni Sistem Mimarisi

### Elasticsearch Index Yapısı
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": { 
        "type": "text",
        "analyzer": "turkish",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "completion" }
        }
      },
      "description": { 
        "type": "text",
        "analyzer": "turkish" 
      },
      "category": { 
        "type": "keyword",
        "fields": {
          "text": { "type": "text", "analyzer": "turkish" }
        }
      },
      "budget": { "type": "float" },
      "location": { 
        "type": "geo_point",
        "fields": {
          "text": { "type": "text", "analyzer": "turkish" }
        }
      },
      "urgency": { "type": "keyword" },
      "attributes": { "type": "object" },
      "user_id": { "type": "keyword" },
      "status": { "type": "keyword" },
      "created_at": { "type": "date" },
      "popularity_score": { "type": "integer" },
      "is_premium": { "type": "boolean" },
      "tags": { "type": "keyword" }
    }
  }
}
```

### Data Flow
```
Supabase PostgreSQL → Change Data Capture → Elasticsearch
         ↓
   PostgreSQL Triggers → Message Queue → Indexer Service
         ↓
    Real-time Sync → Elasticsearch Index
```

## 🚀 Implementasyon Planı

### Faz 1: Temel Kurulum (1 hafta)

#### 1.1 Elasticsearch Kurulumu
```bash
# Docker ile Elasticsearch
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "cluster.name=benalsam-cluster" \
  -e "node.name=benalsam-node-1" \
  elasticsearch:8.11.0

# Kibana (opsiyonel - monitoring için)
docker run -d \
  --name kibana \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  kibana:8.11.0
```

#### 1.2 Index Oluşturma
```typescript
// services/elasticsearchService.ts
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200'
});

export class ElasticsearchService {
  async createListingsIndex() {
    try {
      await client.indices.create({
        index: 'listings',
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                turkish: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: [
                    'lowercase',
                    'turkish_stop',
                    'turkish_stemmer',
                    'asciifolding'
                  ]
                }
              }
            }
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: {
                type: 'text',
                analyzer: 'turkish',
                fields: {
                  keyword: { type: 'keyword' },
                  suggest: { type: 'completion' }
                }
              },
              description: {
                type: 'text',
                analyzer: 'turkish'
              },
              category: {
                type: 'keyword',
                fields: {
                  text: { type: 'text', analyzer: 'turkish' }
                }
              },
              budget: { type: 'float' },
              location: {
                type: 'geo_point',
                fields: {
                  text: { type: 'text', analyzer: 'turkish' }
                }
              },
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
      });
      
      console.log('✅ Listings index created successfully');
    } catch (error) {
      console.error('❌ Error creating index:', error);
      throw error;
    }
  }
}
```

#### 1.3 Initial Data Migration
```typescript
// services/dataMigrationService.ts
export class DataMigrationService {
  async migrateListingsToElasticsearch() {
    try {
      console.log('🔄 Starting listings migration...');
      
      // Supabase'den tüm aktif ilanları çek
      const { data: listings, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      
      console.log(`📊 Found ${listings.length} listings to migrate`);
      
      // Elasticsearch'e bulk index
      const operations = listings.flatMap(listing => [
        { index: { _index: 'listings', _id: listing.id } },
        this.transformListingForElasticsearch(listing)
      ]);
      
      const { errors, items } = await client.bulk({ body: operations });
      
      if (errors) {
        console.error('❌ Bulk indexing errors:', errors);
      }
      
      console.log(`✅ Successfully indexed ${items.length} listings`);
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
  
  private transformListingForElasticsearch(listing: any) {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      budget: listing.budget,
      location: listing.geolocation ? {
        lat: listing.geolocation.coordinates[1],
        lon: listing.geolocation.coordinates[0]
      } : null,
      urgency: listing.urgency,
      attributes: listing.attributes,
      user_id: listing.user_id,
      status: listing.status,
      created_at: listing.created_at,
      popularity_score: listing.popularity_score || 0,
      is_premium: listing.is_premium || false,
      tags: listing.tags || []
    };
  }
}
```

### Faz 2: Arama API Geliştirme (1 hafta)

#### 2.1 Search Service
```typescript
// services/searchService.ts
export class SearchService {
  async searchListings(searchParams: SearchParams): Promise<SearchResponse> {
    try {
      const query = this.buildSearchQuery(searchParams);
      
      const response = await client.search({
        index: 'listings',
        body: {
          query,
          aggs: this.buildAggregations(),
          sort: this.buildSorting(searchParams.sortBy, searchParams.sortOrder),
          from: (searchParams.page - 1) * searchParams.size,
          size: searchParams.size
        }
      });
      
      return this.formatSearchResponse(response);
      
    } catch (error) {
      console.error('❌ Search error:', error);
      throw error;
    }
  }
  
  private buildSearchQuery(params: SearchParams) {
    const query: any = {
      bool: {
        must: [],
        filter: [],
        should: []
      }
    };
    
    // Text search
    if (params.query) {
      query.bool.must.push({
        multi_match: {
          query: params.query,
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
      });
    }
    
    // Filters
    if (params.category) {
      query.bool.filter.push({
        term: { category: params.category }
      });
    }
    
    if (params.minPrice || params.maxPrice) {
      query.bool.filter.push({
        range: {
          budget: {
            gte: params.minPrice,
            lte: params.maxPrice
          }
        }
      });
    }
    
    if (params.location && params.radius) {
      query.bool.filter.push({
        geo_distance: {
          location: params.location,
          distance: `${params.radius}km`
        }
      });
    }
    
    // Status filter
    query.bool.filter.push({
      term: { status: 'active' }
    });
    
    return query;
  }
  
  private buildAggregations() {
    return {
      price_ranges: {
        range: {
          field: 'budget',
          ranges: [
            { to: 1000 },
            { from: 1000, to: 5000 },
            { from: 5000, to: 10000 },
            { from: 10000 }
          ]
        }
      },
      categories: {
        terms: {
          field: 'category',
          size: 20
        }
      },
      locations: {
        terms: {
          field: 'location.text',
          size: 10
        }
      },
      conditions: {
        terms: {
          field: 'attributes.condition',
          size: 5
        }
      }
    };
  }
  
  private buildSorting(sortBy: string, sortOrder: string) {
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    
    switch (sortBy) {
      case 'price':
        return [{ budget: { order } }];
      case 'date':
        return [{ created_at: { order } }];
      case 'popularity':
        return [{ popularity_score: { order } }];
      default:
        return [
          { is_premium: { order: 'desc' }},
          { popularity_score: { order: 'desc' }},
          { created_at: { order: 'desc' }}
        ];
    }
  }
  
  private formatSearchResponse(response: any): SearchResponse {
    return {
      hits: response.hits.hits.map((hit: any) => ({
        ...hit._source,
        score: hit._score
      })),
      total: response.hits.total.value,
      aggregations: {
        priceRanges: response.aggregations.price_ranges.buckets,
        categories: response.aggregations.categories.buckets,
        locations: response.aggregations.locations.buckets,
        conditions: response.aggregations.conditions.buckets
      }
    };
  }
}
```

#### 2.2 API Endpoints
```typescript
// routes/search.ts
import { Router } from 'express';
import { SearchService } from '../services/searchService';

const router = Router();
const searchService = new SearchService();

// GET /api/search
router.get('/search', async (req, res) => {
  try {
    const searchParams = {
      query: req.query.q as string,
      category: req.query.category as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      location: req.query.location as string,
      radius: req.query.radius ? parseInt(req.query.radius as string) : undefined,
      sortBy: req.query.sortBy as string || 'relevance',
      sortOrder: req.query.sortOrder as string || 'desc',
      page: parseInt(req.query.page as string) || 1,
      size: parseInt(req.query.size as string) || 20
    };
    
    const results = await searchService.searchListings(searchParams);
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

// GET /api/search/suggest
router.get('/suggest', async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const response = await client.search({
      index: 'listings',
      body: {
        suggest: {
          listing_suggest: {
            prefix: query,
            completion: {
              field: 'title.suggest',
              size: 5,
              skip_duplicates: true
            }
          }
        }
      }
    });
    
    const suggestions = response.suggest.listing_suggest[0].options
      .map((option: any) => option.text);
    
    res.json({ suggestions });
    
  } catch (error) {
    console.error('Suggest API error:', error);
    res.status(500).json({ suggestions: [] });
  }
});

export default router;
```

### Faz 3: Real-time Sync (1 hafta)

#### 3.1 PostgreSQL Triggers
```sql
-- Trigger function for Elasticsearch sync
CREATE OR REPLACE FUNCTION sync_to_elasticsearch()
RETURNS TRIGGER AS $$
BEGIN
  -- Send to message queue for async processing
  PERFORM pg_notify('elasticsearch_sync', json_build_object(
    'operation', TG_OP,
    'table', TG_TABLE_NAME,
    'record_id', COALESCE(NEW.id, OLD.id)
  )::text);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER listings_elasticsearch_sync
  AFTER INSERT OR UPDATE OR DELETE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION sync_to_elasticsearch();
```

#### 3.2 Message Queue Consumer
```typescript
// services/elasticsearchSyncService.ts
import { Pool } from 'pg';

export class ElasticsearchSyncService {
  private pool: Pool;
  
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }
  
  async startListening() {
    const client = await this.pool.connect();
    
    await client.query('LISTEN elasticsearch_sync');
    
    client.on('notification', async (msg) => {
      try {
        const data = JSON.parse(msg.payload);
        await this.processSyncEvent(data);
      } catch (error) {
        console.error('❌ Sync processing error:', error);
      }
    });
    
    console.log('✅ Listening for Elasticsearch sync events');
  }
  
  private async processSyncEvent(event: any) {
    const { operation, table, record_id } = event;
    
    if (table !== 'listings') return;
    
    try {
      switch (operation) {
        case 'INSERT':
        case 'UPDATE':
          await this.syncListing(record_id);
          break;
        case 'DELETE':
          await this.deleteListing(record_id);
          break;
      }
    } catch (error) {
      console.error(`❌ Failed to sync ${operation} for ${record_id}:`, error);
    }
  }
  
  private async syncListing(listingId: string) {
    const { data: listing } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();
    
    if (listing) {
      await client.index({
        index: 'listings',
        id: listing.id,
        body: this.transformListingForElasticsearch(listing)
      });
    }
  }
  
  private async deleteListing(listingId: string) {
    await client.delete({
      index: 'listings',
      id: listingId
    });
  }
}
```

### Faz 4: Frontend Entegrasyonu (1 hafta)

#### 4.1 React Hook
```typescript
// hooks/useElasticSearch.ts
import { useState, useCallback } from 'react';

interface SearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  radius?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  size?: number;
}

export const useElasticSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aggregations, setAggregations] = useState({});
  const [total, setTotal] = useState(0);
  
  const search = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/search?${queryString}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data.hits);
        setAggregations(data.data.aggregations);
        setTotal(data.data.total);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    search,
    results,
    loading,
    error,
    aggregations,
    total
  };
};
```

#### 4.2 Search Component
```typescript
// components/ElasticSearchBar.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useElasticSearch } from '../hooks/useElasticSearch';

interface ElasticSearchBarProps {
  onResultsChange: (results: any[]) => void;
  onAggregationsChange: (aggregations: any) => void;
}

export const ElasticSearchBar: React.FC<ElasticSearchBarProps> = ({
  onResultsChange,
  onAggregationsChange
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { search, results, loading, aggregations } = useElasticSearch();
  
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length >= 2) {
      await search({ query: searchQuery, page: 1, size: 20 });
    }
  }, [search]);
  
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    
    // Debounced search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [handleSearch]);
  
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  }, [handleSearch]);
  
  // Update parent components
  useEffect(() => {
    onResultsChange(results);
  }, [results, onResultsChange]);
  
  useEffect(() => {
    onAggregationsChange(aggregations);
  }, [aggregations, onAggregationsChange]);
  
  return (
    <div className="elastic-search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Ne arıyorsunuz?"
          className="search-input"
        />
        
        {loading && (
          <div className="loading-indicator">
            <span>Aranıyor...</span>
          </div>
        )}
      </div>
      
      {suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 🧪 Test Planı

### 1. Unit Tests
```typescript
// tests/searchService.test.ts
import { SearchService } from '../services/searchService';

describe('SearchService', () => {
  let searchService: SearchService;
  
  beforeEach(() => {
    searchService = new SearchService();
  });
  
  test('should search listings with text query', async () => {
    const params = { query: 'iPhone', page: 1, size: 10 };
    const results = await searchService.searchListings(params);
    
    expect(results.hits).toBeDefined();
    expect(results.total).toBeGreaterThan(0);
  });
  
  test('should filter by price range', async () => {
    const params = { 
      query: 'telefon', 
      minPrice: 1000, 
      maxPrice: 5000,
      page: 1,
      size: 10
    };
    
    const results = await searchService.searchListings(params);
    
    results.hits.forEach(hit => {
      expect(hit.budget).toBeGreaterThanOrEqual(1000);
      expect(hit.budget).toBeLessThanOrEqual(5000);
    });
  });
});
```

### 2. Integration Tests
```typescript
// tests/searchApi.test.ts
import request from 'supertest';
import app from '../app';

describe('Search API', () => {
  test('GET /api/search should return results', async () => {
    const response = await request(app)
      .get('/api/search')
      .query({ q: 'iPhone', page: 1, size: 10 });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.hits).toBeDefined();
  });
  
  test('GET /api/search/suggest should return suggestions', async () => {
    const response = await request(app)
      .get('/api/search/suggest')
      .query({ q: 'iph' });
    
    expect(response.status).toBe(200);
    expect(response.body.suggestions).toBeDefined();
  });
});
```

### 3. Performance Tests
```typescript
// tests/performance.test.ts
describe('Search Performance', () => {
  test('should complete search within 100ms', async () => {
    const startTime = performance.now();
    
    await searchService.searchListings({
      query: 'test',
      page: 1,
      size: 20
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100);
  });
});
```

## 📊 Monitoring ve Analytics

### 1. Search Metrics
```typescript
// services/analyticsService.ts
export class SearchAnalyticsService {
  async trackSearch(searchParams: any, results: any) {
    await fetch('/api/analytics/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: searchParams.query,
        filters: searchParams.filters,
        resultCount: results.total,
        responseTime: results.responseTime,
        timestamp: new Date().toISOString(),
        userId: getCurrentUserId()
      })
    });
  }
}
```

### 2. Performance Monitoring
```typescript
// middleware/performanceMiddleware.ts
export const performanceMiddleware = (req: any, res: any, next: any) => {
  const startTime = performance.now();
  
  res.on('finish', () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`${req.method} ${req.path} - ${duration}ms`);
    
    // Send to monitoring service
    sendMetrics({
      endpoint: req.path,
      method: req.method,
      duration,
      statusCode: res.statusCode
    });
  });
  
  next();
};
```

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Elasticsearch kurulumu tamamlandı
- [ ] Index mapping tanımları oluşturuldu
- [ ] Initial data migration yapıldı
- [ ] API endpoints geliştirildi
- [ ] Frontend entegrasyonu tamamlandı
- [ ] Unit testler yazıldı
- [ ] Integration testler yazıldı
- [ ] Performance testler yapıldı

### Deployment
- [ ] Elasticsearch production'a deploy edildi
- [ ] API production'a deploy edildi
- [ ] Frontend production'a deploy edildi
- [ ] Real-time sync aktif edildi
- [ ] Monitoring kurulumu tamamlandı

### Post-deployment
- [ ] A/B test başlatıldı
- [ ] Kullanıcı geri bildirimi toplanıyor
- [ ] Performans metrikleri izleniyor
- [ ] Hata logları kontrol ediliyor

## 📈 Başarı Kriterleri

### Teknik Kriterler
- ✅ Arama hızı < 100ms
- ✅ 99.9% uptime
- ✅ Real-time sync < 1s
- ✅ Query complexity desteği

### İş Kriterleri
- ✅ Kullanıcı memnuniyeti artışı
- ✅ Arama conversion rate artışı
- ✅ Operasyonel maliyet azalması
- ✅ Geliştirme hızı artışı

## 🔧 Troubleshooting

### Yaygın Sorunlar

#### 1. Elasticsearch Bağlantı Hatası
```bash
# Elasticsearch durumunu kontrol et
curl -X GET "localhost:9200/_cluster/health"

# Logları kontrol et
docker logs elasticsearch
```

#### 2. Index Mapping Hatası
```bash
# Index'i sil ve yeniden oluştur
curl -X DELETE "localhost:9200/listings"
curl -X PUT "localhost:9200/listings" -H "Content-Type: application/json" -d @mapping.json
```

#### 3. Sync Sorunları
```bash
# PostgreSQL trigger'ları kontrol et
SELECT * FROM pg_trigger WHERE tgname = 'listings_elasticsearch_sync';

# Message queue'yu kontrol et
SELECT * FROM pg_stat_activity WHERE application_name = 'elasticsearch_sync';
```

---

*Bu rehber Elasticsearch implementasyonu için kapsamlı bir yol haritası sunar.* 