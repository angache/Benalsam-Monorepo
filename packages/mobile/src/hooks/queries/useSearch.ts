import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { 
  fetchListings, 
  fetchFilteredListings, 
  fetchPopularListings,
  fetchRecentlyViewedListings,
  fetchListingsMatchingLastSearch
} from '../../services/listingService/fetchers';
import { saveLastSearch, getLastSearch } from '../../services/userActivityService';
import { useAuthStore } from '../../stores';
import { useState, useCallback, useEffect } from 'react';

// Types
interface FilteredListingsResult {
  listings: any[];
  totalCount: number;
}

// ===========================
// QUERY KEYS
// ===========================
export const searchKeys = {
  all: ['search'] as const,
  listings: () => [...searchKeys.all, 'listings'] as const,
  filtered: (filters?: any) => [...searchKeys.all, 'filtered', filters] as const,
  popular: () => [...searchKeys.all, 'popular'] as const,
  recentlyViewed: (userId?: string) => [...searchKeys.all, 'recentlyViewed', userId] as const,
  lastSearch: (userId?: string) => [...searchKeys.all, 'lastSearch', userId] as const,
  basicSearch: (query?: string, category?: string) => [...searchKeys.all, 'basic', query, category] as const,
};

// ===========================
// QUERY HOOKS
// ===========================

/**
 * Tüm aktif ilanları getirir (temel arama için)
 */
export const useListings = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: searchKeys.listings(),
    queryFn: () => fetchListings(user?.id || null),
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 5 * 60 * 1000, // 5 dakika
  });
};

/**
 * Filtrelenmiş ilan araması (gelişmiş arama)
 */
export const useFilteredListings = (filters: any, enabled = true) => {
  const { user } = useAuthStore();
  
  // enabled parametresini boolean olarak zorla
  const isEnabled = enabled === true;
  
  console.log('🔍 useFilteredListings - Called with:', { filters, enabled, isEnabled });
  
  const enabledCondition = isEnabled && !!filters;
  console.log('🔍 useFilteredListings - Enabled condition:', enabledCondition);
  
  return useQuery({
    queryKey: searchKeys.filtered(filters),
    queryFn: () => {
      console.log('🔍 useFilteredListings - queryFn executing with filters:', filters);
      return fetchFilteredListings(filters, user?.id || null);
    },
    enabled: enabledCondition,
    staleTime: 1 * 60 * 1000, // 1 dakika (arama sonuçları daha volatile)
    gcTime: 3 * 60 * 1000, // 3 dakika
    select: (data: any) => {
      console.log('🔍 useFilteredListings - Raw data:', data);
      
      // API'den dönen veri yapısını kontrol et
      if (data?.data && Array.isArray(data.data)) {
        // API response: { data: [...], error: null }
        return {
          listings: data.data,
          totalCount: data.data.length,
        };
      } else if (Array.isArray(data)) {
        // Direkt array dönerse
        return {
          listings: data,
          totalCount: data.length,
        };
      } else if (data?.listings) {
        // Zaten doğru formatta
        return {
          listings: data.listings,
          totalCount: data.totalCount || data.listings.length,
        };
      } else {
        // Boş sonuç
        return {
          listings: [],
          totalCount: 0,
        };
      }
    },
  });
};

/**
 * Sonsuz scroll ile filtrelenmiş ilan araması
 */
export const useInfiniteFilteredListings = (filters: any, enabled = true) => {
  const { user } = useAuthStore();
  
  return useInfiniteQuery({
    queryKey: [...searchKeys.filtered(filters), 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const result: any = await fetchFilteredListings(filters, user?.id || null, pageParam, 20);
      const listings = result?.listings || result || [];
      const totalCount = result?.totalCount || (Array.isArray(result) ? result.length : 0);
      
      return {
        listings,
        totalCount,
        currentPage: pageParam,
        hasNextPage: listings.length === 20,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: enabled && !!filters,
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
  });
};

/**
 * Popüler ilanları getirir
 */
export const usePopularListings = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: searchKeys.popular(),
    queryFn: () => fetchPopularListings(user?.id || null),
    staleTime: 5 * 60 * 1000, // 5 dakika (popüler içerik daha az değişir)
    gcTime: 10 * 60 * 1000, // 10 dakika
  });
};

/**
 * Son görüntülenen ilanları getirir
 */
export const useRecentlyViewedListings = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: searchKeys.recentlyViewed(user?.id),
    queryFn: () => fetchRecentlyViewedListings(user?.id!),
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 saniye (hızlı güncelleme)
    gcTime: 2 * 60 * 1000, // 2 dakika
  });
};

/**
 * Son aramaya uygun ilanları getirir
 */
export const useListingsMatchingLastSearch = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: searchKeys.lastSearch(user?.id),
    queryFn: () => fetchListingsMatchingLastSearch(user?.id!),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 5 * 60 * 1000, // 5 dakika
  });
};

/**
 * Temel arama (text + kategori)
 */
