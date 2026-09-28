import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';

interface MapScreenProps {
  onNavigate: (screen: ScreenKey) => void;
}

interface SpotItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews?: number;
  distance: string;
  image: string;
  desc: string;
  latitude?: number;
  longitude?: number;
  pinTop?: string;
  pinLeft?: string;
}

export const MapScreen: React.FC<MapScreenProps> = ({ onNavigate }) => {
  const [filter, setFilter] = useState<'places' | 'activities' | 'friends'>('places');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedCity = useAuthStore((s) => s.selectedCity) || 'Đà Nẵng';

  const defaultSpots: SpotItem[] = [
    {
      id: 'loc_1',
      name: 'Bán đảo Sơn Trà',
      category: 'Điểm ngắm cảnh',
      rating: 4.9,
      reviews: 320,
      distance: '3.2 km',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
      desc: 'Cung đường ven biển kỳ vĩ, chùa Linh Ứng và đỉnh Bàn Cờ ngắm trọn thành phố.',
      pinTop: '25%',
      pinLeft: '62%',
    },
    {
      id: 'loc_2',
      name: 'Cầu Rồng Đà Nẵng',
      category: 'Điểm checkin',
      rating: 4.8,
      reviews: 580,
      distance: '1.5 km',
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600',
      desc: 'Biểu tượng độc đáo, trình diễn phun lửa & nước ngoạn mục vào 21h cuối tuần.',
      pinTop: '48%',
      pinLeft: '40%',
    },
    {
      id: 'loc_3',
      name: 'Biển Mỹ Khê',
      category: 'Bãi biển',
      rating: 4.8,
      reviews: 940,
      distance: '2.0 km',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
      desc: 'Top bãi biển quyến rũ nhất hành tinh với bãi cát trắng mịn, thể thao biển sôi động.',
      pinTop: '65%',
      pinLeft: '72%',
    },
    {
      id: 'loc_4',
      name: 'Bánh Tráng Thịt Heo Bà Mua',
      category: 'Ẩm thực',
      rating: 4.7,
      reviews: 215,
      distance: '1.2 km',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
      desc: 'Đặc sản trứ danh với thịt luộc hai đầu da giòn ngọt và mắm nêm bí truyền.',
      pinTop: '42%',
      pinLeft: '28%',
    },
  ];

  const [spots, setSpots] = useState<SpotItem[]>(defaultSpots);
  const [selectedSpot, setSelectedSpot] = useState<SpotItem>(defaultSpots[0]);

  // Load verified places from 5-stage Zero-Garbage crawler
  useEffect(() => {
    let isMounted = true;
    async function fetchCleanedPlaces() {
      setLoading(true);
      try {
        const res = await ApiClient.getPlaces(selectedCity);
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: SpotItem[] = res.data.map((item: any, idx: number) => ({
            id: item.id || `crawled_${idx}`,
            name: item.name,
            category: item.category || 'Địa điểm',
            rating: item.rating || 4.8,
            reviews: item.reviewsCount || 100 + idx * 25,
            distance: `${(1.0 + idx * 0.8).toFixed(1)} km`,
            image: item.images?.[0] || defaultSpots[idx % defaultSpots.length].image,
            desc: item.description || 'Địa điểm sạch đã được kiểm định qua hệ sinh thái VIVU.',
            pinTop: `${25 + (idx * 16) % 50}%`,
            pinLeft: `${25 + (idx * 22) % 60}%`,
          }));
          setSpots(mapped);
          setSelectedSpot(mapped[0]);
        }
      } catch {
        // Giữ fallback default
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCleanedPlaces();
    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Tìm kiếm ngữ nghĩa lai (Hybrid Search)
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSpots(defaultSpots);
      setSelectedSpot(defaultSpots[0]);
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClient.search(text, filter === 'places' ? '' : filter, selectedCity);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const searched: SpotItem[] = res.data.map((item: any, idx: number) => ({
          id: item.id || `search_${idx}`,
          name: item.name,
          category: item.category || 'Khám phá',
          rating: item.rating || 4.8,
          reviews: item.reviewsCount || 50,
          distance: `${(0.8 + idx * 0.5).toFixed(1)} km`,
          image: item.images?.[0] || defaultSpots[idx % defaultSpots.length].image,
          desc: item.description || 'Tìm thấy qua AI Semantic Search',
          pinTop: `${30 + (idx * 15) % 40}%`,
          pinLeft: `${30 + (idx * 20) % 50}%`,
        }));
        setSpots(searched);
        setSelectedSpot(searched[0]);
      }
    } catch {
      // Giữ danh sách hiện tại
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Area */}
      <View style={styles.mapArea}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000',
          }}
          style={styles.mapImage}
          resizeMode="cover"
        />

        {/* Dynamic Map Pins */}
        {spots.map((spot) => {
          const isActive = selectedSpot?.id === spot.id;
          return (
            <TouchableOpacity
              key={spot.id}
              style={[
                styles.pinWrapper,
                { top: spot.pinTop || '40%', left: spot.pinLeft || '50%' } as any,
              ]}
              onPress={() => setSelectedSpot(spot)}
            >
              <View style={[styles.pinBadge, isActive && styles.pinBadgeActive]}>
                <Ionicons
                  name={
                    spot.category.includes('biển')
                      ? 'water'
                      : spot.category.includes('Ẩm thực')
                      ? 'restaurant'
                      : 'location'
                  }
                  size={14}
                  color="#FFF"
                />
                <Text style={styles.pinText} numberOfLines={1}>
                  {spot.name.length > 14 ? spot.name.slice(0, 14) + '...' : spot.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Top Header */}
      <View style={styles.floatingTop}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => onNavigate('home_feed')}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
          </TouchableOpacity>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Tìm tại ${selectedCity} (quán cafe, bãi biển...)`}
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {loading && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'places' && styles.filterChipActive]}
            onPress={() => setFilter('places')}
          >
            <Ionicons
              name="location-sharp"
              size={14}
              color={filter === 'places' ? '#FFF' : COLORS.textDark}
            />
            <Text style={[styles.filterChipText, filter === 'places' && styles.filterChipTextActive]}>
              Địa điểm sạch
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'activities' && styles.filterChipActive]}
            onPress={() => setFilter('activities')}
          >
            <Ionicons
              name="bicycle"
              size={14}
              color={filter === 'activities' ? '#FFF' : COLORS.textDark}
            />
            <Text style={[styles.filterChipText, filter === 'activities' && styles.filterChipTextActive]}>
              Hoạt động
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'friends' && styles.filterChipActive]}
            onPress={() => setFilter('friends')}
          >
            <Ionicons
              name="people"
              size={14}
              color={filter === 'friends' ? '#FFF' : COLORS.textDark}
            />
            <Text style={[styles.filterChipText, filter === 'friends' && styles.filterChipTextActive]}>
              Bạn bè gần đây
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Floating Location Card */}
      {selectedSpot && (
        <View style={styles.bottomCardWrapper}>
          <View style={styles.spotCard}>
            <Image source={{ uri: selectedSpot.image }} style={styles.spotThumb} />
            <View style={styles.spotInfo}>
              <View style={styles.spotHeader}>
                <Text style={styles.spotName} numberOfLines={1}>
                  {selectedSpot.name}
                </Text>
                <Text style={styles.spotRating}>⭐ {selectedSpot.rating}</Text>
              </View>
              <Text style={styles.spotDistance}>
                📍 Cách bạn {selectedSpot.distance} • {selectedSpot.category}
              </Text>
              <Text style={styles.spotDesc} numberOfLines={2}>
                {selectedSpot.desc}
              </Text>

              <View style={styles.spotActions}>
                <TouchableOpacity
                  style={styles.reviewBtn}
                  onPress={() => onNavigate('review')}
                >
                  <Text style={styles.reviewBtnText}>Đánh giá & Review</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => onNavigate('activity_detail')}
                >
                  <Text style={styles.detailBtnText}>Tạo hẹn đi ↗</Text>
                </TouchableOpacity>
              </View>
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
  pinWrapper: {
    position: 'absolute',
    ...SHADOWS.md,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinBadgeActive: {
    backgroundColor: '#EF4444',
    transform: [{ scale: 1.08 }],
  },
  pinText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  floatingTop: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.textDark,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
    ...SHADOWS.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  spotCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    gap: 12,
    ...SHADOWS.md,
  },
  spotThumb: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },
  spotInfo: {
    flex: 1,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 6,
  },
  spotRating: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.warning,
  },
  spotDistance: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
    marginBottom: 4,
  },
  spotDesc: {
    fontSize: 12,
    color: COLORS.textMedium,
    lineHeight: 16,
    marginBottom: 8,
  },
  spotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewBtn: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  reviewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  detailBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  detailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
});
