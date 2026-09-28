import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { ApiClient } from '../../services/api';
import { socketService } from '../../services/socket';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';

interface PersonalChatProps {
  onNavigate: (screen: ScreenKey) => void;
}

interface ChatMessage {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
}

export const PersonalChatScreen: React.FC<PersonalChatProps> = ({ onNavigate }) => {
  const [inputText, setInputText] = useState('');
  const [loadingIcebreaker, setLoadingIcebreaker] = useState(false);
  const [isTypingPeer, setIsTypingPeer] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([
    'Nhất trí nhé! Chiều thứ 7 17h mình có mặt tại điểm hẹn.',
    'Để mình rủ thêm bạn cùng đi cho vui nha! ✨',
    'Địa điểm ở đâu vậy bạn ơi?',
  ]);

  const user = useAuthStore((s) => s.user);
  const selectedCity = useAuthStore((s) => s.selectedCity) || 'Đà Nẵng';
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Cuối tuần bạn có rảnh không?',
      time: '12:28',
      isMe: false,
    },
    {
      id: '2',
      text: 'Mình đang định đi nè 😊 Bạn có kế hoạch gì chưa?',
      time: '12:29',
      isMe: true,
    },
    {
      id: '3',
      text: 'Bạn có thể hỏi mọi người trong nhóm food tour thử xem! Chiều thứ 7 tụi mình gặp nhau nhé.',
      time: '12:30',
      isMe: false,
    },
  ]);

  const ROOM_ID = 'chat_personal_minh_thu';

  useEffect(() => {
    // 1. Kết nối Realtime WebSocket
    socketService.connect(user?.id || 'u_me');
    socketService.joinRoom(ROOM_ID, {
      id: user?.id || 'u_me',
      name: user?.name || 'Bạn',
    });

    socketService.onReceiveMessage((incoming) => {
      if (incoming.senderId !== (user?.id || 'u_me')) {
        setMessages((prev) => [
          ...prev,
          {
            id: incoming.id || Date.now().toString(),
            text: incoming.text,
            time: incoming.time || 'Vừa xong',
            isMe: false,
          },
        ]);
        // Tự động sinh gợi ý trả lời ngữ cảnh mới
        loadSmartReplies(incoming.text);
      }
    });

    socketService.onTyping(({ userName, isTyping }) => {
      setIsTypingPeer(isTyping);
    });

    return () => {
      socketService.offReceiveMessage();
      socketService.offTyping();
      socketService.leaveRoom(ROOM_ID);
    };
  }, []);

  const loadSmartReplies = async (lastText: string) => {
    try {
      const res = await ApiClient.generateSmartReplies(lastText);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setSmartReplies(res.data);
      }
    } catch {
      // Giữ gợi ý mặc định
    }
  };

  const handleSendText = (textToSend: string) => {
    if (!textToSend.trim()) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      text: textToSend.trim(),
      time: nowTime,
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    socketService.sendMessage(ROOM_ID, user?.id || 'u_me', user?.name || 'Bạn', textToSend.trim());
    setInputText('');

    // Sau khi gửi, ViVi cập nhật gợi ý tiếp theo
    loadSmartReplies(textToSend);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleGenerateIcebreaker = async () => {
    setLoadingIcebreaker(true);
    try {
      const res = await ApiClient.generateIcebreaker(
        'Minh Thư',
        ['Ẩm thực', 'Chụp ảnh', 'Cafe ngắm biển'],
        selectedCity
      );
      if (res?.data?.icebreaker) {
        setInputText(res.data.icebreaker);
      }
    } finally {
      setLoadingIcebreaker(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Minh Thư"
        subtitle={isTypingPeer ? 'Đang soạn tin nhắn...' : 'Đang hoạt động • Điểm uy tín: 94'}
        onBack={() => onNavigate('message_home')}
        rightIcon="call-outline"
        onRightPress={() => onNavigate('profile')}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Header */}
        <View style={styles.peerCard}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            }}
            style={styles.peerCardAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.peerCardName}>Minh Thư</Text>
            <Text style={styles.peerCardDesc}>
              Đam mê ẩm thực & săn ảnh hoàng hôn • {selectedCity}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.icebreakerBtn}
            onPress={handleGenerateIcebreaker}
            disabled={loadingIcebreaker}
          >
            {loadingIcebreaker ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                <Text style={styles.icebreakerBtnText}>Gợi ý mở lời</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.msgRow,
              m.isMe ? styles.msgRowMe : styles.msgRowOther,
            ]}
          >
            {!m.isMe && (
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                }}
                style={styles.avatar}
              />
            )}
            <View
              style={[
                styles.bubble,
                m.isMe ? styles.bubbleMe : styles.bubbleOther,
              ]}
            >
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

        {isTypingPeer && (
          <View style={[styles.msgRow, styles.msgRowOther]}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
              }}
              style={styles.avatar}
            />
            <View style={[styles.bubble, styles.bubbleOther, styles.typingBubble]}>
              <Text style={styles.typingText}>Minh Thư đang gõ...</Text>
            </View>
          </View>
        )}

        {/* ViVi Smart Contextual Suggestions Section */}
        <View style={styles.smartSection}>
          <View style={styles.smartHeader}>
            <Ionicons name="sparkles" size={15} color={COLORS.primary} />
            <Text style={styles.smartTitle}>ViVi AI: Gợi ý trả lời ngữ cảnh</Text>
          </View>
          <View style={styles.chipsRow}>
            {smartReplies.map((reply, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.replyChip}
                onPress={() => handleSendText(reply)}
              >
                <Text style={styles.replyChipText} numberOfLines={2}>
                  {reply}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={COLORS.textLight}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSendText(inputText)}
        />

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => handleSendText(inputText)}
        >
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
    gap: 12,
  },
  peerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#ECECF2',
    marginBottom: 8,
  },
  peerCardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  peerCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  peerCardDesc: {
    fontSize: 11,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  icebreakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  icebreakerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
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
  typingBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  typingText: {
    fontSize: 12,
    color: COLORS.textMedium,
    fontStyle: 'italic',
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
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
    color: 'rgba(255,255,255,0.7)',
  },
  smartSection: {
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginTop: 8,
    gap: 8,
  },
  smartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  chipsRow: {
    gap: 6,
  },
  replyChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  replyChipText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 16,
    fontWeight: '500',
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
