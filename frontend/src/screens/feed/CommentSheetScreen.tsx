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
import { MOCK_POSTS } from '../../constants/mockData';
import { COLORS } from '../../constants/theme';
import { useFeedStore } from '../../stores/feedStore';
import { ScreenKey } from '../../types';

interface CommentSheetProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const CommentSheetScreen: React.FC<CommentSheetProps> = ({ onNavigate }) => {
  const posts = useFeedStore((state) => state.posts);
  const addComment = useFeedStore((state) => state.addComment);
  const post = posts[0] || MOCK_POSTS[0];
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      name: 'Quang Anh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      time: '20 phút trước',
      content: 'Dưới quán Nối view cực chill đó bạn ơi! Đi tầm 16h30 ngắm hoàng hôn là số 1.',
      likes: 8,
      repliesCount: 2,
    },
    {
      id: '2',
      name: 'Lan Anh',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      time: '15 phút trước',
      content: 'Bọn mình tuần trước vừa đi thử xong, view nhìn thẳng ra cầu sông Hàn bao đẹp!',
      likes: 5,
      repliesCount: 0,
    },
  ]);

  const handleSend = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: 'Tùng (Bạn)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        time: 'Vừa xong',
        content: commentText.trim(),
        likes: 0,
        repliesCount: 0,
      },
    ]);
    addComment(post.id);
    setCommentText('');
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Bình luận"
        subtitle={`${comments.length} bình luận`}
        onBack={() => onNavigate('home_feed')}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Post Snippet */}
        <View style={styles.postSnippet}>
          <Image source={{ uri: post.author.avatar }} style={styles.snippetAvatar} />
          <View style={styles.snippetInfo}>
            <Text style={styles.snippetAuthor}>{post.author.name}</Text>
            <Text style={styles.snippetText} numberOfLines={2}>
              {post.content}
            </Text>
          </View>
        </View>

        {/* Comments List */}
        <View style={styles.commentsList}>
          {comments.map((item) => (
            <View key={item.id} style={styles.commentItem}>
              <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
              <View style={styles.commentContent}>
                <View style={styles.bubble}>
                  <Text style={styles.commentAuthor}>{item.name}</Text>
                  <Text style={styles.commentBody}>{item.content}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <TouchableOpacity>
                    <Text style={styles.actionText}>Thích ({item.likes})</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.actionText}>Trả lời</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ViVi Smart Suggestion Prompt */}
        <TouchableOpacity
          style={styles.viviPromptCard}
          onPress={() =>
            setCommentText(
              '@Minh Thư Mình cũng hay ghé Nối Cafe, chiều nay bạn có ghé đó không?'
            )
          }
        >
          <View style={styles.viviHeaderRow}>
            <Ionicons name="sparkles" size={16} color={COLORS.primary} />
            <Text style={styles.viviTitle}>ViVi Trợ lý ảo gợi ý:</Text>
          </View>
          <Text style={styles.viviSuggestion}>
            "Có thể hỏi để bắt chuyện: @Minh Thư Quán Nối góc Hải Châu không nhé!"
          </Text>
          <Text style={styles.tapToUse}>Bấm để dùng câu này ngay ↗</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Sticky Comment Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập bình luận của bạn..."
          placeholderTextColor={COLORS.textLight}
          value={commentText}
          onChangeText={setCommentText}
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
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  postSnippet: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF2',
    gap: 12,
  },
  snippetAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  snippetInfo: {
    flex: 1,
  },
  snippetAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  snippetText: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  commentsList: {
    padding: 16,
    gap: 16,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentContent: {
    flex: 1,
  },
  bubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 12,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 3,
  },
  commentBody: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 5,
    marginLeft: 4,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  viviPromptCard: {
    margin: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F0EEFF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  viviHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  viviTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  viviSuggestion: {
    fontSize: 13,
    color: COLORS.textDark,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  tapToUse: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '700',
    marginTop: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
    backgroundColor: '#FFFFFF',
    gap: 10,
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
