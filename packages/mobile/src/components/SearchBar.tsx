import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle,
  Keyboard,
} from 'react-native';
import { useThemeColors } from '../stores';
import { Search, X, Mic } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimpleSearchSuggestions from './SimpleSearchSuggestions';

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
  const inputRef = useRef<TextInput>(null);

  const addToRecentSearches = async (searchText: string) => {
    try {
      const recent = await AsyncStorage.getItem('recentSearches');
      const recentSearches = recent ? JSON.parse(recent) : [];
      const newRecent = [searchText, ...recentSearches.filter((s: string) => s !== searchText)].slice(0, 5);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(newRecent));
    } catch (error) {
      console.log('Recent search kaydedilemedi:', error);
    }
  };



  const handleClear = () => {
    onChangeText('');
    onClear?.();
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  // Eski suggestion press handler kaldırıldı - SearchSuggestions kullanılıyor

  const handleSearchPress = () => {
    setShowSuggestionsList(false);
    Keyboard.dismiss();
    
    // Recent searches'e ekle
    if (value.trim()) {
      addToRecentSearches(value.trim());
    }
    
    onSearch?.();
  };

  // Eski suggestion item render sistemi kaldırıldı - SearchSuggestions kullanılıyor

  // Eski suggestion sistemi kaldırıldı - SearchSuggestions kullanılıyor

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
            onChangeText(text);
            if (showSuggestions) {
              setShowSuggestionsList(true);
            }
          }}
          onFocus={() => {
            setIsFocused(true);
            if (showSuggestions) {
              setShowSuggestionsList(true);
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
      {showSuggestionsList && (
        <View style={styles.suggestionsWrapper}>
          <SimpleSearchSuggestions
            query={value}
            onSuggestionPress={(suggestion) => {
              onSuggestionSelect?.({
                id: `selected-${Date.now()}`,
                text: suggestion,
                type: 'suggestion',
              });
              
              setShowSuggestionsList(false);
              addToRecentSearches(suggestion);
            }}
            visible={showSuggestionsList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  suggestionsWrapper: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    zIndex: 1001,
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