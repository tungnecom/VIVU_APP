import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '../../components/BottomTabBar';
import { MOCK_ACTIVITY } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface MatchHomeProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const MatchHomeScreen: React.FC<MatchHomeProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState('Ăn uống');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Ăn uống', icon: 'restaurant-outline' },
    { name: 'Đi dạo', icon: 'walk-outline' },
    { name: 'Camping', icon: 'bonfire-outline' },
    { name: 'Cafe', icon: 'cafe-outline' },
    { name: 'Photography', icon: 'camera-outline' },
    { name: 'Chill', icon: 'sparkles-outline' },
    { name: 'Gaming', icon: 'game-controller-outline' },
    { name: 'Sport', icon: 'football-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Match</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => onNavigate('map')}
            >
              <Ionicons name="map-outline" size={20} color={COLORS.textDark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => onNavigate('message_home')}
            >
              <Ionicons name="chatbubbles-outline" size={20} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bạn cùng đi đâu? (Đà Nẵng, Hội An...)"
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Categories Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat, i) => {
            const isActive = activeCategory === cat.name;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
                onPress={() => setActiveCategory(cat.name)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={isActive ? '#FFFFFF' : COLORS.textDark}
                />
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gợi ý dành cho bạn</Text>
          <TouchableOpacity onPress={() => onNavigate('home_feed')}>
            <Text style={styles.seeMoreText}>Xem thêm &gt;</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Card 1 */}
        <TouchableOpacity
          style={styles.matchCard}
          activeOpacity={0.9}
          onPress={() => onNavigate('activity_detail')}
        >
          <View style={styles.cardImageWrap}>
            <Image source={{ uri: MOCK_ACTIVITY.image }} style={styles.cardImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.65)']}
              style={styles.gradientOverlay}
            />
            <View style={styles.cardRatingBadge}>
              <Text style={styles.ratingText}>⭐ {MOCK_ACTIVITY.rating} (56)</Text>
            </View>
            <View style={styles.locationChip}>
              <Ionicons name="location" size={12} color="#FFF" />
              <Text style={styles.locationChipText}>{MOCK_ACTIVITY.location}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{MOCK_ACTIVITY.title}</Text>
            <Text style={styles.cardTime}>
              📅 {MOCK_ACTIVITY.date} • {MOCK_ACTIVITY.time}
            </Text>

            <View style={styles.cardTagsRow}>
              {MOCK_ACTIVITY.tags.map((t, i) => (
                <View key={i} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.participantsRow}
                onPress={() => onNavigate('participant_list')}
              >
                <View style={styles.avatarStack}>
                  {MOCK_ACTIVITY.participants.slice(0, 3).map((p, pIdx) => (
                    <Image
                      key={p.id}
                      source={{ uri: p.avatar }}
                      style={[styles.stackAvatar, { left: pIdx * 16 }]}
                    />
                  ))}
                </View>
                <Text style={styles.participantsText}>
                  {MOCK_ACTIVITY.joinedCount}/{MOCK_ACTIVITY.maxCount} tham gia
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.joinBtn}
                onPress={() => onNavigate('activity_detail')}
              >
                <Text style={styles.joinBtnText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Activity Card 2: Sunset Son Tra */}
        <TouchableOpacity
          style={styles.matchCard}
          activeOpacity={0.9}
          onPress={() => onNavigate('activity_detail')}
        >
          <View style={styles.cardImageWrap}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
              }}
              style={styles.cardImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.65)']}
              style={styles.gradientOverlay}
            />
            <View style={styles.cardRatingBadge}>
              <Text style={styles.ratingText}>⭐ 4.9 (42)</Text>
            </View>
            <View style={styles.locationChip}>
              <Ionicons name="location" size={12} color="#FFF" />
              <Text style={styles.locationChipText}>Bán đảo Sơn Trà</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Săn hoàng hôn đỉnh Bàn Cờ</Text>
            <Text style={styles.cardTime}>📅 Chủ nhật, 26/05 • 16:00 - 19:30</Text>

            <View style={styles.cardTagsRow}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>Phượt xe máy</Text>
              </View>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>Hoàng hôn</Text>
              </View>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>Săn mây</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.participantsRow}>
                <Text style={styles.participantsText}>3/6 người đã tham gia</Text>
              </View>
              <TouchableOpacity
                style={styles.joinBtn}
                onPress={() => onNavigate('activity_detail')}
              >
                <Text style={styles.joinBtnText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <BottomTabBar currentScreen="match_home" onNavigate={onNavigate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textDark,
  },
  scroll: {
    flex: 1,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  seeMoreText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardImageWrap: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  cardRatingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  locationChip: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  locationChipText: {
    color: '#FFF',
    fontSize: 12,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 13,
    color: COLORS.textMedium,
    marginBottom: 10,
  },
  cardTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textMedium,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarStack: {
    width: 60,
    height: 26,
    position: 'relative',
  },
  stackAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#FFF',
    position: 'absolute',
  },
  participantsText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  joinBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  joinBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
