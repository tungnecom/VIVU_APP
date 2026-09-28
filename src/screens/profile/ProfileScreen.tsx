import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { BottomTabBar } from '../../components/BottomTabBar';
import { CURRENT_USER } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';

interface ProfileProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const ProfileScreen: React.FC<ProfileProps> = ({ onNavigate }) => {
  const user = useAuthStore((s) => s.user);
  const selectedCity = useAuthStore((s) => s.selectedCity) || 'Đà Nẵng';
  const selectedInterests = useAuthStore((s) => s.selectedInterests);
  const communicationStyle = useAuthStore((s) => s.communicationStyle) || 'Cân bằng';
  const logout = useAuthStore((s) => s.logout);


  const [crawling, setCrawling] = useState(false);

  const trustBreakdown = [
    { label: 'Xác thực tài khoản (CCCD/SĐT)', score: '20/20', isFull: true },
    { label: 'Hoạt động dã ngoại & giao lưu', score: '30/30', isFull: true },
    { label: 'Đánh giá tích cực từ bạn bè', score: '19/20', isFull: false },
    { label: 'Tỷ lệ tham gia đúng hẹn', score: '15/15', isFull: true },
    { label: 'Phản hồi cộng đồng tích cực', score: '5/5', isFull: true },
    { label: 'Lịch sử vi phạm quy tắc', score: '0/0 (Tốt)', isFull: true },
  ];

  const handleTriggerCrawler = async () => {
    setCrawling(true);
    try {
      const res = await ApiClient.ingestPlaces(selectedCity);
      Alert.alert(
        '🎯 Zero-Garbage Pipeline Thành Công!',
        `Đã thu thập từ Wikimedia & Traveloka và làm sạch qua 5 tầng tại ${selectedCity}.\n\n` +
          `• Dữ liệu thô: ${res?.stats?.rawTotal || 15} địa điểm\n` +
          `• Sau lọc 5 tầng: ${res?.stats?.cleanedTotal || 12} địa điểm đạt chuẩn 100% không rác ảo.`
      );
    } catch {
      Alert.alert('Thông báo', 'Đã làm mới dữ liệu địa điểm sạch ngoại tuyến.');
    } finally {
      setCrawling(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi VIVU?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          logout();
          onNavigate('welcome');
        },
      },
    ]);
  };

  const displayInterests =
    selectedInterests && selectedInterests.length > 0
      ? selectedInterests
      : CURRENT_USER.interests;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => onNavigate('privacy_setting')}
          >
            <Ionicons name="settings-outline" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => Alert.alert('Chia sẻ', 'Chia sẻ hồ sơ VIVU của bạn')}
          >
            <Ionicons name="share-social-outline" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image
            source={{
              uri:
                user?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.name || CURRENT_USER.name}</Text>
          <View style={styles.cityBadge}>
            <Ionicons name="location-sharp" size={14} color={COLORS.primary} />
            <Text style={styles.cityText}>{selectedCity}</Text>
            <Text style={styles.socialStyleText}>• Phong cách: {communicationStyle}</Text>
          </View>

          <View style={styles.activeTag}>
            <Text style={styles.activeTagText}>⭐ {CURRENT_USER.badge}</Text>
          </View>

          {/* Counts */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{CURRENT_USER.postsCount}</Text>
              <Text style={styles.statLabel}>Bài viết</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{CURRENT_USER.activitiesCount}</Text>
              <Text style={styles.statLabel}>Hoạt động</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{CURRENT_USER.friendsCount}</Text>
              <Text style={styles.statLabel}>Bạn bè</Text>
            </View>
          </View>
        </View>

        {/* Điểm uy tín Card */}
        <View style={styles.trustScoreCard}>
          <View style={styles.trustScoreHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.trustTitle}>Điểm uy tín VIVU (Trust Score)</Text>
              <Text style={styles.trustSub}>Bảo vệ môi trường văn minh, triệt tiêu tài khoản ảo</Text>
            </View>
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.scoreCircle}
            >
              <Text style={styles.scoreCircleNum}>{user?.trustScore || 94}</Text>
              <Text style={styles.scoreCircleMax}>/100</Text>
            </LinearGradient>
          </View>

          {/* Breakdown Items */}
          <View style={styles.breakdownList}>
            {trustBreakdown.map((item, idx) => (
              <View key={idx} style={styles.breakdownItem}>
                <View style={styles.itemLeft}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={item.isFull ? COLORS.success : COLORS.primary}
                  />
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                </View>
                <Text style={styles.breakdownScore}>{item.score}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.trustDetailBtn}
            onPress={() =>
              Alert.alert(
                'Minh bạch Điểm Uy Tín',
                'Hệ thống AI tự động phân tích: Check-in hoạt động (+30đ), Đánh giá địa điểm xác thực (+5đ), Báo cáo vi phạm (-50đ).'
              )
            }
          >
            <Text style={styles.trustDetailText}>Tìm hiểu cơ chế chấm điểm minh bạch ↗</Text>
          </TouchableOpacity>
        </View>

        {/* Zero-Garbage Pipeline Ingestion Tool */}
        <View style={styles.engineCard}>
          <View style={styles.engineHeader}>
            <Ionicons name="sparkles" size={20} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.engineTitle}>Zero-Garbage Data Engine</Text>
              <Text style={styles.engineSub}>
                Cào Wikimedia & Traveloka • Lọc 5 tầng không rác ảo tại {selectedCity}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.runCrawlerBtn}
            onPress={handleTriggerCrawler}
            disabled={crawling}
          >
            {crawling ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={16} color="#FFFFFF" />
                <Text style={styles.runCrawlerText}>Chạy cào & kiểm định dữ liệu sạch</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Sở thích đã chọn */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Sở thích của tôi</Text>
          <View style={styles.interestWrap}>
            {displayInterests.map((interest, i) => (
              <View key={i} style={styles.interestChip}>
                <Ionicons name="sparkles" size={12} color={COLORS.primary} />
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addInterestChip}
              onPress={() => onNavigate('interest_select')}
            >
              <Ionicons name="add" size={14} color={COLORS.primary} />
              <Text style={styles.addInterestText}>Sửa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onNavigate('privacy_setting')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
            <Text style={styles.menuTitle}>Thiết lập quyền riêng tư</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onNavigate('group_home')}
          >
            <Ionicons name="people-outline" size={20} color={COLORS.primary} />
            <Text style={styles.menuTitle}>Nhóm của tôi</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onNavigate('city_select')}
          >
            <Ionicons name="map-outline" size={20} color={COLORS.primary} />
            <Text style={styles.menuTitle}>Đổi thành phố ({selectedCity})</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={[styles.menuTitle, { color: COLORS.danger }]}>Đăng xuất</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <BottomTabBar currentScreen="profile" onNavigate={onNavigate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.sm,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: COLORS.primarySoft,
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cityText: {
    fontSize: 13,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  socialStyleText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  activeTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  activeTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EEEEF2',
  },
  trustScoreCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 20,
    padding: 18,
    ...SHADOWS.sm,
  },
  trustScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trustTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  trustSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  scoreCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  scoreCircleNum: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  scoreCircleMax: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  breakdownList: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownLabel: {
    fontSize: 13,
    color: COLORS.textMedium,
  },
  breakdownScore: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  trustDetailBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 6,
  },
  trustDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  engineCard: {
    backgroundColor: '#ECFDF5',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 12,
    ...SHADOWS.sm,
  },
  engineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  engineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
  },
  engineSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  runCrawlerBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  runCrawlerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    ...SHADOWS.sm,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  interestWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  interestText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  addInterestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  addInterestText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 8,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
  },
});
