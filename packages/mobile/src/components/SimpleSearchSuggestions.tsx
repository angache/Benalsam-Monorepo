import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, Car, Home, Phone, Monitor, Sofa } from 'lucide-react-native';
import { useThemeColors } from '../stores/themeStore';

interface SimpleSearchSuggestionsProps {
  query: string;
  onSuggestionPress: (text: string) => void;
  visible: boolean;
}

const SimpleSearchSuggestions: React.FC<SimpleSearchSuggestionsProps> = ({
  query,
  onSuggestionPress,
  visible,
}) => {
  const colors = useThemeColors();

  if (!visible) return null;

  const allSuggestions = ['araba', 'ev', 'telefon', 'bilgisayar', 'mobilya'];
  
  // Query'ye göre filtrele
  const filteredSuggestions = allSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        {query.trim() ? '🔍 Filtrelenmiş Öneriler' : '💡 Öneriler'}
      </Text>
      {filteredSuggestions.map((suggestion, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.suggestionItem, 
            { 
              borderBottomColor: colors.border,
              borderBottomWidth: index === filteredSuggestions.length - 1 ? 0 : 1
            }
          ]}
          onPress={() => {
            onSuggestionPress(suggestion);
          }}
        >
          {suggestion === 'araba' && <Car size={18} color={colors.textSecondary} style={styles.icon} />}
          {suggestion === 'ev' && <Home size={18} color={colors.textSecondary} style={styles.icon} />}
          {suggestion === 'telefon' && <Phone size={18} color={colors.textSecondary} style={styles.icon} />}
          {suggestion === 'bilgisayar' && <Monitor size={18} color={colors.textSecondary} style={styles.icon} />}
          {suggestion === 'mobilya' && <Sofa size={18} color={colors.textSecondary} style={styles.icon} />}
          <Text style={[styles.suggestionText, { color: colors.text }]}>
            {suggestion}
          </Text>
        </TouchableOpacity>
      ))}
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
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  suggestionText: {
    fontSize: 14,
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
});

export default SimpleSearchSuggestions; 