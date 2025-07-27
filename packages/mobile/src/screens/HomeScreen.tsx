import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { FlatList } from 'react-native';
import { TrendingUp, Clock, Star, Users, Bell, Search as SearchIcon } from 'lucide-react-native';
import { useThemeStore, useThemeColors } from '../stores';
import { useAuthStore } from '../stores';
import { Header, SectionHeader } from '../components';
import ListingCard from '../components/ListingCard';
import CategoryCard from '../components/CategoryCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing, margins, paddings, layout, shadows, borderRadius } from '../utils/spacing';
import { typography, textPatterns, fontWeight } from '../utils/typography';

// React Query Hooks - YENİ!
import { 
  useListings, 
  usePopularListings, 
  useTodaysDeals, 
  useMostOfferedListings 
} from '../hooks/queries/useListings';
import { useFollowedCategoryListings } from '../hooks/queries/useCategories';
import { useToggleFavorite } from '../hooks/queries/useFavorites';
import { ListingWithUser } from '../services/listingService/core';
import { CategoryWithListings } from '../services/categoryFollowService';
import { UseQueryResult } from '@tanstack/react-query';
import { useScrollHeader } from '../hooks/useScrollHeader';

// Legacy imports - aşamalı olarak kaldırılacak
import { fetchListings, fetchPopularListings, fetchTodaysDeals } from '../services/listingService';
import { fetchFollowedCategories, fetchListingsForFollowedCategories } from '../services/categoryFollowService';
import { categoriesConfig } from '../config/categories-with-attributes';
import { SearchBar } from '../components/SearchBar';
import { getListingHistory } from '../services/userActivityService';
import { fetchMostOfferedListings } from '../services/listingService/fetchers';
import { supabase  } from '../services/supabaseClient';
import { ListingWithFavorite } from '../services/categoryFollowService';
import { formatDate, formatPrice } from '../types';

