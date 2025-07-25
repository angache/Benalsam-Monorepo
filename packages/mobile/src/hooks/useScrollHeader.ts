import { useState, useCallback, useRef } from 'react';
import { Animated } from 'react-native';

export const useScrollHeader = (threshold: number = 50) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-48)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const lastScrollTime = useRef(0);

  const handleScroll = useCallback((event: any) => {
    const now = Date.now();
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const shouldShow = currentScrollY > threshold;

    // Scroll throttle - 16ms (60fps)
    if (now - lastScrollTime.current < 16) return;
    lastScrollTime.current = now;

    // Eğer durum değişmediyse animasyon yapma
    if (shouldShow === isHeaderVisible) return;

    // Önceki animasyonu durdur
    if (animationRef.current) {
      animationRef.current.stop();
    }

    setIsHeaderVisible(shouldShow);

    if (shouldShow) {
      // Header'ı göster - daha hızlı
      animationRef.current = Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]);
    } else {
      // Header'ı gizle - daha hızlı
      animationRef.current = Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: -48,
          duration: 120,
          useNativeDriver: true,
        }),
      ]);
    }

    animationRef.current?.start();
  }, [threshold, isHeaderVisible, headerOpacity, headerTranslateY]);

  return {
    handleScroll,
    headerOpacity,
    headerTranslateY,
  };
}; 