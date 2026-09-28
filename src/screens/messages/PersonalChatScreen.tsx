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

interface PersonalChatProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const PersonalChatScreen: React.FC<PersonalChatProps> = ({ onNavigate }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
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

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
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
        title="Minh Thư"
        subtitle="Đang hoạt động"
        onBack={() => onNavigate('message_home')}
        rightIcon="call-outline"
        onRightPress={() => onNavigate('profile')}
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

        {/* ViVi Smart Suggestion Prompt */}
        <TouchableOpacity
          style={styles.viviPrompt}
          onPress={() =>
            setInputText('Nhất trí nhé! Chiều thứ 7 17h mình có mặt tại điểm hẹn.')
          }
        >
          <Ionicons name="sparkles" size={16} color={COLORS.primary} />
          <Text style={styles.viviPromptText}>
            ViVi: Gợi ý trả lời: "Nhất trí nhé! Chiều thứ 7 17h mình có mặt tại điểm hẹn."
          </Text>
        </TouchableOpacity>
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
    gap: 12,
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
  viviPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 8,
    marginTop: 10,
  },
  viviPromptText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    flex: 1,
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
