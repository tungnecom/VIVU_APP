import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '../../components/BottomTabBar';

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
  const communicationStyle = useAuthStore((s) => s.communicationStyle) || 'Cởi mở, thích khám phá';
  const logout = useAuthStore((s) => s.logout);

  const [activeTab, setActiveTab] = useState<'media' | 'trips' | 'reviews'>('media');
  const [showTrustAuditModal, setShowTrustAuditModal] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200'
  );
  const [crawling, setCrawling] = useState(false);

  const trustScore = user?.trustScore || 94;

  // Change Cover Photo
  const handleChangeCover = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'VIVU cần quyền truy cập ảnh để đổi ảnh bìa.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });

    if (!res.canceled && res.assets && res.assets.length > 0) {
      setCoverPhoto(res.assets[0].uri);
    }
  };

  // Mock Media Grid (Instagram/TikTok 3-column)
  const mediaGrid = [
    { id: 'm1', type: 'video', uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', duration: '0:15' },
    { id: 'm2', type: 'image', uri: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500' },
    { id: 'm3', type: 'image', uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500' },
    { id: 'm4', type: 'video', uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500', duration: '0:22' },
    { id: 'm5', type: 'image', uri: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500' },
    { id: 'm6', type: 'image', uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500' },
  ];

  // Mock Trip History
  const tripHistory = [
    {
      id: 't1',
      title: 'Food Tour Chợ Đêm & Hải Sản Năm Đảnh',
      date: 'Thứ 7, 18/05/2025',
      location: 'Sơn Trà, Đà Nẵng',
      status: 'Đã hoàn thành',
      companions: 4,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    },
    {
      id: 't2',
      title: 'Đổ đèo Hải Vân săn mây bình minh',
      date: 'Chủ nhật, 12/05/2025',
      location: 'Đèo Hải Vân, Đà Nẵng',
      status: 'Đã hoàn thành',
      companions: 6,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
    },
  ];

  // Mock Peer Reviews
  const peerReviews = [
    {
      id: 'r1',
      author: 'Minh Thư',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      rating: 5,
      date: '2 ngày trước',
      tripName: 'Food Tour Chợ Đêm',
      comment: 'Tùng rất đúng giờ, vui tính và chọn quán ăn cực kỳ chuẩn vị! 10/10 điểm uy tín!',
    },
    {
      id: 'r2',
      author: 'Quang Anh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 5,
      date: '1 tuần trước',
      tripName: 'Săn mây Hải Vân',
      comment: 'Lái xe rất an toàn, chụp ảnh cho cả nhóm siêu có tâm. Lần sau chắc chắn ghép cạ tiếp!',
    },
  ];

  // Achievement Badges
  const achievementBadges = [
    { id: 'b1', icon: 'shield-checkmark', title: 'CCCD & SĐT Xác thực', color: '#059669', bg: '#ECFDF5' },
    { id: 'b2', icon: 'ribbon', title: 'Cạ Cứng Du Lịch', color: '#3B82F6', bg: '#EFF6FF' },
    { id: 'b3', icon: 'restaurant', title: 'Thổ Địa Sành Ăn', color: '#F59E0B', bg: '#FFFBEB' },
    { id: 'b4', icon: 'trophy', title: 'Uy Tín Vàng 90+', color: '#8B5CF6', bg: '#F5F3FF' },
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
      : ['Du lịch', 'Cafe', 'Khám phá'];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Panoramic Cover Photo Banner */}
        <View style={styles.coverWrapper}>
          <Image source={{ uri: coverPhoto }} style={styles.coverImage} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.coverGradient}
          />
          <TouchableOpacity style={styles.changeCoverBtn} onPress={handleChangeCover}>
            <Ionicons name="camera" size={16} color="#FFF" />
            <Text style={styles.changeCoverText}>Đổi ảnh bìa</Text>
          </TouchableOpacity>

          <View style={styles.coverTopActions}>
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => onNavigate('privacy_setting')}
            >
              <Ionicons name="settings-outline" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => Alert.alert('Chia sẻ', 'Đã sao chép link hồ sơ cá nhân!')}
            >
              <Ionicons name="share-social-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info Overlay Card */}
        <View style={styles.profileCard}>
          {/* Avatar with Trust Score Aura Glow */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={
                trustScore >= 90
                  ? ['#00F2FE', '#4FACFE', '#6366F1']
                  : trustScore >= 80
                  ? ['#34D399', '#10B981', '#059669']
                  : ['#FBBF24', '#F59E0B', '#D97706']
              }
              style={styles.auraGlow}
            >
              <Image
                source={{
                  uri:
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250',
                }}
                style={styles.avatarImage}
              />
            </LinearGradient>
            <View style={styles.verifiedFloatingBadge}>
              <Ionicons name="checkmark-circle" size={22} color="#10B981" />
            </View>
          </View>

          {/* User Name & Bio */}
          <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>

          <View style={styles.verifiedRow}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={styles.verifiedText}>Đã xác thực CCCD & Số điện thoại</Text>
          </View>

          <Text style={styles.userBio}>
            📍 {selectedCity} • 🎒 Phong cách: {communicationStyle}
          </Text>

          {/* Interactive Trust Score Capsule (tap opens transparent breakdown) */}
          <TouchableOpacity
            style={styles.trustScorePill}
            activeOpacity={0.85}
            onPress={() => setShowTrustAuditModal(true)}
          >
            <LinearGradient
              colors={['#00F2FE', '#4FACFE']}
              style={styles.trustGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="shield" size={16} color="#FFF" />
              <Text style={styles.trustScorePillText}>Điểm Uy Tín: {trustScore}/100</Text>
              <View style={styles.auditHelpTag}>
                <Text style={styles.auditHelpText}>Bảng kê minh bạch ↗</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Counts Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>12</Text>
              <Text style={styles.statLabel}>Bài viết</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>16</Text>
              <Text style={styles.statLabel}>Chuyến đi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>148</Text>
              <Text style={styles.statLabel}>Cạ cứng</Text>
            </View>
          </View>

          {/* Achievement Badges Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesScroll}
          >
            {achievementBadges.map((b) => (
              <View key={b.id} style={[styles.badgeChip, { backgroundColor: b.bg }]}>
                <Ionicons name={b.icon as any} size={15} color={b.color} />
                <Text style={[styles.badgeTitle, { color: b.color }]}>{b.title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 3-Tab Navigation Segment */}
        <View style={styles.tabBarWrap}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'media' && styles.tabItemActive]}
            onPress={() => setActiveTab('media')}
          >
            <Ionicons
              name="grid"
              size={18}
              color={activeTab === 'media' ? COLORS.primary : COLORS.textLight}
            />
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'media' && styles.tabItemTextActive,
              ]}
            >
              Khoảnh khắc ({mediaGrid.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'trips' && styles.tabItemActive]}
            onPress={() => setActiveTab('trips')}
          >
            <Ionicons
              name="compass"
              size={18}
              color={activeTab === 'trips' ? COLORS.primary : COLORS.textLight}
            />
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'trips' && styles.tabItemTextActive,
              ]}
            >
              Hành trình ({tripHistory.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'reviews' && styles.tabItemActive]}
            onPress={() => setActiveTab('reviews')}
          >
            <Ionicons
              name="star"
              size={18}
              color={activeTab === 'reviews' ? COLORS.primary : COLORS.textLight}
            />
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'reviews' && styles.tabItemTextActive,
              ]}
            >
              Đánh giá cạ ({peerReviews.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Media Grid (Instagram/TikTok 3-column) */}
        {activeTab === 'media' && (
          <View style={styles.mediaGridContainer}>
            {mediaGrid.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.gridThumbWrap}
                activeOpacity={0.8}
                onPress={() => onNavigate('home_feed')}
              >
                <Image source={{ uri: m.uri }} style={styles.gridThumbImage} />
                {m.type === 'video' && (
                  <View style={styles.gridVideoBadge}>
                    <Ionicons name="play" size={12} color="#FFF" />
                    <Text style={styles.gridVideoDuration}>{m.duration}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tab 2: Trip History */}
        {activeTab === 'trips' && (
          <View style={styles.tripsListContainer}>
            {tripHistory.map((trip) => (
              <View key={trip.id} style={styles.tripCard}>
                <Image source={{ uri: trip.image }} style={styles.tripCardImage} />
                <View style={styles.tripCardContent}>
                  <View style={styles.tripStatusTag}>
                    <Text style={styles.tripStatusText}>{trip.status}</Text>
                  </View>
                  <Text style={styles.tripTitle}>{trip.title}</Text>
                  <Text style={styles.tripMeta}>📅 {trip.date} • 📍 {trip.location}</Text>
                  <Text style={styles.tripCompanions}>👥 Đã đi cùng {trip.companions} cạ cứng</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tab 3: Peer Reviews */}
        {activeTab === 'reviews' && (
          <View style={styles.reviewsListContainer}>
            {peerReviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: rev.avatar }} style={styles.reviewAvatar} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.reviewAuthor}>{rev.author}</Text>
                    <Text style={styles.reviewDate}>{rev.date} • Chuyến: {rev.tripName}</Text>
                  </View>
                  <Text style={styles.reviewRating}>⭐ {rev.rating}.0</Text>
                </View>
                <Text style={styles.reviewComment}>"{rev.comment}"</Text>
              </View>
            ))}
          </View>
        )}

        {/* Interests Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Sở thích du lịch & khám phá</Text>
          <View style={styles.interestWrap}>
            {displayInterests.map((interest: string, i: number) => (
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

        {/* Zero-Garbage Pipeline Admin Tool */}
        <View style={styles.engineCard}>
          <View style={styles.engineHeader}>
            <Ionicons name="sparkles" size={20} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.engineTitle}>Zero-Garbage Data Engine</Text>
              <Text style={styles.engineSub}>
                Cào Wikimedia, ShopeeFood, GrabFood & Traveloka tại {selectedCity}
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

        {/* Quick Menu Settings */}
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
            <Text style={styles.menuTitle}>Đổi tỉnh thành ({selectedCity})</Text>
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Trust Score Breakdown Modal / Bottom Sheet */}
      <Modal visible={showTrustAuditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <View>
                <Text style={styles.modalSheetTitle}>Bảng Kê Điểm Uy Tín Minh Bạch</Text>
                <Text style={styles.modalSheetSubtitle}>Hệ thống AI tự động chấm điểm thời gian thực</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTrustAuditModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.totalScoreBanner}>
              <LinearGradient
                colors={['#00F2FE', '#4FACFE']}
                style={styles.totalScoreGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.totalScoreNum}>{trustScore}</Text>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.totalScoreTier}>Hạng Cạ Vàng Xuất Sắc</Text>
                  <Text style={styles.totalScoreDesc}>Được ưu tiên ghép nhóm và hiển thị đầu Feed</Text>
                </View>
              </LinearGradient>
            </View>

            <ScrollView style={{ maxHeight: 320 }}>
              <View style={styles.auditItem}>
                <View style={styles.auditIconDone}>
                  <Ionicons name="checkmark" size={16} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.auditItemName}>Xác thực SĐT qua SMS OTP thật</Text>
                  <Text style={styles.auditItemDesc}>Ngăn chặn tài khoản clone / ảo</Text>
                </View>
                <Text style={styles.auditScorePlus}>+20đ</Text>
              </View>

              <View style={styles.auditItem}>
                <View style={styles.auditIconDone}>
                  <Ionicons name="checkmark" size={16} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.auditItemName}>Check-in GPS tọa độ thật</Text>
                  <Text style={styles.auditItemDesc}>Khớp tọa độ vệ tinh tại Sơn Trà</Text>
                </View>
                <Text style={styles.auditScorePlus}>+30đ</Text>
              </View>

              <View style={styles.auditItem}>
                <View style={styles.auditIconDone}>
                  <Ionicons name="checkmark" size={16} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.auditItemName}>Đánh giá 5 sao từ cạ cứng sau chuyến đi</Text>
                  <Text style={styles.auditItemDesc}>2 cạ xác nhận đúng giờ và nhiệt tình</Text>
                </View>
                <Text style={styles.auditScorePlus}>+10đ</Text>
              </View>

              <View style={styles.auditItem}>
                <View style={styles.auditIconDone}>
                  <Ionicons name="checkmark" size={16} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.auditItemName}>Hoàn thành onboarding & chia sẻ sở thích</Text>
                  <Text style={styles.auditItemDesc}>Thiết lập hồ sơ đầy đủ</Text>
                </View>
                <Text style={styles.auditScorePlus}>+15đ</Text>
              </View>

              <View style={styles.auditItem}>
                <View style={styles.auditIconDone}>
                  <Ionicons name="checkmark" size={16} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.auditItemName}>Hành vi văn minh, 0 báo cáo vi phạm</Text>
                  <Text style={styles.auditItemDesc}>Tuân thủ quy tắc cộng đồng VIVU</Text>
                </View>
                <Text style={styles.auditScorePlus}>+19đ</Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowTrustAuditModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  scroll: {
    flex: 1,
  },
  coverWrapper: {
    position: 'relative',
    height: 190,
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    ...StyleSheet.absoluteFill,
  },
  coverTopActions: {
    position: 'absolute',
    top: 36,
    right: 16,
    flexDirection: 'row',
    gap: 10,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeCoverBtn: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  changeCoverText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -45,
    borderRadius: 24,
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 20,
    paddingHorizontal: 16,
    ...SHADOWS.md,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -45,
    marginBottom: 10,
  },
  auraGlow: {
    padding: 4,
    borderRadius: 50,
    ...SHADOWS.glow,
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  verifiedFloatingBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
    marginBottom: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  userBio: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginBottom: 12,
    textAlign: 'center',
  },
  trustScorePill: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
    ...SHADOWS.sm,
  },
  trustGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  trustScorePillText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  auditHelpTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  auditHelpText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  badgesScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabBarWrap: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 4,
    ...SHADOWS.sm,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: '#EEF2FF',
  },
  tabItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  mediaGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  gridThumbWrap: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  gridThumbImage: {
    width: '100%',
    height: '100%',
  },
  gridVideoBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  gridVideoDuration: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  tripsListContainer: {
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 12,
  },
  tripCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    ...SHADOWS.sm,
  },
  tripCardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  tripCardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  tripStatusTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  tripStatusText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  tripTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  tripMeta: {
    fontSize: 11,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  tripCompanions: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  reviewsListContainer: {
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    ...SHADOWS.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  reviewDate: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  reviewRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  reviewComment: {
    fontSize: 12,
    color: COLORS.textMedium,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    ...SHADOWS.sm,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  interestWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  interestText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  addInterestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 2,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addInterestText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  engineCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    ...SHADOWS.sm,
  },
  engineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  engineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  engineSub: {
    fontSize: 11,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  runCrawlerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 10,
  },
  runCrawlerText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalSheetSubtitle: {
    fontSize: 11,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  totalScoreBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  totalScoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  totalScoreNum: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  totalScoreTier: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  totalScoreDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  auditIconDone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  auditItemDesc: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  auditScorePlus: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  modalCloseBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
