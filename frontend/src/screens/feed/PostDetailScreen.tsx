import React, { useState } from 'react';
import {
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
import { COLORS, SHADOWS } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';
import { ApiClient } from '../../services/api';
import { ScreenKey } from '../../types';
import { UserAvatar } from '../../components/common/UserAvatar';

interface PostDetailProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
  postId?: string;
}

export const PostDetailScreen: React.FC<PostDetailProps> = ({
  onNavigate,
  postId,
}) => {
  const posts = useFeedStore((s) => s.posts);
  const token = useAuthStore((s) => s.token);
  const currentUser = useAuthStore((s) => s.user);

  const post = posts.find((p) => p.id === postId) || posts[0] || {
    id: 'post_demo',
    content:
      'Chiều nay lang thang quanh phố đi bộ Bạch Đằng ngắm hoàng hôn buông xuống sông Hàn. Gió mát rượi, cafe thơm lừng, ai cũng tươi cười. Đà Nẵng mùa này thật sự quá tuyệt vời để ra ngoài tận hưởng!',
    location: 'Phố đi bộ Bạch Đằng, Hải Châu, Đà Nẵng',
    images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'],
    createdAt: '2 giờ trước',
    likes: 24,
    commentsCount: 3,
    author: {
      name: 'Thuỳ Linh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      trustScore: 91,
    },
  };

  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([
    {
      id: 'c1',
      author: 'Hoàng Long',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      text: 'View này ngắm Cầu Rồng phun lửa cũng đẹp lắm bạn ơi!',
      time: '1 giờ trước',
      trustScore: 88,
    },
    {
      id: 'c2',
      author: 'Mai Anh',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      text: 'Cuối tuần này có ai lên kèo cafe ở đây không, cho mình đi cùng với 😍',
      time: '30 phút trước',
      trustScore: 85,
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    if (!token) {
      Alert.alert('Cần đăng nhập', 'Vui lòng đăng nhập để bình luận.', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => onNavigate('login') },
      ]);
      return;
    }

    setSubmitting(true);
    const newComment = {
      id: `c_${Date.now()}`,
      author: currentUser?.name || 'Bạn',
      avatar: currentUser?.avatar,
      text: commentText.trim(),
      time: 'Vừa xong',
      trustScore: currentUser?.trustScore || 85,
    };

    setComments([...comments, newComment]);
    setCommentText('');

    try {
      await ApiClient.createComment(post.id, commentText.trim(), token);
    } catch {
      // Local optimistic update
    } finally {
      setSubmitting(false);
    }
  };

  // Luồng C: Chuyển từ bài viết sang Tạo kèo
  const handleRuDiCung = () => {
    onNavigate('create_post', {
      venueName: post.location,
      category: 'Cafe',
    });
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
          onPress={() => onNavigate('home_feed')}
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => Alert.alert('Chia sẻ', 'Liên kết bài viết đã được sao chép!')}
          accessibilityLabel="Chia sẻ"
        >
          <Ionicons name="share-social-outline" size={18} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Author Card */}
        <View style={styles.authorRow}>
          <UserAvatar
            uri={post.author?.avatar}
            name={post.author?.name}
            size={48}
            trustScore={post.author?.trustScore}
            isVerified={true}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post.author?.name || 'Thành viên Vivu'}</Text>
            <Text style={styles.postMeta}>{post.createdAt} • {post.location}</Text>
          </View>
        </View>

        {/* Content text */}
        <Text style={styles.bodyText}>{post.content}</Text>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imageWrap}>
            <Image source={{ uri: post.images[0] }} style={styles.postImage} />
          </View>
        )}

        {/* Luồng C: CTA Rủ đi cùng tại địa điểm này */}
        {post.location && (
          <View style={styles.luongCBanner}>
            <View style={styles.luongCTextCol}>
              <View style={styles.locationTitleRow}>
                <Ionicons name="location" size={15} color={COLORS.secondaryPurple} />
                <Text style={styles.locationTitle} numberOfLines={1}>
                  {post.location}
                </Text>
              </View>
              <Text style={styles.luongCSubtitle}>
                Thích địa điểm này? Hãy lên kèo để rủ cạ đi cùng!
              </Text>
            </View>

            <TouchableOpacity
              style={styles.ruDiCungBtn}
              activeOpacity={0.85}
              onPress={handleRuDiCung}
              accessibilityLabel="Rủ đi cùng tại địa điểm này"
            >
              <Ionicons name="compass" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.ruDiCungText}>Rủ đi cùng</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Like and Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.likeBtn}
            onPress={() => setIsLiked(!isLiked)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? COLORS.primaryCoral : COLORS.textLight}
            />
            <Text style={[styles.statsNum, isLiked && { color: COLORS.primaryCoral }]}>
              {(post.likes || 0) + (isLiked ? 1 : 0)} Yêu thích
            </Text>
          </TouchableOpacity>

          <View style={styles.commentCountRow}>
            <Ionicons name="chatbubble-outline" size={18} color={COLORS.textLight} />
            <Text style={styles.statsNum}>{comments.length} Bình luận</Text>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Bình luận</Text>

          {comments.map((cmt) => (
            <View key={cmt.id} style={styles.commentItem}>
              <UserAvatar
                uri={cmt.avatar}
                name={cmt.author}
                size={36}
                trustScore={cmt.trustScore}
              />
              <View style={styles.commentBubble}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{cmt.author}</Text>
                  <Text style={styles.commentTime}>{cmt.time}</Text>
                </View>
                <Text style={styles.commentText}>{cmt.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Input bar ở đáy */}
      <View style={styles.commentInputBar}>
        <TextInput
          style={styles.commentInput}
          placeholder="Viết bình luận hoặc rủ cạ..."
          placeholderTextColor={COLORS.textLight}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!commentText.trim() || submitting) && styles.sendBtnDisabled,
          ]}
          disabled={!commentText.trim() || submitting}
          onPress={handleSendComment}
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
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  postMeta: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  bodyText: {
    fontSize: 15,
    color: COLORS.textDark,
    lineHeight: 23,
    marginBottom: 14,
  },
  imageWrap: {
    height: 240,
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#EBE7E1',
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  luongCBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3EEFD',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6DCFB',
    marginBottom: 16,
  },
  luongCTextCol: {
    flex: 1,
    marginRight: 10,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondaryPurple,
  },
  luongCSubtitle: {
    fontSize: 11,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  ruDiCungBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryCoral,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 16,
    ...SHADOWS.glow,
  },
  ruDiCungText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsNum: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  commentsSection: {
    marginTop: 4,
  },
  commentsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 14,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  commentBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  commentTime: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  commentText: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 18,
  },
  commentInputBar: {
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
  commentInput: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryCoral,
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
