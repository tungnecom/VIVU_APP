import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '../../components/BottomTabBar';
import { ViViMascotModal } from '../../components/ViViMascotModal';
import { CURRENT_USER, MOCK_ACTIVITY, MOCK_POSTS } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenKey } from '../../types';
import { Video, ResizeMode } from '../../utils/safeAV';

interface HomeFeedProps {
  onNavigate: (screen: ScreenKey) => void;
  onOpenQuickSwitcher: () => void;
}

import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';

export const HomeFeedScreen: React.FC<HomeFeedProps> = ({
  onNavigate,
  onOpenQuickSwitcher,
}) => {
  const [showViVi, setShowViVi] = useState(false);
  const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>({});
  const posts = useFeedStore((state) => state.posts);
  const likedPostIds = useFeedStore((state) => state.likedPostIds) || {};
  const likedPosts = useFeedStore((state) => state.likedPosts) || likedPostIds;
  const toggleLike = useFeedStore((state) => state.toggleLike);
  const deletePost = useFeedStore((state) => state.deletePost);
  const setSelectedPostId = useFeedStore((state) => state.setSelectedPostId);
  const activeCategory = useFeedStore((state) => state.activeCategory);
  const setActiveCategory = useFeedStore((state) => state.setActiveCategory);
  const fetchPosts = useFeedStore((state) => state.fetchPosts);

  const toggleVideoMute = (postId: string) => {
    setMutedVideos((prev) => ({
      ...prev,
      [postId]: prev[postId] === undefined ? true : !prev[postId],
    }));
  };

  const handlePostOptions = (post: any) => {
    Alert.alert(
      'Tùy chọn bài viết',
      'Chọn thao tác bạn muốn thực hiện:',
      [
        { text: 'Chỉnh sửa bài viết', onPress: () => onNavigate('edit_post') },
        {
          text: 'Xóa bài viết',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Xác nhận xóa',
              'Bạn có chắc chắn muốn xóa bài viết này khỏi VIVU Feed không?',
              [
                { text: 'Hủy', style: 'cancel' },
                {
                  text: 'Xóa ngay',
                  style: 'destructive',
                  onPress: () => {
                    deletePost(post.id);
                    Alert.alert('Đã xóa', 'Bài viết đã được xóa thành công khỏi Feed!');
                  },
                },
              ]
            );
          },
        },
        { text: 'Đóng', style: 'cancel' },
      ]
    );
  };

  useEffect(() => {
    fetchPosts(activeCategory);
  }, []);


  const selectedCity = useAuthStore((state) => state.selectedCity);
  const currentUser = useAuthStore((state) => state.user) || CURRENT_USER;

  const categories = [
    { name: 'Ăn uống', icon: 'restaurant-outline' },
    { name: 'Du lịch', icon: 'airplane-outline' },
    { name: 'Camping', icon: 'bonfire-outline' },
    { name: 'Cafe', icon: 'cafe-outline' },
    { name: 'Chụp ảnh', icon: 'camera-outline' },
    { name: 'Bản đồ', icon: 'map-outline', isMap: true },
  ];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandRow}>
            <Text style={styles.logoText}>VIVU</Text>
            <TouchableOpacity
              style={styles.locationChip}
              onPress={() => onNavigate('city_select')}
            >
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={styles.locationText}>{selectedCity}</Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.switcherBtn}
              onPress={onOpenQuickSwitcher}
              activeOpacity={0.7}
            >
              <Ionicons name="grid-outline" size={18} color={COLORS.primary} />
              <Text style={styles.switcherText}>28 màn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => onNavigate('map')}
            >
              <Ionicons name="map-outline" size={20} color={COLORS.textDark} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => onNavigate('message_home')}
            >
              <Ionicons name="notifications-outline" size={20} color={COLORS.textDark} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.greetingWrap}>
          <Text style={styles.greetingTitle}>
            Chào buổi sáng, {currentUser.name} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>Hôm nay bạn muốn đi đâu?</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm địa điểm, hoạt động, nhóm..."
            placeholderTextColor={COLORS.textLight}
            onFocus={() => onNavigate('match_home')}
          />
          <TouchableOpacity onPress={() => onNavigate('map')}>
            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Feed Scroll */}
      <ScrollView style={styles.feedScroll} showsVerticalScrollIndicator={false}>
        {/* Categories Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat, idx) => {
            const isActive = activeCategory === cat.name;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
                onPress={() => {
                  if (cat.isMap) {
                    onNavigate('map');
                  } else {
                    setActiveCategory(cat.name);
                  }
                }}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={isActive ? '#FFFFFF' : COLORS.textDark}
                />
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section: Hoạt động phù hợp với bạn */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hoạt động phù hợp với bạn</Text>
          <TouchableOpacity onPress={() => onNavigate('match_home')}>
            <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Card */}
        <TouchableOpacity
          style={styles.activityCard}
          activeOpacity={0.9}
          onPress={() => onNavigate('activity_detail')}
        >
          <Image
            source={{ uri: MOCK_ACTIVITY.image }}
            style={styles.activityImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.activityGradient}
          />
          <View style={styles.activityBadge}>
            <Text style={styles.activityBadgeText}>⭐ {MOCK_ACTIVITY.rating}</Text>
          </View>

          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>{MOCK_ACTIVITY.title}</Text>
            <View style={styles.activityMetaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color="#FFFFFF" />
                <Text style={styles.metaText}>{MOCK_ACTIVITY.time}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={13} color="#FFFFFF" />
                <Text style={styles.metaText}>
                  {MOCK_ACTIVITY.joinedCount}/{MOCK_ACTIVITY.maxCount} người
                </Text>
              </View>
            </View>

            <View style={styles.activityFooter}>
              <View style={styles.hostRow}>
                <Image
                  source={{ uri: MOCK_ACTIVITY.host.avatar }}
                  style={styles.hostAvatar}
                />
                <Text style={styles.hostName}>{MOCK_ACTIVITY.host.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.joinBtn}
                onPress={() => onNavigate('activity_detail')}
              >
                <Text style={styles.joinBtnText}>Tham gia</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Section: Mọi người đang nói gì? */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mọi người đang nói gì?</Text>
          <TouchableOpacity onPress={() => onNavigate('create_post')}>
            <Text style={styles.seeAllText}>+ Tạo bài</Text>
          </TouchableOpacity>
        </View>

        {/* Post Cards */}
        {posts.map((post) => {
          const isLiked = likedPostIds[post.id] ?? false;
          const isMuted = mutedVideos[post.id] ?? false;

          return (
            <View key={post.id} style={styles.postCard}>
              {/* Author Row */}
              <View style={styles.postHeader}>
                <TouchableOpacity
                  style={styles.authorInfo}
                  onPress={() => onNavigate('profile')}
                >
                  <Image
                    source={{ uri: post.author.avatar }}
                    style={styles.authorAvatar}
                  />
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.authorName}>{post.author.name}</Text>
                      {post.isRecruitment && (
                        <View style={styles.recruitBadge}>
                          <Text style={styles.recruitBadgeText}>Tuyển cạ</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.postSubRow}>
                      <Text style={styles.postTime}>{post.timeAgo}</Text>
                      <Text style={styles.dot}>•</Text>
                      <Ionicons name="location-sharp" size={12} color={COLORS.primary} />
                      <Text style={styles.postLocation}>{post.author.location}</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handlePostOptions(post)}>
                  <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>

              {/* Tagged Companions if any */}
              {post.taggedCompanions && post.taggedCompanions.length > 0 && (
                <View style={styles.feedCompanionsRow}>
                  <Text style={styles.feedCompanionsText}>Cùng với: </Text>
                  {post.taggedCompanions.map((comp, cIdx) => (
                    <View key={cIdx} style={styles.feedCompanionChip}>
                      <Image source={{ uri: comp.avatar }} style={styles.feedCompanionAvatar} />
                      <Text style={styles.feedCompanionName}>@{comp.name}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Post Content */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedPostId(post.id);
                  onNavigate('post_detail');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.postContentText}>{post.content}</Text>

                {/* Hashtags */}
                <View style={styles.hashtagRow}>
                  {post.hashtags.map((tag, tIdx) => (
                    <Text key={tIdx} style={styles.hashtagText}>
                      {tag}{' '}
                    </Text>
                  ))}
                </View>

                {/* Real Crawled Spot Tag Card */}
                {post.taggedVenue && (
                  <TouchableOpacity
                    style={styles.feedVenueCard}
                    activeOpacity={0.8}
                    onPress={() => onNavigate('map')}
                  >
                    <View style={styles.feedVenuePlatformBadge}>
                      <Text style={styles.feedVenuePlatformText}>
                        {post.taggedVenue.platformSource || 'ZERO-GARBAGE'}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.feedVenueName}>{post.taggedVenue.name}</Text>
                      <Text style={styles.feedVenueAddress} numberOfLines={1}>
                        {post.taggedVenue.address}
                      </Text>
                    </View>
                    <Ionicons name="map" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                )}

                {/* Recruitment Trip Card if active */}
                {post.isRecruitment && post.activitySnippet && (
                  <View style={styles.recruitmentTripCard}>
                    <View style={styles.recruitmentTripTop}>
                      <View style={styles.recruitmentTripTag}>
                        <Ionicons name="compass" size={14} color="#FFF" />
                        <Text style={styles.recruitmentTripTagText}>Lịch trình tuyển cạ</Text>
                      </View>
                      <Text style={styles.recruitmentSlotsText}>
                        Đã có {post.recruitmentJoined || 2}/{post.recruitmentSlots || 4} bạn
                      </Text>
                    </View>
                    <View style={styles.recruitmentTripDetails}>
                      <View style={styles.tripDetailRow}>
                        <Ionicons name="time" size={14} color={COLORS.primary} />
                        <Text style={styles.tripDetailText}>{post.activitySnippet.time}</Text>
                      </View>
                      {post.activitySnippet.budget && (
                        <View style={styles.tripDetailRow}>
                          <Ionicons name="wallet" size={14} color="#10B981" />
                          <Text style={styles.tripDetailText}>{post.activitySnippet.budget}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.applyRecruitBtn}
                      activeOpacity={0.8}
                      onPress={() => Alert.alert('Đã gửi yêu cầu ghép cạ!', 'Chủ bài viết sẽ nhận được thông báo kết nối cạ cùng bạn.')}
                    >
                      <LinearGradient
                        colors={COLORS.primaryGradient}
                        style={styles.applyRecruitGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Ionicons name="person-add" size={14} color="#FFF" />
                        <Text style={styles.applyRecruitText}>Đăng ký tham gia cạ này</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Rich Video Player (with sound control & audio badge) */}
                {post.videoUrl && (
                  <View style={styles.videoCardContainer}>
                    <Video
                      source={{ uri: post.videoUrl }}
                      style={styles.feedVideo}
                      resizeMode={ResizeMode.COVER}
                      isLooping
                      shouldPlay={true}
                      isMuted={isMuted}
                    />
                    <TouchableOpacity
                      style={styles.soundToggleBtn}
                      onPress={() => toggleVideoMute(post.id)}
                    >
                      <Ionicons
                        name={isMuted ? 'volume-mute' : 'volume-high'}
                        size={16}
                        color="#FFF"
                      />
                      <Text style={styles.soundToggleText}>
                        {isMuted ? 'Bật tiếng' : 'Có tiếng'}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.videoDurationBadge}>
                      <Ionicons name="videocam" size={12} color="#FFF" />
                      <Text style={styles.videoDurationText}>
                        {post.videoDuration ? `${post.videoDuration}s` : 'HD'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Image Gallery */}
                {!post.videoUrl && post.images && post.images.length > 0 && (
                  <View style={styles.galleryContainer}>
                    <Image
                      source={{ uri: post.images[0] }}
                      style={styles.galleryMainImage}
                    />
                    {post.images.length > 1 && (
                      <View style={styles.gallerySubColumn}>
                        <Image
                          source={{ uri: post.images[1] }}
                          style={styles.gallerySubImage}
                        />
                        {post.images[2] && (
                          <Image
                            source={{ uri: post.images[2] }}
                            style={styles.gallerySubImage}
                          />
                        )}
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>

              {/* ViVi Smart Suggestion Chip */}
              <TouchableOpacity
                style={styles.viviChip}
                onPress={() => setShowViVi(true)}
              >
                <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                <Text style={styles.viviChipText}>
                  ViVi gợi ý: Có thể hỏi {post.author.name} về địa điểm và cách kết nối đi chung!
                </Text>
              </TouchableOpacity>

              {/* Engagement Stats & Actions */}
              <View style={styles.actionsBar}>
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => toggleLike(post.id)}
                >
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isLiked ? COLORS.danger : COLORS.textMedium}
                  />
                  <Text style={[styles.actionNum, isLiked && { color: COLORS.danger }]}>
                    {post.likes + (isLiked ? 1 : 0)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => {
                    setSelectedPostId(post.id);
                    onNavigate('post_detail');
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={19} color={COLORS.textMedium} />
                  <Text style={styles.actionNum}>{post.commentsCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => Alert.alert('Chia sẻ', 'Đã sao chép liên kết bài viết vào bộ nhớ tạm!')}
                >
                  <Ionicons name="share-social-outline" size={19} color={COLORS.textMedium} />
                  <Text style={styles.actionNum}>{post.sharesCount}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating ViVi Assistant Trigger */}
      <TouchableOpacity
        style={styles.floatingViViBtn}
        activeOpacity={0.85}
        onPress={() => setShowViVi(true)}
      >
        <LinearGradient
          colors={COLORS.primaryGradient}
          style={styles.floatingViViGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="sparkles" size={22} color="#FFD700" />
          <Text style={styles.floatingViViText}>ViVi</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <BottomTabBar currentScreen="home_feed" onNavigate={onNavigate} />

      {/* ViVi Assistant Modal */}
      <ViViMascotModal
        visible={showViVi}
        onClose={() => setShowViVi(false)}
        onSelectAction={() => setShowViVi(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switcherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#D8D4FF',
  },
  switcherText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },
  greetingWrap: {
    marginTop: 14,
    marginBottom: 12,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textDark,
  },
  feedScroll: {
    flex: 1,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  activityCard: {
    marginHorizontal: 20,
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.md,
  },
  activityImage: {
    width: '100%',
    height: '100%',
  },
  activityGradient: {
    ...StyleSheet.absoluteFill,
  },
  activityBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  activityContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  activityTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  activityMetaRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  hostName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  joinBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 14,
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    ...SHADOWS.sm,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  postSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  postTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  dot: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  postLocation: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
  postContentText: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 21,
    marginBottom: 8,
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  hashtagText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  galleryContainer: {
    flexDirection: 'row',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    gap: 6,
    marginBottom: 12,
  },
  galleryMainImage: {
    flex: 2,
    height: '100%',
  },
  gallerySubColumn: {
    flex: 1,
    gap: 6,
  },
  gallerySubImage: {
    flex: 1,
    width: '100%',
  },
  viviChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E9E4FF',
  },
  viviChipText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    flex: 1,
    fontWeight: '500',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  actionNum: {
    fontSize: 13,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  floatingViViBtn: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    ...SHADOWS.glow,
  },
  floatingViViGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  floatingViViText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  recruitBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  recruitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  feedCompanionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  feedCompanionsText: {
    fontSize: 12,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  feedCompanionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  feedCompanionAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  feedCompanionName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  feedVenueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  feedVenuePlatformBadge: {
    backgroundColor: '#059669',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  feedVenuePlatformText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  feedVenueName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  feedVenueAddress: {
    fontSize: 11,
    color: COLORS.textMedium,
  },
  recruitmentTripCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    padding: 12,
    marginBottom: 10,
  },
  recruitmentTripTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recruitmentTripTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  recruitmentTripTagText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  recruitmentSlotsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  recruitmentTripDetails: {
    gap: 4,
    marginBottom: 10,
  },
  tripDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripDetailText: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  applyRecruitBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  applyRecruitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  applyRecruitText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  videoCardContainer: {
    position: 'relative',
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 12,
  },
  feedVideo: {
    width: '100%',
    height: '100%',
  },
  soundToggleBtn: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  soundToggleText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  videoDurationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  videoDurationText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
