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
  Keyboard,
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
  ListingListItem,
} from "../components";
import { supabase } from "../services/supabaseClient";



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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState('created_at-desc');

  // Manuel arama fonksiyonu
  const performSearch = useCallback(async (query?: string, categories?: string[]) => {
    const searchText = query || searchQuery;
    const searchCategories = categories || selectedCategories;
    
    console.log('🔍 performSearch called with:', { query: searchText, categories: searchCategories });
    
    if (!searchText.trim() && searchCategories.length === 0) {
      console.log('🔍 No search text and no categories, clearing results');
      setResults([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      let query = supabase.from('listings').select('*');
      
      if (searchText.trim()) {
        query = query.or(`title.ilike.%${searchText}%,description.ilike.%${searchText}%`);
      }
      
      if (searchCategories.length > 0) {
        // Çoklu kategori filtresi
        const categoryValues = searchCategories.map(cat => findCategoryValue(cat));
        console.log('🔍 Category filter values:', categoryValues);
        query = query.in('category', categoryValues);
      }
      
      // Sıralama uygula
      const [sortField, sortOrder] = selectedSort.split('-');
      
      if (sortField && sortOrder) {
        query = query.order(sortField, { ascending: sortOrder === 'asc' });
      }
      
      const { data, error } = await query.limit(20);
      
      if (error) {
        console.error('🔍 Search error:', error);
        setResults([]);
        setTotalCount(0);
      } else {
        setResults(data || []);
        setTotalCount(data?.length || 0);
        
        // Arama sonuçları geldiğinde klavyeyi kapat
        if (data && data.length > 0) {
          Keyboard.dismiss();
        }
      }
    } catch (error) {
      console.error('🔍 Search exception:', error);
      setResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategories, selectedSort]);

  // Kategori değerini veritabanı değerine çevir
  const findCategoryValue = (mainCategory: string): string => {
    // Leaf kategorilerle eşleşecek şekilde mapping
    const categoryMap: { [key: string]: string } = {
      'Elektronik': 'Elektronik > Telefon > Akıllı Telefon > Akıllı Telefonlar',
      'Ev Aletleri & Mobilya': 'Ev Aletleri & Mobilya > Ev Aletleri > Buzdolabı > Buzdolapları',
      'Araç & Vasıta': 'Araç & Vasıta > Bisiklet > Şehir Bisikleti > Şehir Bisikletleri',
      'İş Makinesi': 'İş Makinesi > İş Makineleri > Ekskavatör > Ekskavatörler',
      'Moda': 'Moda > Ayakkabı',
      'Spor & Hobi': 'spor & hobi',
      'Kitap & Müzik': 'kitap & müzik',
      'Bahçe & Tarım': 'bahçe & tarım',
      'Sanat & Koleksiyon': 'sanat & koleksiyon',
      'Oyuncak & Hobi': 'oyuncak & hobi',
      'Sağlık & Güzellik': 'sağlık & güzellik',
      'Eğitim & Kurs': 'eğitim & kurs',
      'Hizmet': 'hizmet',
      'Diğer': 'diger'
    };

    const result = categoryMap[mainCategory] || mainCategory.toLowerCase();
    console.log('🔍 findCategoryValue:', mainCategory, '->', result);
    return result;
  };

  // Category search
  const performCategorySearch = useCallback(async (categories: string[]) => {
    console.log('🔍 performCategorySearch - categories:', categories);
    console.log('🔍 performCategorySearch - searchQuery:', searchQuery);
    setSelectedCategories(categories);
    // setSearchQuery(''); // Arama sorgusunu temizleme, sadece kategori filtresi uygula
    await performSearch(searchQuery, categories);
    // Kategori seçildiğinde klavyeyi kapat
    Keyboard.dismiss();
  }, [performSearch, searchQuery]);

  useEffect(() => {
    if (route?.params?.query) {
      const query = route.params.query;
      setSearchQuery(query);
      performSearch(query);
    } else if (route?.params?.category) {
      performCategorySearch([route.params.category]);
    }
  }, [route?.params?.query, route?.params?.category, performSearch, performCategorySearch]);

  // Custom Header Component
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.headerTop}>
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

        <View style={styles.headerActions}>
          {/* Sort Button */}
          <TouchableOpacity
            style={styles.headerSortButton}
            onPress={() => setShowSortOptions(!showSortOptions)}
          >
            <Text style={[styles.headerSortButtonText, { color: colors.text }]}>
              Sırala
            </Text>
            <ChevronDown
              size={14}
              color={colors.text}
              style={[
                styles.headerSortIcon,
                { transform: [{ rotate: showSortOptions ? '180deg' : '0deg' }] }
              ]}
            />
          </TouchableOpacity>

          {/* View Mode Toggle */}
          <View style={styles.headerViewModeContainer}>
            <TouchableOpacity
              style={[
                styles.headerViewModeButton,
                viewMode === 'grid' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setViewMode('grid')}
            >
              <Grid3X3
                size={14}
                color={viewMode === 'grid' ? colors.white : colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.headerViewModeButton,
                viewMode === 'list' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setViewMode('list')}
            >
              <List
                size={14}
                color={viewMode === 'list' ? colors.white : colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <SlidersHorizontal size={20} color={colors.primary} />
            {selectedCategories.length > 0 && (
              <View style={[styles.filterIndicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        </View>
      </View>


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
          setSearchQuery(suggestion.text);
          performSearch(suggestion.text);
          // Suggestion seçildiğinde klavyeyi kapat
          Keyboard.dismiss();
        }}
        placeholder="Ne arıyorsunuz?"
        showSuggestions={true}
        autoFocus={false}
      />
    </View>
  );



  // Enhanced List Item Renderer
  const renderListItem = useCallback(({ item }: { item: any }) => {
    if (viewMode === 'grid') {
      return (
        <View style={[styles.listItem, styles.gridItem]}>
          <ListingCard
            listing={item}
            onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
          />
        </View>
      );
    } else {
      return (
        <View style={[styles.listItem, styles.listItemFull]}>
          <ListingListItem
            listing={item}
            onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
          />
        </View>
      );
    }
  }, [viewMode, navigation]);

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
          console.log('🔍 Current searchQuery:', searchQuery);
          console.log('🔍 Current selectedCategories:', selectedCategories);
          
          // Kategori filtresini uygula
          if (filters.category && filters.category.length > 0) {
            console.log('🔍 Applying category filter:', filters.category);
            setSelectedCategories(filters.category);
            performCategorySearch(filters.category);
          } else {
            // Kategori temizlendiğinde orijinal aramayı geri yükle
            console.log('🔍 Clearing category filter, restoring original search');
            setSelectedCategories([]);
            if (searchQuery.trim()) {
              console.log('🔍 Restoring search with query:', searchQuery);
              performSearch(searchQuery, []);
            } else {
              console.log('🔍 No search query, clearing results');
              setResults([]);
              setTotalCount(0);
            }
          }
          
          // Diğer filtreleri uygula (gelecekte eklenecek)
          // TODO: Apply other filters (price, location, etc.)
          
          setShowFilters(false);
        }}
          onClear={() => {
            console.log('🔍 Filters cleared');
            setSearchQuery('');
            setSelectedCategories([]);
            setResults([]);
            setTotalCount(0);
          }}
          currentFilters={{
            searchQuery,
            category: selectedCategories,
            priceRange: null,
            location: '',
            urgency: '',
          }}
          searchResults={results}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerSortButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 2,
  },
  headerSortIcon: {
    marginLeft: 2,
  },
  headerViewModeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
    padding: 2,
  },
  headerViewModeButton: {
    padding: 4,
    borderRadius: 4,
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