export const useBasicSearch = (query?: string, category?: string, enabled = true) => {
  const { user } = useAuthStore();
  
  // enabled parametresini boolean olarak zorla
  const isEnabled = enabled === true;
  
  console.log('🔍 useBasicSearch - Called with:', { query, category, enabled, isEnabled });
  
  return useQuery({
    queryKey: searchKeys.basicSearch(query, category),
    queryFn: async () => {
      console.log('🔍 useBasicSearch - queryFn executing...');
      const response = await fetchListings(user?.id || null);
      const allListings = response?.data || [];
      
      console.log('🔍 useBasicSearch - All listings count:', allListings.length);
      console.log('🔍 useBasicSearch - Sample titles:', allListings.slice(0, 3).map(item => item.title));
      
      let filtered = allListings;
      
      // Text search
      if (query?.trim()) {
        const searchQuery = query.toLowerCase();
        console.log('🔍 useBasicSearch - Searching for:', searchQuery);
        
        filtered = filtered.filter((item: any) => {
          const titleMatch = item.title?.toLowerCase().includes(searchQuery);
          const descriptionMatch = item.description?.toLowerCase().includes(searchQuery);
          const categoryMatch = item.category?.toLowerCase().includes(searchQuery);
          
          if (titleMatch || descriptionMatch || categoryMatch) {
            console.log('🔍 useBasicSearch - Match found:', {
              title: item.title,
              titleMatch,
              descriptionMatch,
              categoryMatch
            });
          }
          
          return titleMatch || descriptionMatch || categoryMatch;
        });
        console.log('🔍 useBasicSearch - After text filter:', filtered.length);
      }
      
      // Category filter
      if (category) {
        filtered = filtered.filter((item: any) => 
          item.category?.includes(category)
        );
        console.log('🔍 useBasicSearch - After category filter:', filtered.length);
      }
      
      console.log('🔍 useBasicSearch - Final result:', filtered.length);
      return filtered;
    },
    enabled: isEnabled,
    staleTime: 1 * 60 * 1000, // 1 dakika
    gcTime: 3 * 60 * 1000, // 3 dakika
  });
};

// ===========================
// MUTATION HOOKS
// ===========================

/**
 * Son aramayı kaydetme mutation'ı
 */
export const useSaveLastSearch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (searchCriteria: any) => {
      saveLastSearch(searchCriteria);
      return Promise.resolve(searchCriteria);
    },
    onSuccess: () => {
      // Son arama cache'ini invalidate et
      queryClient.invalidateQueries({
        queryKey: searchKeys.lastSearch(user?.id)
      });
    }
  });
};

// ===========================
// HELPER HOOKS
// ===========================

/**
 * Son aramalar için local state management
 */
export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'iPhone', 'Laptop', 'Bisiklet', 'Oyun Konsolu'
  ]);

  const addRecentSearch = useCallback((search: string) => {
    if (search.trim() && !recentSearches.includes(search)) {
      setRecentSearches(prev => [search, ...prev.slice(0, 4)]);
    }
  }, [recentSearches]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
};

/**
 * Arama filtreleri için state management
 */
export const useSearchFilters = () => {
  const [filters, setFilters] = useState({
    searchQuery: '',
    selectedCategory: '',
    sortBy: 'created_at-desc',
    priceRange: null as [number, number] | null,
    location: '',
    urgency: '',
    attributes: {} as Record<string, string[]>,
  });
  
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      selectedCategory: '',
      sortBy: 'created_at-desc',
      priceRange: null,
      location: '',
      urgency: '',
      attributes: {},
    });
  }, []);

  const hasActiveFilters = 
    filters.searchQuery.trim() !== '' ||
    filters.selectedCategory !== '' ||
    filters.priceRange !== null ||
    filters.location !== '' ||
    filters.urgency !== '' ||
    Object.keys(filters.attributes).some(key => filters.attributes[key]?.length > 0);

  return {
    filters,
    showFilters,
    setShowFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
};

/**
 * Kapsamlı arama işlemleri helper hook'u
 */
