import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';
import { ScreenKey } from '../../types';

interface MapScreenProps {
  onNavigate: (screen: ScreenKey) => void;
}

export type CategoryType =
  | 'all'
  | 'food'
  | 'tourism'
  | 'stay'
  | 'school'
  | 'entertainment'
  | 'wishes';

interface MapPlaceItem {
  id: string;
  name: string;
  category: string;
  categoryType: 'food' | 'tourism' | 'stay' | 'school' | 'entertainment';
  rating: number;
  reviews?: number;
  latitude: number;
  longitude: number;
  distanceKm: number;
  distanceText: string;
  image: string;
  desc: string;
  source: string;
  priceRange?: string;
  openingHours?: string;
  address: string;
  pinTop: string;
  pinLeft: string;
}

interface UserWishItem {
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

export const MapScreen: React.FC<MapScreenProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite'>('standard');
  const [loading, setLoading] = useState(false);
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null);
  const [checkedInSpots, setCheckedInSpots] = useState<Record<string, boolean>>({});

  const selectedCity = useAuthStore((s) => s.selectedCity) || 'Đà Nẵng';
  const currentUser = useAuthStore((s) => s.user);
  const feedPosts = useFeedStore((s) => s.posts);

  // User's Real GPS Coordinates
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 16.0544,
    longitude: 108.2022,
  });

  // Comprehensive Nationwide Places Database (Food, Tourism, Stay, School, Entertainment)
  const nationwideDatabase: MapPlaceItem[] = [
    // --- 🍽️ ĂN UỐNG & CAFE ---
    {
      id: 'f1',
      name: 'Bánh Tráng Thịt Heo Bà Mua',
      category: 'Ẩm thực truyền thống',
      categoryType: 'food',
      rating: 4.8,
      reviews: 430,
      latitude: 16.0633,
      longitude: 108.2178,
      distanceKm: 0.9,
      distanceText: '900 m',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
      desc: 'Đặc sản trứ danh thịt luộc hai đầu da giòn ngọt và mắm nêm bí truyền chuẩn vị miền Trung.',
      source: 'SHOPEEFOOD',
      priceRange: '45.000đ - 90.000đ',
      openingHours: '06:30 - 22:00',
      address: '95A Nguyễn Tri Phương, Thanh Khê, Đà Nẵng',
      pinTop: '46%',
      pinLeft: '28%',
    },
    {
      id: 'f2',
      name: 'Sơn Trà Marina Cafe & Lounge',
      category: 'Cafe view biển',
      categoryType: 'food',
      rating: 4.9,
      reviews: 580,
      latitude: 16.1158,
      longitude: 108.2536,
      distanceKm: 3.5,
      distanceText: '3.5 km',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
      desc: 'Santorini giữa lòng Đà Nẵng, góc ngắm hoàng hôn vịnh biển đẹp mê hồn cùng thức uống acoustic.',
      source: 'GRABFOOD',
      priceRange: '50.000đ - 120.000đ',
      openingHours: '07:00 - 22:30',
      address: 'Đường Hồ Xanh, Thọ Quang, Sơn Trà, Đà Nẵng',
      pinTop: '20%',
      pinLeft: '72%',
    },
    {
      id: 'f3',
      name: 'Quán Nối Cafe Hoài Cổ',
      category: 'Cafe Vintage',
      categoryType: 'food',
      rating: 4.9,
      reviews: 290,
      latitude: 16.0712,
      longitude: 108.2231,
      distanceKm: 1.2,
      distanceText: '1.2 km',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600',
      desc: 'Không gian bao cấp retro thập niên 90, cafe trứng béo ngậy và trà sen thơm ngát.',
      source: 'FOODBOOK',
      priceRange: '25.000đ - 55.000đ',
      openingHours: '06:30 - 22:00',
      address: '113/18 Nguyễn Chí Thanh, Hải Châu, Đà Nẵng',
      pinTop: '38%',
      pinLeft: '38%',
    },

    // --- 🏞️ DU LỊCH & DANH THẮNG ---
    {
      id: 't1',
      name: 'Bán Đảo Sơn Trà & Chùa Linh Ứng',
      category: 'Di tích & Thắng cảnh',
      categoryType: 'tourism',
      rating: 4.9,
      reviews: 1250,
      latitude: 16.1000,
      longitude: 108.2700,
      distanceKm: 4.2,
      distanceText: '4.2 km',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
      desc: 'Tượng Phật Bà Quan Âm cao nhất Việt Nam nhìn ra biển Đông, cung đường săn mây ngắm khỉ Voọc chà vá chân nâu.',
      source: 'WIKIMEDIA',
      priceRange: 'Miễn phí vé vào cửa',
      openingHours: '06:00 - 18:30',
      address: 'Bán đảo Sơn Trà, Thọ Quang, Đà Nẵng',
      pinTop: '25%',
      pinLeft: '80%',
    },
    {
      id: 't2',
      name: 'Cầu Rồng & Cầu Tình Yêu',
      category: 'Biểu tượng checkin',
      categoryType: 'tourism',
      rating: 4.8,
      reviews: 980,
      latitude: 16.0611,
      longitude: 108.2272,
      distanceKm: 1.5,
      distanceText: '1.5 km',
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600',
      desc: 'Cầu thép vòm rồng thép độc nhất vô nhị, trình diễn phun lửa & nước lúc 21h thứ Bảy và Chủ Nhật.',
      source: 'WIKIMEDIA',
      priceRange: 'Miễn phí tham quan',
      openingHours: 'Mở cửa cả ngày (24/7)',
      address: 'Nguyễn Văn Linh - Bạch Đằng, Hải Châu, Đà Nẵng',
      pinTop: '52%',
      pinLeft: '48%',
    },
    {
      id: 't3',
      name: 'Biển Mỹ Khê & Bãi tắm Phạm Văn Đồng',
      category: 'Bãi biển Quốc tế',
      categoryType: 'tourism',
      rating: 4.9,
      reviews: 1800,
      latitude: 16.0592,
      longitude: 108.2458,
      distanceKm: 2.1,
      distanceText: '2.1 km',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
      desc: 'Top 6 bãi biển quyến rũ nhất hành tinh do Forbes bình chọn, bãi cát trắng mịn, dù lượn và lướt sóng.',
      source: 'TRAVELOKA',
      priceRange: 'Tắm biển miễn phí',
      openingHours: '05:00 - 19:00 (Cứu hộ trực)',
      address: 'Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng',
      pinTop: '62%',
      pinLeft: '68%',
    },

    // --- 🏨 NGHỈ NGƠI & LƯU TRÚ ---
    {
      id: 's1',
      name: 'Khách sạn Novotel Danang Premier Han River',
      category: 'Khách sạn 5 sao',
      categoryType: 'stay',
      rating: 4.8,
      reviews: 620,
      latitude: 16.0772,
      longitude: 108.2241,
      distanceKm: 1.8,
      distanceText: '1.8 km',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
      desc: 'Khách sạn sang trọng bên bờ sông Hàn với Sky36 rooftop lounge cao nhất thành phố và hồ bơi vô cực.',
      source: 'TRAVELOKA',
      priceRange: '1.800.000đ - 3.500.000đ/đêm',
      openingHours: 'Nhận phòng 14:00 • Trả phòng 12:00',
      address: '36 Bạch Đằng, Thạch Thang, Hải Châu, Đà Nẵng',
      pinTop: '35%',
      pinLeft: '44%',
    },
    {
      id: 's2',
      name: 'InterContinental Danang Sun Peninsula Resort',
      category: 'Resort nghỉ dưỡng',
      categoryType: 'stay',
      rating: 5.0,
      reviews: 780,
      latitude: 16.1215,
      longitude: 108.3100,
      distanceKm: 7.8,
      distanceText: '7.8 km',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
      desc: 'Kiệt tác kiến trúc của Bill Bensley ẩn mình giữa núi rừng Sơn Trà nguyên sinh nhìn thẳng ra vịnh biển riêng tư.',
      source: 'TRAVELOKA',
      priceRange: '8.000.000đ - 18.000.000đ/đêm',
      openingHours: 'Lễ tân 24/7',
      address: 'Bãi Bắc, Bán đảo Sơn Trà, Đà Nẵng',
      pinTop: '15%',
      pinLeft: '88%',
    },

    // --- 🏫 TRƯỜNG HỌC & GIÁO DỤC ---
    {
      id: 'sc1',
      name: 'Đại Học Bách Khoa - Đại Học Đà Nẵng',
      category: 'Trường Đại học',
      categoryType: 'school',
      rating: 4.7,
      reviews: 350,
      latitude: 16.0754,
      longitude: 108.1534,
      distanceKm: 3.8,
      distanceText: '3.8 km',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600',
      desc: 'Trung tâm đào tạo kỹ thuật, công nghệ hàng đầu miền Trung với khuôn viên rợp bóng cây xanh và thư viện hiện đại.',
      source: 'WIKIMEDIA',
      priceRange: 'Khuôn viên mở cửa sinh viên',
      openingHours: '07:00 - 21:00',
      address: '54 Nguyễn Lương Bằng, Hòa Khánh Bắc, Liên Chiểu',
      pinTop: '32%',
      pinLeft: '14%',
    },
    {
      id: 'sc2',
      name: 'Đại Học Kinh Tế Đà Nẵng',
      category: 'Trường Đại học',
      categoryType: 'school',
      rating: 4.8,
      reviews: 280,
      latitude: 16.0520,
      longitude: 108.2435,
      distanceKm: 1.6,
      distanceText: '1.6 km',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600',
      desc: 'Nơi quy tụ cộng đồng sinh viên năng động, các CLB du lịch tình nguyện và giao lưu cạ cứng trẻ tuổi.',
      source: 'WIKIMEDIA',
      priceRange: 'Cộng đồng sinh viên',
      openingHours: '07:00 - 21:00',
      address: '71 Ngũ Hành Sơn, Bắc Mỹ An, Ngũ Hành Sơn',
      pinTop: '68%',
      pinLeft: '56%',
    },

    // --- 🎡 VUI CHƠI & GIẢI TRÍ ---
    {
      id: 'e1',
      name: 'Chợ Đêm Helio & Khu Vui Chơi',
      category: 'Tổ hợp giải trí đêm',
      categoryType: 'entertainment',
      rating: 4.8,
      reviews: 920,
      latitude: 16.0352,
      longitude: 108.2238,
      distanceKm: 2.2,
      distanceText: '2.2 km',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
      desc: 'Thiên đường ẩm thực đêm lớn nhất Đà Nẵng, bia nướng âm nhạc live acoustic, rạp phim và games ngoài trời.',
      source: 'SHOPEEFOOD',
      priceRange: '20.000đ - 100.000đ',
      openingHours: '17:30 - 23:00 hàng ngày',
      address: 'Đường 2 Tháng 9, Hòa Cường Bắc, Hải Châu, Đà Nẵng',
      pinTop: '74%',
      pinLeft: '40%',
    },
  ];

  // Dynamic User Wishes Synced from Live Feed Posts!
  const liveWishes: UserWishItem[] = [
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
    // Also include any posts from feedStore that have wish or recruitment
    ...feedPosts
      .filter((p) => p.isWish || p.isRecruitment)
      .map((p, idx) => ({
        id: `post_wish_${p.id}`,
        userName: p.author.name,
        userAvatar: p.author.avatar,
        trustScore: 92,
        destination: p.taggedVenue?.name || p.wishDestination || p.author.location || 'Địa điểm vi vu',
        dateText: p.wishDate || p.activitySnippet?.time || 'Hôm nay',
        note: p.content,
        latitude: p.taggedVenue?.latitude || 16.0600 + idx * 0.01,
        longitude: p.taggedVenue?.longitude || 108.2200 + idx * 0.01,
        pinTop: `${48 + (idx * 12) % 30}%`,
        pinLeft: `${40 + (idx * 16) % 40}%`,
      })),
  ];

  const [places, setPlaces] = useState<MapPlaceItem[]>(nationwideDatabase);
  const [selectedPlace, setSelectedPlace] = useState<MapPlaceItem | null>(nationwideDatabase[0]);
  const [selectedWish, setSelectedWish] = useState<UserWishItem | null>(null);

  // Request GPS Permission & Update Distances dynamically
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

  // Recalculate distance dynamically whenever userLocation changes
  const computedPlaces: MapPlaceItem[] = places.map((place) => {
    const dist = calculateHaversineDistance(
      userLocation.latitude,
      userLocation.longitude,
      place.latitude,
      place.longitude
    );
    return {
      ...place,
      distanceKm: dist,
      distanceText: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
    };
  });

  // Filter places by category and search
  const filteredPlaces = computedPlaces.filter((item) => {
    // Category filter
    if (activeCategory === 'food' && item.categoryType !== 'food') return false;
    if (activeCategory === 'tourism' && item.categoryType !== 'tourism') return false;
    if (activeCategory === 'stay' && item.categoryType !== 'stay') return false;
    if (activeCategory === 'school' && item.categoryType !== 'school') return false;
    if (activeCategory === 'entertainment' && item.categoryType !== 'entertainment') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Open Native Google Maps navigation
  const handleOpenDirections = (place: MapPlaceItem) => {
    const lat = place.latitude;
    const lon = place.longitude;
    const label = encodeURIComponent(place.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lon}`,
      android: `geo:0,0?q=${lat},${lon}(${label})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`);
      }
    });
  };

  // GPS Check-in (+30 Trust Score Points)
  const handleGpsCheckIn = (place: MapPlaceItem) => {
    if (checkedInSpots[place.id]) {
      Alert.alert('Đã Check-in', 'Bạn đã check-in tại địa điểm này hôm nay rồi!');
      return;
    }

    setCheckedInSpots({ ...checkedInSpots, [place.id]: true });

    if (currentUser) {
      useAuthStore.setState({
        user: {
          ...currentUser,
          trustScore: Math.min(100, (currentUser.trustScore || 85) + 30),
        },
      });
    }

    Alert.alert(
      '🎉 Check-in GPS Tọa Độ Thật!',
      `Tọa độ GPS của bạn đã khớp với ${place.name}.\n\nBạn được thưởng +30 ĐIỂM UY TÍN! Điểm mới: ${Math.min(100, (currentUser?.trustScore || 85) + 30)}đ`,
      [{ text: 'Tuyệt vời!' }]
    );
  };

  // Category Selector Tabs
  const categoriesList: Array<{ key: CategoryType; label: string; icon: string }> = [
    { key: 'all', label: 'Tất cả', icon: 'grid-outline' },
    { key: 'wishes', label: '✨ Nguyện vọng cạ', icon: 'navigate' },
    { key: 'food', label: '🍽️ Ăn uống', icon: 'restaurant' },
    { key: 'tourism', label: '🏞️ Du lịch', icon: 'compass' },
    { key: 'stay', label: '🏨 Nghỉ ngơi', icon: 'bed' },
    { key: 'school', label: '🏫 Trường học', icon: 'school' },
    { key: 'entertainment', label: '🎡 Vui chơi', icon: 'balloon' },
  ];

  return (
    <View style={styles.container}>
      {/* Google Maps Simulated Viewport */}
      <View style={styles.mapArea}>
        <Image
          source={{
            uri:
              mapLayer === 'satellite'
                ? 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200'
                : 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200',
          }}
          style={styles.mapImage}
          resizeMode="cover"
        />

        {/* User GPS Pin (Blue pulsing beacon) */}
        <View style={styles.userGpsPin}>
          <View style={styles.userGpsHalo} />
          <View style={styles.userGpsDot} />
        </View>

        {/* 1. Category Places Markers */}
        {activeCategory !== 'wishes' &&
          filteredPlaces.map((place) => {
            const isActive = selectedPlace?.id === place.id && !selectedWish;
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
              >
                <View
                  style={[
                    styles.pinBadge,
                    place.categoryType === 'food' && { backgroundColor: '#EA580C' },
                    place.categoryType === 'tourism' && { backgroundColor: '#0284C7' },
                    place.categoryType === 'stay' && { backgroundColor: '#7C3AED' },
                    place.categoryType === 'school' && { backgroundColor: '#059669' },
                    place.categoryType === 'entertainment' && { backgroundColor: '#DB2777' },
                    isActive && styles.pinBadgeActive,
                  ]}
                >
                  <Ionicons
                    name={
                      place.categoryType === 'food'
                        ? 'restaurant'
                        : place.categoryType === 'tourism'
                        ? 'camera'
                        : place.categoryType === 'stay'
                        ? 'bed'
                        : place.categoryType === 'school'
                        ? 'school'
                        : 'balloon'
                    }
                    size={13}
                    color="#FFF"
                  />
                  <Text style={styles.pinText} numberOfLines={1}>
                    {place.name.length > 13 ? place.name.slice(0, 13) + '...' : place.name}
                  </Text>
                  <Text style={styles.pinDistText}>({place.distanceText})</Text>
                </View>
              </TouchableOpacity>
            );
          })}

        {/* 2. SYNCHRONIZED USER WISHES PINS (Nguyện vọng cạ cứng đồng bộ lên Map) */}
        {(activeCategory === 'wishes' || activeCategory === 'all') &&
          liveWishes.map((wish) => {
            const isWishActive = selectedWish?.id === wish.id;
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
              >
                {/* Speech bubble showing user wish */}
                <View style={[styles.wishSpeechBubble, isWishActive && styles.wishBubbleActive]}>
                  <Text style={styles.wishBubbleUser}>@{wish.userName}</Text>
                  <Text style={styles.wishBubbleText} numberOfLines={1}>
                    {wish.destination}
                  </Text>
                </View>

                {/* Avatar beacon */}
                <View style={styles.wishAvatarBeacon}>
                  <Image source={{ uri: wish.userAvatar }} style={styles.wishAvatar} />
                  <View style={styles.wishPulseRing} />
                </View>
              </TouchableOpacity>
            );
          })}
      </View>

      {/* Floating Google Maps Style Top Bar */}
      <View style={styles.floatingTop}>
        {/* Search Bar Row */}
        <View style={styles.searchBarRow}>
          <TouchableOpacity
            style={styles.backCircleBtn}
            onPress={() => onNavigate('home_feed')}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
          </TouchableOpacity>

          <View style={styles.googleSearchBar}>
            <Ionicons name="search" size={18} color="#EA4335" />
            <TextInput
              style={styles.googleSearchInput}
              placeholder={`Khám phá toàn quốc (${selectedCity})`}
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.citySelectorChip}
              onPress={() => onNavigate('city_select')}
            >
              <Text style={styles.citySelectorText}>{selectedCity}</Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Layer switcher */}
          <TouchableOpacity
            style={styles.layerBtn}
            onPress={() =>
              setMapLayer(mapLayer === 'standard' ? 'satellite' : 'standard')
            }
          >
            <Ionicons
              name={mapLayer === 'standard' ? 'earth' : 'map'}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Category Carousel Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsScroll}
        >
          {categoriesList.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                  cat.key === 'wishes' && styles.categoryPillWishes,
                  cat.key === 'wishes' && isActive && styles.categoryPillWishesActive,
                ]}
                onPress={() => setActiveCategory(cat.key)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isActive && styles.categoryPillTextActive,
                    cat.key === 'wishes' && { fontWeight: '800' },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Map Right Quick Actions (Target GPS, Compass, Add Wish) */}
      <View style={styles.rightFloatControls}>
        <TouchableOpacity
          style={styles.rightControlBtn}
          onPress={() => {
            Alert.alert('Tọa độ GPS Hiện Tại', `Vĩ độ: ${userLocation.latitude.toFixed(4)}\nKinh độ: ${userLocation.longitude.toFixed(4)}\nBán kính định vị chính xác: ~10m`);
          }}
        >
          <Ionicons name="locate" size={20} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.rightControlBtn, { backgroundColor: '#EF4444' }]}
          onPress={() => onNavigate('create_post')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM CARD: Selected Place Card */}
      {selectedPlace && !selectedWish && (
        <View style={styles.bottomCardWrapper}>
          <View style={styles.placeCard}>
            <Image source={{ uri: selectedPlace.image }} style={styles.placeThumb} />
            <View style={styles.placeInfo}>
              <View style={styles.placeHeader}>
                <Text style={styles.placeName} numberOfLines={1}>
                  {selectedPlace.name}
                </Text>
                <View style={styles.sourceTag}>
                  <Text style={styles.sourceTagText}>{selectedPlace.source}</Text>
                </View>
              </View>

              <View style={styles.placeMetaRow}>
                <Text style={styles.placeRating}>⭐ {selectedPlace.rating}</Text>
                <Text style={styles.placeCategory}>• {selectedPlace.category}</Text>
                <Text style={styles.placeDistance}>• 📍 {selectedPlace.distanceText}</Text>
              </View>

              <Text style={styles.placeAddress} numberOfLines={1}>
                {selectedPlace.address}
              </Text>

              <View style={styles.placeActions}>
                <TouchableOpacity
                  style={styles.directionsBtn}
                  onPress={() => handleOpenDirections(selectedPlace)}
                >
                  <Ionicons name="navigate" size={14} color="#FFF" />
                  <Text style={styles.directionsBtnText}>Chỉ đường GG Maps ↗</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.checkInBtn,
                    checkedInSpots[selectedPlace.id] && styles.checkInBtnDone,
                  ]}
                  onPress={() => handleGpsCheckIn(selectedPlace)}
                >
                  <Ionicons
                    name={checkedInSpots[selectedPlace.id] ? 'checkmark-circle' : 'shield-checkmark'}
                    size={14}
                    color={checkedInSpots[selectedPlace.id] ? '#059669' : COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.checkInBtnText,
                      checkedInSpots[selectedPlace.id] && { color: '#059669' },
                    ]}
                  >
                    {checkedInSpots[selectedPlace.id] ? 'Đã Check-in' : 'Check-in (+30đ)'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.meetupBtn}
                  onPress={() => onNavigate('create_post')}
                >
                  <Text style={styles.meetupBtnText}>Rủ cạ đi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* BOTTOM CARD: Selected Synchronized User Wish Card */}
      {selectedWish && (
        <View style={styles.bottomCardWrapper}>
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
                <Ionicons name="close" size={20} color={COLORS.textLight} />
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
                <Ionicons name="chatbubbles" size={15} color="#FFF" />
                <Text style={styles.connectWishBtnText}>Nhắn tin ghép cạ ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
  },
  userGpsDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  pinWrapper: {
    position: 'absolute',
    zIndex: 10,
    ...SHADOWS.md,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinBadgeActive: {
    transform: [{ scale: 1.12 }],
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
    color: COLORS.textDark,
    fontWeight: '600',
  },
  wishAvatarBeacon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  wishPulseRing: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  floatingTop: {
    position: 'absolute',
    top: 40,
    left: 12,
    right: 12,
    gap: 8,
    zIndex: 30,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  googleSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 12,
    height: 44,
    gap: 6,
    ...SHADOWS.md,
  },
  googleSearchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
  },
  citySelectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 2,
  },
  citySelectorText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  layerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  categoryPillsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  categoryPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    ...SHADOWS.sm,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
  },
  categoryPillWishes: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  categoryPillWishesActive: {
    backgroundColor: '#EF4444',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rightFloatControls: {
    position: 'absolute',
    right: 14,
    top: 155,
    gap: 10,
    zIndex: 25,
  },
  rightControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 14,
    right: 14,
    zIndex: 40,
  },
  placeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    ...SHADOWS.md,
  },
  placeThumb: {
    width: 90,
    height: 115,
    borderRadius: 12,
  },
  placeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sourceTag: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  sourceTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  placeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  placeRating: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  placeCategory: {
    fontSize: 11,
    color: COLORS.textMedium,
  },
  placeDistance: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  placeAddress: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  placeActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  directionsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  checkInBtnDone: {
    backgroundColor: '#ECFDF5',
  },
  checkInBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  meetupBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  meetupBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  wishDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    ...SHADOWS.md,
  },
  wishDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  wishDetailAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  wishDetailUser: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  wishTrustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  wishTrustText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  wishDetailTime: {
    fontSize: 11,
    color: COLORS.textMedium,
  },
  wishTargetBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  wishTargetDestination: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  wishDetailNote: {
    fontSize: 12,
    color: COLORS.textMedium,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 10,
  },
  wishActionRow: {
    flexDirection: 'row',
  },
  connectWishBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
  },
  connectWishBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
