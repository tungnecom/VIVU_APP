import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { EmptyState, LoadingSkeleton } from '../../components/common/StateView';
import { UserAvatar } from '../../components/common/UserAvatar';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { MASTER_NATIONWIDE_PLACES, NationalPlace } from '../../services/fullVietnamData';
import { useAuthStore } from '../../stores/authStore';
import { ActivityItem, ScreenKey } from '../../types';

interface MapScreenProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
}

type MapMode = 'activities' | 'places';
type CategoryFilter = 'all' | 'food' | 'cafe' | 'tourism' | 'sport';

const CATEGORIES = [
  { key: 'all', label: 'Tất cả', icon: 'sparkles' },
  { key: 'food', label: 'Ẩm thực', icon: 'restaurant' },
  { key: 'cafe', label: 'Cà phê', icon: 'cafe' },
  { key: 'tourism', label: 'Check-in', icon: 'camera' },
  { key: 'sport', label: 'Thể thao', icon: 'bicycle' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const MapScreen: React.FC<MapScreenProps> = ({ onNavigate }) => {
  const selectedCity = useAuthStore((s) => s.selectedCity) || 'Đà Nẵng';

  const [mode, setMode] = useState<MapMode>('activities');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'map' | 'list'>('map');

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [places, setPlaces] = useState<NationalPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Selected item on map
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<NationalPlace | null>(null);

  // Load backend activities & places
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch live activities
      const actRes = await ApiClient.getActivities(selectedCity);
      if (actRes?.success && Array.isArray(actRes.data)) {
        setActivities(actRes.data);
        if (actRes.data.length > 0 && !selectedActivity) {
          setSelectedActivity(actRes.data[0]);
        }
      }

      // Fetch live places or fallback from MASTER_NATIONWIDE_PLACES
      const placeRes = await ApiClient.getPlaces(selectedCity);
      if (placeRes?.success && Array.isArray(placeRes.data) && placeRes.data.length > 0) {
        setPlaces(placeRes.data);
        if (!selectedPlace) setSelectedPlace(placeRes.data[0]);
      } else {
        const danangPlaces = MASTER_NATIONWIDE_PLACES.filter(
          (p) => p.province === 'Đà Nẵng' || p.province === selectedCity
        );
        const fallbackList = danangPlaces.length > 0 ? danangPlaces : MASTER_NATIONWIDE_PLACES.slice(0, 15);
        setPlaces(fallbackList);
        if (!selectedPlace && fallbackList.length > 0) {
          setSelectedPlace(fallbackList[0]);
        }
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Filtered lists
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchQuery =
        !searchQuery ||
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'food' && act.category.toLowerCase().includes('ăn')) ||
        (selectedCategory === 'cafe' && act.category.toLowerCase().includes('cafe')) ||
        (selectedCategory === 'tourism' && act.category.toLowerCase().includes('du lịch')) ||
        (selectedCategory === 'sport' && act.category.toLowerCase().includes('thao'));

      return matchQuery && matchCat;
    });
  }, [activities, searchQuery, selectedCategory]);

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'food' && p.categoryType === 'food') ||
        (selectedCategory === 'cafe' && p.categoryType === 'cafe') ||
        (selectedCategory === 'tourism' && p.categoryType === 'tourism') ||
        (selectedCategory === 'sport' && p.categoryType === 'entertainment');

      return matchQuery && matchCat;
    });
  }, [places, searchQuery, selectedCategory]);

  return (
    <View style={styles.container}>
      {/* Search & Header Bar */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={
                mode === 'activities'
                  ? 'Tìm kèo theo khu vực, hoạt động...'
                  : 'Tìm quán cafe, ẩm thực Đà Nẵng...'
              }
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.viewToggleBtn}
            activeOpacity={0.8}
            onPress={() => setViewType(viewType === 'map' ? 'list' : 'map')}
          >
            <Ionicons
              name={viewType === 'map' ? 'list' : 'map'}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Mode Switcher Tabs */}
        <View style={styles.modeTabsRow}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'activities' && styles.modeTabActive]}
            activeOpacity={0.8}
            onPress={() => {
              setMode('activities');
              if (filteredActivities.length > 0) setSelectedActivity(filteredActivities[0]);
            }}
          >
            <Ionicons
              name="people"
              size={16}
              color={mode === 'activities' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.modeTabText,
                mode === 'activities' && styles.modeTabTextActive,
              ]}
            >
              Kèo trên bản đồ ({filteredActivities.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, mode === 'places' && styles.modeTabActive]}
            activeOpacity={0.8}
            onPress={() => {
              setMode('places');
              if (filteredPlaces.length > 0) setSelectedPlace(filteredPlaces[0]);
            }}
          >
            <Ionicons
              name="location"
              size={16}
              color={mode === 'places' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.modeTabText,
                mode === 'places' && styles.modeTabTextActive,
              ]}
            >
              Địa điểm sạch ({filteredPlaces.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChips}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat.key as CategoryFilter)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Body: Map or List */}
      {viewType === 'map' ? (
        <View style={styles.mapArea}>
          {/* Simulated Interactive Map Grid for Danang */}
          <View style={styles.mapCanvas}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1000',
              }}
              style={styles.mapBackground}
            />
            <View style={styles.mapOverlayGrid} />

            {/* Danang City Center Marker */}
            <View style={styles.cityCenterBadge}>
              <Ionicons name="compass" size={14} color={COLORS.primary} />
              <Text style={styles.cityCenterText}>Khu vực {selectedCity}</Text>
            </View>

            {/* Pins layer */}
            {mode === 'activities' ? (
              filteredActivities.map((act, index) => {
                const isSelected = selectedActivity?.id === act.id;
                // Distribute pins aesthetically across map
                const topPos = 20 + ((index * 29) % 55);
                const leftPos = 15 + ((index * 37) % 65);

                return (
                  <TouchableOpacity
                    key={act.id}
                    style={[
                      styles.mapPin,
                      { top: `${topPos}%`, left: `${leftPos}%` },
                      isSelected && styles.mapPinSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedActivity(act)}
                  >
                    <View
                      style={[
                        styles.pinIconCircle,
                        isSelected && { backgroundColor: COLORS.coral },
                      ]}
                    >
                      <Ionicons
                        name="people"
                        size={14}
                        color={isSelected ? '#FFFFFF' : COLORS.purple}
                      />
                    </View>
                    <View style={styles.pinBubble}>
                      <Text style={styles.pinTitle} numberOfLines={1}>
                        {act.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              filteredPlaces.map((pl, index) => {
                const isSelected = selectedPlace?.id === pl.id;
                const topPos = 18 + ((index * 31) % 58);
                const leftPos = 12 + ((index * 41) % 70);

                return (
                  <TouchableOpacity
                    key={pl.id}
                    style={[
                      styles.mapPin,
                      { top: `${topPos}%`, left: `${leftPos}%` },
                      isSelected && styles.mapPinSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedPlace(pl)}
                  >
                    <View
                      style={[
                        styles.pinIconCircle,
                        isSelected && { backgroundColor: COLORS.success },
                      ]}
                    >
                      <Ionicons
                        name="restaurant"
                        size={14}
                        color={isSelected ? '#FFFFFF' : COLORS.success}
                      />
                    </View>
                    <View style={styles.pinBubble}>
                      <Text style={styles.pinTitle} numberOfLines={1}>
                        {pl.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Bottom Card for Selected Pin */}
          <View style={styles.bottomCardWrapper}>
            {mode === 'activities' && selectedActivity ? (
              <View style={styles.selectedCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.hostRow}>
                    <UserAvatar
                      uri={selectedActivity.host?.avatar}
                      name={selectedActivity.host?.name || 'Chủ kèo'}
                      size={40}
                      trustScore={selectedActivity.host?.trustScore || 85}
                    />
                    <View style={styles.hostMeta}>
                      <Text style={styles.hostName}>{selectedActivity.host?.name}</Text>
                      <View style={styles.trustScorePill}>
                        <Ionicons name="shield-checkmark" size={11} color={COLORS.success} />
                        <Text style={styles.trustScoreText}>
                          {selectedActivity.host?.trustScore || 85}đ uy tín
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.slotBadge}>
                    <Ionicons name="people-outline" size={13} color={COLORS.primary} />
                    <Text style={styles.slotText}>
                      {selectedActivity.joinedCount}/{selectedActivity.maxCount} chỗ
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{selectedActivity.title}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>
                      {selectedActivity.time} • {selectedActivity.date}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {selectedActivity.location}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryCtaBtn}
                  activeOpacity={0.88}
                  onPress={() =>
                    onNavigate('activity_detail', { id: selectedActivity.id })
                  }
                >
                  <Text style={styles.primaryCtaText}>Xem chi tiết kèo & tham gia</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : mode === 'places' && selectedPlace ? (
              <View style={styles.selectedCard}>
                <View style={styles.placeHeaderRow}>
                  <Image source={{ uri: selectedPlace.image }} style={styles.placeThumb} />
                  <View style={styles.placeMeta}>
                    <View style={styles.verifiedRow}>
                      <Ionicons name="shield-checkmark" size={13} color={COLORS.success} />
                      <Text style={styles.verifiedLabel}>Zero-Garbage Verified</Text>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {selectedPlace.name}
                    </Text>
                    <Text style={styles.placeAddress} numberOfLines={1}>
                      {selectedPlace.address}, {selectedPlace.district}
                    </Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color="#FFB800" />
                      <Text style={styles.ratingText}>{selectedPlace.rating}</Text>
                      <Text style={styles.reviewCountText}>
                        ({selectedPlace.reviewsCount} đánh giá)
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Luồng C: Contextual Activity Creation */}
                <View style={styles.placeActionRow}>
                  <TouchableOpacity
                    style={styles.secondaryActionBtn}
                    activeOpacity={0.8}
                    onPress={() => onNavigate('review')}
                  >
                    <Ionicons name="star-outline" size={15} color={COLORS.textSecondary} />
                    <Text style={styles.secondaryActionText}>Đánh giá</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryCtaBtn, { flex: 1 }]}
                    activeOpacity={0.88}
                    onPress={() =>
                      onNavigate('create_post', {
                        prefillTitle: `Rủ đi ${selectedPlace.name}`,
                        prefillLocation: `${selectedPlace.name}, ${selectedPlace.district}, Đà Nẵng`,
                      })
                    }
                  >
                    <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.primaryCtaText}>Tạo kèo tại đây</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        /* List View */
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {loading ? (
            <LoadingSkeleton count={3} />
          ) : mode === 'activities' ? (
            filteredActivities.length === 0 ? (
              <EmptyState
                icon="map-outline"
                title="Không tìm thấy kèo nào"
                message="Chưa có kèo nào phù hợp với bộ lọc trong khu vực này. Bạn có muốn tạo kèo mới?"
                actionLabel="Tạo kèo mới"
                onAction={() => onNavigate('create_post')}
              />
            ) : (
              filteredActivities.map((act) => (
                <TouchableOpacity
                  key={act.id}
                  style={styles.listItemCard}
                  activeOpacity={0.85}
                  onPress={() => onNavigate('activity_detail', { id: act.id })}
                >
                  <View style={styles.listItemHeader}>
                    <UserAvatar
                      uri={act.host?.avatar}
                      name={act.host?.name || 'Chủ kèo'}
                      size={36}
                      trustScore={act.host?.trustScore || 85}
                    />
                    <View style={styles.listItemMeta}>
                      <Text style={styles.listItemHost}>{act.host?.name}</Text>
                      <Text style={styles.listItemTime}>
                        {act.time} • {act.date}
                      </Text>
                    </View>
                    <View style={styles.slotBadge}>
                      <Text style={styles.slotText}>
                        {act.joinedCount}/{act.maxCount} chỗ
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.listItemTitle}>{act.title}</Text>
                  <View style={styles.listItemFooter}>
                    <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.listItemLocation}>{act.location}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : filteredPlaces.length === 0 ? (
            <EmptyState
              icon="restaurant-outline"
              title="Không tìm thấy địa điểm"
              message="Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục khác."
            />
          ) : (
            filteredPlaces.map((pl) => (
              <View key={pl.id} style={styles.placeListItem}>
                <Image source={{ uri: pl.image }} style={styles.placeListImg} />
                <View style={styles.placeListInfo}>
                  <View style={styles.verifiedRow}>
                    <Ionicons name="shield-checkmark" size={12} color={COLORS.success} />
                    <Text style={styles.verifiedLabel}>Zero-Garbage</Text>
                  </View>
                  <Text style={styles.placeListName}>{pl.name}</Text>
                  <Text style={styles.placeListAddress}>
                    {pl.address}, {pl.district}
                  </Text>
                  <View style={styles.placeListFooter}>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color="#FFB800" />
                      <Text style={styles.ratingText}>{pl.rating}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.createKeoMiniBtn}
                      activeOpacity={0.8}
                      onPress={() =>
                        onNavigate('create_post', {
                          prefillTitle: `Rủ đi ${pl.name}`,
                          prefillLocation: `${pl.name}, ${pl.district}, Đà Nẵng`,
                        })
                      }
                    >
                      <Ionicons name="people" size={12} color="#FFFFFF" />
                      <Text style={styles.createKeoMiniText}>Tạo kèo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 48,
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.card,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.s,
    color: COLORS.textPrimary,
  },
  viewToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.m,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeTabActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  modeTabText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  categoryChips: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  mapCanvas: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#E2E8F0',
  },
  mapBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.85,
  },
  mapOverlayGrid: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(250, 248, 245, 0.4)',
  },
  cityCenterBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cityCenterText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  mapPinSelected: {
    zIndex: 10,
    transform: [{ scale: 1.1 }],
  },
  pinIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  pinBubble: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.s,
    marginTop: 3,
    maxWidth: 110,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  pinTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 30,
    left: SPACING.m,
    right: SPACING.m,
  },
  selectedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostMeta: {
    gap: 2,
  },
  hostName: {
    fontSize: FONT_SIZES.s,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  trustScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trustScoreText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
  },
  slotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardTitle: {
    fontSize: FONT_SIZES.m,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  primaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.coral,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.l,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.s,
    fontWeight: '700',
  },
  placeHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  placeThumb: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.m,
    resizeMode: 'cover',
  },
  placeMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  verifiedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
  },
  placeAddress: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  reviewCountText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  placeActionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.l,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryActionText: {
    fontSize: FONT_SIZES.s,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  // List view styles
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.m,
  },
  listItemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.m,
    ...SHADOWS.card,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  listItemMeta: {
    flex: 1,
  },
  listItemHost: {
    fontSize: FONT_SIZES.s,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  listItemTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  listItemTitle: {
    fontSize: FONT_SIZES.m,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  listItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listItemLocation: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  placeListItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.m,
    gap: 12,
    ...SHADOWS.card,
  },
  placeListImg: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.m,
  },
  placeListInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  placeListName: {
    fontSize: FONT_SIZES.m,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  placeListAddress: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  placeListFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createKeoMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.coral,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  createKeoMiniText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
