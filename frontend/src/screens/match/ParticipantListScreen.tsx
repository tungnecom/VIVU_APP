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
import { ScreenKey } from '../../types';

interface ParticipantListProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const ParticipantListScreen: React.FC<ParticipantListProps> = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <Header
        title={`Người tham gia (${MOCK_ACTIVITY.participants.length}/${MOCK_ACTIVITY.maxCount})`}
        onBack={() => onNavigate('activity_detail')}
        rightIcon="person-add-outline"
        onRightPress={() => Alert.alert('Mời bạn bè', 'Đã tạo link mời tham gia!')}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {MOCK_ACTIVITY.participants.map((user) => {
          const isHost = user.role === 'Trưởng nhóm';
          return (
            <View key={user.id} style={styles.userCard}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
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
});
