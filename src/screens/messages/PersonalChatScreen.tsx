import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { COLORS, SHADOWS } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { socketService } from '../../services/socket';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';
import { Audio } from '../../utils/safeAV';

interface PersonalChatProps {
  onNavigate: (screen: ScreenKey) => void;
}

export interface ChatMessage {
  id: string;
  text?: string;
  time: string;
  isMe: boolean;
  type?: 'text' | 'voice' | 'image' | 'location';
  audioUri?: string;
  duration?: number;
  imageUrl?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  reaction?: string;
  replyTo?: { text: string; sender: string };
  isRead?: boolean;
}

export const PersonalChatScreen: React.FC<PersonalChatProps> = ({ onNavigate }) => {
  const [inputText, setInputText] = useState('');
  const [loadingIcebreaker, setLoadingIcebreaker] = useState(false);
  const [isTypingPeer, setIsTypingPeer] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState<ChatMessage | null>(null);
  const [selectedMsgForReaction, setSelectedMsgForReaction] = useState<string | null>(null);

  // Voice recording & playback states
  const [recording, setRecording] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const soundRef = useRef<any | null>(null);
  const recordTimerRef = useRef<any>(null);

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
      text: 'Cuối tuần bạn có rảnh đi cafe ngắm biển Mỹ Khê không?',
      time: '12:28',
      isMe: false,
      isRead: true,
      reaction: '❤️',
    },
    {
      id: '2',
      text: 'Mình đang định đi nè 😊 Bạn có địa điểm nào chill chưa?',
      time: '12:29',
      isMe: true,
      isRead: true,
    },
    {
      id: '3',
      text: 'Ghé Sơn Trà Marina view Santorini nhé! Mình gửi ghim vị trí cho bạn.',
      time: '12:30',
      isMe: false,
      isRead: true,
    },
    {
      id: '4',
      time: '12:30',
      isMe: false,
      type: 'location',
      locationName: 'Sơn Trà Marina Cafe • Thọ Quang, Sơn Trà',
      latitude: 16.1154,
      longitude: 108.2741,
      isRead: true,
    },
    {
      id: '5',
      time: '12:31',
      isMe: false,
      type: 'voice',
      duration: 8,
      audioUri: 'https://example.com/audio.m4a',
      isRead: true,
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
            isRead: true,
          },
        ]);
        loadSmartReplies(incoming.text);
      }
    });

    socketService.onTyping(({ isTyping }) => {
      setIsTypingPeer(isTyping);
    });

    return () => {
      socketService.offReceiveMessage();
      socketService.offTyping();
      socketService.leaveRoom(ROOM_ID);
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    };
  }, []);

  const loadSmartReplies = async (lastText: string) => {
    try {
      const res = await ApiClient.generateSmartReplies(lastText);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setSmartReplies(res.data);
      }
    } catch {}
  };

  // 1. Gửi tin nhắn văn bản
  const handleSendText = (textToSend: string) => {
    if (!textToSend.trim()) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      text: textToSend.trim(),
      time: nowTime,
      isMe: true,
      type: 'text',
      isRead: true,
      replyTo: replyingMessage
        ? {
            text: replyingMessage.text || 'Tin nhắn phương tiện',
            sender: replyingMessage.isMe ? 'Bạn' : 'Minh Thư',
          }
        : undefined,
    };

    setMessages((prev) => [...prev, newMsg]);
    socketService.sendMessage(ROOM_ID, user?.id || 'u_me', user?.name || 'Bạn', textToSend.trim());
    setInputText('');
    setReplyingMessage(null);
    loadSmartReplies(textToSend);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // 2. Thu âm tin nhắn thoại (Voice Audio)
  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Quyền microphone', 'Cần cấp quyền microphone để thu âm tin nhắn thoại.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setRecordDuration(0);

      recordTimerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      clearInterval(recordTimerRef.current);
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const voiceMsg: ChatMessage = {
          id: 'voice_' + Date.now(),
          time: nowTime,
          isMe: true,
          type: 'voice',
          audioUri: uri,
          duration: Math.max(recordDuration, 1),
          isRead: true,
        };
        setMessages((prev) => [...prev, voiceMsg]);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch {
      setIsRecording(false);
    }
  };

  // 3. Phát lại tin nhắn thoại
  const playVoiceMessage = async (msgId: string, uri?: string) => {
    try {
      if (playingAudioId === msgId) {
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          setPlayingAudioId(null);
        }
        return;
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: uri || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setPlayingAudioId(msgId);

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudioId(null);
        }
      });
    } catch {
      setPlayingAudioId(null);
    }
  };

  // 4. Chọn ảnh từ thư viện
  const handlePickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!res.canceled && res.assets && res.assets.length > 0) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const imgMsg: ChatMessage = {
        id: 'img_' + Date.now(),
        time: nowTime,
        isMe: true,
        type: 'image',
        imageUrl: res.assets[0].uri,
        isRead: true,
      };
      setMessages((prev) => [...prev, imgMsg]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // 5. Chia sẻ vị trí GPS thời gian thực
  const handleShareLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let coords = { latitude: 16.0544, longitude: 108.2022 };
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const locMsg: ChatMessage = {
        id: 'loc_' + Date.now(),
        time: nowTime,
        isMe: true,
        type: 'location',
        locationName: `Vị trí trực tiếp của tôi • ${selectedCity}`,
        latitude: coords.latitude,
        longitude: coords.longitude,
        isRead: true,
      };
      setMessages((prev) => [...prev, locMsg]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {}
  };

  // 6. Thả cảm xúc Emoji Reaction
  const handleReactToMessage = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, reaction: m.reaction === emoji ? undefined : emoji } : m))
    );
    setSelectedMsgForReaction(null);
  };

  // 7. Sinh câu mở lời AI
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
        subtitle={isTypingPeer ? 'Đang soạn tin nhắn...' : '🟢 Đang hoạt động • 96đ uy tín'}
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.peerCardName}>Minh Thư</Text>
              <Ionicons name="checkmark-circle" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
            </View>
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

        {/* Message List */}
        {messages.map((m) => {
          const isSelected = selectedMsgForReaction === m.id;
          return (
            <View key={m.id} style={{ position: 'relative', marginBottom: 6 }}>
              {/* Emoji Reaction Popover */}
              {isSelected && (
                <View style={[styles.reactionPopover, m.isMe ? { right: 10 } : { left: 40 }]}>
                  {['❤️', '😂', '😮', '😢', '👍', '🔥'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.emojiTouch}
                      onPress={() => handleReactToMessage(m.id, emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.replyActionTouch}
                    onPress={() => {
                      setReplyingMessage(m);
                      setSelectedMsgForReaction(null);
                    }}
                  >
                    <Ionicons name="arrow-undo" size={15} color={COLORS.textMedium} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={[styles.msgRow, m.isMe ? styles.msgRowMe : styles.msgRowOther]}>
                {!m.isMe && (
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                    }}
                    style={styles.avatar}
                  />
                )}

                <TouchableOpacity
                  activeOpacity={0.9}
                  onLongPress={() => setSelectedMsgForReaction(isSelected ? null : m.id)}
                  style={[styles.bubble, m.isMe ? styles.bubbleMe : styles.bubbleOther]}
                >
                  {/* Trích dẫn tin nhắn (Reply Quote) */}
                  {m.replyTo && (
                    <View style={styles.quoteBox}>
                      <Text style={styles.quoteSender}>{m.replyTo.sender}</Text>
                      <Text style={styles.quoteText} numberOfLines={1}>
                        {m.replyTo.text}
                      </Text>
                    </View>
                  )}

                  {/* 1. Tin nhắn Text */}
                  {(!m.type || m.type === 'text') && (
                    <Text style={[styles.msgText, m.isMe ? styles.msgTextMe : styles.msgTextOther]}>
                      {m.text}
                    </Text>
                  )}

                  {/* 2. Tin nhắn Thoại (Voice Audio Bubble) */}
                  {m.type === 'voice' && (
                    <View style={styles.voiceBubbleRow}>
                      <TouchableOpacity
                        style={styles.playVoiceBtn}
                        onPress={() => playVoiceMessage(m.id, m.audioUri)}
                      >
                        <Ionicons
                          name={playingAudioId === m.id ? 'pause' : 'play'}
                          size={18}
                          color={m.isMe ? '#FFFFFF' : COLORS.primary}
                        />
                      </TouchableOpacity>

                      <View style={styles.voiceWaveWrap}>
                        <View style={styles.waveBarsRow}>
                          {[12, 22, 16, 26, 18, 14, 24, 20, 16, 22, 14].map((h, hIdx) => (
                            <View
                              key={hIdx}
                              style={[
                                styles.waveBar,
                                {
                                  height: h,
                                  backgroundColor: m.isMe ? 'rgba(255,255,255,0.7)' : COLORS.primary,
                                },
                              ]}
                            />
                          ))}
                        </View>
                        <Text style={[styles.voiceDuration, m.isMe ? styles.timeTextMe : styles.timeTextOther]}>
                          0:{m.duration && m.duration < 10 ? `0${m.duration}` : m.duration || '08'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 3. Tin nhắn Ảnh (Image Bubble) */}
                  {m.type === 'image' && m.imageUrl && (
                    <Image source={{ uri: m.imageUrl }} style={styles.msgImageThumb} resizeMode="cover" />
                  )}

                  {/* 4. Tin nhắn Ghim vị trí (Location Pin Bubble) */}
                  {m.type === 'location' && (
                    <TouchableOpacity
                      style={styles.locationPinBubble}
                      onPress={() => onNavigate('map')}
                    >
                      <View style={styles.pinIconCircle}>
                        <Ionicons name="location" size={18} color="#EF4444" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.locationPinTitle}>Ghim địa điểm</Text>
                        <Text style={styles.locationPinDesc} numberOfLines={1}>
                          {m.locationName}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
                    </TouchableOpacity>
                  )}

                  {/* Message Meta: Time & Delivery Status (2 tick xanh) */}
                  <View style={styles.msgMetaRow}>
                    <Text style={[styles.timeText, m.isMe ? styles.timeTextMe : styles.timeTextOther]}>
                      {m.time}
                    </Text>
                    {m.isMe && (
                      <Ionicons
                        name="checkmark-done"
                        size={14}
                        color={m.isRead ? '#38BDF8' : '#94A3B8'}
                        style={{ marginLeft: 3 }}
                      />
                    )}
                  </View>

                  {/* Reaction badge */}
                  {m.reaction && (
                    <View style={styles.reactionBadge}>
                      <Text style={styles.reactionBadgeText}>{m.reaction}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {isTypingPeer && (
          <View style={[styles.msgRow, styles.msgRowOther]}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
              }}
              style={styles.avatar}
            />
            <View style={[styles.bubble, styles.bubbleOther, styles.typingBubble]}>
              <Text style={styles.typingText}>Minh Thư đang soạn tin...</Text>
            </View>
          </View>
        )}

        {/* ViVi Smart Suggestions */}
        <View style={styles.smartSection}>
          <View style={styles.smartHeader}>
            <Ionicons name="sparkles" size={15} color={COLORS.primary} />
            <Text style={styles.smartTitle}>ViVi AI: Gợi ý phản hồi thông minh</Text>
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

      {/* Quote Preview Bar */}
      {replyingMessage && (
        <View style={styles.replyBar}>
          <View style={styles.replyBarLeft}>
            <Ionicons name="arrow-undo" size={14} color={COLORS.primary} />
            <Text style={styles.replyBarSender}>
              Trả lời {replyingMessage.isMe ? 'chính bạn' : 'Minh Thư'}
            </Text>
          </View>
          <Text style={styles.replyBarText} numberOfLines={1}>
            {replyingMessage.text || 'Nội dung đa phương tiện'}
          </Text>
          <TouchableOpacity onPress={() => setReplyingMessage(null)}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      )}

      {/* Recording in progress banner */}
      {isRecording && (
        <View style={styles.recordingBanner}>
          <View style={styles.recordingPulse} />
          <Text style={styles.recordingText}>
            Đang ghi âm giọng nói: 0:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}
          </Text>
          <TouchableOpacity style={styles.stopRecBtn} onPress={stopRecording}>
            <Text style={styles.stopRecText}>Gửi ngay</Text>
          </TouchableOpacity>
        </View>
      )}

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
          placeholder={isRecording ? 'Đang ghi âm...' : 'Nhập tin nhắn...'}
          placeholderTextColor={COLORS.textLight}
          value={inputText}
          onChangeText={setInputText}
          editable={!isRecording}
          onSubmitEditing={() => handleSendText(inputText)}
        />

        {/* Nút Mic hoặc Gửi */}
        {inputText.trim().length > 0 ? (
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSendText(inputText)}>
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.micBtn, isRecording && styles.micBtnRecording]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons name={isRecording ? 'stop' : 'mic'} size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
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
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'relative',
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EEEEF2',
  },
  bubbleMe: {
    backgroundColor: COLORS.primaryDark,
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
  msgMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
  },
  timeTextOther: {
    color: COLORS.textLight,
  },
  timeTextMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  // Voice Bubble
  voiceBubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 160,
  },
  playVoiceBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceWaveWrap: {
    flex: 1,
  },
  waveBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 30,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 10,
    marginTop: 2,
  },
  // Image Bubble
  msgImageThumb: {
    width: 200,
    height: 140,
    borderRadius: 12,
    marginBottom: 4,
  },
  // Location Pin Bubble
  locationPinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  pinIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPinTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9F1239',
  },
  locationPinDesc: {
    fontSize: 11,
    color: '#BE123C',
    marginTop: 2,
  },
  // Quote Box
  quoteBox: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 6,
  },
  quoteSender: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  quoteText: {
    fontSize: 11,
    color: COLORS.textDark,
  },
  // Reaction
  reactionBadge: {
    position: 'absolute',
    bottom: -8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.sm,
  },
  reactionBadgeText: {
    fontSize: 11,
  },
  reactionPopover: {
    position: 'absolute',
    top: -36,
    zIndex: 99,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  emojiTouch: {
    padding: 4,
  },
  emojiText: {
    fontSize: 16,
  },
  replyActionTouch: {
    padding: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    marginLeft: 4,
  },
  // ViVi Suggestions
  smartSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EEEEF2',
  },
  smartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
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
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  replyChipText: {
    fontSize: 12,
    color: COLORS.textDark,
    lineHeight: 16,
  },
  // Reply Bar
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#BFDBFE',
    gap: 8,
  },
  replyBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyBarSender: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  replyBarText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textMedium,
  },
  // Recording Banner
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#FECDD3',
    gap: 8,
  },
  recordingPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
  },
  stopRecBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stopRecText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
    gap: 8,
  },
  mediaBtn: {
    padding: 6,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.textDark,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnRecording: {
    backgroundColor: '#EF4444',
  },
});
