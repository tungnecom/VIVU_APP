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
import { COLORS, SHADOWS } from '../../constants/theme';
import { useFeedStore } from '../../stores/feedStore';
import { ScreenKey } from '../../types';

interface PostDetailProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const PostDetailScreen: React.FC<PostDetailProps> = ({ onNavigate }) => {
  const posts = useFeedStore((state) => state.posts);
  const addComment = useFeedStore((state) => state.addComment);
  const post = posts[0] || MOCK_POSTS[0];
  const [commentInput, setCommentInput] = useState('');

  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Quang Anh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      text: 'Quán Nối view vintage cực đẹp bạn ơi! Đi tầm 16h là nắng đẹp nhất.',
      time: '1 giờ trước',
      likes: 8,
    },
    {
      id: 'c2',
      author: 'Lan Anh',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      text: 'Góc ban công tầng 2 nhìn thẳng ra biển Mỹ Khê bao chill luôn nè!',
      time: '35 phút trước',
      likes: 5,
    },
  ]);

  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      author: 'Tùng (Bạn)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      text: commentInput.trim(),
      time: 'Vừa xong',
      likes: 0,
    };
    setComments((prev) => [...prev, newComment]);
    addComment(post.id);
    setCommentInput('');
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Chi tiết bài viết"
        onBack={() => onNavigate('home_feed')}
        rightIcon="ellipsis-horizontal"
        onRightPress={() => onNavigate('edit_post')}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Author Header */}
        <View style={styles.authorRow}>
          <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} />
          <View style={styles.authorMeta}>
            <Text style={styles.authorName}>{post.author.name}</Text>
            <View style={styles.subMeta}>
              <Text style={styles.timeText}>{post.timeAgo}</Text>
              <Text style={styles.dot}>•</Text>
              <Ionicons name="location-sharp" size={12} color={COLORS.primary} />
              <Text style={styles.locationText}>{post.author.location}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => onNavigate('personal_chat')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.primary} />
            <Text style={styles.connectText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>

        {/* Content text */}
        <Text style={styles.contentText}>{post.content}</Text>

        {/* Hashtags */}
        <View style={styles.hashtagRow}>
          {post.hashtags.map((h, i) => (
            <Text key={i} style={styles.hashtag}>{h} </Text>
          ))}
        </View>

        {/* Full Image Gallery */}
        <View style={styles.imagesGrid}>
          {post.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.largeImage} />
          ))}
        </View>

        {/* Activity Snippet Box */}
        {post.activitySnippet && (
          <View style={styles.snippetCard}>
            <View style={styles.snippetLeft}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
              <View>
                <Text style={styles.snippetTitle}>Lời mời hẹn đi cùng</Text>
                <Text style={styles.snippetSub}>
                  {post.activitySnippet.time} • {post.activitySnippet.slots}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.snippetBtn}
              onPress={() => onNavigate('activity_detail')}
            >
              <Text style={styles.snippetBtnText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats bar */}
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>{post.likes} lượt thích</Text>
          <Text style={styles.statsText}>
            {comments.length} bình luận • {post.sharesCount} chia sẻ
          </Text>
        </View>

        {/* ViVi Smart Suggestion Prompt */}
        <TouchableOpacity
          style={styles.viviSuggestion}
          onPress={() =>
            setCommentInput('@Minh Thư Quán Nối góc Hải Châu có view tầng 2 ngắm hoàng hôn đỉnh lắm nè!')
          }
        >
          <Ionicons name="sparkles" size={16} color={COLORS.primary} />
          <Text style={styles.viviText}>
            ViVi: Bấm vào đây để gợi ý nhanh quán Nối góc Hải Châu cho Minh Thư!
          </Text>
        </TouchableOpacity>

        {/* Comments Section */}
        <View style={styles.commentsBlock}>
          <Text style={styles.commentsHeader}>Bình luận nổi bật</Text>
          {comments.map((c) => (
            <View key={c.id} style={styles.commentItem}>
              <Image source={{ uri: c.avatar }} style={styles.commentAvatar} />
              <View style={styles.commentBody}>
                <View style={styles.commentBubble}>
                  <Text style={styles.commentAuthor}>{c.author}</Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
                <View style={styles.commentFooter}>
                  <Text style={styles.commentTime}>{c.time}</Text>
                  <TouchableOpacity>
                    <Text style={styles.commentReply}>Thích</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.commentReply}>Trả lời</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Comment Input Bar */}
      <View style={styles.inputBar}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          }}
          style={styles.inputUserAvatar}
        />
        <TextInput
          style={styles.input}
          placeholder="Nhập bình luận của bạn..."
          placeholderTextColor={COLORS.textLight}
          value={commentInput}
          onChangeText={setCommentInput}
          onSubmitEditing={handleSendComment}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSendComment}
          activeOpacity={0.8}
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
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  authorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  subMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  dot: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 4,
  },
  connectText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  contentText: {
    fontSize: 15,
    color: COLORS.textDark,
    lineHeight: 23,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  hashtag: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  imagesGrid: {
    gap: 10,
    paddingHorizontal: 16,
  },
  largeImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
  },
  snippetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    padding: 14,
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0DBFF',
  },
  snippetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  snippetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  snippetSub: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 1,
  },
  snippetBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  snippetBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  statsText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  viviSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F0EEFF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 8,
  },
  viviText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    flex: 1,
    fontWeight: '500',
  },
  commentsBlock: {
    paddingHorizontal: 16,
  },
  commentsHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentBody: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 10,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 18,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
    marginLeft: 6,
  },
  commentTime: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  commentReply: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  inputUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
