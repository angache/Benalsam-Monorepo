import React, { useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { Image as ImageIcon } from 'lucide-react-native';

interface ImageWithFallbackProps {
  uri: string;
  style?: any;
  fallbackText?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  uri, 
  style, 
  fallbackText = 'Görsel yüklenemedi' 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    console.log('🚨 Image failed to load:', uri);
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <ImageIcon size={40} color="#666" />
        <Text style={styles.fallbackText}>{fallbackText}</Text>
        <Text style={styles.urlText} numberOfLines={2}>
          {uri}
        </Text>
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={{ uri }}
        style={[style, isLoading && styles.loading]}
        onError={handleError}
        onLoad={handleLoad}
        resizeMode="cover"
      />
      {isLoading && (
        <View style={[styles.loadingOverlay, style]}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
  },
  fallbackText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  urlText: {
    marginTop: 4,
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  loading: {
    opacity: 0.5,
  },
  loadingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
  },
}); 