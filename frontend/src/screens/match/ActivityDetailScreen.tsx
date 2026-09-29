import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useActivityStore } from '../../stores/activityStore';
import { useAuthStore } from '../../stores/authStore';
import { ApiClient } from '../../services/api';
import { ScreenKey } from '../../types';
import { UserAvatar } from '../../components/common/UserAvatar';
import { LoadingSkeleton, ErrorState } from '../../components/common/StateView';

interface ActivityDetailProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
  activityId?: string;
}

export const ActivityDetailScreen: React.FC<ActivityDetailProps> = ({
  onNavigate,
  activityId,
}) => {
  const currentActivity = useActivityStore((s) => s.currentActivity);
  const fetchActivityDetail = useActivityStore((s) => s.fetchActivityDetail);
  const loading = useActivityStore((s) => s.loading);
  const error = useActivityStore((s) => s.error);

  const token = useAuthStore((s) => s.token);
  const currentUser = useAuthStore((s) => s.user);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);
  const [userStatus, setUserStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED'>('NONE');

  useEffect(() => {
    if (activityId) {
      fetchActivityDetail(activityId);
    }
  }, [activityId]);

  const activity = currentActivity || {
    id: activityId || 'mock',
    title: 'Cafe sáng ngắm sông Hàn & chia sẻ về nhiếp ảnh đường phố',
    category: 'Cafe',
    location: 'Quán Wonderlust, 96 Trần Phú, Hải Châu, Đà Nẵng',
    time: '08:30 - 10:30',
    date: 'Chủ Nhật, 05/10/2026',
    description:
      'Cuối tuần này mình dự định ngồi cafe tại Wonderlust để chụp vài tấm ảnh film và giao lưu kinh nghiệm chụp ảnh đường phố. Bạn nào cùng sở thích chụp ảnh hoặc thích cafe ngắm phố sáng sớm thì cùng tham gia nhé!',
    joined: 2,
    maxParticipants: 4,
    budget: '50.000đ - 70.000đ (Tự túc)',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    host: {
      id: 'host_01',
      name: 'Nguyễn Minh Quân',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      trustScore: 92,
      bio: 'Yêu Đà Nẵng, thích ảnh film và đạp xe ven biển.',
      isVerified: true,
    },
    participants: [
      {
        id: 'p1',
        name: 'Trần Thu Hà',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        trustScore: 88,
      },
    ],
  };

  const isHost = currentUser?.id && activity.host?.id && currentUser.id === activity.host.id;
  const isFull = (activity.joined || 1) >= (activity.maxParticipants || 4);
  const remaining = Math.max(0, (activity.maxParticipants || 4) - (activity.joined || 1));

  const handleJoinSubmit = async () => {
    if (!token) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để gửi yêu cầu tham gia kèo.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => onNavigate('login') },
        ]
      );
      return;
    }

    setSubmittingJoin(true);
    try {
      const res = await ApiClient.joinActivity(
        activity.id,
        joinMessage.trim() || 'Chào bạn, cho mình tham gia kèo này với nhé!',
        token
      );
      if (res.success) {
        setUserStatus('PENDING');
        setShowJoinModal(false);
        setJoinMessage('');
        Alert.alert(
          'Đã gửi yêu cầu tham gia!',
          'Chủ kèo sẽ nhận được thông báo. Khi được duyệt, bạn sẽ được tự động tham gia nhóm chat của kèo.',
          [{ text: 'Đã hiểu' }]
        );
      } else {
        Alert.alert('Chưa thể gửi yêu cầu', res.error || 'Vui lòng thử lại sau.');
      }
    } catch {
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Báo cáo kèo',
      'Bạn có phát hiện điều gì bất thường về kèo này không?',
      [
        { text: 'Nội dung không phù hợp', onPress: () => Alert.alert('Đã tiếp nhận', 'Cảm ơn bạn đã phản hồi. Ban quản trị sẽ rà soát ngay.') },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  if (loading && !currentActivity) {
    return (
      <View style={styles.container}>
        <LoadingSkeleton count={3} height={200} />
      </View>
    );
  }

  if (error && !currentActivity) {
    return (
      <View style={styles.container}>
        <ErrorState
          message={error}
          onRetry={() => activityId && fetchActivityDetail(activityId)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Floating Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.circleBtn}
          activeOpacity={0.8}
          onPress={() => onNavigate('match_home')}
          accessibilityLabel="Quay lại danh sách kèo"
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.topNavRight}>
          <TouchableOpacity
            style={styles.circleBtn}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Chia sẻ kèo', 'Liên kết mời tham gia kèo đã được sao chép!')}
            accessibilityLabel="Chia sẻ kèo"
          >
            <Ionicons name="share-social-outline" size={18} color={COLORS.textDark} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleBtn}
            activeOpacity={0.8}
            onPress={handleReport}
            accessibilityLabel="Báo cáo kèo"
          >
            <Ionicons name="flag-outline" size={18} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cover Image & Category */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: activity.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(41, 38, 51, 0.75)']}
            style={styles.heroGradient}
          />

          <View style={styles.heroBadges}>
            {activity.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{activity.category}</Text>
              </View>
            )}
            <View style={[styles.slotBadge, isFull ? styles.slotBadgeFull : styles.slotBadgeAvailable]}>
              <Ionicons name={isFull ? 'people' : 'person-add'} size={12} color="#FFFFFF" />
              <Text style={styles.slotBadgeText}>
                {isFull ? 'Đã đủ người' : `Còn ${remaining}/${activity.maxParticipants || 4} chỗ`}
              </Text>
            </View>
          </View>
        </View>

        {/* Nội dung chi tiết */}
        <View style={styles.body}>
          <Text style={styles.title}>{activity.title}</Text>

          {/* Khối kế hoạch chi tiết (Thời gian, Địa điểm, Ngân sách) */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="calendar" size={18} color={COLORS.primaryCoral} />
              </View>
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Thời gian diễn ra</Text>
                <Text style={styles.infoValue}>
                  {activity.time} • {activity.date}
                </Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.infoRow}>
              <View style={[styles.iconWrap, { backgroundColor: '#F3EEFD' }]}>
                <Ionicons name="location" size={18} color={COLORS.secondaryPurple} />
              </View>
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Điểm hẹn công cộng</Text>
                <Text style={styles.infoValue}>{activity.location}</Text>
              </View>
            </View>

            {activity.budget && (
              <>
                <View style={styles.cardDivider} />
                <View style={styles.infoRow}>
                  <View style={[styles.iconWrap, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="wallet" size={18} color={COLORS.accentMint} />
                  </View>
                  <View style={styles.infoTextCol}>
                    <Text style={styles.infoLabel}>Dự trù chi phí</Text>
                    <Text style={[styles.infoValue, { color: COLORS.accentMint }]}>
                      {activity.budget}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Thông tin Chủ Kèo (Host) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chủ kèo</Text>
            <View style={styles.trustPill}>
              <Ionicons name="shield-checkmark" size={13} color={COLORS.accentMint} />
              <Text style={styles.trustPillText}>Độ tin cậy: {activity.host.trustScore}%</Text>
            </View>
          </View>

          <View style={styles.hostCard}>
            <UserAvatar
              uri={activity.host.avatar}
              name={activity.host.name}
              size={54}
              trustScore={activity.host.trustScore}
              isVerified={activity.host.isVerified}
            />
            <View style={styles.hostDetails}>
              <View style={styles.hostNameRow}>
                <Text style={styles.hostName}>{activity.host.name}</Text>
                {activity.host.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.accentMint} />
                )}
              </View>
              <Text style={styles.hostBio}>
                {activity.host.bio || 'Thành viên yêu thích du lịch và gặp gỡ bạn mới.'}
              </Text>
            </View>
          </View>

          {/* Mô tả hoạt động */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mô tả hoạt động</Text>
          </View>
          <Text style={styles.descriptionText}>{activity.description}</Text>

          {/* Thành viên tham gia (UX-10) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Thành viên ({activity.joined || 1}/{activity.maxParticipants || 4})
            </Text>
            {isHost && (
              <TouchableOpacity onPress={() => onNavigate('participant_list', { id: activity.id })}>
                <Text style={styles.manageLink}>Duyệt yêu cầu &gt;</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.membersRow}>
            {/* Host Avatar */}
            <View style={styles.memberItem}>
              <UserAvatar
                uri={activity.host.avatar}
                name={activity.host.name}
                size={44}
                trustScore={activity.host.trustScore}
                isVerified={activity.host.isVerified}
              />
              <Text style={styles.memberName} numberOfLines={1}>
                {activity.host.name.split(' ').pop()} (Chủ)
              </Text>
            </View>

            {/* Other participants */}
            {(activity.participants || []).map((m: any, idx: number) => (
              <View key={m.id || idx} style={styles.memberItem}>
                <UserAvatar uri={m.avatar} name={m.name} size={44} trustScore={m.trustScore} />
                <Text style={styles.memberName} numberOfLines={1}>
                  {m.name.split(' ').pop()}
                </Text>
              </View>
            ))}

            {/* Empty slots */}
            {Array.from({ length: remaining }).map((_, idx) => (
              <View key={`empty_${idx}`} style={styles.emptyMemberSlot}>
                <Ionicons name="person-outline" size={20} color={COLORS.textLight} />
                <Text style={styles.emptySlotText}>Còn chỗ</Text>
              </View>
            ))}
          </View>

          {/* Nguyên tắc gặp mặt an toàn (Mục 1 Nguyên tắc UX) */}
          <View style={styles.safetyBox}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.secondaryPurple} />
              <Text style={styles.safetyTitle}>Gặp mặt an toàn cùng Vivu</Text>
            </View>
            <Text style={styles.safetyText}>
              • Luôn gặp mặt tại địa điểm công cộng, đông người.{'\n'}
              • Báo cho người thân hoặc bạn bè về lịch trình cuộc hẹn.{'\n'}
              • Không chuyển tiền đặt cọc trước khi gặp mặt trực tiếp.
            </Text>
          </View>

          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      {/* Thanh CTA cố định ở đáy màn hình */}
      <View style={styles.bottomBar}>
        {isHost ? (
          <TouchableOpacity
            style={[styles.primaryCtaBtn, { backgroundColor: COLORS.secondaryPurple }]}
            activeOpacity={0.88}
            onPress={() => onNavigate('participant_list', { id: activity.id })}
          >
            <Ionicons name="people" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryCtaText}>Quản lý thành viên & Duyệt yêu cầu</Text>
          </TouchableOpacity>
        ) : userStatus === 'ACCEPTED' ? (
          <TouchableOpacity
            style={[styles.primaryCtaBtn, { backgroundColor: COLORS.accentMint }]}
            activeOpacity={0.88}
            onPress={() => onNavigate('group_chat', { id: activity.id })}
          >
            <Ionicons name="chatbubbles" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryCtaText}>Vào nhóm chat kèo</Text>
          </TouchableOpacity>
        ) : userStatus === 'PENDING' ? (
          <View style={styles.pendingBar}>
            <Ionicons name="time" size={18} color="#D97706" style={{ marginRight: 6 }} />
            <Text style={styles.pendingText}>Đã gửi yêu cầu • Chờ chủ kèo duyệt</Text>
          </View>
        ) : isFull ? (
          <View style={styles.fullBar}>
            <Text style={styles.fullText}>Kèo này đã đủ số lượng thành viên</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.primaryCtaBtn}
            activeOpacity={0.88}
            onPress={() => setShowJoinModal(true)}
          >
            <Ionicons name="person-add" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryCtaText}>Gửi yêu cầu tham gia kèo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal gửi yêu cầu */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Xin tham gia kèo</Text>
            <Text style={styles.modalSubtitle}>{activity.title}</Text>

            <Text style={styles.inputLabel}>Gửi lời chào hoặc lý do tham gia tới chủ kèo:</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Ví dụ: Chào bạn, mình cũng đang rảnh khung giờ này, cho mình tham gia cùng nhóm nhé!"
              placeholderTextColor={COLORS.textLight}
              value={joinMessage}
              onChangeText={setJoinMessage}
              multiline
              numberOfLines={3}
              maxLength={150}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowJoinModal(false)}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, submittingJoin && { opacity: 0.6 }]}
                disabled={submittingJoin}
                onPress={handleJoinSubmit}
              >
                <Text style={styles.submitBtnText}>
                  {submittingJoin ? 'Đang gửi...' : 'Xác nhận gửi'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  topNav: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 16,
    left: 16,
    right: 16,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroWrap: {
    height: 260,
    width: '100%',
    position: 'relative',
    backgroundColor: '#EBE7E1',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  heroBadges: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: 'rgba(41, 38, 51, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  slotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  slotBadgeAvailable: {
    backgroundColor: COLORS.accentMint,
  },
  slotBadgeFull: {
    backgroundColor: '#6B7280',
  },
  slotBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textDark,
    lineHeight: 30,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  trustPillText: {
    color: COLORS.accentMint,
    fontSize: 11,
    fontWeight: '700',
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  hostDetails: {
    flex: 1,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hostName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  hostBio: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
    lineHeight: 18,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 22,
    marginBottom: 20,
  },
  manageLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondaryPurple,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  memberItem: {
    alignItems: 'center',
    width: 60,
  },
  memberName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyMemberSlot: {
    width: 60,
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DDD8D0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 4,
  },
  safetyBox: {
    backgroundColor: '#F3EEFD',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6DCFB',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondaryPurple,
  },
  safetyText: {
    fontSize: 12,
    color: COLORS.textMedium,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    ...SHADOWS.md,
  },
  primaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryCoral,
    paddingVertical: 14,
    borderRadius: 24,
    ...SHADOWS.glow,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  pendingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '700',
  },
  fullBar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 24,
  },
  fullText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(41, 38, 51, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  messageInput: {
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: 14,
    color: COLORS.textDark,
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 20,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  submitBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 20,
    backgroundColor: COLORS.primaryCoral,
    ...SHADOWS.glow,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
