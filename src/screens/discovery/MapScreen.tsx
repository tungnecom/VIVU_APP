import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MAP_LOCATIONS } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface MapScreenProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({ onNavigate }) => {
  const [filter, setFilter] = useState<'places' | 'activities' | 'friends'>('places');
  const [selectedSpot, setSelectedSpot] = useState(MAP_LOCATIONS[0]);

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

        {/* Map Location Pins */}
        <TouchableOpacity
          style={[styles.pinWrapper, { top: '25%', left: '60%' }]}
          onPress={() => setSelectedSpot(MAP_LOCATIONS[0])}
        >
          <View style={[styles.pinBadge, selectedSpot.id === 'loc_1' && styles.pinBadgeActive]}>
            <Ionicons name="location" size={16} color="#FFF" />
            <Text style={styles.pinText}>Sơn Trà</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pinWrapper, { top: '48%', left: '42%' }]}
          onPress={() => setSelectedSpot(MAP_LOCATIONS[1])}
        >
          <View style={[styles.pinBadge, selectedSpot.id === 'loc_2' && styles.pinBadgeActive]}>
            <Ionicons name="flame" size={16} color="#FFF" />
            <Text style={styles.pinText}>Cầu Rồng</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pinWrapper, { top: '65%', left: '70%' }]}
          onPress={() => setSelectedSpot(MAP_LOCATIONS[2])}
        >
          <View style={[styles.pinBadge, selectedSpot.id === 'loc_3' && styles.pinBadgeActive]}>
            <Ionicons name="water" size={16} color="#FFF" />
            <Text style={styles.pinText}>Biển Mỹ Khê</Text>
          </View>
        </TouchableOpacity>
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
              placeholder="Tìm quanh đây (quán cafe, bãi biển...)"
              placeholderTextColor={COLORS.textLight}
            />
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
              Địa điểm
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
              Bạn bè
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Floating Location Card */}
      <View style={styles.bottomCardWrapper}>
        <View style={styles.spotCard}>
          <Image source={{ uri: selectedSpot.image }} style={styles.spotThumb} />
          <View style={styles.spotInfo}>
            <View style={styles.spotHeader}>
              <Text style={styles.spotName}>{selectedSpot.name}</Text>
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
                <Text style={styles.reviewBtnText}>Đánh giá &amp; Review</Text>
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinBadgeActive: {
    backgroundColor: '#EF4444',
  },
  pinText: {
    color: '#FFFFFF',
    fontSize: 12,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
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
    paddingVertical: 5,
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
    paddingVertical: 5,
    borderRadius: 10,
  },
  detailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
});
