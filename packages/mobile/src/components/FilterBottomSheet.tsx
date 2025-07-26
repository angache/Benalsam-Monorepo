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
  Star,
  Tag
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
  searchResults?: any[]; // Arama sonuçları için
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  currentFilters = {},
  searchResults = [],
}) => {
  const colors = useThemeColors();
  const [expandedSections, setExpandedSections] = useState<string[]>(['category']);
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  
  // currentFilters değiştiğinde selectedFilters'ı güncelle
  useEffect(() => {
    if (currentFilters) {
      setSelectedFilters(currentFilters);
    }
  }, [currentFilters]);
  
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Kategori eşleştirme fonksiyonu
    const matchCategory = (dbCategory: string): string => {
    // Küçük harf kontrolü
    const normalizedCategory = dbCategory.toLowerCase();

    const categoryMap: { [key: string]: string } = {
      // Elektronik alt kategorileri
      'elektronik': 'Elektronik',
      'elektronik > telefon': 'Elektronik',
      'elektronik > telefon > akıllı telefon': 'Elektronik',
      'elektronik > telefon > akıllı telefon > akıllı telefonlar': 'Elektronik',
      'elektronik > telefon > akıllı telefon > katlanabilir telefon': 'Elektronik',
      'elektronik > telefon > akıllı telefon > gaming telefon': 'Elektronik',
      'elektronik > telefon > akıllı telefon > iş telefonu': 'Elektronik',
      'elektronik > telefon > cep telefonu': 'Elektronik',
      'elektronik > telefon > cep telefonu > klasik tuşlu telefon': 'Elektronik',
      'elektronik > telefon > cep telefonu > qwerty klavyeli telefon': 'Elektronik',
      'elektronik > telefon > cep telefonu > yaşlı dostu telefon': 'Elektronik',
      'elektronik > telefon > cep telefonu > dayanıklı telefon': 'Elektronik',
      'elektronik > telefon > telefon aksesuarları': 'Elektronik',
      'elektronik > telefon > telefon bileşenleri': 'Elektronik',
      'elektronik > bilgisayar': 'Elektronik',
      'elektronik > bilgisayar > dizüstü bilgisayar': 'Elektronik',
      'elektronik > bilgisayar > masaüstü bilgisayar': 'Elektronik',
      'elektronik > bilgisayar > tablet': 'Elektronik',
      'elektronik > bilgisayar > bilgisayar bileşenleri': 'Elektronik',
      'elektronik > bilgisayar > bilgisayar aksesuarları': 'Elektronik',
      'elektronik > bilgisayar > yazıcı & tarayıcı': 'Elektronik',
      'elektronik > tv & ses': 'Elektronik',
      'elektronik > tv & ses > televizyon': 'Elektronik',
      'elektronik > tv & ses > ses sistemleri': 'Elektronik',
      'elektronik > tv & ses > kulaklık & hoparlör': 'Elektronik',
      'elektronik > tv & ses > projeksiyon': 'Elektronik',
      'elektronik > oyun & eğlence': 'Elektronik',
      'elektronik > oyun & eğlence > oyun konsolu': 'Elektronik',
      'elektronik > oyun & eğlence > oyun aksesuarları': 'Elektronik',
      'elektronik > oyun & eğlence > video oyunları': 'Elektronik',
      'elektronik > oyun & eğlence > masa oyunları': 'Elektronik',
      'elektronik > fotoğraf & kamera': 'Elektronik',
      'elektronik > fotoğraf & kamera > dijital kamera': 'Elektronik',
      'elektronik > fotoğraf & kamera > video kamera': 'Elektronik',
      'elektronik > fotoğraf & kamera > kamera aksesuarları': 'Elektronik',
      'elektronik > fotoğraf & kamera > drone': 'Elektronik',
      'elektronik > giyilebilir teknoloji': 'Elektronik',
      'elektronik > giyilebilir teknoloji > akıllı saat': 'Elektronik',
      'elektronik > giyilebilir teknoloji > fitness takip cihazı': 'Elektronik',
      'elektronik > giyilebilir teknoloji > akıllı bileklik': 'Elektronik',
      'elektronik > giyilebilir teknoloji > vr gözlük': 'Elektronik',
      'elektronik > giyilebilir teknoloji > ar gözlük': 'Elektronik',
      'elektronik > giyilebilir teknoloji > akıllı gözlük': 'Elektronik',
      'elektronik > giyilebilir teknoloji > akıllı yüzük': 'Elektronik',
      'elektronik > giyilebilir teknoloji > akıllı kulaklık': 'Elektronik',
      'elektronik > giyilebilir teknoloji > giyilebilir kamera': 'Elektronik',
      'elektronik > giyilebilir teknoloji > akıllı kıyafet': 'Elektronik',
      'elektronik > giyilebilir teknoloji > diğer giyilebilir': 'Elektronik',
      'elektronik > küçük elektronik': 'Elektronik',
      'elektronik > küçük elektronik > saat & takı': 'Elektronik',
      'elektronik > küçük elektronik > hesap makinesi': 'Elektronik',
      'elektronik > küçük elektronik > elektronik oyunlar': 'Elektronik',
      'elektronik > diğer': 'Elektronik',

      // Ev Aletleri & Mobilya alt kategorileri
      'ev aletleri & mobilya': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > ev aletleri': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > ev aletleri > çamaşır makinesi & kurutma': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > ev aletleri > bulaşık makinesi': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > ev aletleri > buzdolabı & dondurucu': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > ev aletleri > fırın & ocak': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > ev aletleri > mikrodalga & küçük ev aletleri': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > ev aletleri > süpürge & temizlik': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > ev aletleri > ısıtma & soğutma': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mobilya': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mobilya > oturma odası mobilyası': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mobilya > yatak odası mobilyası': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mobilya > mutfak mobilyası': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mobilya > çalışma odası mobilyası': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mobilya > çocuk odası mobilyası': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mobilya > bahçe mobilyası': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > dekorasyon': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > dekorasyon > aydınlatma': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > dekorasyon > perde & stor': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > dekorasyon > halı & kilim': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > dekorasyon > tablo & resim': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > dekorasyon > vazo & süs eşyaları': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > dekorasyon > yastık & örtü': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mutfak eşyaları': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mutfak eşyaları > tencere & tava': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mutfak eşyaları > bardak & tabak': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mutfak eşyaları > çatal bıçak takımları': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mutfak eşyaları > mutfak aletleri': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > mutfak eşyaları > saklama kapları': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > bahçe & yapı market': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > bahçe & yapı market > bahçe aletleri': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > bahçe & yapı market > bitki & çiçek': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > bahçe & yapı market > yapı malzemeleri': 'Ev Aletleri & Mobilya',
      'ev aletleri & mobilya > bahçe & yapı market > el aletleri': 'Ev Aletleri & Mobilya',

      // Araç & Vasıta alt kategorileri
      'araç & vasıta': 'Araç & Vasıta',
      'araç & vasıta > otomobil': 'Araç & Vasıta',
      'araç & vasıta > otomobil > binek araç': 'Araç & Vasıta',
      'araç & vasıta > otomobil > suv & jip': 'Araç & Vasıta',
      'araç & vasıta > otomobil > ticari araç': 'Araç & Vasıta',
      'araç & vasıta > otomobil > klasik araç': 'Araç & Vasıta',
      'araç & vasıta > otomobil > antika araç': 'Araç & Vasıta',
      'araç & vasıta > otomobil > modifiye araç': 'Araç & Vasıta',
      'araç & vasıta > otomobil > lüks araç': 'Araç & Vasıta',
      'araç & vasıta > otomobil > spor araç': 'Araç & Vasıta',
      'araç & vasıta > otomobil > elektrikli araç': 'Araç & Vasıta',
      'araç & vasıta > otomobil > hibrit araç': 'Araç & Vasıta',
      'araç & vasıta > motosiklet': 'Araç & Vasıta',

      // Eski kategori isimleri (geriye uyumluluk için)
      'moda > giyim': 'Moda',
      'araclar': 'Araç & Vasıta',
      'spor & hobi': 'Spor & Hobi',
      'kitap & müzik': 'Kitap & Müzik',
      'is-makineleri': 'İş Makinesi',
      'bahçe & tarım': 'Bahçe & Tarım',
      'sanat & koleksiyon': 'Sanat & Koleksiyon',
      'oyuncak & hobi': 'Oyuncak & Hobi',
      'sağlık & güzellik': 'Sağlık & Güzellik',
      'sağlık & güzellik > güzellik & kozmetik > saç bakımı': 'Sağlık & Güzellik',
      'eğitim & kurs': 'Eğitim & Kurs',
      'hizmet': 'Hizmet',
      'diger': 'Diğer',
    };

    // Tam eşleşme varsa onu kullan
    if (categoryMap[normalizedCategory]) {
      return categoryMap[normalizedCategory];
    }

    // Ana kategori eşleşmesi ara
    for (const [dbCat, mainCat] of Object.entries(categoryMap)) {
      if (normalizedCategory.startsWith(dbCat)) {
        return mainCat;
      }
    }

    // Hiçbir eşleşme bulunamazsa "Diğer"
    return 'Diğer';
  };

  // Dinamik kategori sayılarını hesapla - Sadece sonuçlu kategorileri göster
  const getDynamicCategoryCounts = () => {
    const categoryCounts: { [key: string]: number } = {};
    
    searchResults.forEach(item => {
      if (item.category) {
        const mainCategory = matchCategory(item.category);
        categoryCounts[mainCategory] = (categoryCounts[mainCategory] || 0) + 1;
      }
    });
    
    // Sadece sonuçlu kategorileri döndür (0 olanları filtrele)
    const filteredCounts: { [key: string]: number } = {};
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > 0) {
        filteredCounts[category] = count;
      }
    });
    
    return filteredCounts;
  };

  // Tüm kategorileri tanımla (veritabanından alınacak)
    const ALL_CATEGORIES = [
    'Elektronik',
    'Ev Aletleri & Mobilya',
    'Araç & Vasıta',
    'Moda',
    'Spor & Hobi',
    'Kitap & Müzik',
    'İş Makinesi',
    'Bahçe & Tarım',
    'Sanat & Koleksiyon',
    'Oyuncak & Hobi',
    'Sağlık & Güzellik',
    'Eğitim & Kurs',
    'Hizmet',
    'Diğer'
  ];

  // Dinamik kategorileri oluştur - Sadece sonuçlu olanları göster
  const getDynamicCategories = () => {
    const dynamicCounts = getDynamicCategoryCounts();
    
    // Eğer arama sonucu varsa, sadece sonuçlu kategorileri göster
    if (searchResults.length > 0) {
      return ALL_CATEGORIES.filter(category => dynamicCounts[category] > 0);
    }
    
    // Arama sonucu yoksa tüm kategorileri göster
    return ALL_CATEGORIES;
  };

  const dynamicCategoryCounts = getDynamicCategoryCounts();
  
  // Debug: Kategori sayılarını logla
  console.log('🔍 FilterBottomSheet - Search Results:', searchResults.length);
  console.log('🔍 FilterBottomSheet - Raw Categories:', searchResults.map(item => item.category));
  console.log('🔍 FilterBottomSheet - Category Counts:', dynamicCategoryCounts);
  console.log('🔍 FilterBottomSheet - Dynamic Categories:', getDynamicCategories());

  // Filter sections data
  const filterSections: FilterSection[] = [
    {
      id: 'category',
      title: 'Kategoriler',
      icon: <Tag size={20} color={colors.text} />,
      options: getDynamicCategories().map(category => {
        console.log('🔍 Creating option for category:', category, typeof category);
        return {
          id: category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          label: String(category || ''),
          value: String(category || ''),
          count: dynamicCategoryCounts[category] || 0
        };
      }),
      multiSelect: true, // Çoklu seçim
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

  // Kategori seçildiğinde doğru alt kategoriyi bul
    const findCategoryValue = (mainCategory: string): string => {
    const categoryMap: { [key: string]: string } = {
      'Elektronik': 'elektronik',
      'Ev Aletleri & Mobilya': 'ev aletleri & mobilya',
      'Araç & Vasıta': 'araç & vasıta',
      'Moda': 'moda > giyim',
      'Spor & Hobi': 'spor & hobi',
      'Kitap & Müzik': 'kitap & müzik',
      'İş Makinesi': 'is-makineleri',
      'Bahçe & Tarım': 'bahçe & tarım',
      'Sanat & Koleksiyon': 'sanat & koleksiyon',
      'Oyuncak & Hobi': 'oyuncak & hobi',
      'Sağlık & Güzellik': 'sağlık & güzellik',
      'Eğitim & Kurs': 'eğitim & kurs',
      'Hizmet': 'hizmet',
      'Diğer': 'diger'
    };

    return categoryMap[mainCategory] || mainCategory.toLowerCase();
  };

  const toggleFilter = (sectionId: string, optionId: string, value: string) => {
    setSelectedFilters((prev: any) => {
      // Kategori için çoklu seçim
      if (sectionId === 'category') {
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
      } else {
        // Diğer filtreler için çoklu seçim
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
              const hasResults = (option.count || 0) > 0;
              const isDisabled = section.id === 'category' && !hasResults;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionItem,
                    isSelected && { backgroundColor: colors.primary + '20' },
                    isDisabled && { opacity: 0.5 }
                  ]}
                  onPress={() => !isDisabled && toggleFilter(section.id, option.id, option.value)}
                  disabled={isDisabled}
                >
                  <View style={styles.optionContent}>
                    <Text style={[
                      styles.optionLabel,
                      { 
                        color: isSelected 
                          ? colors.primary 
                          : isDisabled 
                            ? colors.textSecondary 
                            : colors.text 
                      }
                    ]}>
                      {typeof option.label === 'string' ? option.label : String(option.label || '')}
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
            {selectedFilters.category && selectedFilters.category.length > 0 && (
              <View style={[styles.activeFilterBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.activeFilterText, { color: colors.white }]}>
                  {selectedFilters.category.length} kategori
                </Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            {/* Kategori temizleme butonu */}
            {selectedFilters.category && selectedFilters.category.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  console.log("🔍 FilterBottomSheet - Clear category button pressed");
                  const newFilters = { ...selectedFilters };
                  delete newFilters.category;
                  setSelectedFilters(newFilters);
                  // Kategorileri temizledikten sonra orijinal aramayı geri yükle
                  onApply(newFilters);
                }} 
                style={[styles.clearCategoryButton, { borderColor: colors.border, backgroundColor: colors.background }]}
              >
                <X size={16} color={colors.primary} />
                <Text style={[styles.clearCategoryText, { color: colors.primary }]}>
                  Kategorileri Temizle
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={hideBottomSheet} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearCategoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  clearCategoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeFilterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '600',
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