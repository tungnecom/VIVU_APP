import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';
import { useActivityStore } from '../../stores/activityStore';
import { ScreenKey } from '../../types';
import { UserAvatar } from '../../components/common/UserAvatar';
import { KeoCard } from '../../components/common/KeoCard';
import { EmptyState, LoadingSkeleton } from '../../components/common/StateView';

interface HomeFeedProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
  onOpenQuickSwitcher?: () => void;
}

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'grid-outline' },
  { id: 'cafe', name: 'Cafe', icon: 'cafe-outline' },
  { id: 'food', name: 'Ăn uống', icon: 'restaurant-outline' },
  { id: 'travel', name: 'Du lịch', icon: 'airplane-outline' },
  { id: 'camping', name: 'Camping', icon: 'bonfire-outline' },
  { id: 'sports', name: 'Thể thao', icon: 'football-outline' },
];

export const HomeFeedScreen: React.FC<HomeFeedProps> = ({
  onNavigate,
}) => {
  const selectedCity = useAuthStore((s) => s.selectedCity) || 'Đà Nẵng';
  const currentUser = useAuthStore((s) => s.user);

  const posts = useFeedStore((s) => s.posts);
  const loadingPosts = useFeedStore((s) => s.loading);
  const fetchPosts = useFeedStore((s) => s.fetchPosts);
  const toggleLike = useFeedStore((s) => s.toggleLike);

  const activities = useActivityStore((s) => s.activities);
  const fetchActivities = useActivityStore((s) => s.fetchActivities);

  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    const cat = selectedCategory === 'Tất cả' ? undefined : selectedCategory;
    await Promise.all([
      fetchPosts(cat),
      fetchActivities(selectedCity, cat),
    ]);
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedCity]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleLike = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
    toggleLike(postId);
  };

  // Luồng C: Từ nội dung/bài viết sang tạo kèo có prefill thông tin địa điểm
  const handleRuDiCung = (post: any) => {
    onNavigate('create_post', {
      venueName: post.location || post.taggedVenue?.name,
      venueAddress: post.taggedVenue?.address || selectedCity,
      category: post.category || 'Cafe',
    });
  };

  // Kèo tiêu biểu đang mở
  const featuredActivity = activities && activities.length > 0 ? activities[0] : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {/* Logo & Slogan */}
          <View style={styles.brandRow}>
            <Text style={styles.logoText}>VIVU</Text>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>ĐI CÙNG</Text>
            </View>
          </View>

          {/* Chọn thành phố & Thông báo */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.cityChip}
              activeOpacity={0.8}
              onPress={() => onNavigate('city_select')}
              accessibilityLabel={`Thành phố: ${selectedCity}`}
            >
              <Ionicons name="location" size={13} color={COLORS.primaryCoral} />
              <Text style={styles.cityText}>{selectedCity}</Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.8}
              onPress={() => onNavigate('map')}
              accessibilityLabel="Bản đồ khám phá"
            >
              <Ionicons name="map-outline" size={18} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Thanh tìm kiếm nhanh */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.85}
          onPress={() => onNavigate('match_home')}
          accessibilityLabel="Tìm kèo hoặc bạn đồng hành"
        >
          <Ionicons name="search" size={16} color={COLORS.textLight} />
          <Text style={styles.searchPlaceholder}>
            Tìm kèo cafe, du lịch, thể thao tại {selectedCity}...
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primaryCoral]}
          />
        }
      >
        {/* Section: Danh mục nhanh */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, active && styles.catChipActive]}
                activeOpacity={0.75}
                onPress={() => setSelectedCategory(cat.name)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={active ? '#FFFFFF' : COLORS.textDark}
                />
                <Text style={[styles.catText, active && styles.catTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section: Kèo nổi bật đang tìm cạ (Ưu tiên lời hứa sản phẩm) */}
        {featuredActivity && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="flame" size={18} color={COLORS.primaryCoral} />
                <Text style={styles.sectionTitle}>Kèo đang tìm cạ gần bạn</Text>
              </View>
              <TouchableOpacity onPress={() => onNavigate('match_home')}>
                <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
              </TouchableOpacity>
            </View>

            <KeoCard
              activity={{
                id: featuredActivity.id,
                title: featuredActivity.title,
                category: featuredActivity.category,
                location: featuredActivity.location,
                time: featuredActivity.time,
                date: featuredActivity.date || 'Hôm nay',
                joined: featuredActivity.joined || 1,
                maxParticipants: featuredActivity.maxParticipants || 4,
                image: featuredActivity.image,
                host: {
                  name: featuredActivity.host?.name || 'Thành viên Vivu',
                  avatar: featuredActivity.host?.avatar,
                  trustScore: featuredActivity.host?.trustScore || 85,
                  isVerified: true,
                },
                matchReason: 'Kèo sắp diễn ra',
              }}
              onPress={() => onNavigate('activity_detail', { id: featuredActivity.id })}
            />
          </View>
        )}

        {/* Section: Bảng tin Cộng đồng (Feed bài viết thật) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Khám phá & Cảm hứng</Text>
          <Text style={styles.feedCountText}>{posts.length} bài viết</Text>
        </View>

        {loadingPosts && !refreshing ? (
          <LoadingSkeleton count={2} height={280} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon="images-outline"
            title="Chưa có bài viết mới"
            message={`Hãy là người đầu tiên chia sẻ địa điểm thú vị tại ${selectedCity}!`}
            actionLabel="+ Đăng bài viết ngay"
            onAction={() => onNavigate('create_post')}
          />
        ) : (
          posts.map((post) => {
            const isLiked = likedPosts[post.id];
            const likeCount = (post.likes || 0) + (isLiked ? 1 : 0);

            return (
              <View key={post.id} style={styles.postCard}>
                {/* Author Info */}
                <View style={styles.authorRow}>
                  <UserAvatar
                    uri={post.author?.avatar}
                    name={post.author?.name || 'Vivu Traveler'}
                    size={40}
                    trustScore={post.author?.trustScore || 85}
                    isVerified={true}
                  />
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>
                      {post.author?.name || 'Thành viên Vivu'}
                    </Text>
                    <Text style={styles.postMetaText}>
                      {post.createdAt || 'Vừa xong'} • {post.location || selectedCity}
                    </Text>
                  </View>
                </View>

                {/* Content text */}
                {post.content && (
                  <Text style={styles.postBodyText}>{post.content}</Text>
                )}

                {/* Media Image */}
                {post.images && post.images.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={() => onNavigate('post_detail', { id: post.id })}
                    style={styles.postImageContainer}
                  >
                    <Image
                      source={{ uri: post.images[0] }}
                      style={styles.postImage}
                    />
                  </TouchableOpacity>
                )}

                {/* Tagged Venue & LUỒNG C: Nút "Rủ đi cùng" */}
                {post.location && (
                  <View style={styles.venueActionBanner}>
                    <View style={styles.venueInfoCol}>
                      <Ionicons name="location" size={15} color={COLORS.secondaryPurple} />
                      <Text style={styles.venueNameText} numberOfLines={1}>
                        {post.location}
                      </Text>
                    </View>

                    {/* CTA Luồng C: Biến địa điểm này thành kèo */}
                    <TouchableOpacity
                      style={styles.ruDiCungBtn}
                      activeOpacity={0.85}
                      onPress={() => handleRuDiCung(post)}
                      accessibilityLabel="Rủ bạn bè đi cùng địa điểm này"
                    >
                      <Ionicons name="compass" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.ruDiCungText}>Rủ đi cùng</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Footer Actions: Like, Comment, Share */}
                <View style={styles.postFooter}>
                  <TouchableOpacity
                    style={styles.footerActionBtn}
                    onPress={() => handleToggleLike(post.id)}
                  >
                    <Ionicons
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isLiked ? COLORS.primaryCoral : COLORS.textLight}
                    />
                    <Text style={[styles.actionNum, isLiked && { color: COLORS.primaryCoral }]}>
                      {likeCount}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.footerActionBtn}
                    onPress={() => onNavigate('post_detail', { id: post.id })}
                  >
                    <Ionicons name="chatbubble-outline" size={18} color={COLORS.textLight} />
                    <Text style={styles.actionNum}>{post.commentsCount || 0}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.footerActionBtn}
                    onPress={() => Alert.alert('Chia sẻ', 'Liên kết bài viết đã được sao chép!')}
                  >
                    <Ionicons name="share-social-outline" size={18} color={COLORS.textLight} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryCoral,
    letterSpacing: 1.5,
  },
  brandBadge: {
    backgroundColor: '#F3EEFD',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  brandBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.secondaryPurple,
    letterSpacing: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cityText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: COLORS.textLight,
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContent: {
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: {
    backgroundColor: COLORS.secondaryPurple,
    borderColor: COLORS.secondaryPurple,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  featuredSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryPurple,
  },
  feedCountText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  postMetaText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  postBodyText: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImageContainer: {
    height: 220,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FAF8F5',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  venueActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  venueInfoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  venueNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  ruDiCungBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryCoral,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    ...SHADOWS.glow,
  },
  ruDiCungText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  actionNum: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
});
