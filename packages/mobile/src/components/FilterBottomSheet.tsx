import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '../stores';
import { 
  X, 
  SlidersHorizontal, 
  Filter, 
  ChevronDown,
  ChevronUp,
  MapPin,
  DollarSign,
  Clock,
  Star
} from 'lucide-react-native';

const { height: screenHeight } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = screenHeight * 0.8;

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

interface FilterSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  options: FilterOption[];
  multiSelect?: boolean;
}

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  onClear: () => void;
  currentFilters?: any;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  currentFilters = {},
}) => {
  const colors = useThemeColors();
  const [expandedSections, setExpandedSections] = useState<string[]>(['location']);
  const [selectedFilters, setSelectedFilters] = useState<any>(currentFilters);
  
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Filter sections data
  const filterSections: FilterSection[] = [
    {
      id: 'category',
      title: 'Kategori',
      icon: <Star size={20} color={colors.text} />,
      options: [
        { id: 'elektronik', label: 'Elektronik', value: 'Elektronik', count: 1250 },
        { id: 'moda', label: 'Moda', value: 'Moda', count: 2100 },
        { id: 'ev-yasam', label: 'Ev & Yaşam', value: 'Ev & Yaşam', count: 890 },
        { id: 'arac', label: 'Araç', value: 'Araç', count: 650 },
        { id: 'spor', label: 'Spor & Hobi', value: 'Spor & Hobi', count: 450 },
        { id: 'kitap', label: 'Kitap & Müzik', value: 'Kitap & Müzik', count: 320 },
        { id: 'is-makinesi', label: 'İş Makinesi', value: 'İş Makinesi', count: 180 },
        { id: 'diger', label: 'Diğer', value: 'Diğer', count: 280 },
      ],
    },
    {
      id: 'location',
      title: 'Konum',
      icon: <MapPin size={20} color={colors.text} />,
      options: [
        { id: 'izmir', label: 'İzmir', value: 'İzmir', count: 1250 },
        { id: 'istanbul', label: 'İstanbul', value: 'İstanbul', count: 2100 },
        { id: 'ankara', label: 'Ankara', value: 'Ankara', count: 890 },
        { id: 'bursa', label: 'Bursa', value: 'Bursa', count: 650 },
      ],
    },
    {
      id: 'price',
      title: 'Fiyat Aralığı',
      icon: <DollarSign size={20} color={colors.text} />,
      options: [
        { id: '0-1000', label: '0 - 1.000 TL', value: '0-1000', count: 450 },
        { id: '1000-5000', label: '1.000 - 5.000 TL', value: '1000-5000', count: 1200 },
        { id: '5000-10000', label: '5.000 - 10.000 TL', value: '5000-10000', count: 800 },
        { id: '10000+', label: '10.000 TL+', value: '10000+', count: 300 },
      ],
    },
    {
      id: 'urgency',
      title: 'Aciliyet',
      icon: <Clock size={20} color={colors.text} />,
      options: [
        { id: 'low', label: 'Düşük', value: 'low', count: 1200 },
        { id: 'normal', label: 'Normal', value: 'normal', count: 1800 },
        { id: 'high', label: 'Yüksek', value: 'high', count: 400 },
      ],
    },
    {
      id: 'premium',
      title: 'Premium İlanlar',
      icon: <Star size={20} color={colors.text} />,
      options: [
        { id: 'premium', label: 'Sadece Premium', value: 'premium', count: 150 },
        { id: 'all', label: 'Tümü', value: 'all', count: 3400 },
      ],
    },
  ];

  useEffect(() => {
    if (visible) {
      showBottomSheet();
    } else {
      hideBottomSheet();
    }
  }, [visible]);

  const showBottomSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideBottomSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        onClose();
      }, 0);
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleFilter = (sectionId: string, optionId: string, value: string) => {
    setSelectedFilters((prev: any) => {
      const current = prev[sectionId] || [];
      const isSelected = current.includes(value);
      
      if (isSelected) {
        return {
          ...prev,
          [sectionId]: current.filter((v: string) => v !== value),
        };
      } else {
        return {
          ...prev,
          [sectionId]: [...current, value],
        };
      }
    });
  };

  const handleApply = () => {
    onApply(selectedFilters);
    hideBottomSheet();
  };

  const handleClear = () => {
    setSelectedFilters({});
    onClear();
  };

  const renderFilterSection = (section: FilterSection) => {
    const isExpanded = expandedSections.includes(section.id);
    const selectedValues = selectedFilters[section.id] || [];

    return (
      <View key={section.id} style={[styles.section, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(section.id)}
        >
          <View style={styles.sectionTitleContainer}>
            {section.icon}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            {selectedValues.length > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.badgeText, { color: colors.white }]}>
                  {selectedValues.length}
                </Text>
              </View>
            )}
          </View>
          {isExpanded ? (
            <ChevronUp size={20} color={colors.text} />
          ) : (
            <ChevronDown size={20} color={colors.text} />
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContent}>
            {section.options.map(option => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionItem,
                    isSelected && { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => toggleFilter(section.id, option.id, option.value)}
                >
                  <View style={styles.optionContent}>
                    <Text style={[
                      styles.optionLabel,
                      { color: isSelected ? colors.primary : colors.text }
                    ]}>
                      {option.label}
                    </Text>
                    {option.count && (
                      <Text style={[styles.optionCount, { color: colors.textSecondary }]}>
                        {option.count}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: colors.primary }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropOpacity }
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={hideBottomSheet}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            backgroundColor: colors.background,
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <SlidersHorizontal size={24} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Filtreler
            </Text>
          </View>
          <TouchableOpacity onPress={hideBottomSheet} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filterSections.map(renderFilterSection)}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: colors.border }]}
            onPress={handleClear}
          >
            <Text style={[styles.clearButtonText, { color: colors.text }]}>
              Temizle
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={handleApply}
          >
            <Text style={[styles.applyButtonText, { color: colors.white }]}>
              Uygula
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionContent: {
    paddingBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionCount: {
    fontSize: 14,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 