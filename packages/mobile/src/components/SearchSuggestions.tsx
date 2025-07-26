import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseClient';
import { useThemeColors } from '../stores/themeStore';
import { Clock, TrendingUp, Grid, Zap, Search } from 'lucide-react-native';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'category' | 'trending';
  category?: string;
  count?: number;
}

interface SearchSuggestionsProps {
  query: string;
  onSuggestionPress: (suggestion: string) => void;
  onClearHistory?: () => void;
  visible: boolean;
  maxSuggestions?: number;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  onSuggestionPress,
  onClearHistory,
  visible,
  maxSuggestions = 10,
}) => {
  const colors = useThemeColors();
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Son aramaları yükle
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Arama önerilerini güncelle
  useEffect(() => {
    console.log('🔍 SearchSuggestions useEffect - visible:', visible, 'query:', query);
    if (visible && query.trim()) {
      console.log('🔍 SearchSuggestions - Generating suggestions for query:', query);
      generateSuggestions();
    } else if (visible && !query.trim()) {
      console.log('🔍 SearchSuggestions - Showing default suggestions');
      showDefaultSuggestions();
    }
  }, [query, visible]);

  // Son aramaları AsyncStorage'dan yükle
  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentSearches');
      if (stored) {
        const searches = JSON.parse(stored);
        setRecentSearches(searches);
      }
    } catch (error) {
      console.warn('Son aramalar yüklenemedi:', error);
    }
  };

  // Arama geçmişini temizle
  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches');
      setRecentSearches([]);
      onClearHistory?.();
    } catch (error) {
      console.warn('Arama geçmişi temizlenemedi:', error);
    }
  };

  // Varsayılan önerileri göster
  const showDefaultSuggestions = async () => {
    console.log('🔍 SearchSuggestions showDefaultSuggestions - ENTRY');
    const defaultSuggestions: SearchSuggestion[] = [];

    // Son aramalar
    if (recentSearches.length > 0) {
      console.log('🔍 SearchSuggestions - Recent searches found:', recentSearches);
      recentSearches.slice(0, 5).forEach((search, index) => {
        defaultSuggestions.push({
          id: `recent-${index}`,
          text: search,
          type: 'recent',
        });
      });
    }

    // Popüler aramalar
    const popularSearches = await getPopularSearches();
    console.log('🔍 SearchSuggestions - Popular searches:', popularSearches);
    popularSearches.forEach((search, index) => {
      defaultSuggestions.push({
        id: `popular-${index}`,
        text: search,
        type: 'popular',
      });
    });

    console.log('🔍 SearchSuggestions - Final suggestions:', defaultSuggestions);
    setSuggestions(defaultSuggestions.slice(0, maxSuggestions));
  };

  // Popüler aramaları getir
  const getPopularSearches = async (): Promise<string[]> => {
    try {
      // Supabase'den popüler aramaları çek
      const { data, error } = await supabase
        .from('listings')
        .select('title, category')
        .limit(20);

      if (error) throw error;

      // Başlıklardan popüler kelimeleri çıkar
      const words = data
        ?.flatMap(item => item.title?.split(' ') || [])
        .filter(word => word.length > 2)
        .map(word => word.toLowerCase());

      // Kelime frekansını hesapla
      const wordCount: { [key: string]: number } = {};
      words?.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });

      // En popüler kelimeleri döndür
      return Object.entries(wordCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);
    } catch (error) {
      console.warn('Popüler aramalar yüklenemedi:', error);
      return ['araba', 'ev', 'telefon', 'bilgisayar', 'mobilya'];
    }
  };

  // Arama önerilerini oluştur
  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const newSuggestions: SearchSuggestion[] = [];

      // 1. Son aramalardan eşleşenleri bul
      const matchingRecent = recentSearches
        .filter(search => 
          search.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
        .map((search, index) => ({
          id: `recent-match-${index}`,
          text: search,
          type: 'recent' as const,
        }));

      newSuggestions.push(...matchingRecent);

      // 2. Kategori bazlı öneriler
      const categorySuggestions = await getCategorySuggestions(query);
      newSuggestions.push(...categorySuggestions);

      // 3. Supabase'den benzer başlıklar
      const similarTitles = await getSimilarTitles(query);
      newSuggestions.push(...similarTitles);

      // 4. Popüler aramalardan eşleşenler
      const popularSearches = await getPopularSearches();
      const matchingPopular = popularSearches
        .filter(search => 
          search.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 2)
        .map((search, index) => ({
          id: `popular-match-${index}`,
          text: search,
          type: 'popular' as const,
        }));

      newSuggestions.push(...matchingPopular);

      // Tekrarları kaldır ve sırala
      const uniqueSuggestions = newSuggestions.filter(
        (suggestion, index, self) => 
          index === self.findIndex(s => s.text === suggestion.text)
      );

      setSuggestions(uniqueSuggestions.slice(0, maxSuggestions));
    } catch (error) {
      console.warn('Arama önerileri oluşturulamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kategori bazlı öneriler
  const getCategorySuggestions = async (query: string): Promise<SearchSuggestion[]> => {
    const suggestions: SearchSuggestion[] = [];
    
    // Kategori eşleştirmeleri - gerçek arama terimleriyle eşleştir
    const categoryMatches = {
      'ara': ['araba', 'araclar', 'araç'],
      'ev': ['ev', 'emlak', 'daire', 'konut'],
      'tel': ['telefon', 'iphone', 'samsung', 'mobil'],
      'bil': ['bilgisayar', 'laptop', 'pc', 'computer'],
      'mob': ['mobilya', 'koltuk', 'masa', 'sandalye'],
      'iş': ['iş makinesi', 'ekskavatör', 'buldozer'],
      'elek': ['elektronik', 'teknoloji', 'gadget'],
    };

    Object.entries(categoryMatches).forEach(([keyword, searchTerms]) => {
      if (query.toLowerCase().includes(keyword)) {
        searchTerms.forEach((term, index) => {
          suggestions.push({
            id: `category-${keyword}-${index}`,
            text: term,
            type: 'category',
            category: keyword,
          });
        });
      }
    });

    return suggestions.slice(0, 3);
  };

  // Benzer başlıkları getir
  const getSimilarTitles = async (query: string): Promise<SearchSuggestion[]> => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('title')
        .ilike('title', `%${query}%`)
        .limit(5);

      if (error) throw error;

      return data?.map((item, index) => ({
        id: `similar-${index}`,
        text: item.title,
        type: 'trending',
      })) || [];
    } catch (error) {
      console.warn('Benzer başlıklar yüklenemedi:', error);
      return [];
    }
  };

  // Öneri türüne göre icon
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return Clock;
      case 'popular':
        return TrendingUp;
      case 'category':
        return Grid;
      case 'trending':
        return Zap;
      default:
        return Search;
    }
  };

  // Öneri türüne göre renk
  const getSuggestionColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return colors.primary;
      case 'popular':
        return colors.success;
      case 'category':
        return colors.warning;
      case 'trending':
        return colors.error;
      default:
        return colors.text;
    }
  };

  // Öneri türüne göre başlık
  const getSuggestionTitle = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return 'Son Aramalar';
      case 'popular':
        return 'Popüler Aramalar';
      case 'category':
        return 'Kategori Önerileri';
      case 'trending':
        return 'Trend Aramalar';
      default:
        return 'Öneriler';
    }
  };

  // Önerileri grupla
  const groupedSuggestions = useMemo(() => {
    const groups: { [key: string]: SearchSuggestion[] } = {};
    
    suggestions.forEach(suggestion => {
      if (!groups[suggestion.type]) {
        groups[suggestion.type] = [];
      }
      groups[suggestion.type].push(suggestion);
    });

    return groups;
  }, [suggestions]);

  // Öneri render
  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => {
    const IconComponent = getSuggestionIcon(item.type);
    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => {
          console.log('🔍 SearchSuggestions - Suggestion pressed:', item.text);
          onSuggestionPress(item.text);
        }}
      >
        <IconComponent
          size={16}
          color={getSuggestionColor(item.type)}
          style={styles.suggestionIcon}
        />
        <Text style={[styles.suggestionText, { color: colors.text }]}>
          {item.text}
        </Text>
        {item.count && (
          <Text style={[styles.suggestionCount, { color: colors.textSecondary }]}>
            {item.count}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Grup başlığı render
  const renderGroupHeader = (type: string, suggestions: SearchSuggestion[]) => (
    <View style={styles.groupHeader}>
      <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
        {getSuggestionTitle(type as SearchSuggestion['type'])}
      </Text>
      {type === 'recent' && suggestions.length > 0 && (
        <TouchableOpacity onPress={clearHistory}>
          <Text style={[styles.clearButton, { color: colors.primary }]}>
            Temizle
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Öneriler yükleniyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={Object.entries(groupedSuggestions)}
          keyExtractor={([type]) => type}
          renderItem={({ item: [type, suggestions] }) => (
            <View style={styles.group}>
              {renderGroupHeader(type, suggestions)}
              {suggestions.map(suggestion => (
                <View key={suggestion.id}>
                  {renderSuggestion({ item: suggestion })}
                </View>
              ))}
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  listContainer: {
    padding: 8,
  },
  group: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearButton: {
    fontSize: 12,
    fontWeight: '500',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
  },
  suggestionCount: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SearchSuggestions; 