type RootStackParamList = {
  Search: { query?: string };
  Messages: undefined;
  Create: undefined;
  Login: undefined;
  Category: { category: string };
  ListingDetail: { listingId: string };
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const BANNERS = [
  {
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    text: 'İhtiyacınız olan ürünleri hemen bulun!',
    action: 'explore'
  },
  {
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    text: 'Kaliteli ürünler uygun fiyatlarla',
    action: 'latest'
  },
  {
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    text: 'Güvenli alışveriş, hızlı teslimat',
    action: 'safety'
  }
];

const STATS = [
  { icon: Users, value: '50K+', label: 'Aktif Kullanıcı', color: 'primary' },
  { icon: TrendingUp, value: '125K+', label: 'Alım İlanı', color: 'success' },
  { icon: Star, value: '89%', label: 'Memnuniyet', color: 'warning' },
  { icon: Clock, value: '24/7', label: 'Destek', color: 'info' },
];

const { width: screenWidth, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SIDE_PADDING = spacing.md; // 16px - Sol ve sağ kenar mesafesi
const CARD_GAP = spacing.md; // 16px - Kartlar arası mesafe (8px'den 16px'e çıkarıldı)
const NUM_COLUMNS = 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'android' ? 0 : 20,
  },
  skeletonCard: {
    width: (screenWidth - SIDE_PADDING * 2 - CARD_GAP) / 2,
    height: 260,
    borderRadius: borderRadius.md,
    ...margins.b.md, // marginBottom: 16
    marginHorizontal: CARD_GAP / 2,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 140,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  skeletonContent: {
    ...paddings.all.sm, // padding: 12
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    ...margins.b.sm, // marginBottom: 8
  },
  welcomeSection: {
    ...margins.h.md, // marginHorizontal: 16
    ...margins.v.sm, // marginVertical: 12
    ...paddings.all.md, // padding: 16
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  welcomeText: {
    ...textPatterns.sectionHeader, // fontSize: 20, fontWeight: 'bold', lineHeight: 28
    ...margins.b.xs, // marginBottom: 4
  },
  welcomeSubtext: {
    ...typography.body2, // fontSize: 14, fontWeight: 'normal', lineHeight: 20
  },
  searchSection: {
    ...margins.h.md, // marginHorizontal: 16
    ...margins.b.md, // marginBottom: 16
  },
  bannerSection: {
    height: 180,
    ...margins.b.md, // marginBottom: 16
  },
  bannerContainer: {
    ...paddings.h.sm, // paddingHorizontal: 8
  },
  bannerCard: {
    width: 280,
    height: 160,
    marginHorizontal: spacing.sm, // 8px
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.lg,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    ...paddings.all.md, // padding: 16
  },
  bannerText: {
    ...typography.h3, // fontSize: 16, fontWeight: 'semibold', lineHeight: 22
    color: 'white',
  },
  statsSection: {
    marginBottom: 20,
  },
  statsContainer: {
    paddingHorizontal: 8,
  },
  statCard: {
    width: 100,
    ...paddings.all.md, // padding: 16
    marginHorizontal: spacing.sm, // 8px
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  statValue: {
    ...typography.h2, // fontSize: 18, fontWeight: 'semibold', lineHeight: 24
    fontWeight: fontWeight.extrabold, // Override for stats
    ...margins.t.sm, // marginTop: 8
    ...margins.b.xs, // marginBottom: 4
  },
  statLabel: {
    ...typography.caption1, // fontSize: 12, fontWeight: 'normal', lineHeight: 16
    textAlign: 'center',
    fontWeight: fontWeight.medium, // Override for stats
  },
  section: {
    ...margins.v.md, // marginVertical: 16 (increased from 12)
  },
  mostOfferedSection: {
    ...margins.v.md, // marginVertical: 16 (normal spacing)
  },
  todaysDealsSection: {
    ...margins.v.md, // marginVertical: 16 (normal spacing)
  },
  popularListingsSection: {
    ...margins.v.md, // marginVertical: 16 (normal spacing)
  },
  sectionTitle: {
    ...textPatterns.sectionHeader, // fontSize: 20, fontWeight: 'bold', lineHeight: 28
    ...margins.h.md, // marginHorizontal: 16
    ...margins.b.sm, // marginBottom: 12
  },
  categorySection: {
    ...margins.b.lg, // marginBottom: 20
  },
  categoryTitle: {
    ...textPatterns.cardTitle, // fontSize: 16, fontWeight: 'semibold', lineHeight: 22
    ...margins.h.md, // marginHorizontal: 16
    ...margins.b.sm, // marginBottom: 8
  },
  categoryScrollerSection: {
    ...margins.b.sm, // marginBottom: 10
  },
  horizontalListContainer: {
    ...paddings.h.md, // paddingHorizontal: 16
  },
  gridListContainer: {
    paddingHorizontal: SIDE_PADDING,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    gap: spacing.md, // 16px gap (CARD_GAP ile aynı)
  },
  flashListContainer: {
    height: Math.ceil(20 / NUM_COLUMNS) * 280, // Approximate height for 20 items
    paddingHorizontal: 0,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PADDING - CARD_GAP / 2,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  skeletonHorizontalCard: {
    width: 200,
    height: 280,
    borderRadius: borderRadius.md,
    ...margins.b.md, // marginBottom: 16
    marginHorizontal: spacing.sm, // 8px
    overflow: 'hidden',
  },
  skeletonHorizontalImage: {
    height: 160,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  skeletonHorizontalContent: {
    ...paddings.all.sm, // padding: 12
  },
  skeletonSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...margins.h.md, // marginHorizontal: 16
    ...margins.b.sm, // marginBottom: 12
  },
  skeletonTitle: {
    width: 150,
    height: 24,
    borderRadius: 6,
  },
  skeletonAction: {
    width: 80,
    height: 24,
    borderRadius: 6,
  },
});

// Skeleton loading components
const SkeletonCard = () => {
  const colors = useThemeColors();
  return (
    <View style={[styles.skeletonCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.skeletonImage, { backgroundColor: colors.border }]} />
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '80%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '60%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '40%' }]} />
      </View>
    </View>
  );
};

const SkeletonHorizontalCard = () => {
  const colors = useThemeColors();
  return (
    <View style={[styles.skeletonHorizontalCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.skeletonHorizontalImage, { backgroundColor: colors.border }]} />
      <View style={styles.skeletonHorizontalContent}>
        <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '90%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '70%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '50%' }]} />
      </View>
    </View>
  );
};

