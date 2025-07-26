import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SuggestionItem {
  id: string;
  text: string;
  type: 'dynamic' | 'history' | 'popular' | 'category';
  timestamp?: number;
  count?: number;
  trend?: 'up' | 'down' | 'stable';
  category?: string;
}

export interface SearchSuggestionsState {
  dynamicSuggestions: SuggestionItem[];
  historySuggestions: SuggestionItem[];
  popularSuggestions: SuggestionItem[];
  categorySuggestions: SuggestionItem[];
  isLoading: boolean;
  error: string | null;
}

export interface UseSearchSuggestionsOptions {
  debounceMs?: number;
  maxDynamicResults?: number;
  maxHistoryResults?: number;
  maxPopularResults?: number;
  maxCategoryResults?: number;
  enableCaching?: boolean;
  cacheExpiryMs?: number;
}

const DEFAULT_OPTIONS: UseSearchSuggestionsOptions = {
  debounceMs: 300,
  maxDynamicResults: 8,
  maxHistoryResults: 10,
  maxPopularResults: 10,
  maxCategoryResults: 5,
  enableCaching: true,
  cacheExpiryMs: 5 * 60 * 1000, // 5 dakika
};

export const useSearchSuggestions = (
  query: string,
  options: UseSearchSuggestionsOptions = {}
) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<SearchSuggestionsState>({
    dynamicSuggestions: [],
    historySuggestions: [],
    popularSuggestions: [],
    categorySuggestions: [],
    isLoading: false,
    error: null,
  });

  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Cache management
  const cacheKey = (type: string, data: string) => `search_suggestions_${type}_${data}`;
  const isCacheValid = (timestamp: number) => Date.now() - timestamp < config.cacheExpiryMs!;

  // Dynamic suggestions from database
  const fetchDynamicSuggestions = useCallback(async (searchQuery: string): Promise<SuggestionItem[]> => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('title, description, category')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(config.maxDynamicResults!);

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Başlıklardan benzersiz öneriler çıkar
      const suggestions = new Set<string>();
      data.forEach(item => {
        if (item.title) {
          const words = item.title.toLowerCase()
            .split(/\s+/)
            .filter((word: string) => 
              word.length >= 2 && 
              word.includes(searchQuery.toLowerCase()) &&
              !suggestions.has(word)
            );
                     words.forEach((word: string) => suggestions.add(word));
        }
      });

      return Array.from(suggestions).slice(0, config.maxDynamicResults!).map((text, index) => ({
        id: `dynamic-${Date.now()}-${index}`,
        text,
        type: 'dynamic' as const,
      }));
    } catch (error) {
      console.error('Dynamic suggestions fetch error:', error);
      return [];
    }
  }, [config.maxDynamicResults]);

  // History suggestions from AsyncStorage
  const fetchHistorySuggestions = useCallback(async (): Promise<SuggestionItem[]> => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (!history) return [];

      const parsedHistory = JSON.parse(history);
      return parsedHistory
        .sort((a: any, b: any) => b.timestamp - a.timestamp)
        .slice(0, config.maxHistoryResults!)
        .map((item: any) => ({
          id: item.id,
          text: item.text,
          type: 'history' as const,
          timestamp: item.timestamp,
        }));
    } catch (error) {
      console.error('History suggestions fetch error:', error);
      return [];
    }
  }, [config.maxHistoryResults]);

  // Popular suggestions with analytics
  const fetchPopularSuggestions = useCallback(async (): Promise<SuggestionItem[]> => {
    try {
      // Cache kontrolü
      if (config.enableCaching) {
        const cached = await AsyncStorage.getItem(cacheKey('popular', 'all'));
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (isCacheValid(timestamp)) {
            return data;
          }
        }
      }

      const { data, error } = await supabase
        .from('listings')
        .select('title, category, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (!data || data.length === 0) return getStaticPopularSuggestions();

      // Popüler kelimeleri analiz et
      const wordCounts: { [key: string]: number } = {};
      const categoryCounts: { [key: string]: number } = {};

      data.forEach((item) => {
        if (item.title) {
          const words = item.title.toLowerCase()
            .split(/\s+/)
            .filter((word: string) => word.length > 2);

          words.forEach((word: string) => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          });

          if (item.category) {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
          }
        }
      });

      // En popüler kelimeleri al
      const popularWords = Object.entries(wordCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, config.maxPopularResults!)
        .map(([text, count], index) => ({
          id: `popular-${index}`,
          text,
          type: 'popular' as const,
          count,
          trend: getRandomTrend(),
        }));

      // Cache'e kaydet
      if (config.enableCaching) {
        await AsyncStorage.setItem(cacheKey('popular', 'all'), JSON.stringify({
          data: popularWords,
          timestamp: Date.now(),
        }));
      }

      return popularWords;
    } catch (error) {
      console.error('Popular suggestions fetch error:', error);
      return getStaticPopularSuggestions();
    }
  }, [config.maxPopularResults, config.enableCaching, config.cacheExpiryMs]);

  // Category-based suggestions
  const fetchCategorySuggestions = useCallback(async (searchQuery: string): Promise<SuggestionItem[]> => {
    if (!searchQuery.trim()) return [];

    const detectedCategory = detectCategory(searchQuery);
    if (!detectedCategory) return [];

    const categorySuggestions = CATEGORY_SUGGESTIONS[detectedCategory as keyof typeof CATEGORY_SUGGESTIONS] || [];
    
    return categorySuggestions
      .filter((suggestion: string) => suggestion.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, config.maxCategoryResults!)
      .map((text, index) => ({
        id: `category-${detectedCategory}-${index}`,
        text,
        type: 'category' as const,
        category: detectedCategory,
      }));
  }, [config.maxCategoryResults]);

  // Ana fetch fonksiyonu
  const fetchAllSuggestions = useCallback(async (searchQuery: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Önceki request'i iptal et
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const [dynamic, history, popular, category] = await Promise.all([
        fetchDynamicSuggestions(searchQuery),
        fetchHistorySuggestions(),
        fetchPopularSuggestions(),
        fetchCategorySuggestions(searchQuery),
      ]);

      setState({
        dynamicSuggestions: dynamic,
        historySuggestions: history,
        popularSuggestions: popular,
        categorySuggestions: category,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request iptal edildi, state'i güncelleme
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      }));
    }
  }, [fetchDynamicSuggestions, fetchHistorySuggestions, fetchPopularSuggestions, fetchCategorySuggestions]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchAllSuggestions(query);
    }, config.debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchAllSuggestions, config.debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Utility functions
  const getRandomTrend = (): 'up' | 'down' | 'stable' => {
    const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)];
  };

  const getStaticPopularSuggestions = (): SuggestionItem[] => {
    return [
      { id: '1', text: 'telefon', type: 'popular', count: 156, trend: 'up' },
      { id: '2', text: 'bilgisayar', type: 'popular', count: 142, trend: 'up' },
      { id: '3', text: 'araba', type: 'popular', count: 98, trend: 'stable' },
      { id: '4', text: 'mobilya', type: 'popular', count: 87, trend: 'down' },
      { id: '5', text: 'ayakkabı', type: 'popular', count: 65, trend: 'up' },
      { id: '6', text: 'ev', type: 'popular', count: 43, trend: 'down' },
    ];
  };

  const detectCategory = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('telefon') || lowerText.includes('iphone') || lowerText.includes('samsung')) {
      return 'Elektronik';
    }
    if (lowerText.includes('bilgisayar') || lowerText.includes('laptop') || lowerText.includes('pc')) {
      return 'Elektronik';
    }
    if (lowerText.includes('araba') || lowerText.includes('otomobil') || lowerText.includes('araç')) {
      return 'Araçlar';
    }
    if (lowerText.includes('mobilya') || lowerText.includes('koltuk') || lowerText.includes('masa')) {
      return 'Ev & Yaşam';
    }
    if (lowerText.includes('ayakkabı') || lowerText.includes('giyim') || lowerText.includes('kıyafet')) {
      return 'Moda';
    }
    
    return null;
  };

  const CATEGORY_SUGGESTIONS = {
    Elektronik: ['iPhone 15', 'Samsung Galaxy', 'MacBook Pro', 'Gaming Laptop', 'Tablet', 'Akıllı Saat'],
    'Araçlar': ['BMW X5', 'Mercedes C200', 'Audi A4', 'Volkswagen Golf', 'Toyota Corolla', 'Honda Civic'],
    'Ev & Yaşam': ['Koltuk Takımı', 'Yemek Masası', 'Yatak Odası', 'Mutfak Mobilyası', 'Bahçe Mobilyası'],
    Moda: ['Nike Ayakkabı', 'Adidas Spor', 'Kadın Elbise', 'Erkek Gömlek', 'Çanta', 'Takı'],
  };

  // Public methods
  const refreshSuggestions = useCallback(() => {
    fetchAllSuggestions(query);
  }, [fetchAllSuggestions, query]);

  const clearCache = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('search_suggestions_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache temizleme hatası:', error);
    }
  }, []);

  return {
    ...state,
    refreshSuggestions,
    clearCache,
  };
}; 