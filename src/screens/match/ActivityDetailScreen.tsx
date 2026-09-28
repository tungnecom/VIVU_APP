import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { MOCK_ACTIVITY } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useActivityStore } from '../../stores/activityStore';
import { ScreenKey } from '../../types';


interface ActivityDetailProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const ActivityDetailScreen: React.FC<ActivityDetailProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'desc' | 'members' | 'chat'>('desc');
  const isJoined = useActivityStore((state) => state.isJoined);
  const toggleJoinActivity = useActivityStore((state) => state.toggleJoinActivity);
  const activity = useActivityStore((state) => state.currentActivity);

  const handleJoin = () => {
    toggleJoinActivity();
    Alert.alert(
      isJoined ? 'Đã hủy tham gia' : 'Thành công!',
      isJoined
        ? 'Bạn đã rời khỏi hoạt động này.'
        : `Bạn đã đăng ký tham gia "${activity.title}"! Hãy chuẩn bị đúng giờ nhé 🎉`
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Chi tiết hoạt động"
        onBack={() => onNavigate('match_home')}
        rightIcon="share-social-outline"
        onRightPress={() => Alert.alert('Chia sẻ', 'Đã sao chép liên kết hoạt động!')}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: MOCK_ACTIVITY.image }} style={styles.bannerImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={styles.bannerOverlay}
          />
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>⭐ {MOCK_ACTIVITY.rating} (56 đánh giá)</Text>
          </View>
        </View>

        {/* Title & Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.activityTitle}>{MOCK_ACTIVITY.title}</Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
              <View>
                <Text style={styles.metaLabel}>Thời gian</Text>
                <Text style={styles.metaValue}>{MOCK_ACTIVITY.time}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.metaItem}
              onPress={() => onNavigate('map')}
            >
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              <View>
                <Text style={styles.metaLabel}>Địa điểm</Text>
                <Text style={styles.metaValue}>{MOCK_ACTIVITY.location} ↗</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.metaItem}
              onPress={() => onNavigate('participant_list')}
            >
              <Ionicons name="people-outline" size={18} color={COLORS.primary} />
              <View>
                <Text style={styles.metaLabel}>Số người</Text>
                <Text style={styles.metaValue}>
                  {MOCK_ACTIVITY.joinedCount + (isJoined ? 1 : 0)}/{MOCK_ACTIVITY.maxCount} thành viên
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Host Card */}
          <TouchableOpacity
            style={styles.hostCard}
            onPress={() => onNavigate('profile')}
          >
            <Image source={{ uri: MOCK_ACTIVITY.host.avatar }} style={styles.hostAvatar} />
            <View style={styles.hostInfo}>
              <Text style={styles.hostRole}>Tổ chức bởi</Text>
              <Text style={styles.hostName}>{MOCK_ACTIVITY.host.name}</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
              <Text style={styles.trustScore}>{MOCK_ACTIVITY.host.trustScore} điểm uy tín</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'desc' && styles.tabBtnActive]}
            onPress={() => setActiveTab('desc')}
          >
            <Text style={[styles.tabText, activeTab === 'desc' && styles.tabTextActive]}>
              Mô tả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'members' && styles.tabBtnActive]}
            onPress={() => setActiveTab('members')}
          >
            <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
              Người tham gia ({MOCK_ACTIVITY.participants.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'chat' && styles.tabBtnActive]}
            onPress={() => onNavigate('personal_chat')}
          >
            <Text style={styles.tabText}>Trao đổi (Chat)</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'desc' ? (
          <View style={styles.tabContent}>
            <Text style={styles.descParagraph}>{MOCK_ACTIVITY.description}</Text>

            {/* Tags */}
            <View style={styles.tagsWrap}>
              {MOCK_ACTIVITY.tags.map((t, i) => (
                <View key={i} style={styles.tagBadge}>
                  <Text style={styles.tagText}>#{t}</Text>
                </View>
              ))}
            </View>

            {/* Mini Map Preview */}
            <Text style={styles.sectionHeading}>Bản đồ lộ trình</Text>
            <TouchableOpacity
              style={styles.miniMapCard}
              activeOpacity={0.85}
              onPress={() => onNavigate('map')}
            >
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600',
                }}
                style={styles.miniMapImg}
              />
              <View style={styles.miniMapPin}>
                <Ionicons name="location" size={24} color={COLORS.danger} />
              </View>
              <View style={styles.mapClickBanner}>
                <Text style={styles.mapClickText}>Chạm để xem bản đồ tương tác ↗</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tabContent}>
            {MOCK_ACTIVITY.participants.map((p) => (
              <View key={p.id} style={styles.memberItem}>
                <Image source={{ uri: p.avatar }} style={styles.memberAvatar} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{p.name}</Text>
                  <Text style={styles.memberRole}>{p.role || 'Thành viên'}</Text>
                </View>
                <View style={styles.memberTrustBadge}>
                  <Text style={styles.memberTrustText}>{p.trustScore} điểm</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.chatActionBtn}
          onPress={() => onNavigate('personal_chat')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
          <Text style={styles.chatActionText}>Trao đổi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.joinPrimaryBtn}
          activeOpacity={0.85}
          onPress={handleJoin}
        >
          <LinearGradient
            colors={
              isJoined
                ? ['#10B981', '#059669']
                : COLORS.primaryGradient
            }
            style={styles.joinGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons
              name={isJoined ? 'checkmark-circle' : 'person-add'}
              size={18}
              color="#FFF"
            />
            <Text style={styles.joinText}>
              {isJoined ? 'Đã tham gia (Hủy)' : 'Tham gia'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  bannerContainer: {
    height: 240,
    width: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
  },
  bannerBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  bannerBadgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 16,
  },
  metaGrid: {
    gap: 12,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#EEEEF2',
  },
  hostAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  hostInfo: {
    flex: 1,
  },
  hostRole: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  hostName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  trustScore: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF2',
    paddingHorizontal: 20,
  },
  tabBtn: {
    paddingVertical: 14,
    marginRight: 24,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabContent: {
    padding: 20,
  },
  descParagraph: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textDark,
    marginBottom: 16,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  miniMapCard: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#EEEEF2',
  },
  miniMapImg: {
    width: '100%',
    height: '100%',
  },
  miniMapPin: {
    position: 'absolute',
    top: '35%',
    left: '48%',
  },
  mapClickBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  mapClickText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  memberRole: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  memberTrustBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  memberTrustText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: 6,
  },
  chatActionText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  joinPrimaryBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  joinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  joinText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
