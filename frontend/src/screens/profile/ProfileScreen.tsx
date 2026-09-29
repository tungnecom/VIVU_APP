import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { EmptyState, LoadingSkeleton } from '../../components/common/StateView';
import { KeoActivityItem, KeoCard } from '../../components/common/KeoCard';
import { UserAvatar } from '../../components/common/UserAvatar';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { PostItem, ScreenKey } from '../../types';

interface ProfileScreenProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
  showBottomBar?: boolean;
}

const AVAILABLE_INTERESTS = [
  'Cà phê',
  'Ẩm thực',
  'Du lịch',
  'Camping',
  'Nhiếp ảnh',
  'Thể thao',
  'Chạy bộ',
  'Leo núi',
  'Board game',
  'Âm nhạc',
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);

  const [activeTab, setActiveTab] = useState<'activities' | 'posts' | 'about'>('activities');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Activities & Posts lists
  const [myActivities, setMyActivities] = useState<KeoActivityItem[]>([]);
  const [myPosts, setMyPosts] = useState<PostItem[]>([]);

  // Modals
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(
    'Yêu thích cà phê sáng, khám phá ẩm thực đường phố và ngắm hoàng hôn Đà Nẵng.'
  );
  const [editCity, setEditCity] = useState(user?.city || 'Đà Nẵng');
  const [editInterests, setEditInterests] = useState<string[]>(
    user?.interests && user.interests.length > 0 ? user.interests : ['Cà phê', 'Ẩm thực', 'Camping']
  );
  const [coverPhoto, setCoverPhoto] = useState(
    user?.coverPhoto || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200'
  );

  const trustScore = user?.trustScore || 94;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch user activities
      const actRes = await ApiClient.getActivities(user?.city || 'Đà Nẵng');
      if (actRes?.success && Array.isArray(actRes.data)) {
        const mapped: KeoActivityItem[] = actRes.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category || 'Ăn uống',
          location: item.location || 'Hải Châu, Đà Nẵng',
          district: item.district,
          time: item.time || '18:00',
          date: item.date || 'Hôm nay',
          joined: item.joinedCount || item.joined || 1,
          maxParticipants: item.maxCount || item.maxParticipants || 4,
          image: item.image,
          host: {
            id: item.host?.id,
            name: item.host?.name || 'Thành viên Vivu',
            avatar: item.host?.avatar,
            trustScore: item.host?.trustScore || 85,
            isVerified: item.host?.isVerified !== false,
          },
          matchReason: 'Kèo của bạn',
        }));
        const filtered = mapped.filter(
          (a) =>
            a.host?.id === user?.id ||
            a.host?.name === user?.name
        );
        setMyActivities(filtered.length > 0 ? filtered : mapped.slice(0, 3));
      }

      // Fetch user posts
      const feedRes = await ApiClient.getFeed();
      if (feedRes?.success && Array.isArray(feedRes.data)) {
        const filteredPosts = feedRes.data.filter(
          (p: PostItem) => p.author?.id === user?.id || p.author?.name === user?.name
        );
        setMyPosts(filteredPosts.length > 0 ? filteredPosts : feedRes.data.slice(0, 2));
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Change Cover Photo
  const handleChangeCover = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'VIVU cần quyền truy cập thư viện ảnh để đổi ảnh bìa.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });

    if (!res.canceled && res.assets && res.assets.length > 0) {
      const uri = res.assets[0].uri;
      setCoverPhoto(uri);
      updateUser({ coverPhoto: uri });
    }
  };

  // Save Profile edits
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Lỗi', 'Tên hiển thị không được để trống.');
      return;
    }

    updateUser({
      name: editName.trim(),
      city: editCity,
      interests: editInterests,
    });

    if (token) {
      await ApiClient.updateProfile(
        {
          fullName: editName.trim(),
          bio: editBio,
          city: editCity,
          interests: editInterests,
        },
        token
      );
    }

    setShowEditModal(false);
    Alert.alert('Thành công', 'Thông tin cá nhân đã được lưu.');
  };

  const toggleInterest = (tag: string) => {
    if (editInterests.includes(tag)) {
      setEditInterests(editInterests.filter((t) => t !== tag));
    } else {
      if (editInterests.length >= 5) {
        Alert.alert('Giới hạn', 'Bạn chỉ nên chọn tối đa 5 sở thích nổi bật.');
        return;
      }
      setEditInterests([...editInterests, tag]);
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản VIVU?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
          onNavigate('welcome');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
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
        {/* Cover Header */}
        <View style={styles.coverWrapper}>
          <Image source={{ uri: coverPhoto }} style={styles.coverImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.coverGradient}
          />

          <TouchableOpacity
            style={styles.changeCoverBtn}
            activeOpacity={0.8}
            onPress={handleChangeCover}
          >
            <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            <Text style={styles.changeCoverText}>Đổi ảnh bìa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsBtn}
            activeOpacity={0.8}
            onPress={() => onNavigate('privacy_setting')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarRow}>
            <UserAvatar
              uri={user?.avatar}
              name={user?.name || 'Vivu User'}
              size={84}
              trustScore={trustScore}
              isVerified={user?.verified ?? true}
            />

            <View style={styles.nameBlock}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user?.name || 'Nguyễn Hữu Tùng'}</Text>
                {user?.verified && (
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                )}
              </View>

              <View style={styles.locationBadge}>
                <Ionicons name="location-sharp" size={13} color={COLORS.primary} />
                <Text style={styles.locationText}>{user?.city || 'Đà Nẵng'}</Text>
              </View>

              <Text style={styles.socialStyleText}>
                {user?.communicationStyle || 'Cởi mở, thích khám phá'}
              </Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bioText}>{editBio}</Text>

          {/* Interests Chips */}
          <View style={styles.interestsWrap}>
            {(user?.interests && user.interests.length > 0
              ? user.interests
              : ['Cà phê', 'Ẩm thực', 'Camping', 'Nhiếp ảnh']
            ).map((item, idx) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestTagText}>#{item}</Text>
              </View>
            ))}
          </View>

          {/* Trust Score Banner */}
          <TouchableOpacity
            style={styles.trustBanner}
            activeOpacity={0.88}
            onPress={() => setShowTrustModal(true)}
          >
            <View style={styles.trustLeft}>
              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
              </View>
              <View>
                <View style={styles.trustScoreRow}>
                  <Text style={styles.trustScoreNumber}>{trustScore}</Text>
                  <Text style={styles.trustScoreMax}>/100</Text>
                  <View style={styles.trustLevelBadge}>
                    <Text style={styles.trustLevelText}>Uy tín cao</Text>
                  </View>
                </View>
                <Text style={styles.trustScoreDesc}>
                  Xác thực SĐT • Đúng giờ 98% • An toàn công cộng
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Actions: Edit Profile & Privacy */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.editProfileBtn}
              activeOpacity={0.85}
              onPress={() => setShowEditModal(true)}
            >
              <Ionicons name="create-outline" size={16} color={COLORS.primary} />
              <Text style={styles.editProfileBtnText}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.privacyBtn}
              activeOpacity={0.85}
              onPress={() => onNavigate('privacy_setting')}
            >
              <Ionicons name="lock-closed-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.privacyBtnText}>Quyền riêng tư</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Control Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'activities' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('activities')}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={activeTab === 'activities' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'activities' && styles.tabButtonTextActive]}
            >
              Kèo của tôi ({myActivities.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'posts' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons
              name="newspaper-outline"
              size={18}
              color={activeTab === 'posts' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'posts' && styles.tabButtonTextActive]}
            >
              Bài viết ({myPosts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'about' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('about')}
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={activeTab === 'about' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'about' && styles.tabButtonTextActive]}
            >
              Về tôi
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContentWrap}>
          {loading ? (
            <LoadingSkeleton count={2} />
          ) : activeTab === 'activities' ? (
            myActivities.length === 0 ? (
              <EmptyState
                icon="compass-outline"
                title="Chưa có kèo nào"
                message="Bạn chưa tạo hoặc tham gia kèo nào. Tạo kèo mới ngay để tìm người đi cùng!"
                actionLabel="Tạo kèo mới"
                onAction={() => onNavigate('create_post')}
              />
            ) : (
              myActivities.map((act) => (
                <KeoCard
                  key={act.id}
                  activity={act}
                  onPress={(a) => onNavigate('activity_detail', { id: a.id })}
                  onJoinPress={(a) => onNavigate('activity_detail', { id: a.id })}
                />
              ))
            )
          ) : activeTab === 'posts' ? (
            myPosts.length === 0 ? (
              <EmptyState
                icon="document-text-outline"
                title="Chưa có bài viết"
                message="Chia sẻ trải nghiệm địa điểm, quán ăn hoặc địa danh yêu thích của bạn."
                actionLabel="Đăng bài mới"
                onAction={() => onNavigate('create_post')}
              />
            ) : (
              myPosts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  {post.images && post.images.length > 0 ? (
                    <Image source={{ uri: post.images[0] }} style={styles.postImage} />
                  ) : null}
                  <View style={styles.postBody}>
                    <Text style={styles.postDesc} numberOfLines={3}>
                      {post.content}
                    </Text>
                    <View style={styles.postFooter}>
                      <View style={styles.postLocationBadge}>
                        <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.postLocationText}>
                          {post.location || post.author?.location || 'Đà Nẵng'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.postContextBtn}
                        activeOpacity={0.8}
                        onPress={() =>
                          onNavigate('create_post', {
                            prefillTitle: `Rủ đi ${post.location || 'cùng'}`,
                            prefillLocation: post.location || 'Đà Nẵng',
                          })
                        }
                      >
                        <Ionicons name="people-outline" size={14} color="#FFFFFF" />
                        <Text style={styles.postContextBtnText}>Rủ đi cùng</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )
          ) : (
            // Tab "Về tôi"
            <View style={styles.aboutCard}>
              <View style={styles.aboutRow}>
                <Ionicons name="shield-outline" size={20} color={COLORS.primary} />
                <View style={styles.aboutInfo}>
                  <Text style={styles.aboutLabel}>Cam kết an toàn Vivu</Text>
                  <Text style={styles.aboutValue}>
                    Ưu tiên gặp gỡ tại địa điểm công cộng, tôn trọng sự minh bạch và thông báo trước
                    khi thay đổi lịch trình.
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.aboutRow}>
                <Ionicons name="call-outline" size={20} color={COLORS.primary} />
                <View style={styles.aboutInfo}>
                  <Text style={styles.aboutLabel}>Số điện thoại</Text>
                  <Text style={styles.aboutValue}>
                    {user?.phone ? `${user.phone.slice(0, 3)}****${user.phone.slice(-3)}` : '0905****88'} (Đã xác thực OTP)
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.aboutRow}>
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                <View style={styles.aboutInfo}>
                  <Text style={styles.aboutLabel}>Thời gian tham gia Vivu</Text>
                  <Text style={styles.aboutValue}>Thành viên từ tháng 04/2025</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.logoutBtn}
                activeOpacity={0.85}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
                <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Trust Score Audit Modal */}
      <Modal
        visible={showTrustModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTrustModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="shield-checkmark" size={22} color={COLORS.success} />
                <Text style={styles.modalTitle}>Hồ sơ Uy tín VIVU</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTrustModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.trustScoreBigBox}>
              <Text style={styles.trustScoreBigNum}>{trustScore}</Text>
              <Text style={styles.trustScoreBigLabel}>Điểm Uy Tín Hiện Tại</Text>
              <Text style={styles.trustScoreBigSub}>
                Xếp hạng: Thành viên đáng tin cậy trong cộng đồng Vivu
              </Text>
            </View>

            <View style={styles.trustCriteriaList}>
              <View style={styles.criteriaItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <View style={styles.criteriaInfo}>
                  <Text style={styles.criteriaTitle}>Xác thực số điện thoại</Text>
                  <Text style={styles.criteriaDesc}>Đã xác minh qua mã OTP (+20 điểm)</Text>
                </View>
              </View>

              <View style={styles.criteriaItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <View style={styles.criteriaInfo}>
                  <Text style={styles.criteriaTitle}>Tỷ lệ đúng hẹn (98%)</Text>
                  <Text style={styles.criteriaDesc}>Không hủy kèo sát giờ hoặc trễ hẹn</Text>
                </View>
              </View>

              <View style={styles.criteriaItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <View style={styles.criteriaInfo}>
                  <Text style={styles.criteriaTitle}>Đánh giá từ bạn cạ (5.0 / 5.0)</Text>
                  <Text style={styles.criteriaDesc}>Nhận phản hồi văn minh, tích cực</Text>
                </View>
              </View>

              <View style={styles.criteriaItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <View style={styles.criteriaInfo}>
                  <Text style={styles.criteriaTitle}>Cam kết gặp gỡ công cộng</Text>
                  <Text style={styles.criteriaDesc}>Tuân thủ quy tắc an toàn của Vivu</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              activeOpacity={0.85}
              onPress={() => setShowTrustModal(false)}
            >
              <Text style={styles.modalPrimaryBtnText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Full Name */}
              <Text style={styles.fieldLabel}>Tên hiển thị</Text>
              <TextInput
                style={styles.inputField}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nhập tên của bạn"
                placeholderTextColor={COLORS.textSecondary}
              />

              {/* City */}
              <Text style={styles.fieldLabel}>Thành phố hoạt động</Text>
              <View style={styles.cityOptions}>
                {['Đà Nẵng', 'Hội An', 'Huế', 'Hà Nội', 'TP. Hồ Chí Minh'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.cityChip, editCity === c && styles.cityChipActive]}
                    onPress={() => setEditCity(c)}
                  >
                    <Text
                      style={[
                        styles.cityChipText,
                        editCity === c && styles.cityChipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Bio */}
              <Text style={styles.fieldLabel}>Giới thiệu bản thân (Bio)</Text>
              <TextInput
                style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]}
                value={editBio}
                onChangeText={setEditBio}
                multiline
                maxLength={200}
                placeholder="Mô tả sở thích, gu gặp gỡ của bạn..."
                placeholderTextColor={COLORS.textSecondary}
              />

              {/* Interests */}
              <Text style={styles.fieldLabel}>Sở thích nổi bật (Tối đa 5)</Text>
              <View style={styles.interestsPicker}>
                {AVAILABLE_INTERESTS.map((tag) => {
                  const selected = editInterests.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagSelectChip, selected && styles.tagSelectChipActive]}
                      onPress={() => toggleInterest(tag)}
                    >
                      <Text
                        style={[
                          styles.tagSelectChipText,
                          selected && styles.tagSelectChipTextActive,
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              activeOpacity={0.85}
              onPress={handleSaveProfile}
            >
              <Text style={styles.modalPrimaryBtnText}>Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  coverWrapper: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    ...StyleSheet.absoluteFill,
  },
  changeCoverBtn: {
    position: 'absolute',
    bottom: SPACING.m,
    right: SPACING.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  changeCoverText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  settingsBtn: {
    position: 'absolute',
    top: 50,
    right: SPACING.m,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderCard: {
    backgroundColor: COLORS.surface,
    marginTop: -20,
    marginHorizontal: SPACING.m,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.m,
  },
  nameBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: FONT_SIZES.s,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  socialStyleText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 4,
  },
  bioText: {
    fontSize: FONT_SIZES.m,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: SPACING.m,
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: SPACING.m,
  },
  interestTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  interestTagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    marginTop: SPACING.m,
  },
  trustLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  trustBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  trustScoreNumber: {
    fontSize: FONT_SIZES.l,
    fontWeight: '800',
    color: COLORS.success,
  },
  trustScoreMax: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  trustLevelBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: 6,
  },
  trustLevelText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  trustScoreDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.m,
  },
  editProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.m,
  },
  editProfileBtnText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.s,
    fontWeight: '700',
  },
  privacyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.m,
  },
  privacyBtnText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.s,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.m,
    marginTop: SPACING.l,
    borderRadius: BORDER_RADIUS.l,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.m,
  },
  tabButtonActive: {
    backgroundColor: COLORS.background,
    ...SHADOWS.card,
  },
  tabButtonText: {
    fontSize: FONT_SIZES.s,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabContentWrap: {
    paddingHorizontal: SPACING.m,
    marginTop: SPACING.m,
  },
  postCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.m,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  postImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  postBody: {
    padding: SPACING.m,
  },
  postTitle: {
    fontSize: FONT_SIZES.m,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  postDesc: {
    fontSize: FONT_SIZES.s,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.m,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postLocationText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  postContextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  postContextBtnText: {
    fontSize: FONT_SIZES.xs,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  aboutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.m,
  },
  aboutInfo: {
    flex: 1,
  },
  aboutLabel: {
    fontSize: FONT_SIZES.m,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  aboutValue: {
    fontSize: FONT_SIZES.s,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.m,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    borderRadius: BORDER_RADIUS.m,
    marginTop: SPACING.s,
  },
  logoutBtnText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.m,
    fontWeight: '700',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.l,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.l,
    ...SHADOWS.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.l,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: FONT_SIZES.l,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  trustScoreBigBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.l,
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  trustScoreBigNum: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.success,
  },
  trustScoreBigLabel: {
    fontSize: FONT_SIZES.m,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  trustScoreBigSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  trustCriteriaList: {
    gap: 12,
    marginBottom: SPACING.l,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  criteriaInfo: {
    flex: 1,
  },
  criteriaTitle: {
    fontSize: FONT_SIZES.s,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  criteriaDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalPrimaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.l,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.m,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: FONT_SIZES.s,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.m,
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.m,
    paddingHorizontal: SPACING.m,
    paddingVertical: 10,
    fontSize: FONT_SIZES.m,
    color: COLORS.textPrimary,
  },
  cityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  cityChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  cityChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  cityChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  interestsPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.l,
  },
  tagSelectChip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  tagSelectChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  tagSelectChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tagSelectChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
