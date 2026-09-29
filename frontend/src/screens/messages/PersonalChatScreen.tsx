import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';
import { UserAvatar } from '../../components/common/UserAvatar';

interface PersonalChatProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
  partnerId?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

export const PersonalChatScreen: React.FC<PersonalChatProps> = ({
  onNavigate,
  partnerId,
}) => {
  const user = useAuthStore((s) => s.user);
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'Nguyễn Minh Quân',
      text: 'Chào bạn! Mình thấy bạn cũng đăng ký tham gia kèo cafe sáng chủ nhật này.',
      time: '14:20',
      isMe: false,
    },
    {
      id: 'm2',
      sender: 'Bạn',
      text: 'Đúng rồi bạn, mình cũng mê chụp ảnh film nữa. Hẹn gặp bạn ở Wonderlust nhé!',
      time: '14:22',
      isMe: true,
    },
    {
      id: 'm3',
      sender: 'Nguyễn Minh Quân',
      text: 'Tuyệt vời quá! Quán đấy view tầng 2 chụp ánh sáng tự nhiên rất đẹp. Hẹn gặp bạn nha!',
      time: '14:25',
      isMe: false,
    },
  ]);

  const partner = {
    id: partnerId || 'u_01',
    name: 'Nguyễn Minh Quân',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    trustScore: 92,
    isVerified: true,
    status: 'Đang hoạt động',
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: user?.name || 'Bạn',
      text: inputText.trim(),
      time: 'Vừa xong',
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSafetyOptions = () => {
    Alert.alert(
      `Tùy chọn an toàn với ${partner.name}`,
      'Chọn hành động bạn muốn thực hiện để bảo vệ an toàn tương tác:',
      [
        {
          text: 'Báo cáo người dùng',
          onPress: () =>
            Alert.alert(
              'Đã tiếp nhận báo cáo',
              'Cảm ơn bạn. Đội ngũ an toàn Vivu sẽ xem xét tài khoản này.'
            ),
        },
        {
          text: 'Chặn tài khoản này',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Đã chặn tài khoản',
              'Tài khoản này sẽ không thể liên hệ hoặc nhìn thấy bạn trên Vivu nữa.'
            ),
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => onNavigate('message_home')}
          accessibilityLabel="Quay lại danh sách tin nhắn"
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>

        {/* Partner Info */}
        <View style={styles.partnerInfo}>
          <UserAvatar
            uri={partner.avatar}
            name={partner.name}
            size={38}
            trustScore={partner.trustScore}
            isVerified={partner.isVerified}
          />
          <View style={styles.partnerTextCol}>
            <View style={styles.nameRow}>
              <Text style={styles.partnerName} numberOfLines={1}>
                {partner.name}
              </Text>
              {partner.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color={COLORS.accentMint} />
              )}
            </View>
            <Text style={styles.partnerStatus}>
              ⭐ {partner.trustScore}% uy tín • {partner.status}
            </Text>
          </View>
        </View>

        {/* Safety & Action Button (Mục 1.2: Báo cáo, chặn phải dễ tìm) */}
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={handleSafetyOptions}
          accessibilityLabel="Tùy chọn an toàn, báo cáo hoặc chặn"
        >
          <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      {/* Safety Notice Banner */}
      <View style={styles.safetyNotice}>
        <Ionicons name="shield-checkmark" size={13} color={COLORS.accentMint} />
        <Text style={styles.safetyNoticeText}>
          Trò chuyện bảo mật. Hãy thận trọng và luôn gặp nhau ở nơi công cộng.
        </Text>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((item) => (
          <View
            key={item.id}
            style={[styles.msgRow, item.isMe ? styles.msgRowMe : styles.msgRowThem]}
          >
            {!item.isMe && (
              <UserAvatar
                uri={partner.avatar}
                name={partner.name}
                size={30}
                trustScore={partner.trustScore}
              />
            )}

            <View
              style={[
                styles.bubble,
                item.isMe ? styles.bubbleMe : styles.bubbleThem,
              ]}
            >
              <Text
                style={[
                  styles.msgText,
                  item.isMe ? styles.msgTextMe : styles.msgTextThem,
                ]}
              >
                {item.text}
              </Text>
              <Text
                style={[
                  styles.msgTime,
                  item.isMe ? styles.msgTimeMe : styles.msgTimeThem,
                ]}
              >
                {item.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder={`Nhắn tin với ${partner.name.split(' ').pop()}...`}
          placeholderTextColor={COLORS.textLight}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={300}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          disabled={!inputText.trim()}
          onPress={handleSendMessage}
          accessibilityLabel="Gửi tin nhắn"
        >
          <Ionicons name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginHorizontal: 10,
  },
  partnerTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  partnerStatus: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E8F7F2',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D1EFE6',
  },
  safetyNoticeText: {
    fontSize: 11,
    color: '#0F766E',
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 6,
  },
  msgRowThem: {
    justifyContent: 'flex-start',
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '75%',
  },
  bubbleThem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: COLORS.secondaryPurple,
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 19,
  },
  msgTextThem: {
    color: COLORS.textDark,
  },
  msgTextMe: {
    color: '#FFFFFF',
  },
  msgTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgTimeThem: {
    color: COLORS.textLight,
  },
  msgTimeMe: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.textDark,
    maxHeight: 80,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.secondaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow,
  },
  sendBtnDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
});
