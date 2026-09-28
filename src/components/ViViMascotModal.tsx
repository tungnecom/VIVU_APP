import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../constants/theme';
import { ApiClient } from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface ViViModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAction?: (text: string) => void;
}

export const ViViMascotModal: React.FC<ViViModalProps> = ({
  visible,
  onClose,
  onSelectAction,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'chat'>('menu');
  const [inputVal, setInputVal] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const selectedCity = useAuthStore((s) => s.selectedCity) || 'Đà Nẵng';
  const selectedInterests = useAuthStore((s) => s.selectedInterests);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'vivi' | 'user'; text: string }>>([
    {
      sender: 'vivi',
      text: `Chào bạn! Mình là ViVi ✨. Mình có thể giúp bạn gợi ý quán xá tại ${selectedCity}, viết tin nhắn làm quen mượt mà hoặc tìm cạ cứng cùng sở thích nhé!`,
    },
  ]);


  const VIVI_ACTIONS = [
    {
      id: 'chat',
      title: 'Trò chuyện với ViVi',
      icon: 'chatbubbles',
      color: '#6366F1',
      desc: 'Hỏi bất kỳ điều gì về du lịch, ẩm thực Đà Nẵng',
    },
    {
      id: 'write_msg',
      title: 'Giúp viết tin nhắn',
      icon: 'create',
      color: '#EC4899',
      desc: 'Tạo lời mời đi chơi tự nhiên, cuốn hút',
      sample: 'Chào Minh Thư, mình thấy bạn cũng thích ngắm hoàng hôn Sơn Trà. Chiều thứ 7 này nhóm mình có hẹn đi cafe view biển, bạn tham gia chung cho vui nhé! 🌅',
    },
    {
      id: 'common_topic',
      title: 'Tìm chủ đề chung',
      icon: 'search',
      color: '#10B981',
      desc: 'Phát hiện sở thích tương đồng giữa 2 bạn',
      sample: 'Cả hai bạn đều thích Ẩm thực đường phố & Cắm trại dã ngoại! Hãy bắt đầu với: "Bạn từng thử cắm trại ở Hồ Đồng Xanh chưa?"',
    },
    {
      id: 'icebreak',
      title: 'Giúp bắt chuyện',
      icon: 'hand-left',
      color: '#F59E0B',
      desc: 'Câu mở đầu ấn tượng, không gượng gạo',
      sample: 'Cuối tuần này bạn có kế hoạch săn ảnh hoàng hôn ở đâu chưa? Nghe nói Cầu Rồng tuần này đông vui lắm!',
    },
    {
      id: 'reply_helper',
      title: 'Giúp trả lời tin nhắn',
      icon: 'bulb',
      color: '#8B5CF6',
      desc: 'Gợi ý câu phản hồi thông minh, thân thiện',
      sample: 'Nghe hấp dẫn quá! 17h mình có mặt tại điểm hẹn nhé, hẹn gặp cả nhóm!',
    },
  ];

  const handleActionClick = async (action: typeof VIVI_ACTIONS[0]) => {
    if (action.id === 'chat') {
      setActiveTab('chat');
      return;
    }

    if (action.id === 'icebreak' || action.id === 'write_msg') {
      setActiveTab('chat');
      setLoadingAi(true);
      const res = await ApiClient.generateIcebreaker(
        'bạn mới',
        selectedInterests.length > 0 ? selectedInterests : ['Ẩm thực', 'Cafe'],
        selectedCity
      );
      setLoadingAi(false);
      const text = res?.data?.icebreaker || action.sample!;
      setChatMessages((prev) => [
        ...prev,
        { sender: 'user', text: `ViVi gợi ý: ${action.title}` },
        { sender: 'vivi', text },
      ]);
      onSelectAction?.(text);
      return;
    }

    if (action.id === 'reply_helper') {
      setActiveTab('chat');
      setLoadingAi(true);
      const res = await ApiClient.generateSmartReplies('Cuối tuần này gặp nhau ở đâu nhỉ?');
      setLoadingAi(false);
      const firstReply = res?.data?.[0] || action.sample!;
      setChatMessages((prev) => [
        ...prev,
        { sender: 'user', text: `ViVi gợi ý: ${action.title}` },
        { sender: 'vivi', text: `Gợi ý phản hồi hay nhất:\n👉 "${firstReply}"` },
      ]);
      onSelectAction?.(firstReply);
      return;
    }

    if (action.sample) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'user', text: `ViVi gợi ý: ${action.title}` },
        { sender: 'vivi', text: action.sample! },
      ]);
      setActiveTab('chat');
      onSelectAction?.(action.sample);
    }
  };

  const handleSend = async () => {
    if (!inputVal.trim() || loadingAi) return;
    const userMsg = inputVal.trim();
    setInputVal('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoadingAi(true);

    try {
      const res = await ApiClient.askViVi(userMsg, selectedCity);
      const reply = res?.data?.reply || 'ViVi luôn sẵn sàng đồng hành cùng bạn trên mọi nẻo đường!';
      setChatMessages((prev) => [...prev, { sender: 'vivi', text: reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'vivi', text: 'ViVi đang ghi nhận ý kiến của bạn, cùng kết nối nhé! ✨' },
      ]);
    } finally {
      setLoadingAi(false);
    }
  };


  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={styles.sheetHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerLeft}>
              <View style={styles.avatarWrap}>
                <Ionicons name="sparkles" size={20} color="#FFD700" />
              </View>
              <View>
                <Text style={styles.headerTitle}>ViVi - Trợ lý ảo</Text>
                <Text style={styles.headerSubtitle}>Gợi ý thông minh cho chuyến đi của bạn</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Tab Switcher */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'menu' && styles.tabBtnActive]}
              onPress={() => setActiveTab('menu')}
            >
              <Text style={[styles.tabText, activeTab === 'menu' && styles.tabTextActive]}>
                Danh mục gợi ý
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'chat' && styles.tabBtnActive]}
              onPress={() => setActiveTab('chat')}
            >
              <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
                Trò chuyện với ViVi
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === 'menu' ? (
            <ScrollView style={styles.menuScroll} contentContainerStyle={styles.menuContent}>
              {VIVI_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  activeOpacity={0.7}
                  onPress={() => handleActionClick(action)}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: `${action.color}15` }]}>
                    <Ionicons name={action.icon as any} size={22} color={action.color} />
                  </View>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDesc}>{action.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.chatContainer}>
              <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
                {chatMessages.map((msg, i) => (
                  <View
                    key={i}
                    style={[
                      styles.chatBubbleWrap,
                      msg.sender === 'user' ? styles.bubbleUserWrap : styles.bubbleViviWrap,
                    ]}
                  >
                    {msg.sender === 'vivi' && (
                      <View style={styles.viviMiniAvatar}>
                        <Ionicons name="sparkles" size={12} color="#FFF" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.chatBubble,
                        msg.sender === 'user' ? styles.bubbleUser : styles.bubbleVivi,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chatBubbleText,
                          msg.sender === 'user' ? styles.chatBubbleUserText : styles.chatBubbleViviText,
                        ]}
                      >
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                ))}

                {loadingAi && (
                  <View style={[styles.chatBubbleWrap, styles.bubbleViviWrap]}>
                    <View style={styles.viviMiniAvatar}>
                      <Ionicons name="sparkles" size={12} color="#FFF" />
                    </View>
                    <View style={[styles.chatBubble, styles.bubbleVivi, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={[styles.chatBubbleText, styles.chatBubbleViviText, { fontStyle: 'italic', fontSize: 13 }]}>
                        ViVi đang suy nghĩ...
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Chat Input */}
              <View style={styles.inputRow}>

                <TextInput
                  style={styles.input}
                  placeholder="Hỏi ViVi điều gì đó..."
                  placeholderTextColor={COLORS.textLight}
                  value={inputVal}
                  onChangeText={setInputVal}
                  onSubmitEditing={handleSend}
                />
                <TouchableOpacity onPress={handleSend} style={styles.sendBtn} activeOpacity={0.8}>
                  <Ionicons name="send" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: 460,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFAFC',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    padding: 16,
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F4',
    ...SHADOWS.sm,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 3,
  },
  actionDesc: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
  chatContainer: {
    flex: 1,
    minHeight: 340,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 12,
  },
  chatBubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bubbleUserWrap: {
    justifyContent: 'flex-end',
  },
  bubbleViviWrap: {
    justifyContent: 'flex-start',
  },
  viviMiniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  chatBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleVivi: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  chatBubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatBubbleUserText: {
    color: '#FFFFFF',
  },
  chatBubbleViviText: {
    color: COLORS.textDark,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
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
