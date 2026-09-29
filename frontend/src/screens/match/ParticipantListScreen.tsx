import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useActivityStore } from '../../stores/activityStore';
import { ScreenKey } from '../../types';
import { UserAvatar } from '../../components/common/UserAvatar';
import { EmptyState, LoadingSkeleton } from '../../components/common/StateView';

interface ParticipantListProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
  activityId?: string;
}

export const ParticipantListScreen: React.FC<ParticipantListProps> = ({
  onNavigate,
  activityId,
}) => {
  const token = useAuthStore((state) => state.token);
  const activity = useActivityStore((state) => state.currentActivity);
  const fetchActivityDetail = useActivityStore((state) => state.fetchActivityDetail);

  const [activeTab, setActiveTab] = useState<'pending' | 'members'>('pending');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const targetActivityId = activityId || activity?.id;

  const loadRequests = async () => {
    if (!targetActivityId || !token) return;
    setLoading(true);
    try {
      const res = await ApiClient.getActivityRequests(targetActivityId, token);
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch {
      // Mock fallback if offline/local dev
      setRequests([
        {
          id: 'req_01',
          user: {
            id: 'u_02',
            name: 'Lê Hoàng Nam',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            trustScore: 89,
            bio: 'Thích cafe sáng và chụp ảnh film ở Đà Nẵng.',
          },
          message: 'Chào bạn, cho mình tham gia kèo cafe sáng này với nhé, mình cũng mê ảnh film!',
          createdAt: '15 phút trước',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [targetActivityId, token]);

  const handleRespond = async (requestId: string, action: 'ACCEPT' | 'DECLINE') => {
    if (!targetActivityId || !token) return;

    try {
      const res = await ApiClient.respondToJoinRequest(targetActivityId, requestId, action, token);
      if (res.success) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        if (action === 'ACCEPT') {
          fetchActivityDetail(targetActivityId);
          Alert.alert(
            'Đã duyệt thành viên! 🎉',
            'Thành viên đã được thêm vào nhóm và có quyền truy cập nhóm chat của kèo.',
            [
              {
                text: 'Vào nhóm chat',
                onPress: () => onNavigate('group_chat', { id: targetActivityId }),
              },
              { text: 'Đóng', style: 'cancel' },
            ]
          );
        } else {
          Alert.alert('Đã từ chối', 'Yêu cầu tham gia đã được từ chối lịch sự.');
        }
      } else {
        Alert.alert('Không thể thực hiện', res.message || 'Vui lòng thử lại sau.');
      }
    } catch {
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ.');
    }
  };

  const participants = activity?.participants || [
    {
      id: 'p1',
      name: 'Trần Thu Hà',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      trustScore: 88,
      joinedAt: 'Hôm qua',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => onNavigate('activity_detail', { id: targetActivityId })}
          accessibilityLabel="Quay lại chi tiết kèo"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerSubtitle}>QUẢN LÝ KÈO</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {activity?.title || 'Quản lý thành viên'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.chatIconBtn}
          onPress={() => onNavigate('group_chat', { id: targetActivityId })}
          accessibilityLabel="Vào nhóm chat"
        >
          <Ionicons name="chatbubbles" size={20} color={COLORS.secondaryPurple} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'pending' && styles.tabBtnActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Chờ duyệt ({requests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'members' && styles.tabBtnActive]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
            Đã tham gia ({(activity?.joined || 1)})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'pending' ? (
          loading ? (
            <LoadingSkeleton count={2} height={150} />
          ) : requests.length === 0 ? (
            <EmptyState
              icon="mail-unread-outline"
              title="Chưa có yêu cầu mới"
              message="Khi có thành viên xin tham gia kèo, yêu cầu sẽ xuất hiện tại đây để bạn duyệt."
            />
          ) : (
            requests.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <UserAvatar
                    uri={req.user.avatar}
                    name={req.user.name}
                    size={46}
                    trustScore={req.user.trustScore}
                    isVerified={true}
                  />
                  <View style={styles.requestUserInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{req.user.name}</Text>
                      <View style={styles.trustBadge}>
                        <Text style={styles.trustBadgeText}>⭐ {req.user.trustScore}%</Text>
                      </View>
                    </View>
                    <Text style={styles.userBio} numberOfLines={1}>
                      {req.user.bio || 'Thành viên Vivu'}
                    </Text>
                  </View>
                </View>

                {req.message && (
                  <View style={styles.messageBox}>
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.secondaryPurple} />
                    <Text style={styles.messageText}>"{req.message}"</Text>
                  </View>
                )}

                <View style={styles.actionBtnRow}>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleRespond(req.id, 'DECLINE')}
                  >
                    <Text style={styles.declineText}>Từ chối</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleRespond(req.id, 'ACCEPT')}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.acceptText}>Đồng ý duyệt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        ) : (
          /* Tab Members */
          <View>
            {/* Host */}
            <View style={styles.memberCard}>
              <UserAvatar
                uri={activity?.host?.avatar}
                name={activity?.host?.name || 'Bạn'}
                size={46}
                trustScore={activity?.host?.trustScore || 90}
                isVerified={true}
              />
              <View style={styles.memberInfo}>
                <Text style={styles.userName}>
                  {activity?.host?.name || 'Bạn'} (Chủ kèo)
                </Text>
                <Text style={styles.roleTag}>Tổ chức kèo</Text>
              </View>
            </View>

            {/* Approved Participants */}
            {participants.map((p: any) => (
              <View key={p.id} style={styles.memberCard}>
                <UserAvatar
                  uri={p.avatar}
                  name={p.name}
                  size={46}
                  trustScore={p.trustScore}
                />
                <View style={styles.memberInfo}>
                  <Text style={styles.userName}>{p.name}</Text>
                  <Text style={styles.memberSubText}>Đã tham gia • Sẵn sàng</Text>
                </View>
                <TouchableOpacity
                  style={styles.dmBtn}
                  onPress={() => onNavigate('personal_chat')}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={COLORS.secondaryPurple} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.openChatGroupBtn}
              onPress={() => onNavigate('group_chat', { id: targetActivityId })}
            >
              <Ionicons name="chatbubbles" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.openChatGroupText}>Mở phòng Chat Nhóm Kèo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 6,
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondaryPurple,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  chatIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.secondaryPurple,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.secondaryPurple,
    fontWeight: '800',
  },
  contentArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestUserInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  trustBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trustBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentMint,
  },
  userBio: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF8F5',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 13,
    color: COLORS.textMedium,
    fontStyle: 'italic',
    flex: 1,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  declineBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  declineText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  acceptBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.accentMint,
    ...SHADOWS.sm,
  },
  acceptText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  memberInfo: {
    flex: 1,
  },
  roleTag: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryPurple,
    marginTop: 2,
  },
  memberSubText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  dmBtn: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#FAF8F5',
  },
  openChatGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondaryPurple,
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 18,
    ...SHADOWS.purpleGlow,
  },
  openChatGroupText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
