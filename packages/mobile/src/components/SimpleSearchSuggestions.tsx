import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../stores/themeStore';

interface SimpleSearchSuggestionsProps {
  onSuggestionPress: (text: string) => void;
  visible: boolean;
}

const SimpleSearchSuggestions: React.FC<SimpleSearchSuggestionsProps> = ({
  onSuggestionPress,
  visible,
}) => {
  const colors = useThemeColors();

  if (!visible) return null;

  const testSuggestions = ['araba', 'ev', 'telefon', 'bilgisayar'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Test Önerileri:</Text>
      {testSuggestions.map((suggestion, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
          onPress={() => {
            console.log('🔍 SimpleSearchSuggestions - Pressed:', suggestion);
            onSuggestionPress(suggestion);
          }}
        >
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
    borderRadius: 8,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
  },
});

export default SimpleSearchSuggestions; 