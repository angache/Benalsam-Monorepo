import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Pressable,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../stores';
import { ImageWithFallback } from './ImageWithFallback';
import { Avatar } from './Avatar';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Zap
} from 'lucide-react-native';

interface ListingCardProps {
  listing: any;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  style?: any;
  index?: number;
  isFavoriteLoading?: boolean;
  isGrid?: boolean; // Grid layout için marginRight kontrolü
}

const { width: screenWidth } = Dimensions.get('window');
const SIDE_PADDING = 16; // Sol ve sağ kenar mesafesi
const CARD_GAP = 12; // Kartlar arası mesafe
const CARD_WIDTH = (screenWidth - SIDE_PADDING * 2 - CARD_GAP) / 2;

const ListingCard: React.FC<ListingCardProps> = React.memo(({
  listing,
  onPress,
  onToggleFavorite,
  style,
  index = 0,
  isFavoriteLoading = false,
  isGrid = false,
}) => {
  const colors = useThemeColors();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Animations
  const scaleAnim = useMemo(() => new Animated.Value(1), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  // Memoized data processing
  const cardData = useMemo(() => {
    const isUrgent = listing.urgency === 'high' || listing.urgency === 'Acil';
    const timeAgo = getTimeAgo(listing.created_at);
    
    // Extract only city from location
    const getCity = (location: string) => {
      if (!location || location === '-') return '-';
      const parts = location.split('/').map(part => part.trim());
      return parts[0] || '-'; // First part is usually the city
    };
    
    return {
      id: listing.id,
      title: listing.title || 'Başlık yok',
      price: listing.budget || 0,
      location: getCity(listing.location || '-'),
      timeAgo,
      isUrgent,
      category: listing.category || 'Genel',
      imageUrl: listing.main_image_url || listing.main_image || listing.image_url || null,
      isFavorited: !!listing.is_favorited,
    };
  }, [listing]);

  // Animation handlers
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scaleAnim]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleFavoritePress = useCallback((e: any) => {
    e.stopPropagation();
    onToggleFavorite?.();
  }, [onToggleFavorite]);

  const formatPrice = useCallback((price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
    return price.toString();
  }, []);

  const dynamicStyles = useMemo(() => {
    const containerWidth = style?.width === '100%' ? screenWidth - 32 : CARD_WIDTH;
    
    return StyleSheet.create({
      container: {
        width: containerWidth,
        marginBottom: style?.marginBottom !== undefined ? style.marginBottom : 16,
        marginRight: isGrid ? 0 : 16, // Sadece horizontal layout'ta marginRight
      },
      card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: `${colors.border}20`,
      },
      imageContainer: {
        height: 140,
        position: 'relative',
        backgroundColor: colors.gray[100],
      },
      image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
      },
      imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      urgentBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: colors.error,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
      },
      badgeText: {
        color: colors.white,
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 4,
      },
      favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
      },
      content: {
        padding: 12,
      },
      header: {
        marginBottom: 8,
      },
      title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        lineHeight: 20,
        marginBottom: 4,
        height: 40, // 2 satır için sabit yükseklik (20px * 2)
      },
      price: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: 2,
      },
      priceLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '500',
      },
      metadata: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
      },
      metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      metadataText: {
        fontSize: 11,
        color: colors.textSecondary,
        marginLeft: 4,
        fontWeight: '500',
      },
      loadingIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -10 }, { translateY: -10 }],
      },
      skeletonImage: {
        backgroundColor: colors.gray[200],
        borderRadius: 8,
      },
    });
  }, [colors, style, isGrid]);

  return (
    <Animated.View 
      style={[
        dynamicStyles.container, 
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          dynamicStyles.card,
          isFavoriteLoading && { opacity: 0.7 }
        ]}
        disabled={isFavoriteLoading}
      >
        {/* Image Section */}
        <View style={dynamicStyles.imageContainer}>
          {cardData.imageUrl ? (
            <>
              <Image
                source={{ uri: cardData.imageUrl }}
                style={dynamicStyles.image}
                onLoad={handleImageLoad}
              />
              <Animated.View 
                style={[
                  dynamicStyles.imageOverlay,
                  { opacity: fadeAnim }
                ]}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </>
          ) : (
            <View style={[dynamicStyles.image, dynamicStyles.skeletonImage]} />
          )}

          {/* Badges */}
          {cardData.isUrgent && (
            <View style={dynamicStyles.urgentBadge}>
              <Zap size={12} color={colors.white} />
              <Text style={dynamicStyles.badgeText}>ACİL</Text>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            style={[
              dynamicStyles.favoriteButton,
              isFavoriteLoading && { opacity: 0.5 }
            ]}
            onPress={handleFavoritePress}
            activeOpacity={0.7}
            disabled={isFavoriteLoading}
          >
            <Heart
              size={18}
              color={cardData.isFavorited ? '#FF0000' : '#FFFFFF'}
              fill={cardData.isFavorited ? '#FF0000' : 'transparent'}
              strokeWidth={2}
            />
          </TouchableOpacity>


        </View>

        {/* Content Section */}
        <View style={dynamicStyles.content}>
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title} numberOfLines={2}>
              {cardData.title}
            </Text>
            <Text style={dynamicStyles.price}>
              ₺{formatPrice(cardData.price)}
              <Text style={dynamicStyles.priceLabel}> bütçe</Text>
            </Text>
          </View>

          {/* Metadata */}
          <View style={dynamicStyles.metadata}>
            <View style={dynamicStyles.metadataItem}>
              <MapPin size={12} color={colors.textSecondary} />
              <Text style={dynamicStyles.metadataText} numberOfLines={1}>
                {cardData.location}
              </Text>
            </View>
            <View style={dynamicStyles.metadataItem}>
              <Clock size={12} color={colors.textSecondary} />
              <Text style={dynamicStyles.metadataText}>
                {cardData.timeAgo}
              </Text>
            </View>
          </View>

        </View>
      </Pressable>
    </Animated.View>
  );
});

// Helper function
const getTimeAgo = (dateString: string) => {
  if (!dateString) return 'Bilinmiyor';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInHours < 1) return 'Az önce';
  if (diffInHours < 24) return `${diffInHours}s önce`;
  if (diffInDays < 7) return `${diffInDays}g önce`;
  return `${Math.floor(diffInDays / 7)}h önce`;
};

ListingCard.displayName = 'ListingCard';

export default ListingCard; 