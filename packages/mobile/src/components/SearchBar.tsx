import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../stores';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Ara...',
  value,
  onChangeText,
  onSearch,
  onClear,
  style,
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#232733',
      borderRadius: 6,
      paddingHorizontal: 0,
      paddingVertical: 0,
      marginHorizontal: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: '#333',
      ...style,
    };
  };

  const getInputStyle = () => {
    return {
      flex: 1,
      fontSize: 16,
      color: '#fff',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderTopLeftRadius: 6,
      borderBottomLeftRadius: 6,
      backgroundColor: 'transparent',
    };
  };

  const getSearchButtonStyle = () => ({
    height: 44,
    width: 44,
    backgroundColor: 'transparent',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  });

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={getContainerStyle()}>
      <TextInput
        style={getInputStyle()}
        placeholder={placeholder}
        placeholderTextColor="#cbd5e1"
        value={value}
        onChangeText={(text) => {
          console.log('🔍 SearchBar TextInput onChangeText - Text:', text);
          onChangeText(text);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={() => {
          console.log('🔍 SearchBar TextInput onSubmitEditing - Called');
          onSearch?.();
        }}
        onEndEditing={() => {
          console.log('🔍 SearchBar TextInput onEndEditing - Called');
          // onEndEditing'de arama yapmayalım, sadece log ekleyelim
        }}
        returnKeyType="search"
      />
      <TouchableOpacity 
        onPress={() => {
          console.log('🔍 SearchBar TouchableOpacity onPress - Called');
          onSearch?.();
        }} 
        style={getSearchButtonStyle()}
      >
        <Search size={22} color="#cbd5e1" />
      </TouchableOpacity>
    </View>
  );
}; 