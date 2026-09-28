import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  NationalPlace,
  searchNationalPlaces,
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
  | 'tourism'
  | 'stay'
  | 'school'
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

// Haversine formula for real-time GPS distance calculation
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const MapScreen: React.FC<MapScreenProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite'>('standard');
  const [selectedProvince, setSelectedProvince] = useState<string>('Đà Nẵng');
  const [isProvinceModalVisible, setIsProvinceModalVisible] = useState(false);
  const [provinceSearchQuery, setProvinceSearchQuery] = useState('');
  const [savedPlaces, setSavedPlaces] = useState<Record<string, boolean>>({});
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'reviews' | 'photos'>('overview');

  const currentUser = useAuthStore((s) => s.user);
  const feedPosts = useFeedStore((s) => s.posts);

  // User's Real GPS Coordinates
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 16.0544,
    longitude: 108.2022,
  });

  // Selected Place & Wish State
  const [selectedPlace, setSelectedPlace] = useState<NationalPlace | null>(MASTER_NATIONWIDE_PLACES[0]);
  const [selectedWish, setSelectedWish] = useState<UserWishPin | null>(null);

  // Request GPS Permission on Mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
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
        // Fallback Da Nang center coordinates
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronized Wishes from feedStore and pre-curated community wishes
  const liveWishes: UserWishPin[] = [
    {
      id: 'w1',
      userName: 'Tùng (Tôi)',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      trustScore: currentUser?.trustScore || 94,
      destination: 'Phượt Đèo Hải Vân & Ngắm Hoàng Hôn',
      dateText: 'Chiều nay 16h30',
      note: 'Tuyển 2 bạn lái xe máy cùng đổ đèo Hải Vân săn mây và cafe đỉnh đèo!',
      latitude: 16.1265,
      longitude: 108.1320,
      pinTop: '18%',
      pinLeft: '18%',
    },
    {
      id: 'w2',
      userName: 'Minh Thư',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      trustScore: 94,
      destination: 'Food Tour Hải Sản & Ăn Vặt Chợ Cồn',
      dateText: 'Tối Thứ 7, 18:30',
      note: 'Tìm 2 cạ cùng càn quét ốc hút, chè sầu và bánh xèo tôm nhảy!',
      latitude: 16.0680,
      longitude: 108.2120,
      pinTop: '44%',
      pinLeft: '32%',
    },
    {
      id: 'w3',
      userName: 'Quang Anh',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      trustScore: 88,
      destination: 'Chèo SUP & Đón Bình Minh Biển Mỹ Khê',
      dateText: 'Sáng Chủ Nhật, 05:15',
      note: 'Đã có sẵn 2 SUP, cần rủ thêm 1 cạ dậy sớm ngắm bình minh!',
      latitude: 16.0620,
      longitude: 108.2490,
      pinTop: '58%',
      pinLeft: '76%',
    },
    // Dynamically synchronized from live feed posts (posts marked as wish or recruitment)
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
        latitude: p.taggedVenue?.latitude || 16.0600 + idx * 0.01,
        longitude: p.taggedVenue?.longitude || 108.2200 + idx * 0.01,
        pinTop: `${45 + (idx * 11) % 32}%`,
        pinLeft: `${38 + (idx * 15) % 42}%`,
      })),
  ];

  // Filter places based on search, category, and province
  const displayedPlaces: (NationalPlace & { distanceKm: number; distanceText: string })[] =
    MASTER_NATIONWIDE_PLACES
      .filter((item) => {
        // Province filter
        if (selectedProvince && !item.province.toLowerCase().includes(selectedProvince.toLowerCase())) {
          return false;
        }
        // Category filter
        if (activeCategory !== 'all' && activeCategory !== 'wishes') {
          if (item.categoryType !== activeCategory) return false;
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return (
            item.name.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.district.toLowerCase().includes(q) ||
            item.address.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q)
          );
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
          // Spread pins naturally if not pre-assigned
          pinTop: item.pinTop || `${28 + (index * 14) % 52}%`,
          pinLeft: item.pinLeft || `${20 + (index * 18) % 65}%`,
        };
      });

  // Action: Open Google Maps Native Navigation
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

  // Action: Call Phone Hotline
  const handleCallPlace = (phone: string) => {
    if (!phone) {
      Alert.alert('Thông báo', 'Địa điểm này chưa cập nhật số điện thoại.');
      return;
    }
    const cleanPhone = phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Gọi điện', `Hotline: ${phone}`);
    });
  };

  // Action: Share Place Details
  const handleSharePlace = async (place: NationalPlace) => {
    try {
      await Share.share({
        message: `Khám phá ngay "${place.name}" trên VIVU Maps!\n📍 Địa chỉ: ${place.address}\n⭐ Đánh giá: ${place.rating}/5.0\n📞 Hotline: ${place.phone}`,
        title: place.name,
      });
    } catch {
      // Ignored
    }
  };

  // Action: Toggle Save/Bookmark
  const toggleSavePlace = (placeId: string) => {
    setSavedPlaces((prev) => {
      const isSaved = !prev[placeId];
      Alert.alert(
        isSaved ? 'Đã lưu địa điểm 🔖' : 'Đã bỏ lưu',
        isSaved
          ? 'Địa điểm đã được thêm vào danh sách yêu thích cá nhân của bạn.'
          : 'Đã xóa khỏi danh sách yêu thích.'
      );
      return { ...prev, [placeId]: isSaved };
    });
  };

  // Action: Navigate to Create Post with Tagged Place
  const handleRecruitCompanions = (place: NationalPlace) => {
    Alert.alert(
      'Tuyển Cạ Đến Đây 🛵',
      `Tạo bài viết tuyển cạ đồng hành đến "${place.name}" ngay bây giờ?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tạo bài đăng',
          onPress: () => onNavigate('create_post'),
        },
      ]
    );
  };

  // Category Icons & Badges
  const getCategoryPinIcon = (type: string) => {
    switch (type) {
      case 'food':
        return 'restaurant';
      case 'tourism':
        return 'trail-sign';
      case 'stay':
        return 'bed';
      case 'school':
        return 'school';
      case 'entertainment':
        return 'sparkles';
      default:
        return 'location';
    }
  };

  const getCategoryPinColor = (type: string) => {
    switch (type) {
      case 'food':
        return '#EA580C'; // Warm orange
      case 'tourism':
        return '#059669'; // Green emerald
      case 'stay':
        return '#2563EB'; // Royal blue
      case 'school':
        return '#7C3AED'; // Purple
      case 'entertainment':
        return '#DB2777'; // Pink magenta
      default:
        return COLORS.primary;
    }
  };

  // Filtered 63 Provinces for Selector Modal
  const filteredProvinces = FULL_63_PROVINCES.filter((p) =>
    p.name.toLowerCase().includes(provinceSearchQuery.toLowerCase().trim())
  );

  return (
    <View style={styles.container}>
      {/* MAP CANVAS VIEWPORT */}
      <View style={styles.mapArea}>
        <Image
          source={{
            uri:
              mapLayer === 'satellite'
                ? 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400'
                : 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1400',
          }}
          style={styles.mapImage}
          resizeMode="cover"
        />

        {/* GPS Location Beacon (Current User) */}
        <View style={styles.userGpsPin}>
          <View style={styles.userGpsHalo} />
          <View style={styles.userGpsDot} />
        </View>

        {/* NATIONWIDE PLACES PINS */}
        {activeCategory !== 'wishes' &&
          displayedPlaces.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            const pinColor = getCategoryPinColor(place.categoryType);
            const iconName = getCategoryPinIcon(place.categoryType);

            return (
              <TouchableOpacity
                key={place.id}
                style={[
                  styles.pinWrapper,
                  { top: place.pinTop as any, left: place.pinLeft as any },
                ]}
                onPress={() => {
                  setSelectedPlace(place);
                  setSelectedWish(null);
                }}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.pinBadge,
                    { backgroundColor: pinColor },
                    isSelected && styles.pinBadgeActive,
                  ]}
                >
                  <Ionicons name={iconName as any} size={13} color="#FFF" />
                  <Text style={styles.pinText} numberOfLines={1}>
                    {place.name.length > 14 ? place.name.substring(0, 14) + '...' : place.name}
                  </Text>
                  <Text style={styles.pinDistText}>• {place.distanceText}</Text>
                </View>
                <View style={[styles.pinAnchorTriangle, { borderTopColor: pinColor }]} />
              </TouchableOpacity>
            );
          })}

        {/* LIVE SYNCHRONIZED USER WISHES PINS */}
        {(activeCategory === 'all' || activeCategory === 'wishes') &&
          liveWishes.map((wish) => {
            const isSelected = selectedWish?.id === wish.id;
            return (
              <TouchableOpacity
                key={wish.id}
                style={[
                  styles.wishPinWrapper,
                  { top: wish.pinTop as any, left: wish.pinLeft as any },
                ]}
                onPress={() => {
                  setSelectedWish(wish);
                  setSelectedPlace(null);
                }}
                activeOpacity={0.85}
              >
                {/* Speech Bubble */}
                <View style={[styles.wishSpeechBubble, isSelected && styles.wishBubbleActive]}>
                  <Text style={styles.wishBubbleUser}>@{wish.userName}</Text>
                  <Text style={styles.wishBubbleText} numberOfLines={1}>
                    {wish.destination}
                  </Text>
                </View>
                {/* Pulsing Avatar Beacon */}
                <View style={styles.wishAvatarBeacon}>
                  <View style={styles.wishRadarRing} />
                  <Image source={{ uri: wish.userAvatar }} style={styles.wishAvatar} />
                  <View style={styles.wishOnlineDot} />
                </View>
              </TouchableOpacity>
            );
          })}
      </View>

      {/* FLOATING GOOGLE MAPS TOP HEADER & SEARCH BAR */}
      <View style={styles.floatingHeaderArea}>
        {/* Google Maps Search Bar 1:1 */}
        <View style={styles.googleSearchBar}>
          <TouchableOpacity
            style={styles.searchIconBtn}
            onPress={() => setIsProvinceModalVisible(true)}
          >
            <Ionicons name="search" size={20} color="#4285F4" />
          </TouchableOpacity>

          <TextInput
            style={styles.searchInput}
            placeholder={`Tìm kiếm ở ${selectedProvince} (Ăn uống, trường học, điểm vui chơi...)`}
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

          {/* Active Province Badge Button */}
          <TouchableOpacity
            style={styles.provinceBadgeBtn}
            onPress={() => setIsProvinceModalVisible(true)}
          >
            <Ionicons name="location-sharp" size={13} color="#EA4335" />
            <Text style={styles.provinceBadgeText} numberOfLines={1}>
              {selectedProvince}
            </Text>
            <Ionicons name="chevron-down" size={12} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* HORIZONTAL CATEGORY FILTER CHIPS (Google Maps Style) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === 'all' && styles.categoryChipActive]}
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

          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === 'food' && styles.categoryChipActive]}
            onPress={() => setActiveCategory('food')}
          >
            <Ionicons
              name="restaurant-outline"
              size={15}
              color={activeCategory === 'food' ? '#FFF' : '#374151'}
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === 'food' && styles.categoryChipTextActive,
              ]}
            >
              🍽️ Ăn uống
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === 'tourism' && styles.categoryChipActive]}
            onPress={() => setActiveCategory('tourism')}
          >
            <Ionicons
              name="trail-sign-outline"
              size={15}
              color={activeCategory === 'tourism' ? '#FFF' : '#374151'}
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === 'tourism' && styles.categoryChipTextActive,
              ]}
            >
              🏞️ Điểm tham quan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === 'stay' && styles.categoryChipActive]}
            onPress={() => setActiveCategory('stay')}
          >
            <Ionicons
              name="bed-outline"
              size={15}
              color={activeCategory === 'stay' ? '#FFF' : '#374151'}
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === 'stay' && styles.categoryChipTextActive,
              ]}
            >
              🏨 Khách sạn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === 'school' && styles.categoryChipActive]}
            onPress={() => setActiveCategory('school')}
          >
            <Ionicons
              name="school-outline"
              size={15}
              color={activeCategory === 'school' ? '#FFF' : '#374151'}
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === 'school' && styles.categoryChipTextActive,
              ]}
            >
              🏫 Trường học
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryChip,
              activeCategory === 'entertainment' && styles.categoryChipActive,
            ]}
            onPress={() => setActiveCategory('entertainment')}
          >
            <Ionicons
              name="sparkles-outline"
              size={15}
              color={activeCategory === 'entertainment' ? '#FFF' : '#374151'}
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === 'entertainment' && styles.categoryChipTextActive,
              ]}
            >
              🎡 Vui chơi
            </Text>
          </TouchableOpacity>

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
              color={activeCategory === 'wishes' ? '#FFF' : '#DC2626'}
            />
            <Text
              style={[
                styles.categoryChipText,
                styles.categoryWishChipText,
                activeCategory === 'wishes' && styles.categoryChipTextActive,
              ]}
            >
              📍 Nguyện vọng cạ ({liveWishes.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* FLOATING MAP CONTROLS (Layer Switcher, GPS, Compass) */}
      <View style={styles.floatingControlsRight}>
        {/* Layer Switcher (Standard / Satellite) */}
        <TouchableOpacity
          style={styles.floatingSquareBtn}
          onPress={() => setMapLayer(mapLayer === 'standard' ? 'satellite' : 'standard')}
        >
          <Ionicons
            name={mapLayer === 'standard' ? 'earth' : 'map'}
            size={20}
            color="#1F2937"
          />
        </TouchableOpacity>

        {/* My Location GPS Beacon */}
        <TouchableOpacity
          style={[styles.floatingSquareBtn, { marginTop: 10 }]}
          onPress={() => {
            Alert.alert(
              'Định vị GPS',
              `Tọa độ hiện tại: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
            );
          }}
        >
          <Ionicons name="locate" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* GOOGLE MAPS 1:1 INTERACTIVE BOTTOM SHEET (SELECTED PLACE) */}
      {selectedPlace && !selectedWish && (
        <View style={styles.googleBottomSheet}>
          {/* Sheet Handle */}
          <View style={styles.sheetHandleWrap}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Place Header Info */}
          <View style={styles.placeHeaderRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.placeTitle}>{selectedPlace.name}</Text>
              <View style={styles.ratingAndReviewsRow}>
                <Text style={styles.ratingScoreText}>{selectedPlace.rating.toFixed(1)}</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons key={s} name="star" size={13} color="#FBBF24" />
                  ))}
                </View>
                <Text style={styles.reviewsCountText}>({selectedPlace.reviewsCount})</Text>
                <Text style={styles.categorySubText}>• {selectedPlace.category}</Text>
              </View>
              <View style={styles.statusAndHoursRow}>
                <Text style={styles.openStatusText}>Đang mở cửa</Text>
                <Text style={styles.hoursText}>• {selectedPlace.openingHours}</Text>
                <Text style={styles.distanceBadge}>• {selectedPlace.district}</Text>
              </View>
            </View>

            {/* Thumbnail / Hero Photo */}
            <Image source={{ uri: selectedPlace.image }} style={styles.placeHeroThumbnail} />
          </View>

          {/* GOOGLE MAPS ACTION BUTTONS ROW (Directions, Call, Save, Recruit, Share) */}
          <View style={styles.actionButtonsRow}>
            {/* 1. Chỉ đường (Google Blue Hero Button) */}
            <TouchableOpacity
              style={styles.googleActionBtn}
              onPress={() => handleOpenGoogleMapsDirections(selectedPlace)}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#1A73E8' }]}>
                <Ionicons name="navigate" size={18} color="#FFF" />
              </View>
              <Text style={[styles.actionBtnLabel, { color: '#1A73E8', fontWeight: '700' }]}>
                Chỉ đường
              </Text>
            </TouchableOpacity>

            {/* 2. Gọi điện (Hotline) */}
            <TouchableOpacity
              style={styles.googleActionBtn}
              onPress={() => handleCallPlace(selectedPlace.phone)}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="call" size={18} color="#1A73E8" />
              </View>
              <Text style={styles.actionBtnLabel}>Gọi điện</Text>
            </TouchableOpacity>

            {/* 3. Lưu lại (Favorite) */}
            <TouchableOpacity
              style={styles.googleActionBtn}
              onPress={() => toggleSavePlace(selectedPlace.id)}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons
                  name={savedPlaces[selectedPlace.id] ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={savedPlaces[selectedPlace.id] ? '#EA4335' : '#1A73E8'}
                />
              </View>
              <Text style={styles.actionBtnLabel}>
                {savedPlaces[selectedPlace.id] ? 'Đã lưu' : 'Lưu'}
              </Text>
            </TouchableOpacity>

            {/* 4. Rủ cạ đi cùng (VIVU Exclusive) */}
            <TouchableOpacity
              style={styles.googleActionBtn}
              onPress={() => handleRecruitCompanions(selectedPlace)}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#FF385C' }]}>
                <Ionicons name="people" size={18} color="#FFF" />
              </View>
              <Text style={[styles.actionBtnLabel, { color: '#FF385C', fontWeight: '700' }]}>
                Rủ cạ đi
              </Text>
            </TouchableOpacity>

            {/* 5. Chia sẻ */}
            <TouchableOpacity
              style={styles.googleActionBtn}
              onPress={() => handleSharePlace(selectedPlace)}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="share-social" size={18} color="#1A73E8" />
              </View>
              <Text style={styles.actionBtnLabel}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>

          {/* TAB BAR (Tổng quan / Đánh giá / Ảnh) */}
          <View style={styles.sheetTabBar}>
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
                Ảnh chụp
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB CONTENT */}
          <ScrollView style={styles.sheetBodyScroll} showsVerticalScrollIndicator={false}>
            {activeDetailTab === 'overview' && (
              <View style={styles.tabContentWrap}>
                {/* Address Line */}
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color="#5F6368" />
                  <Text style={styles.infoRowText}>{selectedPlace.address}</Text>
                </View>

                {/* Price Range */}
                <View style={styles.infoRow}>
                  <Ionicons name="pricetag-outline" size={18} color="#5F6368" />
                  <Text style={styles.infoRowText}>Giá tham khảo: {selectedPlace.priceRange}</Text>
                </View>

                {/* Hotline */}
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={18} color="#5F6368" />
                  <Text style={styles.infoRowText}>Hotline: {selectedPlace.phone}</Text>
                </View>

                {/* Description */}
                <Text style={styles.placeDescription}>{selectedPlace.desc}</Text>

                {/* Facilities Badges */}
                <View style={styles.facilitiesRow}>
                  {selectedPlace.facilities.map((f, i) => (
                    <View key={i} style={styles.facilityBadge}>
                      <Ionicons name="checkmark-circle" size={13} color="#059669" />
                      <Text style={styles.facilityText}>{f}</Text>
                    </View>
                  ))}
                </View>

                {/* Data Source Badge */}
                <View style={styles.sourceBadgeWrap}>
                  <Ionicons name="shield-checkmark" size={14} color="#0284C7" />
                  <Text style={styles.sourceBadgeText}>
                    Dữ liệu được xác thực bởi {selectedPlace.source} & Google Maps
                  </Text>
                </View>
              </View>
            )}

            {activeDetailTab === 'reviews' && (
              <View style={styles.tabContentWrap}>
                <View style={styles.reviewSummaryBox}>
                  <Text style={styles.reviewBigRating}>{selectedPlace.rating.toFixed(1)}</Text>
                  <View>
                    <View style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons key={s} name="star" size={15} color="#FBBF24" />
                      ))}
                    </View>
                    <Text style={styles.reviewSubText}>Dựa trên {selectedPlace.reviewsCount} bài đánh giá</Text>
                  </View>
                </View>

                {/* Sample Verified Reviews */}
                <View style={styles.reviewCardItem}>
                  <View style={styles.reviewAuthorRow}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }}
                      style={styles.reviewAvatar}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.reviewAuthorName}>Hà Linh (Cạ Sành Ăn)</Text>
                      <Text style={styles.reviewTimeAgo}>2 ngày trước • Đã xác thực đến quán</Text>
                    </View>
                    <View style={styles.ratingPill}>
                      <Ionicons name="star" size={12} color="#FFF" />
                      <Text style={styles.ratingPillText}>5.0</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewContent}>
                    Quán chuẩn vị cực kỳ ngon, mắm nêm đậm đà thơm nức! Không gian sạch sẽ, bãi đỗ xe máy và ô tô rất thoải mái. Rủ cạ qua VIVU cùng đi ăn rất vui!
                  </Text>
                </View>
              </View>
            )}

            {activeDetailTab === 'photos' && (
              <View style={styles.photosGrid}>
                {selectedPlace.gallery.map((img, i) => (
                  <Image key={i} source={{ uri: img }} style={styles.galleryImage} />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* SYNCHRONIZED USER WISH BOTTOM CARD */}
      {selectedWish && (
        <View style={styles.wishDetailOverlay}>
          <View style={styles.wishDetailCard}>
            <View style={styles.wishDetailHeader}>
              <Image source={{ uri: selectedWish.userAvatar }} style={styles.wishDetailAvatar} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.wishDetailUser}>{selectedWish.userName}</Text>
                  <View style={styles.wishTrustBadge}>
                    <Ionicons name="shield-checkmark" size={11} color="#059669" />
                    <Text style={styles.wishTrustText}>{selectedWish.trustScore}đ</Text>
                  </View>
                </View>
                <Text style={styles.wishDetailTime}>📅 {selectedWish.dateText}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedWish(null)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.wishTargetBlock}>
              <Ionicons name="navigate-circle" size={18} color="#EF4444" />
              <Text style={styles.wishTargetDestination}>{selectedWish.destination}</Text>
            </View>

            <Text style={styles.wishDetailNote}>"{selectedWish.note}"</Text>

            <View style={styles.wishActionRow}>
              <TouchableOpacity
                style={styles.connectWishBtn}
                onPress={() => onNavigate('personal_chat')}
              >
                <Ionicons name="chatbubbles" size={16} color="#FFF" />
                <Text style={styles.connectWishBtnText}>Nhắn tin ghép cạ ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 63 PROVINCES SELECTION MODAL */}
      <Modal
        visible={isProvinceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsProvinceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.provinceModalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Tỉnh / Thành Phố (63 Tỉnh)</Text>
              <TouchableOpacity onPress={() => setIsProvinceModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchBar}>
              <Ionicons name="search" size={18} color="#6B7280" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Tìm tỉnh thành (Hà Nội, Sài Gòn, Đà Lạt...)"
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
                    <Ionicons name="checkmark-circle" size={20} color="#1A73E8" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapArea: {
    ...StyleSheet.absoluteFill,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  userGpsPin: {
    position: 'absolute',
    top: '49%',
    left: '49%',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  userGpsHalo: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(66, 133, 244, 0.25)',
  },
  userGpsDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4285F4',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
    ...SHADOWS.md,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinBadgeActive: {
    transform: [{ scale: 1.15 }],
    borderColor: '#FEF08A',
    borderWidth: 2.5,
  },
  pinText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  pinDistText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '600',
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
  wishPinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 20,
    ...SHADOWS.glow,
  },
  wishSpeechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    marginBottom: 4,
    maxWidth: 130,
    ...SHADOWS.sm,
  },
  wishBubbleActive: {
    backgroundColor: '#FEF2F2',
    transform: [{ scale: 1.08 }],
  },
  wishBubbleUser: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  wishBubbleText: {
    fontSize: 10,
    color: '#1F2937',
    fontWeight: '600',
  },
  wishAvatarBeacon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishRadarRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  wishAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  wishOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  floatingHeaderArea: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 28,
    left: 12,
    right: 12,
    zIndex: 30,
  },
  googleSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 12,
    height: 50,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  searchIconBtn: {
    padding: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingHorizontal: 8,
  },
  clearSearchBtn: {
    padding: 6,
  },
  provinceBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
    maxWidth: 110,
  },
  provinceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  categoryScroll: {
    paddingVertical: 10,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  categoryChipActive: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  categoryWishChip: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  categoryWishChipActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
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
    color: '#DC2626',
  },
  floatingControlsRight: {
    position: 'absolute',
    right: 14,
    top: 150,
    zIndex: 25,
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
    borderColor: 'rgba(0,0,0,0.08)',
  },
  googleBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    maxHeight: '48%',
    ...SHADOWS.md,
    zIndex: 40,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  placeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  placeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  ratingAndReviewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingScoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },
  starRow: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewsCountText: {
    fontSize: 12,
    color: '#6B7280',
  },
  categorySubText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusAndHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  openStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  hoursText: {
    fontSize: 12,
    color: '#4B5563',
  },
  distanceBadge: {
    fontSize: 12,
    color: '#4B5563',
  },
  placeHeroThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  googleActionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  sheetTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  sheetTabItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  sheetTabItemActive: {
    borderBottomColor: '#1A73E8',
  },
  sheetTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  sheetTabTextActive: {
    color: '#1A73E8',
    fontWeight: '700',
  },
  sheetBodyScroll: {
    paddingVertical: 10,
  },
  tabContentWrap: {
    gap: 8,
    paddingBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoRowText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  placeDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginTop: 4,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  facilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  facilityText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '500',
  },
  sourceBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 10,
    gap: 6,
    marginTop: 6,
  },
  sourceBadgeText: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '600',
  },
  reviewSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewBigRating: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
  },
  reviewSubText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  reviewCardItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  reviewAuthorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  reviewTimeAgo: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  ratingPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  reviewContent: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginTop: 6,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 15,
  },
  galleryImage: {
    width: (SCREEN_WIDTH - 48) / 2,
    height: 100,
    borderRadius: 10,
  },
  wishDetailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    ...SHADOWS.md,
    zIndex: 45,
  },
  wishDetailCard: {
    gap: 10,
  },
  wishDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wishDetailAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  wishDetailUser: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  wishTrustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  wishTrustText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  wishDetailTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  wishTargetBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  wishTargetDestination: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
  wishDetailNote: {
    fontSize: 13,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  wishActionRow: {
    marginTop: 4,
  },
  connectWishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF385C',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    ...SHADOWS.sm,
  },
  connectWishBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  provinceModalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  provinceListScroll: {
    paddingBottom: 20,
  },
  provinceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  provinceItemRowActive: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  provinceThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  provinceNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  provinceRegionText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
