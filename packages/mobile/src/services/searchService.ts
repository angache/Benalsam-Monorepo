import { supabase } from './supabaseClient';
import { environment, getApiUrl } from '../config/environment';

export interface SearchParams {
  query?: string;
  filters?: {
    categories?: string[];
    priceRange?: { min: number; max: number };
    location?: string;
    urgency?: string;
    attributes?: Record<string, any>;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  created_at: string;
  user_id: string;
  _score?: number; // Elasticsearch relevance score
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  searchDuration: number;
  suggestions?: string[];
}

// Elasticsearch search via admin-backend
export const searchWithElasticsearch = async (params: SearchParams): Promise<SearchResponse> => {
  try {
    const response = await fetch(getApiUrl(environment.API_ENDPOINTS.ELASTICSEARCH_SEARCH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Admin-backend response formatını mobile formatına çevir
    if (responseData.success && responseData.data) {
      return {
        results: responseData.data.hits || [],
        total: responseData.data.total || 0,
        page: responseData.data.page || 1,
        limit: responseData.data.limit || 20,
        hasMore: (responseData.data.page || 1) < (responseData.data.totalPages || 1),
        searchDuration: 0, // Admin-backend'den gelmiyor
        suggestions: [], // Admin-backend'den gelmiyor
      };
    }
    
    return responseData;
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    
    // Fallback to Supabase search
    console.log('🔄 Falling back to Supabase search');
    return searchWithSupabase(params);
  }
};

// Fallback Supabase search
export const searchWithSupabase = async (params: SearchParams): Promise<SearchResponse> => {
  const startTime = Date.now();
  
  try {
    let query = supabase.from('listings').select('*');
    
    if (params.query?.trim()) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%`);
    }
    
    if (params.filters?.categories?.length) {
      query = query.in('category', params.filters.categories);
    }
    
    if (params.filters?.priceRange) {
      query = query.gte('price', params.filters.priceRange.min)
                   .lte('price', params.filters.priceRange.max);
    }
    
    if (params.sort) {
      query = query.order(params.sort.field, { ascending: params.sort.order === 'asc' });
    }
    
    const limit = params.limit || 20;
    const page = params.page || 1;
    const offset = (page - 1) * limit;
    
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    const searchDuration = Date.now() - startTime;
    
    return {
      results: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (data?.length || 0) === limit,
      searchDuration,
    };
  } catch (error) {
    console.error('Supabase search error:', error);
    throw error;
  }
};

// Combined search function (tries ES first, falls back to Supabase)
export const searchListings = async (params: SearchParams): Promise<SearchResponse> => {
  try {
    // Try Elasticsearch first
    return await searchWithElasticsearch(params);
  } catch (error) {
    console.error('Elasticsearch failed, using Supabase fallback:', error);
    // Fallback to Supabase
    return await searchWithSupabase(params);
  }
}; 