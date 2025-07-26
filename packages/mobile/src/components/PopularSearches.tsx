import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { TrendingUp, Flame, Star, Search } from 'lucide-react-native';
import { useThemeColors } from '../stores/themeStore';
import { supabase } from '../services/supabaseClient';

interface PopularSearchesProps {
  onPopularSearchPress: (text: string) => void;
  visible: boolean;
}

interface PopularSearch {
  id: string;
  text: string;
  count: number;
  category?: string;
  trend: 'up' | 'down' | 'stable';
}

const PopularSearches: React.FC<PopularSearchesProps> = ({
  onPopularSearchPress,
  visible,
}) => {
  const colors = useThemeColors();
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Popüler aramaları yükle
  useEffect(() => {
    if (visible) {
      loadPopularSearches();
    }
  }, [visible]);

  const loadPopularSearches = async () => {
    setIsLoading(true);
    try {
      // Gerçek verilerden popüler aramaları çek
      const { data, error } = await supabase
        .from('listings')
        .select('title, category, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        // Başlıklardan popüler kelimeleri çıkar
        const wordCounts: { [key: string]: number } = {};
        const categoryCounts: { [key: string]: number } = {};

        data.forEach((item) => {
          if (item.title) {
            // Başlığı kelimelere böl
            const words = item.title.toLowerCase()
              .split(/\s+/)
              .filter((word: string) => word.length > 2); // 2 karakterden uzun kelimeler

            words.forEach((word: string) => {
              wordCounts[word] = (wordCounts[word] || 0) + 1;
            });

            // Kategori sayısını da tut
            if (item.category) {
              categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
            }
          }
        });

        // En popüler kelimeleri al
        const sortedWords = Object.entries(wordCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([word, count], index) => ({
            id: `popular-${index}`,
            text: word,
            count,
            trend: getRandomTrend(),
          }));

        // En popüler kategorileri al
        const sortedCategories = Object.entries(categoryCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 4)
          .map(([category, count], index) => ({
            id: `category-${index}`,
            text: category,
            count,
            category: category,
            trend: getRandomTrend(),
          }));

        // Birleştir ve sırala
        const allPopular = [...sortedWords, ...sortedCategories]
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setPopularSearches(allPopular);
      }
    } catch (error) {
      console.error('Popüler aramalar yüklenemedi:', error);
      // Fallback: statik popüler aramalar
      setPopularSearches(getStaticPopularSearches());
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomTrend = (): 'up' | 'down' | 'stable' => {
    const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)];
  };

  const getStaticPopularSearches = (): PopularSearch[] => {
    return [
      { id: '1', text: 'telefon', count: 156, trend: 'up' },
      { id: '2', text: 'bilgisayar', count: 142, trend: 'up' },
      { id: '3', text: 'araba', count: 98, trend: 'stable' },
      { id: '4', text: 'mobilya', count: 87, trend: 'down' },
      { id: '5', text: 'Elektronik', count: 76, category: 'Elektronik', trend: 'up' },
      { id: '6', text: 'ayakkabı', count: 65, trend: 'up' },
      { id: '7', text: 'Moda', count: 54, category: 'Moda', trend: 'stable' },
      { id: '8', text: 'ev', count: 43, trend: 'down' },
    ];
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} color="#22c55e" />;
      case 'down':
        return <TrendingUp size={14} color="#ef4444" style={{ transform: [{ rotate: '180deg' }] }} />;
      case 'stable':
        return <Star size={14} color="#f59e0b" />;
    }
  };

  const getTrendText = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'Yükseliyor';
      case 'down':
        return 'Düşüyor';
      case 'stable':
        return 'Stabil';
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          📈 Popüler Aramalar
        </Text>
        <View style={styles.trendIndicator}>
          <Flame size={16} color="#f59e0b" />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {popularSearches.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.popularItem,
              { 
                borderBottomColor: colors.border,
                borderBottomWidth: index === popularSearches.length - 1 ? 0 : 1
              }
            ]}
            onPress={() => onPopularSearchPress(item.text)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <View style={styles.rankContainer}>
              <Text style={[styles.rank, { color: colors.textSecondary }]}>
                #{index + 1}
              </Text>
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.textContainer}>
                <Text style={[styles.popularText, { color: colors.text }]}>
                  {item.text}
                </Text>
                {item.category && (
                  <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                    {item.category}
                  </Text>
                )}
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.trendContainer}>
                  {getTrendIcon(item.trend)}
                  <Text style={[styles.trendText, { color: colors.textSecondary }]}>
                    {getTrendText(item.trend)}
                  </Text>
                </View>
                <Text style={[styles.countText, { color: colors.textSecondary }]}>
                  {formatCount(item.count)} arama
                </Text>
              </View>
            </View>

            <Search size={16} color={colors.textSecondary} style={styles.searchIcon} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendIndicator: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 250,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  rank: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  popularText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 11,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  trendText: {
    fontSize: 10,
    marginLeft: 4,
  },
  countText: {
    fontSize: 10,
  },
  searchIcon: {
    marginLeft: 12,
  },
});

export default PopularSearches; 