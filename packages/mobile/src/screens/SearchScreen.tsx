import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Filter, X, ChevronDown, TrendingUp } from "lucide-react-native";
import { useThemeColors } from "../stores";
import { useAuthStore } from "../stores";
import {
  Header,
  SearchBar,
  ListingCard,
  LoadingSpinner,
  Card,
  Button,
} from "../components";
import CategoryCard from "../components/CategoryCard";
import CategoryAttributesSelector from "../components/CategoryAttributesSelector";
import { useSearchActions } from "../hooks/queries/useSearch";
import { categoriesConfig } from "../config/categories-with-attributes";

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

  // React Query search hooks
  const {
    results,
    isLoading,
    totalCount,
    performSearch,
    performCategorySearch,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    recentSearches,
  } = useSearchActions();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (route?.params?.query) {
      const query = route.params.query;
      updateFilter("searchQuery", query);
      performSearch(query);
    } else if (route?.params?.category) {
      performCategorySearch(route.params.category);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.query, route?.params?.category]);

  // Filtreler ve quick filters için optimize edilmiş render fonksiyonu
  const renderFiltersSection = useCallback(
    () => (
      <View style={styles.filtersContainer}>
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
                    filters.selectedCategory === filter.category
                      ? colors.primary
                      : colors.surface,
                  borderColor:
                    filters.selectedCategory === filter.category
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
                      filters.selectedCategory === filter.category
                        ? colors.background
                        : colors.text,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.surface }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} color={colors.text} />
            <Text style={[styles.filterButtonText, { color: colors.text }]}>
              Filtrele
            </Text>
            <ChevronDown size={16} color={colors.text} />
          </TouchableOpacity>

          {hasActiveFilters && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: colors.surface }]}
              onPress={clearFilters}
            >
              <X size={16} color={colors.textSecondary} />
              <Text
                style={[
                  styles.clearButtonText,
                  { color: colors.textSecondary },
                ]}
              >
                Temizle
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sort Options and Attribute Filters (when filters shown) */}
        {showFilters && (
          <Card style={styles.filtersCard}>
            <Text style={[styles.filtersTitle, { color: colors.text }]}>
              Sıralama
            </Text>
            {SORT_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.sortOption,
                  {
                    backgroundColor:
                      filters.sortBy === option.value
                        ? colors.primary + "20"
                        : "transparent",
                  },
                ]}
                onPress={() => updateFilter("sortBy", option.value)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    {
                      color:
                        filters.sortBy === option.value
                          ? colors.primary
                          : colors.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Attribute Filters */}
            {filters.selectedCategory && (
              <>
                <Text
                  style={[
                    styles.filtersTitle,
                    { color: colors.text, marginTop: 20 },
                  ]}
                >
                  Özellikler
                </Text>
                <CategoryAttributesSelector
                  categoryPath={filters.selectedCategory}
                  selectedAttributes={filters.attributes || {}}
                  onAttributesChange={(attributes) =>
                    updateFilter("attributes", attributes)
                  }
                />
              </>
            )}
          </Card>
        )}
      </View>
    ),
    [
      filters,
      colors,
      showFilters,
      hasActiveFilters,
      performCategorySearch,
      updateFilter,
      clearFilters,
    ]
  );

  const renderRecentSearches = useCallback(
    () => (
      <Card style={styles.recentSearchesCard}>
        <View style={styles.recentSearchesHeader}>
          <TrendingUp size={20} color={colors.primary} />
          <Text style={[styles.recentSearchesTitle, { color: colors.text }]}>
            Son Aramalar
          </Text>
        </View>
        <View style={styles.recentSearchesList}>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.recentSearchChip,
                { backgroundColor: colors.surface },
              ]}
              onPress={() => {
                updateFilter("searchQuery", search);
                performSearch(search);
              }}
            >
              <Text style={[styles.recentSearchText, { color: colors.text }]}>
                {search}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    ),
    [recentSearches, colors, updateFilter, performSearch]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyIcon, { color: colors.primary }]}>🔍</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {hasActiveFilters ? "Sonuç Bulunamadı" : "Arama Yapın"}
        </Text>
        <Text
          style={[styles.emptyDescription, { color: colors.textSecondary }]}
        >
          {hasActiveFilters
            ? "Farklı anahtar kelimeler deneyin veya filtreleri temizleyin"
            : "İhtiyacınız olan ürünü arayarak başlayın"}
        </Text>
      </View>
    ),
    [hasActiveFilters, colors]
  );

  const renderListItem = useCallback(
    ({ item }) => {
      console.log("Render edilen ilan:", item);
      return (
        <ListingCard
          listing={item}
          onPress={() =>
            navigation.navigate("ListingDetail", { listingId: item.id })
          }
          style={styles.listingCard}
        />
      );
    },
    [navigation]
  );

  const renderListEmpty = useCallback(
    () => (
      <>
        {!isLoading && !hasActiveFilters && renderRecentSearches()}
        {!isLoading && renderEmptyState()}
      </>
    ),
    [isLoading, hasActiveFilters, renderRecentSearches, renderEmptyState]
  );

  // DEBUG LOG EKLENDİ
  console.log("SearchScreen results:", results);
  console.log("isLoading:", isLoading, "totalCount:", totalCount);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header />

      {/* SearchBar'ı FlatList dışına çıkardık */}
      <View style={styles.searchSection}>
        <SearchBar
          value={filters.searchQuery}
          onChangeText={(text) => {
            console.log("🔍 SearchBar onChangeText - Text:", text);
            updateFilter("searchQuery", text);
          }}
          onSearch={() => {
            console.log("🔍 SearchBar onSearch - Called");
            performSearch();
          }}
          placeholder="Hangi ürünü satın almak istiyorsunuz?"
        />
      </View>

      <FlatList
        data={results}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderFiltersSection}
        ListEmptyComponent={renderListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // Klavye sorununu çözer
        removeClippedSubviews={true} // Performance optimizasyonu
        maxToRenderPerBatch={10} // Performance optimizasyonu
        windowSize={10} // Performance optimizasyonu
      />

      {isLoading && <LoadingSpinner text="Aranıyor..." />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
    paddingBottom: 8,
  },
  filtersContainer: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  quickFilters: {
    marginTop: 8,
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
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  clearButtonText: {
    fontSize: 14,
  },
  filtersCard: {
    marginTop: 8,
    padding: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  recentSearchesCard: {
    margin: 16,
    padding: 16,
  },
  recentSearchesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  recentSearchesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  recentSearchChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recentSearchText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 300,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  listingCard: {
    margin: 8,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  listContent: {
    flexGrow: 1,
  },
  attributesSelector: {
    marginTop: 16,
  },
});

export default SearchScreen;
