import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS, SHADOWS } from '../../constants/theme';
import {
  FULL_63_PROVINCES,
  MASTER_NATIONWIDE_PLACES,
  NationalCategoryType,
  NationalPlace,
  VietnamProvince,
} from '../../services/fullVietnamData';
import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';
import { ScreenKey } from '../../types';

interface MapScreenProps {
  onNavigate: (screen: ScreenKey) => void;
}

export type CategoryFilter =
  | 'all'
  | 'food'
  | 'cafe'
  | 'tourism'
  | 'stay'
  | 'entertainment'
  | 'wishes';

interface UserWishPin {
  id: string;
  userName: string;
  userAvatar: string;
  trustScore: number;
  destination: string;
  dateText: string;
  note: string;
  latitude: number;
  longitude: number;
  pinTop: string;
  pinLeft: string;
}

interface FilterOptions {
  maxDistanceKm: number | null; // null = any
  minRating: number; // 0 = any, 4.0, 4.5, 4.8
  onlyOpenNow: boolean;
  priceLevel: 'all' | 'budget' | 'medium' | 'premium';
  facilities: string[];
}

interface PlanItem {
  place: NationalPlace;
  time: string;
  note: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Haversine formula for real-time GPS distance calculation (km)
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const MapScreen: React.FC<MapScreenProps> = ({ onNavigate }) => {
  // Navigation & User State
  const currentUser = useAuthStore((s) => s.user);
  const feedPosts = useFeedStore((s) => s.posts);

  // Map Navigation & Layer State
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite' | 'night'>('standard');
  const [zoomScale, setZoomScale] = useState(1);
  const [selectedProvince, setSelectedProvince] = useState<string>('Đà Nẵng');
  const [isProvinceModalVisible, setIsProvinceModalVisible] = useState(false);
  const [provinceSearchQuery, setProvinceSearchQuery] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    maxDistanceKm: null,
    minRating: 0,
    onlyOpenNow: false,
    priceLevel: 'all',
    facilities: [],
  });

  // GPS & Location State
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 16.0544,
    longitude: 108.2022,
  });
  const [gpsStatusText, setGpsStatusText] = useState<string | null>(null);

  // Loading States
  const [isLoadingMap, setIsLoadingMap] = useState(false);

  // Selected Place & Wish State
  const [selectedPlace, setSelectedPlace] = useState<NationalPlace | null>(MASTER_NATIONWIDE_PLACES[0]);
  const [selectedWish, setSelectedWish] = useState<UserWishPin | null>(null);

  // Bottom Sheet Expansion State ('collapsed' = summary card, 'expanded' = nearby places & plan)
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'nearby' | 'overview' | 'reviews' | 'photos'>('nearby');

  // Bookmarks / Saved Places
  const [savedPlaces, setSavedPlaces] = useState<Record<string, boolean>>({});

  // Trip Planning / Outing Planner State
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);
  const [tripPlan, setTripPlan] = useState<PlanItem[]>([
    {
      place: MASTER_NATIONWIDE_PLACES[0],
      time: '08:30',
      note: 'Điểm hẹn ăn sáng & xuất phát cùng cạ',
    },
  ]);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for user GPS dot
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Toast feedback helper
  const showToast = (message: string) => {
    setGpsStatusText(message);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setGpsStatusText(null));
  };

  // Request GPS Permission on Mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoadingMap(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (isMounted && loc?.coords) {
            setUserLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        }
      } catch {
        // Fallback to initial coordinates
      } finally {
        if (isMounted) {
          setIsLoadingMap(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Center on Current GPS Location
  const handleLocateUser = async () => {
    try {
      setIsLoadingMap(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (loc?.coords) {
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          showToast(`📍 Đã định vị vị trí của bạn (${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)})`);
        }
      } else {
        showToast('📍 Đang dùng vị trí trung tâm ' + selectedProvince);
      }
    } catch {
      showToast('📍 Đã định vị lại vị trí trung tâm');
    } finally {
      setIsLoadingMap(false);
    }
  };

  // Synchronized Wishes from feedStore and pre-curated community wishes
  const liveWishes: UserWishPin[] = useMemo(() => [
    {
      id: 'w1',
      userName: 'Tùng (Tôi)',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      trustScore: currentUser?.trustScore || 94,
      destination: 'Phượt Đèo Hải Vân & Ngắm Hoàng Hôn',
      dateText: 'Chiều nay 16h30',
      note: 'Tuyển 2 bạn lái xe máy cùng đổ đèo Hải Vân săn mây và cafe đỉnh đèo!',
      latitude: 16.1265,
      longitude: 108.132,
      pinTop: '18%',
      pinLeft: '22%',
    },
    {
      id: 'w2',
      userName: 'Minh Thư',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      trustScore: 94,
      destination: 'Food Tour Hải Sản & Ăn Vặt Chợ Cồn',
      dateText: 'Tối Thứ 7, 18:30',
      note: 'Tìm 2 cạ cùng càn quét ốc hút, chè sầu và bánh xèo tôm nhảy!',
      latitude: 16.068,
      longitude: 108.212,
      pinTop: '46%',
      pinLeft: '34%',
    },
    {
      id: 'w3',
      userName: 'Quang Anh',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      trustScore: 88,
      destination: 'Chèo SUP & Đón Bình Minh Biển Mỹ Khê',
      dateText: 'Sáng Chủ Nhật, 05:15',
      note: 'Đã có sẵn 2 SUP, cần rủ thêm 1 cạ dậy sớm ngắm bình minh!',
      latitude: 16.062,
      longitude: 108.249,
      pinTop: '58%',
      pinLeft: '76%',
    },
    // Dynamically synchronized from live feed posts
    ...feedPosts
      .filter((p) => p.isWish || p.isRecruitment)
      .map((p, idx) => ({
        id: `post_wish_${p.id}`,
        userName: p.author.name,
        userAvatar: p.author.avatar,
        trustScore: 92,
        destination: p.taggedVenue?.name || p.wishDestination || p.author.location || 'Điểm hẹn vi vu',
        dateText: p.wishDate || p.activitySnippet?.time || 'Hôm nay',
        note: p.content,
        latitude: p.taggedVenue?.latitude || 16.06 + idx * 0.01,
        longitude: p.taggedVenue?.longitude || 108.22 + idx * 0.01,
        pinTop: `${42 + ((idx * 11) % 34)}%`,
        pinLeft: `${32 + ((idx * 15) % 46)}%`,
      })),
  ], [currentUser, feedPosts]);

  // Filter places based on search, category, province, and advanced filter criteria
  const displayedPlaces = useMemo(() => {
    return MASTER_NATIONWIDE_PLACES
      .filter((item) => {
        // 1. Province filter
        if (selectedProvince && !item.province.toLowerCase().includes(selectedProvince.toLowerCase())) {
          return false;
        }

        // 2. Category filter
        if (activeCategory !== 'all' && activeCategory !== 'wishes') {
          if (item.categoryType !== activeCategory) {
            // Flexible match for cafe if categorized as food with cafe keywords
            if (activeCategory === 'cafe') {
              const isCafeText = item.name.toLowerCase().includes('cafe') ||
                item.name.toLowerCase().includes('cà phê') ||
                item.category.toLowerCase().includes('cafe') ||
                item.category.toLowerCase().includes('cà phê');
              if (!isCafeText) return false;
            } else {
              return false;
            }
          }
        }

        // 3. Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            item.name.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.district.toLowerCase().includes(q) ||
            item.address.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // 4. Advanced Filter: Min Rating
        if (filters.minRating > 0 && item.rating < filters.minRating) {
          return false;
        }

        // 5. Advanced Filter: Distance
        if (filters.maxDistanceKm !== null) {
          const dist = calculateHaversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            item.latitude,
            item.longitude
          );
          if (dist > filters.maxDistanceKm) return false;
        }

        return true;
      })
      .map((item, index) => {
        const dist = calculateHaversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.latitude,
          item.longitude
        );
        return {
          ...item,
          distanceKm: dist,
          distanceText: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
          walkingTimeText: dist < 1 ? `${Math.max(2, Math.round(dist * 15))} phút đi bộ` : `${Math.round(dist * 3)} phút xe máy`,
          pinTop: item.pinTop || `${24 + ((index * 13) % 54)}%`,
          pinLeft: item.pinLeft || `${18 + ((index * 17) % 66)}%`,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [selectedProvince, activeCategory, searchQuery, filters, userLocation]);

  // Nearby places around the currently selected place (sorted by distance from selected place)
  const nearbyPlaces = useMemo(() => {
    if (!selectedPlace) return [];
    return MASTER_NATIONWIDE_PLACES
      .filter((p) => p.id !== selectedPlace.id)
      .map((p) => {
        const distFromCurrent = calculateHaversineDistance(
          selectedPlace.latitude,
          selectedPlace.longitude,
          p.latitude,
          p.longitude
        );
        return {
          ...p,
          distFromCurrent,
          distFromCurrentText:
            distFromCurrent < 1
              ? `${Math.round(distFromCurrent * 1000)} m`
              : `${distFromCurrent.toFixed(1)} km`,
        };
      })
      .sort((a, b) => a.distFromCurrent - b.distFromCurrent)
      .slice(0, 8);
  }, [selectedPlace]);

  // Distance of selected place from user location
  const selectedPlaceDistance = useMemo(() => {
    if (!selectedPlace) {
      return { distanceText: '1.0 km', walkingTimeText: '10 phút' };
    }
    const dist = calculateHaversineDistance(
      userLocation.latitude,
      userLocation.longitude,
      selectedPlace.latitude,
      selectedPlace.longitude
    );
    return {
      distanceKm: dist,
      distanceText: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
      walkingTimeText:
        dist < 1
          ? `${Math.max(2, Math.round(dist * 15))} phút đi bộ`
          : `${Math.round(dist * 3)} phút xe máy`,
    };
  }, [selectedPlace, userLocation]);

  // Category Configuration Helper
  const getCategoryConfig = (type: string) => {
    switch (type) {
      case 'food':
        return {
          label: 'Ăn uống',
          icon: 'restaurant',
          color: '#EA580C', // Vibrant Coral Orange
          lightBg: '#FFF7ED',
        };
      case 'cafe':
        return {
          label: 'Cà phê',
          icon: 'cafe',
          color: '#D97706', // Rich Amber Roast
          lightBg: '#FEF3C7',
        };
      case 'tourism':
        return {
          label: 'Tham quan',
          icon: 'trail-sign',
          color: '#059669', // Emerald Green
          lightBg: '#ECFDF5',
        };
      case 'stay':
        return {
          label: 'Lưu trú',
          icon: 'bed',
          color: '#2563EB', // Royal Blue
          lightBg: '#EFF6FF',
        };
      case 'entertainment':
        return {
          label: 'Vui chơi',
          icon: 'sparkles',
          color: '#DB2777', // Magenta Pink
          lightBg: '#FDF2F8',
        };
      default:
        return {
          label: 'Khám phá',
          icon: 'location',
          color: COLORS.primary,
          lightBg: '#F5F3FF',
        };
    }
  };

  // Actions
  const handleOpenGoogleMapsDirections = (place: NationalPlace) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Chỉ đường', `Mở tọa độ Google Maps: ${place.latitude}, ${place.longitude}`);
      }
    });
  };

  const handleCallPlace = (phone: string) => {
    if (!phone) {
      Alert.alert('Thông báo', 'Địa điểm này chưa cập nhật số điện thoại.');
      return;
    }
    const cleanPhone = phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Hotline', `Số điện thoại: ${phone}`);
    });
  };

  const handleSharePlace = async (place: NationalPlace) => {
    try {
      await Share.share({
        message: `Khám phá ngay "${place.name}" trên Vivu!\n📍 Địa chỉ: ${place.address}\n⭐ Đánh giá: ${place.rating}/5.0\n📞 Hotline: ${place.phone}`,
        title: place.name,
      });
    } catch {
      // Ignored
    }
  };

  const toggleSavePlace = (placeId: string) => {
    setSavedPlaces((prev) => {
      const isSaved = !prev[placeId];
      showToast(isSaved ? 'Đã lưu vào danh sách yêu thích 🔖' : 'Đã bỏ lưu địa điểm');
      return { ...prev, [placeId]: isSaved };
    });
  };

  const handleRecruitCompanions = (place: NationalPlace) => {
    Alert.alert(
      'Tuyển Cạ Đến Đây 🛵',
      `Tạo bài viết tuyển cạ đồng hành đến "${place.name}" ngay bây giờ?`,
      [
        { text: 'Để sau', style: 'cancel' },
        {
          text: 'Tạo bài đăng',
          onPress: () => onNavigate('create_post'),
        },
      ]
    );
  };

  // Add place to today's trip plan
  const handleAddToTripPlan = (place: NationalPlace) => {
    const isAlreadyInPlan = tripPlan.some((p) => p.place.id === place.id);
    if (isAlreadyInPlan) {
      setIsPlanModalVisible(true);
      return;
    }
    const nextHour = 9 + tripPlan.length * 2;
    const timeText = `${nextHour < 10 ? '0' + nextHour : nextHour}:00`;
    setTripPlan((prev) => [
      ...prev,
      {
        place,
        time: timeText,
        note: `Khám phá & chụp ảnh tại ${place.name}`,
      },
    ]);
    showToast(`Đã thêm "${place.name}" vào Lịch trình đi chơi ✨`);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      maxDistanceKm: null,
      minRating: 0,
      onlyOpenNow: false,
      priceLevel: 'all',
      facilities: [],
    });
    setSearchQuery('');
    setActiveCategory('all');
    setIsFilterModalOpen(false);
  };

  // Active filter count badge
  const activeFiltersCount =
    (filters.maxDistanceKm !== null ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.onlyOpenNow ? 1 : 0) +
    (filters.priceLevel !== 'all' ? 1 : 0);

  // Filtered 63 Provinces for Selector Modal
  const filteredProvinces = FULL_63_PROVINCES.filter((p) =>
    p.name.toLowerCase().includes(provinceSearchQuery.toLowerCase().trim())
  );

  return (
    <View style={styles.container}>
      {/* 1. MAP CANVAS VIEWPORT */}
      <View style={styles.mapArea}>
        {/* Map Background Layer */}
        <Image
          source={{
            uri:
              mapLayer === 'satellite'
                ? 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600'
                : mapLayer === 'night'
                ? 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600'
                : 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1600',
          }}
          style={[styles.mapImage, { transform: [{ scale: zoomScale }] }]}
          resizeMode="cover"
        />

        {/* Map Vector Grid & Landmarks Simulation Overlay */}
        <View style={styles.mapVectorGridOverlay} pointerEvents="none">
          <View style={styles.mapRiverLine} />
          <View style={styles.mapAvenueHorizontal} />
          <View style={styles.mapAvenueVertical} />
          <View style={styles.mapDistrictLabelWrap}>
            <Text style={styles.mapDistrictLabel}>QUẬN HẢI CHÂU</Text>
          </View>
          <View style={[styles.mapDistrictLabelWrap, { top: '22%', left: '60%' }]}>
            <Text style={styles.mapDistrictLabel}>BÁN ĐẢO SƠN TRÀ</Text>
          </View>
        </View>

        {/* GPS Location Beacon (Current User) */}
        <View style={styles.userGpsPin}>
          <Animated.View
            style={[
              styles.userGpsHalo,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.4],
                  outputRange: [0.6, 0.1],
                }),
              },
            ]}
          />
          <View style={styles.userGpsDot}>
            <View style={styles.userGpsInnerDot} />
          </View>
          <View style={styles.userGpsBadge}>
            <Text style={styles.userGpsBadgeText}>Bạn ở đây</Text>
          </View>
        </View>

        {/* CATEGORY PINS ON MAP */}
        {activeCategory !== 'wishes' &&
          displayedPlaces.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            const config = getCategoryConfig(place.categoryType);

            return (
              <TouchableOpacity
                key={place.id}
                style={[
                  styles.pinWrapper,
                  { top: place.pinTop as any, left: place.pinLeft as any },
                  isSelected && styles.pinWrapperSelected,
                ]}
                onPress={() => {
                  setSelectedPlace(place);
                  setSelectedWish(null);
                  setIsSheetExpanded(false);
                }}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.pinBadge,
                    { backgroundColor: config.color },
                    isSelected && styles.pinBadgeActive,
                  ]}
                >
                  <Ionicons name={config.icon as any} size={13} color="#FFFFFF" />
                  <Text style={styles.pinText} numberOfLines={1}>
                    {place.name.length > 13 ? place.name.substring(0, 13) + '…' : place.name}
                  </Text>
                  <View style={styles.pinRatingPill}>
                    <Ionicons name="star" size={9} color="#FEF08A" />
                    <Text style={styles.pinRatingText}>{place.rating.toFixed(1)}</Text>
                  </View>
                </View>
                <View style={[styles.pinAnchorTriangle, { borderTopColor: config.color }]} />
              </TouchableOpacity>
            );
          })}

        {/* LIVE COMMUNITY WISHES PINS */}
        {(activeCategory === 'all' || activeCategory === 'wishes') &&
          liveWishes.map((wish) => {
            const isSelected = selectedWish?.id === wish.id;
            return (
              <TouchableOpacity
                key={wish.id}
                style={[
                  styles.wishPinWrapper,
                  { top: wish.pinTop as any, left: wish.pinLeft as any },
                  isSelected && styles.wishPinWrapperActive,
                ]}
                onPress={() => {
                  setSelectedWish(wish);
                  setSelectedPlace(null);
                  setIsSheetExpanded(false);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.wishSpeechBubble, isSelected && styles.wishBubbleActive]}>
                  <Text style={styles.wishBubbleUser}>@{wish.userName}</Text>
                  <Text style={styles.wishBubbleText} numberOfLines={1}>
                    {wish.destination}
                  </Text>
                </View>
                <View style={styles.wishAvatarBeacon}>
                  <View style={styles.wishRadarRing} />
                  <Image source={{ uri: wish.userAvatar }} style={styles.wishAvatar} />
                  <View style={styles.wishOnlineDot} />
                </View>
              </TouchableOpacity>
            );
          })}
      </View>

      {/* 2. FLOATING TOP HEADER: SEARCH BAR + FILTER BUTTON + CATEGORIES */}
      <View style={styles.floatingHeaderArea}>
        {/* Search Bar Row with Filter Button */}
        <View style={styles.searchRow}>
          {/* Main Search Input */}
          <View style={styles.searchBar}>
            <TouchableOpacity
              style={styles.searchIconBtn}
              onPress={() => setIsProvinceModalVisible(true)}
            >
              <Ionicons name="search" size={20} color="#FF385C" />
            </TouchableOpacity>

            <TextInput
              style={styles.searchInput}
              placeholder="Bạn muốn đi đâu? (Cà phê, quán ăn...)"
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}

            {/* Quick Province Selector Chip */}
            <TouchableOpacity
              style={styles.provinceBadgeBtn}
              onPress={() => setIsProvinceModalVisible(true)}
            >
              <Ionicons name="location-sharp" size={13} color="#FF385C" />
              <Text style={styles.provinceBadgeText} numberOfLines={1}>
                {selectedProvince}
              </Text>
              <Ionicons name="chevron-down" size={12} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeFiltersCount > 0 && styles.filterBtnActive,
            ]}
            onPress={() => setIsFilterModalOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={activeFiltersCount > 0 ? '#FFFFFF' : '#374151'}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Horizontal Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {/* 1. Tất cả */}
          <TouchableOpacity
            style={[
              styles.categoryChip,
              activeCategory === 'all' && styles.categoryChipActive,
            ]}
            onPress={() => setActiveCategory('all')}
          >
            <Ionicons
              name="globe-outline"
              size={15}
              color={activeCategory === 'all' ? '#FFF' : '#374151'}
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === 'all' && styles.categoryChipTextActive,
              ]}
            >
              Tất cả ({displayedPlaces.length})
            </Text>
          </TouchableOpacity>

          {/* 2. Ăn uống */}
          <TouchableOpacity
            style={[
              styles.categoryChip,
              activeCategory === 'food' && { backgroundColor: '#EA580C', borderColor: '#EA580C' },
            ]}
            onPress={() => setActiveCategory('food')}
          >
            <Ionicons
              name="restaurant-outline"
              size={15}
              color={activeCategory === 'food' ? '#FFF' : '#EA580C'}
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === 'food' && styles.categoryChipTextActive,
              ]}
            >
              Ăn uống
            </Text>
          </TouchableOpacity>

          {/* 3. Cà phê */}
          <TouchableOpacity
            style={[
              styles.categoryChip,
              activeCategory === 'cafe' && { backgroundColor: '#D97706', borderColor: '#D97706' },
            ]}
            onPress={() => setActiveCategory('cafe')}
          >
            <Ionicons
              name="cafe-outline"
              size={15}
              color={activeCategory === 'cafe' ? '#FFF' : '#D97706'}
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === 'cafe' && styles.categoryChipTextActive,
              ]}
            >
              Cà phê
            </Text>
          </TouchableOpacity>

          {/* 4. Tham quan */}
          <TouchableOpacity
            style={[
              styles.categoryChip,
              activeCategory === 'tourism' && { backgroundColor: '#059669', borderColor: '#059669' },
            ]}
            onPress={() => setActiveCategory('tourism')}
          >
            <Ionicons
              name="trail-sign-outline"
              size={15}
              color={activeCategory === 'tourism' ? '#FFF' : '#059669'}
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === 'tourism' && styles.categoryChipTextActive,
              ]}
            >
              Tham quan
            </Text>
          </TouchableOpacity>

          {/* 5. Lưu trú */}
          <TouchableOpacity
            style={[
              styles.categoryChip,
              activeCategory === 'stay' && { backgroundColor: '#2563EB', borderColor: '#2563EB' },
            ]}
            onPress={() => setActiveCategory('stay')}
          >
            <Ionicons
              name="bed-outline"
              size={15}
              color={activeCategory === 'stay' ? '#FFF' : '#2563EB'}
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === 'stay' && styles.categoryChipTextActive,
              ]}
            >
              Lưu trú
            </Text>
          </TouchableOpacity>

          {/* 6. Vui chơi */}
          <TouchableOpacity
            style={[
              styles.categoryChip,
              activeCategory === 'entertainment' && { backgroundColor: '#DB2777', borderColor: '#DB2777' },
            ]}
            onPress={() => setActiveCategory('entertainment')}
          >
            <Ionicons
              name="sparkles-outline"
              size={15}
              color={activeCategory === 'entertainment' ? '#FFF' : '#DB2777'}
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === 'entertainment' && styles.categoryChipTextActive,
              ]}
            >
              Vui chơi
            </Text>
          </TouchableOpacity>

          {/* 7. Nguyện vọng cạ */}
          <TouchableOpacity
            style={[
              styles.categoryChip,
              styles.categoryWishChip,
              activeCategory === 'wishes' && styles.categoryWishChipActive,
            ]}
            onPress={() => setActiveCategory('wishes')}
          >
            <Ionicons
              name="heart-circle"
              size={16}
              color={activeCategory === 'wishes' ? '#FFF' : '#EF4444'}
            />
            <Text
              style={[
                styles.categoryChipText,
                styles.categoryWishChipText,
                activeCategory === 'wishes' && styles.categoryChipTextActive,
              ]}
            >
              Cạ rủ đi ({liveWishes.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. FLOATING MAP CONTROLS (Right hand side - placed above bottom sheet to avoid obscuring) */}
      <View
        style={[
          styles.floatingControlsRight,
          selectedPlace && !isSheetExpanded && { bottom: 250 },
          selectedPlace && isSheetExpanded && { display: 'none' },
        ]}
      >
        {/* Locate My Location Button (GPS) */}
        <TouchableOpacity
          style={[styles.floatingSquareBtn, styles.gpsLocateBtn]}
          onPress={handleLocateUser}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={22} color="#2563EB" />
        </TouchableOpacity>

        {/* Map Layer Switcher (Standard / Satellite / Night) */}
        <TouchableOpacity
          style={styles.floatingSquareBtn}
          onPress={() => {
            const next =
              mapLayer === 'standard' ? 'satellite' : mapLayer === 'satellite' ? 'night' : 'standard';
            setMapLayer(next);
            showToast(
              next === 'satellite'
                ? 'Đã chuyển sang Ảnh Vệ Tinh'
                : next === 'night'
                ? 'Đã chuyển sang Bản Đồ Đêm'
                : 'Đã chuyển sang Bản Đồ Đường Phố'
            );
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={mapLayer === 'standard' ? 'map' : mapLayer === 'satellite' ? 'earth' : 'moon'}
            size={20}
            color="#374151"
          />
        </TouchableOpacity>

        {/* Trip Planner FAB */}
        <TouchableOpacity
          style={[styles.floatingSquareBtn, styles.planFabBtn]}
          onPress={() => setIsPlanModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar" size={20} color="#FF385C" />
          {tripPlan.length > 0 && (
            <View style={styles.planBadgeDot}>
              <Text style={styles.planBadgeText}>{tripPlan.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Zoom Controls Stack */}
        <View style={styles.zoomStack}>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => setZoomScale((s) => Math.min(s + 0.15, 1.6))}
          >
            <Ionicons name="add" size={20} color="#374151" />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => setZoomScale((s) => Math.max(s - 0.15, 0.85))}
          >
            <Ionicons name="remove" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. TOAST NOTIFICATION / GPS FEEDBACK */}
      {gpsStatusText && (
        <Animated.View style={[styles.floatingToast, { opacity: toastAnim }]}>
          <Ionicons name="information-circle" size={16} color="#FFFFFF" />
          <Text style={styles.floatingToastText}>{gpsStatusText}</Text>
        </Animated.View>
      )}

      {/* 5. EMPTY SEARCH STATE OVERLAY */}
      {displayedPlaces.length === 0 && activeCategory !== 'wishes' && (
        <View style={styles.emptyStateCard}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="compass-outline" size={36} color="#FF385C" />
          </View>
          <Text style={styles.emptyTitle}>Không tìm thấy địa điểm</Text>
          <Text style={styles.emptySubtitle}>
            Không có kết quả nào phù hợp với &quot;{searchQuery || 'bộ lọc hiện tại'}&quot; tại {selectedProvince}.
          </Text>
          <View style={styles.emptyActionRow}>
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={handleResetFilters}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.emptyResetBtnText}>Đặt lại bộ lọc</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.emptyCityBtn}
              onPress={() => setIsProvinceModalVisible(true)}
            >
              <Text style={styles.emptyCityBtnText}>Đổi tỉnh thành</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 6. LOADING STATE OVERLAY */}
      {isLoadingMap && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#FF385C" />
            <Text style={styles.loadingText}>Đang cập nhật bản đồ & vị trí...</Text>
          </View>
        </View>
      )}

      {/* 7. EXPANDABLE BOTTOM SHEET: SELECTED PLACE */}
      {selectedPlace && !selectedWish && (
        <View
          style={[
            styles.bottomSheetContainer,
            isSheetExpanded && styles.bottomSheetContainerExpanded,
          ]}
        >
          {/* Drag Handle & Expand Toggle Button */}
          <TouchableOpacity
            style={styles.sheetHandleWrap}
            onPress={() => setIsSheetExpanded(!isSheetExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.sheetHandleBar} />
            <View style={styles.sheetExpandHintRow}>
              <Ionicons
                name={isSheetExpanded ? 'chevron-down' : 'chevron-up'}
                size={14}
                color="#6B7280"
              />
              <Text style={styles.sheetExpandHintText}>
                {isSheetExpanded
                  ? 'Thu gọn thẻ thông tin'
                  : `Kéo lên xem thêm ${nearbyPlaces.length} địa điểm gần đây`}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Close Sheet Button */}
          <TouchableOpacity
            style={styles.sheetCloseBtn}
            onPress={() => {
              setSelectedPlace(null);
              setIsSheetExpanded(false);
            }}
          >
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Place Summary Header */}
          <View style={styles.placeSummaryHeader}>
            <Image source={{ uri: selectedPlace.image }} style={styles.placeThumbImage} />

            <View style={styles.placeHeaderInfo}>
              <View style={styles.categoryBadgeRow}>
                <View
                  style={[
                    styles.categoryMiniBadge,
                    { backgroundColor: getCategoryConfig(selectedPlace.categoryType).lightBg },
                  ]}
                >
                  <Ionicons
                    name={getCategoryConfig(selectedPlace.categoryType).icon as any}
                    size={11}
                    color={getCategoryConfig(selectedPlace.categoryType).color}
                  />
                  <Text
                    style={[
                      styles.categoryMiniBadgeText,
                      { color: getCategoryConfig(selectedPlace.categoryType).color },
                    ]}
                  >
                    {selectedPlace.category}
                  </Text>
                </View>
                <View style={styles.verifiedMiniBadge}>
                  <Ionicons name="shield-checkmark" size={11} color="#059669" />
                  <Text style={styles.verifiedMiniBadgeText}>Xác thực</Text>
                </View>
              </View>

              <Text style={styles.placeNameText} numberOfLines={1}>
                {selectedPlace.name}
              </Text>

              {/* Rating & Distance */}
              <View style={styles.placeRatingDistRow}>
                <View style={styles.starRatingBadge}>
                  <Ionicons name="star" size={12} color="#D97706" />
                  <Text style={styles.ratingNumberText}>{selectedPlace.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.reviewsCountSmallText}>({selectedPlace.reviewsCount})</Text>
                <Text style={styles.distDotDivider}>•</Text>
                <Text style={styles.distHighlightText}>{selectedPlaceDistance.distanceText}</Text>
                <Text style={styles.walkingEstimateText}>({selectedPlaceDistance.walkingTimeText})</Text>
              </View>

              {/* Status & Hours */}
              <View style={styles.openStatusRow}>
                <View style={styles.greenLiveDot} />
                <Text style={styles.openStatusGreenText}>Đang mở cửa</Text>
                <Text style={styles.openHoursText}>• {selectedPlace.openingHours}</Text>
              </View>
            </View>
          </View>

          {/* ACTION BUTTONS ROW (Chỉ đường, Xem chi tiết, Lên kế hoạch, Rủ cạ, Lưu) */}
          <View style={styles.actionGridRow}>
            {/* 1. Chỉ đường (Hero primary button) */}
            <TouchableOpacity
              style={styles.heroActionBtn}
              onPress={() => handleOpenGoogleMapsDirections(selectedPlace)}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate" size={18} color="#FFFFFF" />
              <Text style={styles.heroActionBtnText}>Chỉ đường</Text>
            </TouchableOpacity>

            {/* 2. Lên kế hoạch đi chơi (Key Vivu Feature) */}
            <TouchableOpacity
              style={styles.secondaryActionBtn}
              onPress={() => handleAddToTripPlan(selectedPlace)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={17} color="#FF385C" />
              <Text style={[styles.secondaryActionBtnText, { color: '#FF385C' }]}>
                Lên kế hoạch
              </Text>
            </TouchableOpacity>

            {/* 3. Rủ cạ đi cùng */}
            <TouchableOpacity
              style={styles.secondaryActionBtn}
              onPress={() => handleRecruitCompanions(selectedPlace)}
              activeOpacity={0.8}
            >
              <Ionicons name="people-outline" size={17} color="#5B47FB" />
              <Text style={[styles.secondaryActionBtnText, { color: '#5B47FB' }]}>
                Rủ cạ đi
              </Text>
            </TouchableOpacity>

            {/* 4. Bookmark / Lưu */}
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => toggleSavePlace(selectedPlace.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={savedPlaces[selectedPlace.id] ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={savedPlaces[selectedPlace.id] ? '#FF385C' : '#4B5563'}
              />
            </TouchableOpacity>

            {/* 5. Gọi điện / Hotline */}
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => handleCallPlace(selectedPlace.phone)}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={18} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* EXPANDABLE SECTION (Tabs: Địa điểm gần đây / Tổng quan / Đánh giá / Ảnh) */}
          {isSheetExpanded && (
            <View style={styles.expandedContentWrap}>
              {/* Tab Navigation */}
              <View style={styles.sheetTabBar}>
                <TouchableOpacity
                  style={[
                    styles.sheetTabItem,
                    activeDetailTab === 'nearby' && styles.sheetTabItemActive,
                  ]}
                  onPress={() => setActiveDetailTab('nearby')}
                >
                  <Text
                    style={[
                      styles.sheetTabText,
                      activeDetailTab === 'nearby' && styles.sheetTabTextActive,
                    ]}
                  >
                    📍 Gần đây ({nearbyPlaces.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sheetTabItem,
                    activeDetailTab === 'overview' && styles.sheetTabItemActive,
                  ]}
                  onPress={() => setActiveDetailTab('overview')}
                >
                  <Text
                    style={[
                      styles.sheetTabText,
                      activeDetailTab === 'overview' && styles.sheetTabTextActive,
                    ]}
                  >
                    Tổng quan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sheetTabItem,
                    activeDetailTab === 'reviews' && styles.sheetTabItemActive,
                  ]}
                  onPress={() => setActiveDetailTab('reviews')}
                >
                  <Text
                    style={[
                      styles.sheetTabText,
                      activeDetailTab === 'reviews' && styles.sheetTabTextActive,
                    ]}
                  >
                    Đánh giá ({selectedPlace.reviewsCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sheetTabItem,
                    activeDetailTab === 'photos' && styles.sheetTabItemActive,
                  ]}
                  onPress={() => setActiveDetailTab('photos')}
                >
                  <Text
                    style={[
                      styles.sheetTabText,
                      activeDetailTab === 'photos' && styles.sheetTabTextActive,
                    ]}
                  >
                    Ảnh ({selectedPlace.gallery.length + 1})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TAB 1: NEARBY PLACES LIST & OUTING ITINERARY BUILDER */}
              {activeDetailTab === 'nearby' && (
                <ScrollView
                  style={styles.sheetTabScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Vivu Smart Plan Helper Banner */}
                  <View style={styles.smartPlanBanner}>
                    <View style={styles.smartPlanIconBox}>
                      <Ionicons name="sparkles" size={18} color="#FF385C" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.smartPlanTitle}>Gợi ý lịch trình vi vu kết hợp</Text>
                      <Text style={styles.smartPlanSub}>
                        Bạn có thể ghé thêm các quán cà phê và điểm tham quan lân cận trong bán kính 1km.
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.smartPlanActionBtn}
                      onPress={() => setIsPlanModalVisible(true)}
                    >
                      <Text style={styles.smartPlanActionText}>Xem lịch trình</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.sectionHeadingText}>
                    Địa điểm lân cận &quot;{selectedPlace.name}&quot;
                  </Text>

                  {nearbyPlaces.map((np) => {
                    const npConfig = getCategoryConfig(np.categoryType);
                    return (
                      <TouchableOpacity
                        key={np.id}
                        style={styles.nearbyPlaceItemCard}
                        onPress={() => {
                          setSelectedPlace(np);
                          setIsSheetExpanded(false);
                          showToast(`Đã chọn: ${np.name}`);
                        }}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: np.image }} style={styles.nearbyThumb} />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <View style={styles.nearbyCatRow}>
                            <View
                              style={[
                                styles.nearbyCatBadge,
                                { backgroundColor: npConfig.lightBg },
                              ]}
                            >
                              <Text style={[styles.nearbyCatText, { color: npConfig.color }]}>
                                {np.category}
                              </Text>
                            </View>
                            <Text style={styles.nearbyDistText}>
                              📍 Cách {np.distFromCurrentText}
                            </Text>
                          </View>
                          <Text style={styles.nearbyNameText} numberOfLines={1}>
                            {np.name}
                          </Text>
                          <View style={styles.nearbyRatingRow}>
                            <Ionicons name="star" size={12} color="#D97706" />
                            <Text style={styles.nearbyRatingVal}>{np.rating.toFixed(1)}</Text>
                            <Text style={styles.nearbyPriceText}>• {np.priceRange}</Text>
                          </View>
                        </View>

                        {/* Quick Add To Plan Button */}
                        <TouchableOpacity
                          style={styles.quickAddPlanBtn}
                          onPress={() => handleAddToTripPlan(np)}
                        >
                          <Ionicons name="add-circle" size={24} color="#FF385C" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={{ height: 30 }} />
                </ScrollView>
              )}

              {/* TAB 2: OVERVIEW */}
              {activeDetailTab === 'overview' && (
                <ScrollView
                  style={styles.sheetTabScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.infoRowBlock}>
                    <Ionicons name="location-outline" size={18} color="#FF385C" />
                    <Text style={styles.infoRowText}>{selectedPlace.address}</Text>
                  </View>

                  <View style={styles.infoRowBlock}>
                    <Ionicons name="pricetag-outline" size={18} color="#059669" />
                    <Text style={styles.infoRowText}>Giá tham khảo: {selectedPlace.priceRange}</Text>
                  </View>

                  <View style={styles.infoRowBlock}>
                    <Ionicons name="call-outline" size={18} color="#2563EB" />
                    <Text style={styles.infoRowText}>Hotline: {selectedPlace.phone}</Text>
                  </View>

                  <Text style={styles.placeDescParagraph}>{selectedPlace.desc}</Text>

                  {/* Facilities */}
                  <Text style={styles.facilitiesTitle}>Tiện ích nổi bật</Text>
                  <View style={styles.facilitiesWrap}>
                    {selectedPlace.facilities.map((fac, idx) => (
                      <View key={idx} style={styles.facilityPill}>
                        <Ionicons name="checkmark-circle" size={14} color="#059669" />
                        <Text style={styles.facilityPillText}>{fac}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.verifiedSourceBanner}>
                    <Ionicons name="shield-checkmark" size={16} color="#0284C7" />
                    <Text style={styles.verifiedSourceText}>
                      Dữ liệu chính xác được xác thực bởi {selectedPlace.source} & Cộng đồng Vivu
                    </Text>
                  </View>

                  <View style={{ height: 30 }} />
                </ScrollView>
              )}

              {/* TAB 3: REVIEWS */}
              {activeDetailTab === 'reviews' && (
                <ScrollView
                  style={styles.sheetTabScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.reviewSummaryBox}>
                    <Text style={styles.reviewScoreBig}>{selectedPlace.rating.toFixed(1)}</Text>
                    <View>
                      <View style={{ flexDirection: 'row', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons key={s} name="star" size={16} color="#FBBF24" />
                        ))}
                      </View>
                      <Text style={styles.reviewTotalSubtitle}>
                        Dựa trên {selectedPlace.reviewsCount} lượt trải nghiệm thực tế
                      </Text>
                    </View>
                  </View>

                  {/* Sample Review Items */}
                  <View style={styles.sampleReviewCard}>
                    <View style={styles.reviewAuthorHeader}>
                      <Image
                        source={{
                          uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
                        }}
                        style={styles.reviewUserAvatar}
                      />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.reviewUserName}>Hà Linh (Cạ Sành Ăn)</Text>
                        <Text style={styles.reviewDate}>Hôm qua • Đã xác thực đến quán</Text>
                      </View>
                      <View style={styles.ratingBadgePill}>
                        <Ionicons name="star" size={11} color="#FFF" />
                        <Text style={styles.ratingBadgePillText}>5.0</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewBodyText}>
                      Quán cực kỳ chất lượng, góc view chụp ảnh rất nghệ! Đồ uống và đồ ăn ngon, nhân viên thân thiện. Lên kế hoạch rủ cạ qua Vivu đi cùng rất tiện!
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.writeReviewButton}
                    onPress={() => onNavigate('review')}
                  >
                    <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.writeReviewButtonText}>Viết đánh giá của bạn</Text>
                  </TouchableOpacity>

                  <View style={{ height: 30 }} />
                </ScrollView>
              )}

              {/* TAB 4: PHOTOS */}
              {activeDetailTab === 'photos' && (
                <ScrollView
                  style={styles.sheetTabScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.galleryGrid}>
                    <Image source={{ uri: selectedPlace.image }} style={styles.galleryGridPhoto} />
                    {selectedPlace.gallery.map((img, i) => (
                      <Image key={i} source={{ uri: img }} style={styles.galleryGridPhoto} />
                    ))}
                  </View>
                  <View style={{ height: 30 }} />
                </ScrollView>
              )}
            </View>
          )}
        </View>
      )}

      {/* 8. WISH PIN BOTTOM CARD (When a community wish is selected) */}
      {selectedWish && (
        <View style={styles.wishDetailCard}>
          <View style={styles.wishCardHeader}>
            <Image source={{ uri: selectedWish.userAvatar }} style={styles.wishUserAvatar} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.wishCardUserName}>{selectedWish.userName}</Text>
                <View style={styles.trustScorePill}>
                  <Ionicons name="shield-checkmark" size={10} color="#059669" />
                  <Text style={styles.trustScoreText}>{selectedWish.trustScore}đ uy tín</Text>
                </View>
              </View>
              <Text style={styles.wishCardTime}>📅 {selectedWish.dateText}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedWish(null)}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.wishDestinationBox}>
            <Ionicons name="navigate-circle" size={18} color="#EF4444" />
            <Text style={styles.wishDestinationText}>{selectedWish.destination}</Text>
          </View>

          <Text style={styles.wishNoteText}>&quot;{selectedWish.note}&quot;</Text>

          <View style={styles.wishActionRow}>
            <TouchableOpacity
              style={styles.wishChatBtn}
              onPress={() => onNavigate('personal_chat')}
            >
              <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
              <Text style={styles.wishChatBtnText}>Nhắn tin ghép cạ ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 9. ADVANCED FILTER MODAL */}
      <Modal
        visible={isFilterModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.filterModalCard}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Bộ Lọc Khám Phá Địa Điểm</Text>
              <TouchableOpacity onPress={() => setIsFilterModalOpen(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterModalScroll} showsVerticalScrollIndicator={false}>
              {/* Filter 1: Bán kính khoảng cách */}
              <Text style={styles.filterSectionTitle}>Khoảng cách từ vị trí của bạn</Text>
              <View style={styles.filterChipRow}>
                {[
                  { label: 'Tất cả', val: null },
                  { label: '< 1 km', val: 1 },
                  { label: '< 3 km', val: 3 },
                  { label: '< 5 km', val: 5 },
                  { label: '< 10 km', val: 10 },
                ].map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.filterSelectChip,
                      filters.maxDistanceKm === item.val && styles.filterSelectChipActive,
                    ]}
                    onPress={() => setFilters({ ...filters, maxDistanceKm: item.val })}
                  >
                    <Text
                      style={[
                        styles.filterSelectChipText,
                        filters.maxDistanceKm === item.val && styles.filterSelectChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Filter 2: Đánh giá tối thiểu */}
              <Text style={styles.filterSectionTitle}>Đánh giá chất lượng</Text>
              <View style={styles.filterChipRow}>
                {[
                  { label: 'Bất kỳ', val: 0 },
                  { label: '4.0+ ★', val: 4.0 },
                  { label: '4.5+ ★', val: 4.5 },
                  { label: '4.8+ ★ Siêu phẩm', val: 4.8 },
                ].map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.filterSelectChip,
                      filters.minRating === item.val && styles.filterSelectChipActive,
                    ]}
                    onPress={() => setFilters({ ...filters, minRating: item.val })}
                  >
                    <Text
                      style={[
                        styles.filterSelectChipText,
                        filters.minRating === item.val && styles.filterSelectChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Filter 3: Trạng thái đang mở cửa */}
              <View style={styles.filterSwitchRow}>
                <View>
                  <Text style={styles.filterSwitchLabel}>Chỉ hiện nơi đang mở cửa</Text>
                  <Text style={styles.filterSwitchSub}>Lọc bỏ các địa điểm đã đóng cửa lúc này</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    filters.onlyOpenNow && styles.toggleSwitchActive,
                  ]}
                  onPress={() =>
                    setFilters({ ...filters, onlyOpenNow: !filters.onlyOpenNow })
                  }
                >
                  <View
                    style={[
                      styles.toggleCircle,
                      filters.onlyOpenNow && styles.toggleCircleActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Modal Bottom Buttons */}
            <View style={styles.filterModalFooter}>
              <TouchableOpacity
                style={styles.filterResetButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.filterResetText}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterApplyButton}
                onPress={() => setIsFilterModalOpen(false)}
              >
                <Text style={styles.filterApplyText}>
                  Áp dụng ({displayedPlaces.length} địa điểm)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 10. PROVINCE SELECTOR MODAL (63 Provinces) */}
      <Modal
        visible={isProvinceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsProvinceModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.provinceModalSheet}>
            <View style={styles.provinceHeaderRow}>
              <Text style={styles.provinceModalTitle}>Chọn Tỉnh / Thành Phố</Text>
              <TouchableOpacity onPress={() => setIsProvinceModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <View style={styles.provinceSearchBar}>
              <Ionicons name="search" size={18} color="#6B7280" />
              <TextInput
                style={styles.provinceSearchInput}
                placeholder="Tìm tỉnh thành (Đà Nẵng, Hà Nội, TP.HCM, Đà Lạt...)"
                placeholderTextColor="#9CA3AF"
                value={provinceSearchQuery}
                onChangeText={setProvinceSearchQuery}
              />
            </View>

            <ScrollView style={styles.provinceListScroll} showsVerticalScrollIndicator={false}>
              {filteredProvinces.map((prov) => (
                <TouchableOpacity
                  key={prov.id}
                  style={[
                    styles.provinceItemRow,
                    selectedProvince === prov.name && styles.provinceItemRowActive,
                  ]}
                  onPress={() => {
                    setSelectedProvince(prov.name);
                    setUserLocation({ latitude: prov.latitude, longitude: prov.longitude });
                    setIsProvinceModalVisible(false);
                    showToast(`Đã chuyển sang khám phá ${prov.name}`);
                  }}
                >
                  <Image source={{ uri: prov.coverImage }} style={styles.provinceThumb} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.provinceNameText}>{prov.name}</Text>
                    <Text style={styles.provinceRegionText}>
                      {prov.region} • {prov.districts.length} quận/huyện
                    </Text>
                  </View>
                  {selectedProvince === prov.name && (
                    <Ionicons name="checkmark-circle" size={22} color="#FF385C" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 11. TRIP PLANNER MODAL (Lên Kế Hoạch Đi Chơi) */}
      <Modal
        visible={isPlanModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPlanModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.planModalSheet}>
            <View style={styles.planModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.planHeaderIconBox}>
                  <Ionicons name="map" size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.planModalTitle}>Lịch Trình Đi Chơi Cùng Cạ</Text>
                  <Text style={styles.planModalSub}>
                    {tripPlan.length} điểm hẹn tại {selectedProvince}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsPlanModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.planTimelineScroll} showsVerticalScrollIndicator={false}>
              {tripPlan.map((item, index) => (
                <View key={item.place.id} style={styles.planTimelineItem}>
                  {/* Timeline connector indicator */}
                  <View style={styles.timelineLeftColumn}>
                    <View style={styles.timelineDot}>
                      <Text style={styles.timelineDotNumber}>{index + 1}</Text>
                    </View>
                    {index < tripPlan.length - 1 && <View style={styles.timelineLine} />}
                  </View>

                  {/* Card Content */}
                  <View style={styles.planPlaceCard}>
                    <View style={styles.planCardTopRow}>
                      <Text style={styles.planTimeBadge}>⏰ {item.time}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          setTripPlan((prev) => prev.filter((p) => p.place.id !== item.place.id))
                        }
                      >
                        <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.planCardBodyRow}>
                      <Image source={{ uri: item.place.image }} style={styles.planPlaceThumb} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.planPlaceTitle} numberOfLines={1}>
                          {item.place.name}
                        </Text>
                        <Text style={styles.planPlaceAddress} numberOfLines={1}>
                          {item.place.address}
                        </Text>
                        <Text style={styles.planPlaceNote}>&quot;{item.note}&quot;</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {tripPlan.length === 0 && (
                <View style={styles.planEmptyState}>
                  <Ionicons name="calendar-outline" size={40} color="#D1D5DB" />
                  <Text style={styles.planEmptyText}>
                    Chưa có địa điểm nào trong lịch trình. Hãy chọn các ghim trên bản đồ và nhấn &quot;Lên kế hoạch&quot;!
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.planModalFooter}>
              <TouchableOpacity
                style={styles.planShareBtn}
                onPress={() => {
                  setIsPlanModalVisible(false);
                  onNavigate('create_post');
                }}
              >
                <Ionicons name="people" size={16} color="#FFFFFF" />
                <Text style={styles.planShareBtnText}>Tạo bài rủ cạ đi theo lịch trình này</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  // Map Canvas
  mapArea: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapVectorGridOverlay: {
    ...StyleSheet.absoluteFill,
  },
  mapRiverLine: {
    position: 'absolute',
    top: '32%',
    left: '48%',
    width: 28,
    height: '50%',
    backgroundColor: 'rgba(59, 130, 246, 0.22)',
    borderRadius: 14,
    transform: [{ rotate: '25deg' }],
  },
  mapAvenueHorizontal: {
    position: 'absolute',
    top: '48%',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  mapAvenueVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '38%',
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  mapDistrictLabelWrap: {
    position: 'absolute',
    top: '38%',
    left: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mapDistrictLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 1.2,
  },
  // GPS User Pin
  userGpsPin: {
    position: 'absolute',
    top: '50%',
    left: '47%',
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  userGpsHalo: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(37, 99, 235, 0.35)',
  },
  userGpsDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    ...SHADOWS.md,
  },
  userGpsInnerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  userGpsBadge: {
    position: 'absolute',
    bottom: -16,
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  userGpsBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Place Pin
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 12,
    ...SHADOWS.md,
  },
  pinWrapperSelected: {
    zIndex: 30,
    transform: [{ scale: 1.15 }],
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  pinBadgeActive: {
    borderColor: '#FEF08A',
    borderWidth: 2.5,
    ...SHADOWS.glow,
  },
  pinText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    maxWidth: 95,
  },
  pinRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    gap: 2,
  },
  pinRatingText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  pinAnchorTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  // Wish Pins
  wishPinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 14,
  },
  wishPinWrapperActive: {
    zIndex: 32,
    transform: [{ scale: 1.1 }],
  },
  wishSpeechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    marginBottom: 4,
    maxWidth: 125,
    ...SHADOWS.sm,
  },
  wishBubbleActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  wishBubbleUser: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EF4444',
  },
  wishBubbleText: {
    fontSize: 10,
    color: '#1F2937',
    fontWeight: '600',
  },
  wishAvatarBeacon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishRadarRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  wishAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  wishOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  // Top Header Area
  floatingHeaderArea: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 28,
    left: 12,
    right: 12,
    zIndex: 40,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 10,
    height: 48,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  searchIconBtn: {
    padding: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    paddingHorizontal: 6,
  },
  clearSearchBtn: {
    padding: 6,
  },
  provinceBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 3,
    maxWidth: 95,
  },
  provinceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: '#FF385C',
    borderColor: '#FF385C',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#10B981',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  categoryScroll: {
    paddingVertical: 8,
    gap: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 5,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  categoryChipActive: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  categoryWishChip: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  categoryWishChipActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  categoryWishChipText: {
    color: '#EF4444',
  },
  // Floating Controls Right
  floatingControlsRight: {
    position: 'absolute',
    right: 14,
    bottom: 40,
    zIndex: 35,
    gap: 10,
    alignItems: 'center',
  },
  floatingSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  gpsLocateBtn: {
    backgroundColor: '#FFFFFF',
  },
  planFabBtn: {
    position: 'relative',
  },
  planBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF385C',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  zoomStack: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  zoomBtn: {
    width: 44,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 6,
  },
  // Floating Toast
  floatingToast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 50,
    ...SHADOWS.md,
  },
  floatingToastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Empty State Card
  emptyStateCard: {
    position: 'absolute',
    top: '36%',
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    ...SHADOWS.md,
    zIndex: 25,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  emptyResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF385C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCityBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  emptyCityBtnText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 150,
    alignSelf: 'center',
    zIndex: 45,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    ...SHADOWS.md,
  },
  loadingText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  // Bottom Sheet Container
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    ...SHADOWS.md,
    zIndex: 40,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  bottomSheetContainerExpanded: {
    height: '75%',
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  sheetHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  sheetExpandHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sheetExpandHintText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  sheetCloseBtn: {
    position: 'absolute',
    right: 14,
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Place Summary Header
  placeSummaryHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  placeThumbImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
  },
  placeHeaderInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  categoryMiniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  verifiedMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedMiniBadgeText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  placeNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  placeRatingDistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  starRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  reviewsCountSmallText: {
    fontSize: 11,
    color: '#6B7280',
  },
  distDotDivider: {
    color: '#D1D5DB',
    marginHorizontal: 2,
  },
  distHighlightText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  walkingEstimateText: {
    fontSize: 11,
    color: '#4B5563',
  },
  openStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  openStatusGreenText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  openHoursText: {
    fontSize: 11,
    color: '#4B5563',
  },
  // Actions Grid Row
  actionGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  heroActionBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
    ...SHADOWS.sm,
  },
  heroActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 4,
  },
  secondaryActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Expanded Content Area
  expandedContentWrap: {
    flex: 1,
    marginTop: 8,
  },
  sheetTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  sheetTabItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  sheetTabItemActive: {
    borderBottomColor: '#FF385C',
  },
  sheetTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  sheetTabTextActive: {
    color: '#FF385C',
    fontWeight: '800',
  },
  sheetTabScroll: {
    flex: 1,
    paddingTop: 10,
  },
  // Nearby Tab
  smartPlanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  smartPlanIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartPlanTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9F1239',
  },
  smartPlanSub: {
    fontSize: 11,
    color: '#BE123C',
    marginTop: 1,
  },
  smartPlanActionBtn: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  smartPlanActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeadingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  nearbyPlaceItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  nearbyThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  nearbyCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  nearbyCatBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nearbyCatText: {
    fontSize: 9,
    fontWeight: '700',
  },
  nearbyDistText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
  },
  nearbyNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  nearbyRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  nearbyRatingVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  nearbyPriceText: {
    fontSize: 11,
    color: '#6B7280',
  },
  quickAddPlanBtn: {
    padding: 6,
  },
  // Overview Tab
  infoRowBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoRowText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  placeDescParagraph: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginVertical: 8,
  },
  facilitiesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 6,
    marginBottom: 6,
  },
  facilitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  facilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  facilityPillText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
  },
  verifiedSourceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 10,
    gap: 6,
    marginTop: 12,
  },
  verifiedSourceText: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '600',
    flex: 1,
  },
  // Reviews Tab
  reviewSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 10,
  },
  reviewScoreBig: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
  },
  reviewTotalSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  sampleReviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  reviewAuthorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reviewUserName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  reviewDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  ratingBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  ratingBadgePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  reviewBodyText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
    marginTop: 6,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 6,
  },
  writeReviewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Photos Tab
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryGridPhoto: {
    width: (SCREEN_WIDTH - 48) / 2,
    height: 105,
    borderRadius: 10,
  },
  // Wish Detail Bottom Card
  wishDetailCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    ...SHADOWS.md,
    zIndex: 42,
    gap: 8,
  },
  wishCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wishUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  wishCardUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  trustScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  trustScoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  wishCardTime: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  wishDestinationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 10,
    gap: 6,
  },
  wishDestinationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
  wishNoteText: {
    fontSize: 12,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 17,
  },
  wishActionRow: {
    marginTop: 2,
  },
  wishChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  wishChatBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  // Modal Backdrop
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  // Filter Modal
  filterModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: '75%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  filterModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  filterModalScroll: {
    paddingVertical: 10,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 10,
    marginBottom: 8,
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterSelectChipActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FF385C',
  },
  filterSelectChipText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  filterSelectChipTextActive: {
    color: '#FF385C',
    fontWeight: '700',
  },
  filterSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    marginTop: 8,
  },
  filterSwitchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  filterSwitchSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#10B981',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  filterModalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  filterResetButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
  },
  filterResetText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterApplyButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF385C',
    paddingVertical: 12,
    borderRadius: 12,
  },
  filterApplyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Province Modal
  provinceModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: '80%',
  },
  provinceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  provinceModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  provinceSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
    gap: 8,
  },
  provinceSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
  },
  provinceListScroll: {
    maxHeight: 400,
  },
  provinceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  provinceItemRowActive: {
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  provinceThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  provinceNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  provinceRegionText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  // Plan Modal
  planModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: '80%',
  },
  planModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  planHeaderIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FF385C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  planModalSub: {
    fontSize: 11,
    color: '#6B7280',
  },
  planTimelineScroll: {
    paddingVertical: 12,
    maxHeight: 380,
  },
  planTimelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineLeftColumn: {
    alignItems: 'center',
    width: 32,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF385C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotNumber: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#FCA5A5',
    marginVertical: 4,
  },
  planPlaceCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginLeft: 6,
  },
  planCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  planTimeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF385C',
  },
  planCardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planPlaceThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  planPlaceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  planPlaceAddress: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  planPlaceNote: {
    fontSize: 11,
    color: '#4B5563',
    fontStyle: 'italic',
    marginTop: 2,
  },
  planEmptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  planEmptyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  planModalFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  planShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF385C',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  planShareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
