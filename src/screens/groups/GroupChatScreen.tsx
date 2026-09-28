import React, { useState } from 'react';
import {
  Image,
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
import { Header } from '../../components/Header';
import { COLORS } from '../../constants/theme';
import { ScreenKey } from '../../types';

interface GroupChatProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const GroupChatScreen: React.FC<GroupChatProps> = ({ onNavigate }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Minh Thư',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      text: 'Tối nay có ai rảnh đi ăn không cả nhà ơi? 🍲',
      time: '18:15',
      isMe: false,
    },
    {
      id: '2',
      sender: 'Quang Anh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      text: 'Mình biết Quán này ngon lắm nè, bánh tráng cuốn thịt heo Đại Lộc!',
      time: '18:17',
      isMe: false,
    },
    {
      id: '3',
      sender: 'ViVi (Trợ lý)',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      text: '✨ ViVi gợi ý: Quán Bánh tráng thịt heo ở Hải Châu đang được đánh giá 4.8⭐. Các bạn có muốn mình tạo cuộc hẹn nhóm ngay tại đây không?',
      time: '18:18',
      isMe: false,
      isBot: true,
    },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'Tùng (Bạn)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        text: inputText.trim(),
        time: 'Vừa xong',
        isMe: true,
      },
    ]);
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Foodie Đà Nẵng"
        subtitle="24 thành viên đang hoạt động"
        onBack={() => onNavigate('group_detail')}
        rightIcon="call-outline"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.msgRow,
              m.isMe ? styles.msgRowMe : styles.msgRowOther,
            ]}
          >
            {!m.isMe && (
              <Image source={{ uri: m.avatar }} style={styles.senderAvatar} />
            )}
            <View
              style={[
                styles.bubble,
                m.isMe
                  ? styles.bubbleMe
                  : m.isBot
                  ? styles.bubbleBot
                  : styles.bubbleOther,
              ]}
            >
              {!m.isMe && (
                <Text
                  style={[
                    styles.senderName,
                    m.isBot && { color: COLORS.primaryDark },
                  ]}
                >
                  {m.sender}
                </Text>
              )}
              <Text
                style={[
                  styles.msgText,
                  m.isMe ? styles.msgTextMe : styles.msgTextOther,
                ]}
              >
                {m.text}
              </Text>
              <Text
                style={[
                  styles.timeText,
                  m.isMe ? styles.timeTextMe : styles.timeTextOther,
                ]}
              >
                {m.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.mediaBtn}>
          <Ionicons name="camera-outline" size={22} color={COLORS.textMedium} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaBtn}>
          <Ionicons name="image-outline" size={22} color={COLORS.textMedium} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn vào nhóm..."
          placeholderTextColor={COLORS.textLight}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  content: {
    padding: 16,
    gap: 14,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  senderAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EEEEF2',
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#F0EEFF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 19,
  },
  msgTextOther: {
    color: COLORS.textDark,
  },
  msgTextMe: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeTextOther: {
    color: COLORS.textLight,
  },
  timeTextMe: {
    color: 'rgba(255,255,255,0.75)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
    gap: 8,
  },
  mediaBtn: {
    padding: 4,
  },
  input: {
    flex: 1,
    height: 42,
    backgroundColor: '#F3F4F6',
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.textDark,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
