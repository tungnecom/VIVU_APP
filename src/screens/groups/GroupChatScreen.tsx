import React, { useEffect, useRef, useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Header } from '../../components/Header';
import { COLORS } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { socketService } from '../../services/socket';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';

interface GroupChatProps {
  onNavigate: (screen: ScreenKey) => void;
}

interface GroupMessage {
  id: string;
  sender: string;
  avatar: string;
  text?: string;
  time: string;
  isMe: boolean;
  isBot?: boolean;
  imageUrl?: string;
  locationName?: string;
}

export const GroupChatScreen: React.FC<GroupChatProps> = ({ onNavigate }) => {
  const [inputText, setInputText] = useState('');
  const user = useAuthStore((s) => s.user);
  const selectedCity = useAuthStore((s) => s.selectedCity) || 'Đà Nẵng';
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<GroupMessage[]>([
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
      text: `✨ ViVi gợi ý: Quán Bánh tráng thịt heo ở Hải Châu (${selectedCity}) đang được đánh giá 4.8⭐. Các bạn có muốn mình tạo cuộc hẹn nhóm ngay tại đây không?`,
      time: '18:18',
      isMe: false,
      isBot: true,
    },
  ]);

  const ROOM_ID = 'group_foodie_danang';

  useEffect(() => {
    socketService.connect(user?.id || 'u_me');
    socketService.joinRoom(ROOM_ID, {
      id: user?.id || 'u_me',
      name: user?.name || 'Tùng (Bạn)',
    });

    socketService.onReceiveMessage((incoming) => {
      if (incoming.senderId !== (user?.id || 'u_me')) {
        setMessages((prev) => [
          ...prev,
          {
            id: incoming.id || Date.now().toString(),
            sender: incoming.senderName || 'Thành viên',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            text: incoming.text,
            time: incoming.time || 'Vừa xong',
            isMe: false,
            isBot: incoming.isBot,
          },
        ]);
      }
    });

    return () => {
      socketService.offReceiveMessage();
      socketService.leaveRoom(ROOM_ID);
    };
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: GroupMessage = {
      id: Date.now().toString(),
      sender: `${user?.name || 'Tùng'} (Bạn)`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      text: textToSend,
      time: nowTime,
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    socketService.sendMessage(ROOM_ID, user?.id || 'u_me', user?.name || 'Bạn', textToSend);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Nếu nhắc đến ViVi hoặc hỏi địa điểm
    if (textToSend.toLowerCase().includes('vivi') || textToSend.toLowerCase().includes('quán nào') || textToSend.toLowerCase().includes('ăn gì')) {
      setTimeout(async () => {
        const res = await ApiClient.askViVi(textToSend, selectedCity);
        const botReply = res?.data?.reply || `ViVi đề xuất quán Bún chả cá 109 Nguyễn Chí Thanh hoặc Chè sầu Liên cực ngon ở ${selectedCity} cho cả nhóm nhé! ✨`;
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ViVi (Trợ lý)',
            avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
            text: `✨ ViVi phản hồi: ${botReply}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false,
            isBot: true,
          },
        ]);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 700);
    }
  };

  const handlePickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!res.canceled && res.assets && res.assets.length > 0) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const imgMsg: GroupMessage = {
        id: 'group_img_' + Date.now(),
        sender: `${user?.name || 'Tùng'} (Bạn)`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        imageUrl: res.assets[0].uri,
        time: nowTime,
        isMe: true,
      };
      setMessages((prev) => [...prev, imgMsg]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleShareLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let coordsName = `Điểm hẹn nhóm • ${selectedCity}`;
      if (status === 'granted') {
        coordsName = `Vị trí trực tiếp của tôi • ${selectedCity}`;
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const locMsg: GroupMessage = {
        id: 'group_loc_' + Date.now(),
        sender: `${user?.name || 'Tùng'} (Bạn)`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        locationName: coordsName,
        time: nowTime,
        isMe: true,
      };
      setMessages((prev) => [...prev, locMsg]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {}
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Foodie Đà Nẵng"
        subtitle="24 thành viên • Kết nối Socket.io Real-time"
        onBack={() => onNavigate('group_detail')}
        rightIcon="call-outline"
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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

              {/* Text message */}
              {m.text && (
                <Text
                  style={[
                    styles.msgText,
                    m.isMe
                      ? styles.msgTextMe
                      : m.isBot
                      ? styles.msgTextBot
                      : styles.msgTextOther,
                  ]}
                >
                  {m.text}
                </Text>
              )}

              {/* Image message */}
              {m.imageUrl && (
                <Image source={{ uri: m.imageUrl }} style={styles.groupImageThumb} resizeMode="cover" />
              )}

              {/* Location pin message */}
              {m.locationName && (
                <TouchableOpacity
                  style={styles.locationPinCard}
                  onPress={() => onNavigate('map')}
                >
                  <Ionicons name="location" size={16} color="#EF4444" />
                  <Text style={styles.locationPinText} numberOfLines={1}>{m.locationName}</Text>
                </TouchableOpacity>
              )}

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

        {/* Quick Prompt Pill */}
        <TouchableOpacity
          style={styles.askViViPill}
          onPress={() => setInputText('ViVi ơi, nhóm mình nên đi ăn quán nào gần biển Mỹ Khê?')}
        >
          <Ionicons name="sparkles" size={14} color={COLORS.primary} />
          <Text style={styles.askViViText}>
            Hỏi ViVi: Gợi ý quán ngon cho nhóm gần biển Mỹ Khê
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.mediaBtn} onPress={handlePickImage}>
          <Ionicons name="image-outline" size={22} color={COLORS.textMedium} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaBtn} onPress={handleShareLocation}>
          <Ionicons name="location-outline" size={22} color={COLORS.textMedium} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn hoặc gõ ViVi..."
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
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  senderAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
  bubbleBot: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextOther: {
    color: COLORS.textDark,
  },
  msgTextBot: {
    color: '#581C87',
    fontWeight: '500',
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
  groupImageThumb: {
    width: 200,
    height: 130,
    borderRadius: 12,
    marginBottom: 4,
  },
  locationPinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginBottom: 4,
  },
  locationPinText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  askViViPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginTop: 6,
  },
  askViViText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
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