const SkeletonSectionHeader = () => {
  const colors = useThemeColors();
  return (
    <View style={styles.skeletonSectionHeader}>
      <View style={[styles.skeletonTitle, { backgroundColor: colors.border }]} />
      <View style={[styles.skeletonAction, { backgroundColor: colors.border }]} />
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const { handleScroll, headerOpacity, headerTranslateY } = useScrollHeader(50);
  
  // React Query hooks with proper typing
  const { data: listings = [], isLoading: listingsLoading, refetch: refetchListings } = useListings() as UseQueryResult<ListingWithUser[], Error>;
  const { data: popularListings = [], isLoading: popularLoading, refetch: refetchPopular } = usePopularListings() as UseQueryResult<ListingWithUser[], Error>;
  const { data: todaysDeals = [], isLoading: dealsLoading, refetch: refetchDeals } = useTodaysDeals() as UseQueryResult<ListingWithUser[], Error>;
  const { data: mostOffered = [], isLoading: mostOfferedLoading, refetch: refetchMostOffered } = useMostOfferedListings() as UseQueryResult<ListingWithUser[], Error>;
  

  const { data: followedCategories = [], isLoading: followedLoading, refetch: refetchFollowed } = useFollowedCategoryListings() as UseQueryResult<CategoryWithListings[], Error>;
  const { toggleFavorite } = useToggleFavorite();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchListings(),
        refetchPopular(),
        refetchDeals(),
        refetchMostOffered(),
        refetchFollowed()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchListings, refetchPopular, refetchDeals, refetchMostOffered, refetchFollowed]);

  const isLoading = listingsLoading || popularLoading || dealsLoading || mostOfferedLoading || followedLoading;

  // Individual section loading states
  const isCategoriesLoading = false; // Categories are static for now
  const isMostOfferedLoading = mostOfferedLoading;
  const isPopularLoading = popularLoading;
  const isTodaysDealsLoading = dealsLoading;
  const isNewListingsLoading = listingsLoading;
  const isFollowedLoading = followedLoading;

  const getCurrentCategories = () => {
    if (categoryPath.length === 0) return categoriesConfig;
    let current: any = categoriesConfig.find(cat => cat.name === categoryPath[0]);
    for (let i = 1; i < categoryPath.length; i++) {
      if (!current || !current.subcategories) return [];
      current = current.subcategories.find((cat: any) => cat.name === categoryPath[i]);
    }
    return current?.subcategories || [];
  };



  const handleCategoryPress = (cat: any) => {
    setSelectedCategory(cat.name);
  };

  const handleSubCategoryPress = (cat: any) => {
    if (cat.subcategories && cat.subcategories.length > 0) {
      setSelectedCategory(cat.name);
    } else {
      navigation.navigate('Search', { query: cat.name });
    }
  };

  const handleBreadcrumb = (idx: number) => {
    setSelectedCategory(selectedCategory.slice(0, idx + 1));
  };

  // Favori toggle fonksiyonu
  const handleToggleFavorite = useCallback(async (listingId: string, currentStatus: boolean) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    
    // If this listing is already being processed, don't process again
    if (selectedListingId === listingId) {
      return;
    }
    
    setSelectedListingId(listingId);
    
    try {
      await toggleFavorite(listingId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setSelectedListingId(null);
    }
  }, [user, toggleFavorite, navigation, selectedListingId]);

  // Memoized render functions for performance
  const renderGridListing = useCallback(({ item, index }: { item: ListingWithUser; index: number }) => (
    <ListingCard
      key={item.id}
      listing={item}
      index={index}
      onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
      onToggleFavorite={() => handleToggleFavorite(item.id, !!item.is_favorited)}
      isFavoriteLoading={selectedListingId === item.id}
      isGrid={true} // Grid layout için marginRight devre dışı
    />
  ), [navigation, handleToggleFavorite, selectedListingId]);

  const renderHorizontalListing = useCallback(({ item, index }: { item: ListingWithUser; index: number }) => (
    <ListingCard
      key={item.id}
      listing={item}
      onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
      onToggleFavorite={() => handleToggleFavorite(item.id, !!item.is_favorited)}
      isFavoriteLoading={selectedListingId === item.id}
      isGrid={false} // Horizontal layout için marginRight aktif
      style={{ width: 200, marginRight: 12 }}
    />
  ), [navigation, handleToggleFavorite, selectedListingId]);

  const renderSkeletonGrid = useCallback(() => (
    <View style={styles.skeletonGrid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  ), []);

  const renderSkeletonHorizontalList = useCallback(() => (
    <View style={styles.horizontalListContainer}>
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonHorizontalCard key={index} />
      ))}
    </View>
  ), []);

  const renderSkeletonSectionHeader = useCallback(() => (
    <SkeletonSectionHeader />
  ), []);

  const keyExtractor = useCallback((item: ListingWithUser) => item.id.toString(), []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 280, // Approximate card height + margin
    offset: 280 * Math.floor(index / NUM_COLUMNS),
    index,
  }), []);

  const navigateToScreen = (screen: keyof RootStackParamList, params?: any) => {
    navigation.navigate(screen, params);
  };

  const darkMode = isDarkMode();

  if (isLoading) {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={Platform.OS === 'ios' ? ['top', 'left', 'right'] : ['left', 'right']}
      >
        <StatusBar
          backgroundColor={colors.background}
          barStyle="light-content"
          translucent={Platform.OS === 'android'}
        />
        <View style={[styles.content, { 
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0
        }]}>
          <Animated.View
            style={{
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
            }}
          >
            <Header 
              onThemeToggle={() => {}}
              isDarkMode={darkMode}
              onSearchPress={() => navigateToScreen('Search')}
              onNotificationPress={() => navigateToScreen('Messages')}
              onCreatePress={() => navigateToScreen('Create')}
            />
          </Animated.View>
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.section}>
              {renderSkeletonSectionHeader()}
              {renderSkeletonGrid()}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={Platform.OS === 'ios' ? ['top', 'left', 'right'] : ['left', 'right']}
    >
      <StatusBar
        backgroundColor={colors.background}
        barStyle="light-content"
        translucent={Platform.OS === 'android'}
      />
      <View style={[styles.content, { 
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0
      }]}>
        <Animated.View
          style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <Header 
            onThemeToggle={() => {}}
            isDarkMode={darkMode}
            onSearchPress={() => navigateToScreen('Search')}
            onNotificationPress={() => navigateToScreen('Messages')}
            onCreatePress={() => navigateToScreen('Create')}
          />
        </Animated.View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, {
            paddingBottom: Platform.OS === 'android' ? 60 : 80
          }]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              title="Yenileniyor..."
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Hoşgeldin Mesajı */}
          {user && (
            <View style={[styles.welcomeSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.welcomeText, { color: colors.text }]}>
                Merhaba {user.username || user.email?.split('@')[0]}! 👋
              </Text>
              <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>
                İhtiyacınız olan ürünleri keşfedin ve satın alın!
              </Text>
            </View>
          )}

          {/* Arama Çubuğu */}
          <View style={styles.searchSection}>
            <SearchBar
              value={selectedCategory}
              onChangeText={(text) => {
                console.log('🔍 HomeScreen onChangeText:', text);
                setSelectedCategory(text);
              }}
              onSearch={() => {
                if (selectedCategory.trim()) {
                  navigation.navigate('Search', { query: selectedCategory.trim() });
                }
              }}
              placeholder="Ne arıyorsunuz?"
              showSuggestions={false}
            />
          </View>

          {/* Banner Section */}
          <View style={styles.bannerSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerContainer}>
              {BANNERS.map((banner, index) => (
                <TouchableOpacity key={index} style={styles.bannerCard}>
                  <Image source={{ uri: banner.image }} style={styles.bannerImage} />
                  <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerText}>{banner.text}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
              {STATS.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <View key={index} style={[styles.statCard, { backgroundColor: colors.surface }]}>
                    <IconComponent size={24} color={colors.primary} />
                    <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Kategoriler */}
          <View style={styles.categorySection}>
            {renderSkeletonSectionHeader()}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {getCurrentCategories().map((category: any) => (
                <CategoryCard
                  key={category.name}
                  title={category.name}
                  onPress={() => handleSubCategoryPress(category)}
                  icon={category.icon}
                />
              ))}
            </ScrollView>
          </View>

          {/* Takip Ettiğiniz Kategoriler */}
          {followedCategories.length > 0 && (
            <View style={styles.section}>
              {renderSkeletonSectionHeader()}
              {followedCategories.map((category: CategoryWithListings) => (
                <View key={category.category_name}>
                  <Text style={[styles.categoryTitle, { color: colors.text }]}>
                    {category.category_name}
                  </Text>
                  {category.listings && category.listings.length > 0 && (
                    <FlashList
                      data={category.listings}
                      renderItem={renderHorizontalListing}
                      keyExtractor={keyExtractor}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalListContainer}
                      estimatedItemSize={200}
                    />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* En Çok Teklif Alanlar */}
          <View style={styles.mostOfferedSection}>
            {isMostOfferedLoading ? (
              <>
                {renderSkeletonSectionHeader()}
                {renderSkeletonHorizontalList()}
              </>
            ) : mostOffered.length > 0 ? (
              <>
                <SectionHeader 
                  title="En Çok Teklif Alanlar"
                  count={mostOffered.length}
                  showCount={true}
                  showAction={true}
                  actionText="Tümünü Gör"
                  onActionPress={() => {
                    // TODO: Navigate to most offered listings
                    console.log('Navigate to most offered listings');
                  }}
                />
                <FlashList
                  data={mostOffered}
                  renderItem={renderHorizontalListing}
                  keyExtractor={keyExtractor}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalListContainer}
                  estimatedItemSize={200}
                />
              </>
            ) : null}
          </View>

          {/* Popüler İlanlar */}
          <View style={styles.popularListingsSection}>
            {isPopularLoading ? (
              <>
                {renderSkeletonSectionHeader()}
                {renderSkeletonHorizontalList()}
              </>
            ) : popularListings.length > 0 ? (
              <>
                <SectionHeader 
                  title="Popüler İlanlar"
                  count={popularListings.length}
                  showCount={true}
                  showAction={true}
                  actionText="Tümünü Gör"
                  onActionPress={() => {
                    // TODO: Navigate to popular listings
                    console.log('Navigate to popular listings');
                  }}
                />
                <FlashList
                  data={popularListings}
                  renderItem={renderHorizontalListing}
                  keyExtractor={keyExtractor}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalListContainer}
                  estimatedItemSize={200}
                />
              </>
            ) : null}
          </View>

          {/* Günün Fırsatları */}
          <View style={styles.todaysDealsSection}>
            {isTodaysDealsLoading ? (
              <>
                {renderSkeletonSectionHeader()}
                {renderSkeletonHorizontalList()}
              </>
            ) : todaysDeals.length > 0 ? (
              <>
                <SectionHeader 
                  title="Günün Fırsatları"
                  count={todaysDeals.length}
                  showCount={true}
                  showAction={true}
                  actionText="Tümünü Gör"
                  onActionPress={() => {
                    // TODO: Navigate to today's deals
                    console.log('Navigate to today\'s deals');
                  }}
                />
                <FlashList
                  data={todaysDeals}
                  renderItem={renderHorizontalListing}
                  keyExtractor={keyExtractor}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalListContainer}
                  estimatedItemSize={200}
                />
              </>
            ) : null}
          </View>

          {/* Tüm İlanlar - Modern Grid */}
          <View style={styles.section}>
            {isNewListingsLoading ? (
              <>
                {renderSkeletonSectionHeader()}
                {renderSkeletonGrid()}
              </>
            ) : listings.length > 0 ? (
              <>
                <SectionHeader 
                  title="Yeni İlanlar"
                  count={listings.length}
                  showCount={true}
                  showAction={true}
                  actionText="Tümünü Gör"
                  onActionPress={() => {
                    // TODO: Navigate to all listings
                    console.log('Navigate to all listings');
                  }}
                />
                <View style={styles.flashListContainer}>
                  <FlatList
                    data={listings}
                    renderItem={renderGridListing}
                    keyExtractor={keyExtractor}
                    numColumns={NUM_COLUMNS}
                    contentContainerStyle={styles.gridListContainer}
                    columnWrapperStyle={styles.gridRow}
                    scrollEnabled={false}
                  />
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen; 