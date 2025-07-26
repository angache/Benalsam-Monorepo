import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Filter,
  X,
  ChevronDown,
  TrendingUp,
  ArrowLeft,
  Grid3X3,
  List,
  SlidersHorizontal
} from "lucide-react-native";
import { useThemeColors } from "../stores";
import { useAuthStore } from "../stores";
import {
  SearchBar,
  ListingCard,
  LoadingSpinner,
  Card,
  Button,
  FilterBottomSheet,
  SearchResults,
  SortOptions,
} from "../components";
import { supabase } from "../services/supabaseClient";

const QUICK_FILTERS = [
  { label: "Elektronik", category: "Elektronik" },
  { label: "Moda", category: "Moda" },
  { label: "Ev & Yaşam", category: "Ev & Yaşam" },
  { label: "Araç", category: "Araç" },
];

const SORT_OPTIONS = [
  { label: "En Yeni", value: "created_at-desc" },
  { label: "En Eski", value: "created_at-asc" },
  { label: "Fiyat: Düşük → Yüksek", value: "price-asc" },
  { label: "Fiyat: Yüksek → Düşük", value: "price-desc" },
];

const SearchScreen = ({ navigation, route }: any) => {
  const colors = useThemeColors();
  const { user } = useAuthStore();

  // Basit state management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState('created_at-desc');

  // Manuel arama fonksiyonu
  const performSearch = useCallback(async (query?: string, category?: string) => {
    console.log('🔍 performSearch - ENTRY POINT');
    console.log('🔍 performSearch - query:', query);
    console.log('🔍 performSearch - category:', category);
    console.log('🔍 performSearch - selectedSort:', selectedSort);
    
    const searchText = query || searchQuery;
    const searchCategory = category || selectedCategory;
    
    console.log('🔍 performSearch - searchText:', searchText);
    console.log('🔍 performSearch - searchCategory:', searchCategory);
    
    if (!searchText.trim() && !searchCategory) {
      console.log('🔍 performSearch - Empty search, clearing results');
      setResults([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      let query = supabase.from('listings').select('*');
      
      if (searchText.trim()) {
        query = query.ilike('title', `%${searchText}%`);
      }
      
      if (searchCategory) {
        query = query.eq('category', searchCategory);
      }
      
      // Sıralama uygula
      const [sortField, sortOrder] = selectedSort.split('-');
      console.log('🔍 performSearch - Applying sort:', sortField, sortOrder);
      
      if (sortField && sortOrder) {
        query = query.order(sortField, { ascending: sortOrder === 'asc' });
      }
      
      const { data, error } = await query.limit(20);
      
      if (error) {
        console.error('🔍 performSearch - Error:', error);
        setResults([]);
        setTotalCount(0);
      } else {
        console.log('🔍 performSearch - Results:', data?.length || 0);
        setResults(data || []);
        setTotalCount(data?.length || 0);
      }
    } catch (error) {
      console.error('🔍 performSearch - Exception:', error);
      setResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
    
    console.log('🔍 performSearch - EXIT POINT');
  }, [searchQuery, selectedCategory, selectedSort]);

  // Category search
  const performCategorySearch = useCallback(async (category: string) => {
    console.log('🔍 performCategorySearch - category:', category);
    setSelectedCategory(category);
    setSearchQuery('');
    await performSearch('', category);
  }, [performSearch]);

  useEffect(() => {
    if (route?.params?.query) {
      const query = route.params.query;
      setSearchQuery(query);
      performSearch(query);
    } else if (route?.params?.category) {
      performCategorySearch(route.params.category);
    }
  }, [route?.params?.query, route?.params?.category, performSearch, performCategorySearch]);

  // Custom Header Component
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.headerTitleContainer}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Arama
        </Text>
        {totalCount > 0 && (
          <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
            {totalCount} sonuç
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
      >
        <SlidersHorizontal size={20} color={colors.primary} />
        {(searchQuery || selectedCategory) && (
          <View style={[styles.filterIndicator, { backgroundColor: colors.primary }]} />
        )}
      </TouchableOpacity>
    </View>
  );

  // Enhanced Search Bar Section
  const renderSearchSection = () => (
    <View style={[styles.searchSection, { backgroundColor: colors.background }]}>
      <SearchBar
        value={searchQuery}
        onChangeText={(text) => {
          console.log("🔍 SearchScreen onChangeText - Text:", text);
          setSearchQuery(text);
        }}
        onSearch={() => {
          console.log("🔍 SearchScreen onSearch - Called");
          if (searchQuery.trim()) {
            performSearch(searchQuery);
          }
        }}
        onSuggestionSelect={(suggestion) => {
          console.log("🔍 SearchScreen onSuggestionSelect:", suggestion);
          setSearchQuery(suggestion.text);
          // State güncellemesi asenkron olduğu için doğrudan suggestion.text kullan
          setTimeout(() => {
            performSearch(suggestion.text);
          }, 50);
        }}
        placeholder="Ne arıyorsunuz?"
        showSuggestions={true}
      />

      {/* Quick Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickFilters}
        contentContainerStyle={styles.quickFiltersContent}
      >
        {QUICK_FILTERS.map((filter, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.quickFilterChip,
              {
                backgroundColor:
                  selectedCategory === filter.category
                    ? colors.primary
                    : colors.surface,
                borderColor:
                  selectedCategory === filter.category
                    ? colors.primary
                    : colors.border,
              },
            ]}
            onPress={() => performCategorySearch(filter.category)}
          >
            <Text
              style={[
                styles.quickFilterText,
                {
                  color:
                    selectedCategory === filter.category
                      ? colors.white
                      : colors.text,
                },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Results Header with Sort and View Options
  const renderResultsHeader = () => (
    <View style={[styles.resultsHeader, { backgroundColor: colors.background }]}>
      <View style={styles.resultsInfo}>
        <Text style={[styles.resultsTitle, { color: colors.text }]}>
          Sonuçlar
        </Text>
        {totalCount > 0 && (
          <Text style={[styles.resultsSubtitle, { color: colors.textSecondary }]}>
            {totalCount} ilan bulundu
          </Text>
        )}
      </View>

      <View style={styles.resultsActions}>
        {/* Sort Button */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <Text style={[styles.sortButtonText, { color: colors.text }]}>
            Sırala
          </Text>
          <ChevronDown
            size={16}
            color={colors.text}
            style={[
              styles.sortIcon,
              { transform: [{ rotate: showSortOptions ? '180deg' : '0deg' }] }
            ]}
          />
        </TouchableOpacity>

        {/* View Mode Toggle */}
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'grid' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Grid3X3
              size={16}
              color={viewMode === 'grid' ? colors.white : colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'list' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setViewMode('list')}
          >
            <List
              size={16}
              color={viewMode === 'list' ? colors.white : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Enhanced List Item Renderer
  const renderListItem = useCallback(({ item }: { item: any }) => (
    <View style={[
      styles.listItem,
      viewMode === 'grid' ? styles.gridItem : styles.listItemFull
    ]}>
      <ListingCard
        listing={item}
        onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
      />
    </View>
  ), [viewMode, navigation]);

  // Empty State
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
        <TrendingUp size={48} color={colors.textSecondary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {searchQuery ? 'Arama sonucu bulunamadı' : 'Arama yapmaya başlayın'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {searchQuery
          ? 'Farklı anahtar kelimeler deneyin veya filtreleri değiştirin'
          : 'İstediğiniz ürünü bulmak için arama yapın'
        }
      </Text>
    </View>
  );

  console.log("isLoading:", isLoading, "totalCount:", totalCount);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={Platform.OS === 'ios' ? ['top', 'left', 'right'] : ['left', 'right']}
    >
      <StatusBar
        backgroundColor={colors.background}
        barStyle="dark-content"
      />

      {/* Custom Header */}
      {renderHeader()}

      {/* Search Section */}
      {renderSearchSection()}

      {/* Results Header */}
      {renderResultsHeader()}

      {/* Results List */}
      <FlatList
        data={results}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={viewMode === 'grid' ? styles.row : undefined}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          results.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        key={viewMode} // Force re-render when view mode changes
      />

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner text="Aranıyor..." />
        </View>
      )}

      {/* Sort Options Modal */}
      {showSortOptions && (
        <View style={styles.sortModal}>
          <TouchableOpacity 
            style={styles.sortModalBackdrop}
            onPress={() => setShowSortOptions(false)}
            activeOpacity={1}
          />
          <View style={styles.sortModalContent}>
            <SortOptions
              selectedSort={selectedSort}
              onSortChange={(sort) => {
                console.log('🔍 Sort changed to:', sort);
                setSelectedSort(sort);
                setShowSortOptions(false);
                // Sıralama değiştiğinde aramayı yeniden çalıştır
                setTimeout(() => {
                  performSearch();
                }, 0);
              }}
              showReset={true}
            />
          </View>
        </View>
      )}

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(filters) => {
          console.log('🔍 Filters applied:', filters);
          // TODO: Apply filters to search
          setShowFilters(false);
        }}
        onClear={() => {
          console.log('🔍 Filters cleared');
          setSearchQuery('');
          setSelectedCategory('');
          setResults([]);
          setTotalCount(0);
        }}
        currentFilters={{
          searchQuery,
          selectedCategory,
          priceRange: null,
          location: '',
          urgency: '',
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  resultCount: {
    fontSize: 14,
    marginTop: 2,
  },
  filterButton: {
    padding: 8,
    position: 'relative',
  },
  filterIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Search Section Styles
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  quickFilters: {
    marginTop: 12,
  },
  quickFiltersContent: {
    paddingHorizontal: 0,
    gap: 8,
  },
  quickFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Results Header Styles
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  resultsInfo: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  resultsSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  resultsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  sortIcon: {
    marginLeft: 4,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    padding: 6,
    borderRadius: 6,
  },

  // List Styles
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
  listItem: {
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  listItemFull: {
    marginHorizontal: 0,
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sort Modal
  sortModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sortModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sortModalContent: {
    position: 'absolute',
    top: '20%',
    left: 16,
    right: 16,
    maxHeight: '60%',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default SearchScreen;
