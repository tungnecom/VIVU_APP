import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { ScreenKey } from '../types';

interface ScreenNavigatorModalProps {
  visible: boolean;
  currentScreen: ScreenKey;
  onClose: () => void;
  onSelectScreen: (screen: ScreenKey) => void;
}

interface ScreenGroup {
  groupName: string;
  items: Array<{ key: ScreenKey; number: string; name: string; icon: string }>;
}

export const ScreenNavigatorModal: React.FC<ScreenNavigatorModalProps> = ({
  visible,
  currentScreen,
  onClose,
  onSelectScreen,
}) => {
  const groups: ScreenGroup[] = [
    {
      groupName: '1. Onboarding & Xác thực',
      items: [
        { key: 'splash', number: '1', name: 'Splash Screen', icon: 'sparkles' },
        { key: 'welcome', number: '2', name: 'Welcome', icon: 'hand-right' },
        { key: 'register', number: '3', name: 'Đăng ký', icon: 'person-add' },
        { key: 'login', number: '4', name: 'Đăng nhập', icon: 'log-in' },
        { key: 'otp', number: '5', name: 'Xác thực tài khoản (OTP)', icon: 'keypad' },
        { key: 'city_select', number: '6', name: 'Chọn thành phố', icon: 'location' },
        { key: 'goal_select', number: '7', name: 'Chọn mục tiêu', icon: 'flag' },
        { key: 'interest_select', number: '8', name: 'Chọn sở thích', icon: 'heart' },
        { key: 'social_level', number: '9', name: 'Mức độ giao tiếp', icon: 'happy' },
        { key: 'privacy_setting', number: '10', name: 'Thiết lập quyền riêng tư', icon: 'shield-checkmark' },
      ],
    },
    {
      groupName: '2. Home Feed & Bài viết',
      items: [
        { key: 'home_feed', number: '11', name: 'Home Feed', icon: 'newspaper' },
        { key: 'post_detail', number: '12', name: 'Chi tiết bài viết', icon: 'document-text' },
        { key: 'create_post', number: '13', name: 'Tạo bài viết', icon: 'add-circle' },
        { key: 'edit_post', number: '14', name: 'Chỉnh sửa bài viết', icon: 'create' },
        { key: 'comment', number: '15', name: 'Comment & ViVi Suggest', icon: 'chatbox-ellipses' },
      ],
    },
    {
      groupName: '3. Match & Hoạt động',
      items: [
        { key: 'match_home', number: '16', name: 'Match Home', icon: 'compass' },
        { key: 'activity_detail', number: '17', name: 'Chi tiết hoạt động', icon: 'bicycle' },
        { key: 'participant_list', number: '18', name: 'Danh sách người tham gia', icon: 'people' },
      ],
    },
    {
      groupName: '4. Nhóm & Cộng đồng',
      items: [
        { key: 'group_home', number: '19', name: 'Group Home', icon: 'albums' },
        { key: 'group_detail', number: '20', name: 'Group Chi tiết', icon: 'information-circle' },
        { key: 'group_chat', number: '21', name: 'Group Chat Room', icon: 'chatbubbles' },
      ],
    },
    {
      groupName: '5. Tin nhắn & Trò chuyện',
      items: [
        { key: 'message_home', number: '22', name: 'Message Home', icon: 'mail' },
        { key: 'personal_chat', number: '23', name: 'Chat cá nhân', icon: 'chatbubble' },
      ],
    },
    {
      groupName: '6. Bản đồ & Đánh giá',
      items: [
        { key: 'map', number: '24', name: 'Bản đồ / Khám phá', icon: 'map' },
        { key: 'review', number: '25', name: 'Đánh giá địa điểm', icon: 'star' },
      ],
    },
    {
      groupName: '7. Cá nhân & Trợ lý ViVi',
      items: [
        { key: 'profile', number: '27', name: 'Hồ sơ & Điểm uy tín (94/100)', icon: 'shield-checkmark' },
        { key: 'vivi_assistant', number: '28', name: 'ViVi Floating Assistant', icon: 'sparkles' },
      ],
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Danh sách 28 màn hình VIVU</Text>
              <Text style={styles.subtitle}>Bấm vào bất kỳ màn hình nào để xem ngay</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {groups.map((group, gIdx) => (
              <View key={gIdx} style={styles.groupSection}>
                <Text style={styles.groupHeader}>{group.groupName}</Text>
                <View style={styles.itemsGrid}>
                  {group.items.map((item) => {
                    const isCurrent = currentScreen === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[styles.itemCard, isCurrent && styles.itemCardActive]}
                        onPress={() => {
                          onSelectScreen(item.key);
                          onClose();
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.badgeNum, isCurrent && styles.badgeNumActive]}>
                          <Text style={[styles.badgeText, isCurrent && styles.badgeTextActive]}>
                            {item.number}
                          </Text>
                        </View>
                        <Ionicons
                          name={item.icon as any}
                          size={18}
                          color={isCurrent ? COLORS.primary : COLORS.textDark}
                          style={styles.itemIcon}
                        />
                        <Text
                          style={[styles.itemName, isCurrent && styles.itemNameActive]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {isCurrent && (
                          <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '88%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 18,
  },
  groupSection: {
    gap: 8,
  },
  groupHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsGrid: {
    gap: 6,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#EEEEF2',
  },
  itemCardActive: {
    backgroundColor: '#EEF2FF',
    borderColor: COLORS.primary,
  },
  badgeNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeNumActive: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
  itemIcon: {
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    color: COLORS.textDark,
    flex: 1,
    fontWeight: '500',
  },
  itemNameActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
});
