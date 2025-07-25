import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle,
  ScrollView,
  FlatList,
  Keyboard,
} from 'react-native';
import { useThemeColors } from '../stores';
import { Search, X, Clock, TrendingUp, Mic } from 'lucide-react-native';
import { supabase } from '../services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'history' | 'trending' | 'suggestion';
  category?: string;
}

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  showSuggestions?: boolean;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Ara...',
  value,
  onChangeText,
  onSearch,
  onClear,
  onSuggestionSelect,
  suggestions = [],
  showSuggestions = true,
  style,
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<TextInput>(null);

  // Recent searches'i localStorage'dan yükle
  useEffect(() => {
    loadRecentSearches();
    loadTrendingSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      // AsyncStorage'dan recent searches'i yükle
      const recent = await AsyncStorage.getItem('recentSearches');
      if (recent) {
        setRecentSearches(JSON.parse(recent));
      }
    } catch (error) {
      console.log('Recent searches yüklenemedi:', error);
    }
  };

  const loadTrendingSearches = async () => {
    try {
      // Supabase'den trending searches'i al
      const { data, error } = await supabase
        .from('listings')
        .select('title, category')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        // En popüler kategorileri ve başlıkları al
        const trending = data.map((item, index) => ({
          id: `trending-${index}`,
          text: item.title,
          type: 'trending' as const,
          category: item.category,
        }));
        setTrendingSearches(trending);
      }
    } catch (error) {
      console.log('Trending searches yüklenemedi:', error);
    }
  };

  const addToRecentSearches = async (searchText: string) => {
    try {
      const newRecent = [searchText, ...recentSearches.filter(s => s !== searchText)].slice(0, 5);
      setRecentSearches(newRecent);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(newRecent));
    } catch (error) {
      console.log('Recent search kaydedilemedi:', error);
    }
  };

  // Dinamik suggestions oluştur
  const getDynamicSuggestions = (): SearchSuggestion[] => {
    const allSuggestions: SearchSuggestion[] = [];

    // Recent searches
    recentSearches.forEach((search, index) => {
      allSuggestions.push({
        id: `recent-${index}`,
        text: search,
        type: 'history',
      });
    });

    // Trending searches
    allSuggestions.push(...trendingSearches);

    // Custom suggestions (props'tan gelen)
    allSuggestions.push(...suggestions);

    return allSuggestions;
  };

  const allSuggestions = getDynamicSuggestions();
  const filteredSuggestions = value.trim() && showSuggestions 
    ? allSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  const handleClear = () => {
    onChangeText('');
    onClear?.();
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    onChangeText(suggestion.text);
    onSuggestionSelect?.(suggestion);
    setShowSuggestionsList(false);
    Keyboard.dismiss();
    
    // Recent searches'e ekle
    addToRecentSearches(suggestion.text);
    
    onSearch?.();
  };

  const handleSearchPress = () => {
    setShowSuggestionsList(false);
    Keyboard.dismiss();
    
    // Recent searches'e ekle
    if (value.trim()) {
      addToRecentSearches(value.trim());
    }
    
    onSearch?.();
  };

  const renderSuggestionItem = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSuggestionPress(item)}
    >
      <View style={styles.suggestionIcon}>
        {item.type === 'history' ? (
          <Clock size={16} color={colors.textSecondary} />
        ) : item.type === 'trending' ? (
          <TrendingUp size={16} color={colors.primary} />
        ) : (
          <Search size={16} color={colors.textSecondary} />
        )}
      </View>
      
      <View style={styles.suggestionContent}>
        <Text style={[styles.suggestionText, { color: colors.text }]}>
          {item.text}
        </Text>
        {item.category && (
          <Text style={[styles.suggestionCategory, { color: colors.textSecondary }]}>
            {item.category}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSuggestionsList = () => (
    <View 
      style={[
        styles.suggestionsContainer,
        { 
          backgroundColor: colors.background,
          borderColor: colors.border,
        }
      ]}
    >
      <FlatList
        data={filteredSuggestions}
        renderItem={renderSuggestionItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        maxToRenderPerBatch={10}
        windowSize={5}
        style={styles.suggestionsList}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[
        styles.searchContainer,
        {
          backgroundColor: colors.surface,
          borderColor: isFocused ? colors.primary : colors.border,
          ...style,
        }
      ]}>
        {/* Search Icon */}
        <View style={styles.searchIconContainer}>
          <Search size={20} color={colors.textSecondary} />
        </View>

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            { color: colors.text }
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={(text) => {
            console.log('🔍 SearchBar TextInput onChangeText - Text:', text);
            onChangeText(text);
            setShowSuggestionsList(Boolean(text.trim() && showSuggestions && filteredSuggestions.length > 0));
          }}
          onFocus={() => {
            setIsFocused(true);
            if (value.trim() && showSuggestions) {
              setShowSuggestionsList(Boolean(filteredSuggestions.length > 0));
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay hiding suggestions to allow for touch events
            setTimeout(() => setShowSuggestionsList(false), 150);
          }}
          onSubmitEditing={handleSearchPress}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {/* Clear Button */}
        {value.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClear}
          >
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Voice Search Button (Optional) */}
        <TouchableOpacity 
          style={styles.voiceButton}
          onPress={() => {
            // TODO: Implement voice search
            console.log('🎤 Voice search pressed');
          }}
        >
          <Mic size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearchPress}
        >
          <Search size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Suggestions List */}
      {showSuggestionsList && renderSuggestionsList()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIconContainer: {
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },
  voiceButton: {
    padding: 8,
    marginRight: 4,
  },
  searchButton: {
    padding: 8,
    marginRight: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 300,
    zIndex: 1001,
  },
  suggestionsList: {
    borderRadius: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  suggestionCategory: {
    fontSize: 12,
    marginTop: 2,
  },
}); 