import React, { useEffect, useRef, useState } from 'react';
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
import { useActivityStore } from '../../stores/activityStore';
import { ScreenKey } from '../../types';
import { UserAvatar } from '../../components/common/UserAvatar';
import { PlanPinnedHeader } from '../../components/common/PlanPinnedHeader';

interface GroupChatProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
  activityId?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar?: string;
  text: string;
  time: string;
  isMe: boolean;
  isSystem?: boolean;
}

export const GroupChatScreen: React.FC<GroupChatProps> = ({
  onNavigate,
  activityId,
}) => {
  const user = useAuthStore((s) => s.user);
  const currentActivity = useActivityStore((s) => s.currentActivity);
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'sys_1',
      sender: 'Hệ thống Vivu',
      text: 'Chào mừng các bạn đã được duyệt tham gia kèo! Kế hoạch đã được ghim ở phía trên.',
      time: '08:00',
      isMe: false,
      isSystem: true,
    },
    {
      id: 'm1',
      sender: 'Nguyễn Minh Quân (Chủ kèo)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text: 'Chào cả nhà, Chủ nhật này 8h30 hẹn gặp nhau ở Wonderlust nhé! Quán có view rất thoáng.',
      time: '08:05',
      isMe: false,
    },
    {
      id: 'm2',
      sender: 'Trần Thu Hà',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      text: 'Dạ vâng anh, em sẽ đến đúng giờ mang theo máy ảnh film luôn ạ ✨',
      time: '08:12',
      isMe: false,
    },
  ]);

  const activity = currentActivity || {
    id: activityId || 'act_01',
    title: 'Cafe sáng ngắm sông Hàn & chia sẻ về nhiếp ảnh',
    time: 'Chủ Nhật, 08:30 - 10:30',
    location: 'Wonderlust Cafe, 96 Trần Phú, Hải Châu, Đà Nẵng',
    joined: 3,
    maxParticipants: 4,
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: user?.name || 'Bạn',
      avatar: user?.avatar,
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

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {activity.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            Nhóm kèo • 👥 {activity.joined}/{activity.maxParticipants} thành viên
          </Text>
        </View>

        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => onNavigate('activity_detail', { id: activity.id })}
          accessibilityLabel="Xem chi tiết kèo"
        >
          <Ionicons name="information-circle-outline" size={22} color={COLORS.secondaryPurple} />
        </TouchableOpacity>
      </View>

      {/* Plan Pinned Header (Mục 6.3 & UX-20: Luôn ghim thông tin kế hoạch) */}
      <PlanPinnedHeader
        title={activity.title}
        time={activity.time}
        location={activity.location}
        memberCount={activity.joined}
        maxParticipants={activity.maxParticipants}
        onViewPlanDetail={() => onNavigate('activity_detail', { id: activity.id })}
      />

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((item) => {
          if (item.isSystem) {
            return (
              <View key={item.id} style={styles.systemMsgWrap}>
                <Ionicons name="information-circle" size={14} color={COLORS.secondaryPurple} />
                <Text style={styles.systemMsgText}>{item.text}</Text>
              </View>
            );
          }

          return (
            <View
              key={item.id}
              style={[styles.msgRow, item.isMe ? styles.msgRowMe : styles.msgRowThem]}
            >
              {!item.isMe && (
                <UserAvatar
                  uri={item.avatar}
                  name={item.sender}
                  size={32}
                  trustScore={88}
                />
              )}

              <View
                style={[
                  styles.bubble,
                  item.isMe ? styles.bubbleMe : styles.bubbleThem,
                ]}
              >
                {!item.isMe && (
                  <Text style={styles.senderName}>{item.sender}</Text>
                )}
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
          );
        })}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Nhắn tin với cả nhóm..."
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
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 12,
  },
  systemMsgWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3EEFD',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
    maxWidth: '90%',
    marginVertical: 6,
  },
  systemMsgText: {
    fontSize: 11,
    color: COLORS.secondaryPurple,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
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
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryPurple,
    marginBottom: 4,
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
