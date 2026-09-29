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
import { Header } from '../../components/Header';
import { MOCK_ACTIVITY } from '../../constants/mockData';
import { COLORS } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useActivityStore } from '../../stores/activityStore';
import { ScreenKey } from '../../types';

interface ParticipantListProps {
  onNavigate: (screen: ScreenKey) => void;
  activityId?: string;
}

export const ParticipantListScreen: React.FC<ParticipantListProps> = ({ onNavigate, activityId }) => {
  const [requests, setRequests] = React.useState<any[]>([]);
  const token = useAuthStore((state) => state.token);
  const activity = useActivityStore((state) => state.currentActivity) || MOCK_ACTIVITY;
  const fetchActivityDetail = useActivityStore((state) => state.fetchActivityDetail);

  React.useEffect(() => {
    if (activityId && token) {
      loadRequests();
    }
  }, [activityId, token]);

  const loadRequests = async () => {
    if (!activityId || !token) return;
    const res = await ApiClient.getActivityRequests(activityId, token);
    if (res.success && res.data) {
      setRequests(res.data);
    }
  };

  const handleRespond = async (requestId: string, action: 'ACCEPT' | 'DECLINE') => {
    if (!activityId || !token) return;
    const res = await ApiClient.respondToJoinRequest(activityId, requestId, action, token);
    if (res.success) {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      if (action === 'ACCEPT') {
        fetchActivityDetail(activityId);
        Alert.alert('Thành công', 'Đã duyệt yêu cầu!');
      } else {
        Alert.alert('Thành công', 'Đã từ chối yêu cầu.');
      }
    } else {
      Alert.alert('Lỗi', res.message || 'Có lỗi xảy ra.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={`Người tham gia (${activity.participants?.length || 0}/${activity.maxCount || 0})`}
        onBack={() => onNavigate('activity_detail' as ScreenKey)}
        rightIcon="person-add-outline"
        onRightPress={() => Alert.alert('Mời bạn bè', 'Đã tạo link mời tham gia!')}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Lời mời đang chờ duyệt */}
        {requests.length > 0 && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Đang chờ duyệt ({requests.length})</Text>
            {requests.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <Image source={{ uri: req.user?.avatarUrl || req.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }} style={styles.avatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{req.user?.name}</Text>
                  <Text style={styles.requestMsg} numberOfLines={2}>"{req.message || 'Muốn tham gia cùng'}"</Text>
                </View>
                <View style={styles.actionBtns}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => handleRespond(req.id, 'ACCEPT')}>
                    <Ionicons name="checkmark" size={18} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => handleRespond(req.id, 'DECLINE')}>
                    <Ionicons name="close" size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Thành viên hiện tại</Text>
          {(activity.participants || []).map((user: any) => {
            const isHost = user.role === 'HOST' || user.role === 'Trưởng nhóm';
            return (
              <View key={user.userId || user.id} style={styles.userCard}>
                <Image source={{ uri: user.avatarUrl || user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  {isHost && (
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>Host</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userRole}>{user.role || 'Thành viên'}</Text>
              </View>

              <TouchableOpacity
                style={styles.trustScoreWrap}
                onPress={() =>
                  Alert.alert(
                    `Hồ sơ Uy Tín: ${user.name}`,
                    `• Điểm uy tín: ${user.trustScore}/100\n• Xác thực CCCD/SĐT: Đã hoàn tất\n• Tỷ lệ đúng hẹn: 98%\n• Đánh giá từ cộng đồng: 5.0 ⭐`
                  )
                }
              >
                <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
                <Text style={styles.trustScoreText}>{user.trustScore} điểm</Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => onNavigate('personal_chat')}
              >
                <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomWrap}>
        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={() => Alert.alert('Mời bạn bè', 'Gửi lời mời thành công!')}
        >
          <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
          <Text style={styles.inviteText}>Mời bạn bè tham gia</Text>
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
  content: {
    padding: 16,
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#EEEEF2',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  hostBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hostBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  trustScoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    marginRight: 10,
  },
  trustScoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  chatBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomWrap: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
  },
  inviteBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  inviteText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionWrap: {
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFF4F4',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  requestMsg: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    backgroundColor: '#9CA3AF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
