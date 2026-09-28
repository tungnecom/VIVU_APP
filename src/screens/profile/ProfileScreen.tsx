import React from 'react';
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
import { BottomTabBar } from '../../components/BottomTabBar';
import { CURRENT_USER } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface ProfileProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const ProfileScreen: React.FC<ProfileProps> = ({ onNavigate }) => {
  const trustBreakdown = [
    { label: 'Xác thực tài khoản (CCCD/SĐT)', score: '20/20', isFull: true },
    { label: 'Hoạt động dã ngoại & giao lưu', score: '30/30', isFull: true },
    { label: 'Đánh giá tích cực từ bạn bè', score: '19/20', isFull: false },
    { label: 'Tỷ lệ tham gia đúng hẹn', score: '14/15', isFull: false },
    { label: 'Phản hồi cộng đồng tích cực', score: '5/5', isFull: true },
    { label: 'Lịch sử vi phạm quy tắc', score: '0/0 (Tốt)', isFull: true },
  ];

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
          <Image source={{ uri: CURRENT_USER.avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{CURRENT_USER.name}</Text>
          <View style={styles.cityBadge}>
            <Ionicons name="location-sharp" size={14} color={COLORS.primary} />
            <Text style={styles.cityText}>{CURRENT_USER.city}</Text>
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

        {/* Điểm uy tín Card (Key Feature of VIVU UI) */}
        <View style={styles.trustScoreCard}>
          <View style={styles.trustScoreHeader}>
            <View>
              <Text style={styles.trustTitle}>Điểm uy tín VIVU</Text>
              <Text style={styles.trustSub}>Độ tin cậy được cộng đồng đánh giá cao</Text>
            </View>
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.scoreCircle}
            >
              <Text style={styles.scoreCircleNum}>{CURRENT_USER.trustScore}</Text>
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
            onPress={() => Alert.alert('Điểm uy tín', 'Điểm uy tín tăng khi bạn tham gia đúng hẹn, được đánh giá 5 sao và hoàn thành xác thực!')}
          >
            <Text style={styles.trustDetailText}>Tìm hiểu cách tính điểm uy tín ↗</Text>
          </TouchableOpacity>
        </View>

        {/* Sở thích đã chọn */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Sở thích của tôi</Text>
          <View style={styles.interestWrap}>
            {CURRENT_USER.interests.map((interest, i) => (
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
              <Text style={styles.addInterestText}>Thêm</Text>
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
            onPress={() => onNavigate('welcome')}
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
    fontWeight: '500',
  },
  activeTag: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 8,
  },
  activeTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
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
    height: '60%',
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
  },
  trustScoreCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 20,
    ...SHADOWS.sm,
  },
  trustScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trustTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  trustSub: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow,
  },
  scoreCircleNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  scoreCircleMax: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
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
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 13,
    color: COLORS.textDark,
  },
  breakdownScore: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  trustDetailBtn: {
    marginTop: 14,
    alignSelf: 'center',
    paddingVertical: 4,
  },
  trustDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
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
    gap: 6,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  interestText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  addInterestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  addInterestText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 8,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    gap: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
});
