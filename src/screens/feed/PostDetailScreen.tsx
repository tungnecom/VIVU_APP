import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { MOCK_POSTS } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useFeedStore } from '../../stores/feedStore';
import { ScreenKey } from '../../types';
import { ResizeMode, Video } from '../../utils/safeAV';

interface PostDetailProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const PostDetailScreen: React.FC<PostDetailProps> = ({ onNavigate }) => {
  const posts = useFeedStore((state) => state.posts);
  const selectedPostId = useFeedStore((state) => state.selectedPostId);
  const addComment = useFeedStore((state) => state.addComment);
  const toggleLike = useFeedStore((state) => state.toggleLike);
  const likedPostIds = useFeedStore((state) => state.likedPostIds) || {};
  const likedPosts = useFeedStore((state) => state.likedPosts) || likedPostIds;

  // Retrieve selected post or fallback safely
  const post =
    posts.find((p) => p.id === selectedPostId) || posts[0] || MOCK_POSTS[0];

  const isLiked = !!(likedPostIds[post.id] ?? likedPosts[post.id] ?? post.isLiked);

  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Quang Anh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      text: 'Địa điểm này view chụp ảnh hoàng hôn cực phẩm luôn!',
      time: '1 giờ trước',
      likes: 8,
    },
    {
      id: 'c2',
      author: 'Lan Anh',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      text: 'Mọi người nhớ chuẩn bị áo khoác nhẹ nha, gió biển chiều tối mát lạnh lắm.',
      time: '35 phút trước',
      likes: 5,
    },
  ]);

  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    const newComment = {
      id: 'cmt_' + Date.now(),
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem bài viết của ${post.author.name} trên VIVU:\n"${post.content}"`,
        title: 'Chia sẻ bài viết VIVU',
      });
    } catch {
      // Ignored
    }
  };

  const handleOpenGoogleMapsDirections = (lat?: number, lng?: number) => {
    const latitude = lat || post.taggedVenue?.latitude || 16.0544;
    const longitude = lng || post.taggedVenue?.longitude || 108.2022;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Chỉ đường', `Tọa độ: ${latitude}, ${longitude}`);
    });
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
        {/* AUTHOR HEADER */}
        <View style={styles.authorRow}>
          <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} />
          <View style={styles.authorMeta}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark" size={11} color="#059669" />
                <Text style={styles.trustBadgeText}>94đ</Text>
              </View>
            </View>
            <View style={styles.subMeta}>
              <Text style={styles.timeText}>{post.timeAgo}</Text>
              <Text style={styles.dot}>•</Text>
              <Ionicons name="location-sharp" size={12} color={COLORS.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {post.author.location}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => onNavigate('personal_chat')}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.primary} />
            <Text style={styles.connectText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>

        {/* POST CONTENT */}
        <Text style={styles.contentText}>{post.content}</Text>

        {/* HASHTAGS */}
        {post.hashtags && post.hashtags.length > 0 && (
          <View style={styles.hashtagRow}>
            {post.hashtags.map((h, i) => (
              <Text key={i} style={styles.hashtag}>
                {h}{' '}
              </Text>
            ))}
          </View>
        )}

        {/* TAGGED FRIENDS ROW */}
        {post.taggedCompanions && post.taggedCompanions.length > 0 && (
          <View style={styles.taggedFriendsCard}>
            <Ionicons name="people" size={15} color="#7C3AED" />
            <Text style={styles.taggedFriendsTitle}>Cùng với: </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {post.taggedCompanions.map((comp, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.friendPill}
                  onPress={() => onNavigate('personal_chat')}
                >
                  <Image source={{ uri: comp.avatar }} style={styles.friendPillAvatar} />
                  <Text style={styles.friendPillName}>@{comp.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* TAGGED SPOT: GOOGLE MAPS 1:1 INTERACTIVE CARD */}
        {post.taggedVenue && (
          <View style={styles.venueGoogleCard}>
            {/* Map Header with Satellite / Standard Vector Snapshot */}
            <View style={styles.venueMapSnapshotWrap}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800',
                }}
                style={styles.venueMapSnapshot}
              />
              <View style={styles.venuePinOverlay}>
                <View style={styles.googleMapPin}>
                  <Ionicons name="location" size={20} color="#EA4335" />
                </View>
                <View style={styles.googlePinHalo} />
              </View>
              <View style={styles.googleWatermark}>
                <Text style={styles.googleWatermarkText}>Google Maps</Text>
              </View>
            </View>

            {/* Venue Info */}
            <View style={styles.venueCardDetails}>
              <View style={styles.venueNameRow}>
                <Text style={styles.venueNameText}>{post.taggedVenue.name}</Text>
                <View style={styles.venuePlatformBadge}>
                  <Text style={styles.platformBadgeText}>
                    {post.taggedVenue.platformSource || 'VERIFIED'}
                  </Text>
                </View>
              </View>

              <View style={styles.venueAddressRow}>
                <Ionicons name="navigate-outline" size={14} color="#6B7280" />
                <Text style={styles.venueAddressText} numberOfLines={2}>
                  {post.taggedVenue.address}
                </Text>
              </View>

              {/* Action Buttons: Directions on Google Maps + Open on VIVU Map */}
              <View style={styles.venueActionsRow}>
                <TouchableOpacity
                  style={styles.googleDirectionsBtn}
                  onPress={() =>
                    handleOpenGoogleMapsDirections(
                      post.taggedVenue?.latitude,
                      post.taggedVenue?.longitude
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate" size={14} color="#FFF" />
                  <Text style={styles.googleDirectionsText}>Chỉ đường Google Maps</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.vivuMapBtn}
                  onPress={() => onNavigate('map')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="map-outline" size={14} color="#1A73E8" />
                  <Text style={styles.vivuMapBtnText}>Mở bản đồ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* RECRUITMENT OR WISH COMPANION BANNER */}
        {post.isRecruitment && post.activitySnippet && (
          <View style={styles.recruitmentCard}>
            <View style={styles.recruitmentHeader}>
              <View style={styles.recruitmentTag}>
                <Ionicons name="compass" size={14} color="#FFF" />
                <Text style={styles.recruitmentTagText}>Lịch trình tuyển cạ</Text>
              </View>
              <Text style={styles.slotsStatus}>
                Đã có {post.recruitmentJoined || 1}/{post.recruitmentSlots || 4} cạ
              </Text>
            </View>

            <View style={styles.recruitmentDetailGrid}>
              <View style={styles.recruitmentDetailItem}>
                <Ionicons name="time" size={15} color={COLORS.primary} />
                <Text style={styles.recruitmentDetailVal}>{post.activitySnippet.time || 'Hôm nay'}</Text>
              </View>
              {post.activitySnippet.budget && (
                <View style={styles.recruitmentDetailItem}>
                  <Ionicons name="wallet" size={15} color="#059669" />
                  <Text style={styles.recruitmentDetailVal}>{post.activitySnippet.budget}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.joinRecruitmentBtn}
              onPress={() => onNavigate('personal_chat')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={COLORS.primaryGradient}
                style={styles.joinBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="person-add" size={15} color="#FFF" />
                <Text style={styles.joinBtnText}>Đăng ký tham gia cạ này</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {post.isWish && (
          <View style={styles.wishDetailBanner}>
            <View style={styles.wishBannerHeader}>
              <Ionicons name="heart-circle" size={20} color="#DC2626" />
              <Text style={styles.wishBannerTitle}>Nguyện vọng vi vu của thành viên</Text>
            </View>
            <Text style={styles.wishBannerDest}>
              Điểm đến: {post.wishDestination || post.author.location}
            </Text>
            {post.wishDate && (
              <Text style={styles.wishBannerDate}>Thời gian mong muốn: {post.wishDate}</Text>
            )}
            <TouchableOpacity
              style={styles.wishConnectBtn}
              onPress={() => onNavigate('personal_chat')}
            >
              <Ionicons name="chatbubbles" size={15} color="#FFF" />
              <Text style={styles.wishConnectBtnText}>Nhắn tin rủ đi chung</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* RICH VIDEO PLAYER */}
        {post.videoUrl && (
          <View style={styles.videoWrapper}>
            <Video
              source={{ uri: post.videoUrl }}
              style={styles.detailVideo}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay={true}
              isMuted={false}
            />
          </View>
        )}

        {/* FULL IMAGE GALLERY */}
        {!post.videoUrl && post.images && post.images.length > 0 && (
          <View style={styles.imagesGrid}>
            {post.images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.largeImage} />
            ))}
          </View>
        )}

        {/* ENGAGEMENT STATS BAR */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => toggleLike(post.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? COLORS.danger : '#4B5563'}
            />
            <Text style={[styles.actionBtnText, isLiked && { color: COLORS.danger, fontWeight: '700' }]}>
              {post.likes + (isLiked ? 1 : 0)} Thích
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={20} color="#4B5563" />
            <Text style={styles.actionBtnText}>{comments.length} Bình luận</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#4B5563" />
            <Text style={styles.actionBtnText}>{post.sharesCount || 0} Chia sẻ</Text>
          </TouchableOpacity>
        </View>

        {/* COMMENTS SECTION */}
        <View style={styles.commentSection}>
          <Text style={styles.commentSectionTitle}>Bình luận ({comments.length})</Text>

          {comments.map((c) => (
            <View key={c.id} style={styles.commentItem}>
              <Image source={{ uri: c.avatar }} style={styles.commentAvatar} />
              <View style={styles.commentContent}>
                <View style={styles.commentBubble}>
                  <Text style={styles.commentAuthor}>{c.author}</Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
                <View style={styles.commentMeta}>
                  <Text style={styles.commentTime}>{c.time}</Text>
                  <TouchableOpacity>
                    <Text style={styles.commentAction}>Thích</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.commentAction}>Trả lời</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* COMMENT INPUT BAR */}
      <View style={styles.inputBar}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          }}
          style={styles.myAvatar}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Viết bình luận cho cạ..."
          placeholderTextColor="#9CA3AF"
          value={commentInput}
          onChangeText={setCommentInput}
          onSubmitEditing={handleSendComment}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !commentInput.trim() && { opacity: 0.5 }]}
          onPress={handleSendComment}
          disabled={!commentInput.trim()}
        >
          <Ionicons name="send" size={18} color={COLORS.primary} />
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  authorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  authorMeta: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  trustBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  subMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dot: {
    fontSize: 10,
    color: '#D1D5DB',
  },
  locationText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    flex: 1,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
  },
  connectText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  contentText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hashtag: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  taggedFriendsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginVertical: 6,
    gap: 8,
  },
  taggedFriendsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  friendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    ...SHADOWS.sm,
  },
  friendPillAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  friendPillName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  venueGoogleCard: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.md,
  },
  venueMapSnapshotWrap: {
    width: '100%',
    height: 120,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueMapSnapshot: {
    width: '100%',
    height: '100%',
  },
  venuePinOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMapPin: {
    ...SHADOWS.sm,
  },
  googlePinHalo: {
    width: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: -4,
  },
  googleWatermark: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  googleWatermarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  venueCardDetails: {
    padding: 12,
  },
  venueNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  venueNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  venuePlatformBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  platformBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A73E8',
  },
  venueAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  venueAddressText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  venueActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  googleDirectionsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A73E8',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  googleDirectionsText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  vivuMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  vivuMapBtnText: {
    color: '#1A73E8',
    fontSize: 12,
    fontWeight: '700',
  },
  recruitmentCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recruitmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recruitmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  recruitmentTagText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  slotsStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  recruitmentDetailGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  recruitmentDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recruitmentDetailVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  joinRecruitmentBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  joinBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  joinBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  wishDetailBanner: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  wishBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wishBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  wishBannerDest: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  wishBannerDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  wishConnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
    marginTop: 4,
  },
  wishConnectBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  videoWrapper: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  detailVideo: {
    width: '100%',
    height: 240,
  },
  imagesGrid: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  largeImage: {
    width: '100%',
    height: 240,
    borderRadius: 14,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginHorizontal: 16,
    marginVertical: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  commentSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  commentSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 14,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  commentBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  commentMeta: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  commentTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  commentAction: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  myAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1F2937',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
