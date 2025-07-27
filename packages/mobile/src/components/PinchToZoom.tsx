import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  StatusBar,
  Text,
} from 'react-native';
import { X, ZoomIn, ZoomOut } from 'lucide-react-native';
import { useThemeColors } from '../stores';
import { haptic } from '../utils/hapticFeedback';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PinchToZoomProps {
  source: { uri: string } | number;
  style?: any;
  onPress?: () => void;
  enableZoom?: boolean;
  maxScale?: number;
  minScale?: number;
}

const PinchToZoom: React.FC<PinchToZoomProps> = ({
  source,
  style,
  onPress,
  enableZoom = true,
  maxScale = 3,
  minScale = 0.5,
}) => {
  const colors = useThemeColors();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Animated values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const resetZoom = () => {
    haptic.medium();
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
  };

  const zoomIn = () => {
    haptic.light();
    scale.value = Math.min(scale.value * 1.5, maxScale);
  };

  const zoomOut = () => {
    haptic.light();
    scale.value = Math.max(scale.value / 1.5, minScale);
  };

  const openModal = () => {
    haptic.light();
    setIsModalVisible(true);
  };

  const closeModal = () => {
    haptic.light();
    setIsModalVisible(false);
    resetZoom();
  };

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(Math.max(event.scale, minScale), maxScale);
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = 1;
        translateX.value = 0;
        translateY.value = 0;
      }
    });

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        translateX.value = 0;
        translateY.value = 0;
      }
    });

  // Combined gestures
  const combinedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated styles
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const renderZoomedImage = () => (
    <View style={styles.modalContainer}>
      <StatusBar hidden />
      
      {/* Header */}
      <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={closeModal}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={zoomOut}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ZoomOut size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={resetZoom}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.zoomText, { color: colors.text }]}>
              {Math.round(scale.value * 100)}%
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={zoomIn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ZoomIn size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Zoomed Image */}
      <View style={styles.imageContainer}>
        <GestureDetector gesture={combinedGesture}>
          <Animated.Image
            source={source}
            style={[styles.fullImage, animatedImageStyle]}
            resizeMode="contain"
          />
        </GestureDetector>
      </View>
    </View>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={openModal}
        activeOpacity={0.9}
      >
        <Image
          source={source}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        {renderZoomedImage()}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 44,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  zoomText: {
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: screenWidth,
    height: screenHeight,
  },
});

export default PinchToZoom; 