export const useSearchActions = () => {
  const { recentSearches, addRecentSearch } = useRecentSearches();
  const { filters, updateFilter, clearFilters, hasActiveFilters } = useSearchFilters();
  const saveLastSearchMutation = useSaveLastSearch();
  
  // Arama state'ini ayrı tut
  const [searchState, setSearchState] = useState({
    searchQuery: '',
    selectedCategory: '',
    priceRange: null as [number, number] | null,
    location: '',
    urgency: '',
    attributes: {} as Record<string, string[]>,
  });
  
  // Arama yapılıp yapılmadığını kontrol et
  const [hasSearched, setHasSearched] = useState(false);
  
  // Temel arama - MANUEL KONTROL
  const { data: basicResults, isLoading: isBasicLoading, refetch: refetchBasic } = useBasicSearch(
    searchState.searchQuery,
    searchState.selectedCategory,
    hasSearched // Sadece arama yapıldığında tetiklensin
  );
  
  // Gelişmiş arama - MANUEL KONTROL
  const { data: advancedResults, isLoading: isAdvancedLoading, refetch: refetchAdvanced } = useFilteredListings(
    searchState,
    hasSearched // Sadece arama yapıldığında tetiklensin
  );

  const performSearch = useCallback(async (query?: string) => {
    const searchText = query || filters.searchQuery;
    
    console.log('🔍 performSearch - Called with:', { query, searchText, filters });
    console.log('🔍 performSearch - Before setHasSearched(true), hasSearched was:', hasSearched);
    
    if (searchText.trim()) {
      addRecentSearch(searchText);
    }
    
    // Arama state'ini güncelle
    const newSearchState = {
      searchQuery: searchText,
      selectedCategory: filters.selectedCategory,
      priceRange: filters.priceRange,
      location: filters.location,
      urgency: filters.urgency,
      attributes: filters.attributes,
    };
    
    console.log('🔍 performSearch - Setting new searchState:', newSearchState);
    setSearchState(newSearchState);
    
    // Arama yapıldığını işaretle
    console.log('🔍 performSearch - Setting hasSearched to true');
    setHasSearched(true);
    
    // Arama otomatik olarak tetiklenecek (hasSearched state'i değiştiği için)
    console.log('🔍 performSearch - Search will be triggered automatically');
    
    // Son aramayı kaydet
    if (hasActiveFilters) {
      saveLastSearchMutation.mutate({
        query: searchText,
        categories: filters.selectedCategory ? [{ name: filters.selectedCategory }] : [],
        filters: {
          location: filters.location,
          urgency: filters.urgency,
          priceRange: filters.priceRange,
        }
      });
    }
  }, [
    filters, 
    addRecentSearch, 
    hasActiveFilters, 
    saveLastSearchMutation,
    hasSearched,
    refetchBasic,
    refetchAdvanced
  ]);

  const performCategorySearch = useCallback(async (category: string) => {
    updateFilter('selectedCategory', category);
    updateFilter('searchQuery', '');
    
    // Arama state'ini güncelle
    const newSearchState = {
      searchQuery: '',
      selectedCategory: category,
      priceRange: filters.priceRange,
      location: filters.location,
      urgency: filters.urgency,
      attributes: filters.attributes,
    };
    
    setSearchState(newSearchState);
    
    // Arama yapıldığını işaretle
    setHasSearched(true);
    
    // Arama otomatik olarak tetiklenecek
    console.log('🔍 performCategorySearch - Search will be triggered automatically for category:', category);
  }, [updateFilter, filters, refetchBasic]);

  // clearFilters fonksiyonunu override et
  const clearFiltersAndReset = useCallback(() => {
    // Filtreleri temizle
    updateFilter('searchQuery', '');
    updateFilter('selectedCategory', '');
    updateFilter('priceRange', null);
    updateFilter('location', '');
    updateFilter('urgency', '');
    updateFilter('attributes', {});
    
    // Arama state'ini de temizle
    setSearchState({
      searchQuery: '',
      selectedCategory: '',
      priceRange: null,
      location: '',
      urgency: '',
      attributes: {},
    });
    
    // Arama yapılmadığını işaretle
    setHasSearched(false);
  }, [updateFilter]);

  // Hangi sonuçları kullanacağımıza karar ver
  const shouldUseAdvanced = searchState.priceRange || searchState.location || searchState.urgency || 
    Object.keys(searchState.attributes).some(key => searchState.attributes[key]?.length > 0);
  
  // Sonuçları doğru şekilde al
  let results: any[] = [];
  let isLoading = false;
  
  if (shouldUseAdvanced) {
    results = advancedResults?.listings || [];
    isLoading = isAdvancedLoading;
  } else {
    results = basicResults || [];
    isLoading = isBasicLoading;
  }

  // DEBUG LOGLARI
  console.log('🔍 useSearchActions DEBUG:');
  console.log('  - hasSearched:', hasSearched);
  console.log('  - searchState:', searchState);
  console.log('  - shouldUseAdvanced:', shouldUseAdvanced);
  console.log('  - basicResults:', basicResults);
  console.log('  - advancedResults:', advancedResults);
  console.log('  - results:', results);
  console.log('  - results.length:', results.length);
  console.log('  - isLoading:', isLoading);
  console.log('  - isBasicLoading:', isBasicLoading);
  console.log('  - isAdvancedLoading:', isAdvancedLoading);

  return {
    // Search results
    results,
    isLoading,
    totalCount: shouldUseAdvanced ? advancedResults?.totalCount : results.length,
    
    // Search actions
    performSearch,
    performCategorySearch,
    
    // Filter management
    filters,
    updateFilter,
    clearFilters: clearFiltersAndReset,
    hasActiveFilters,
    
    // Recent searches
    recentSearches,
    
    // Loading states
    isSavingSearch: saveLastSearchMutation.isPending,
  };
}; 