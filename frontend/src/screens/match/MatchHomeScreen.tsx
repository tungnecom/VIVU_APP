import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { MOCK_ACTIVITY } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { useActivityStore } from '../../stores/activityStore';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';

interface MatchHomeProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
}

export const MatchHomeScreen: React.FC<MatchHomeProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'match' | 'friends' | 'find'>('match');
  const [activeCategory, setActiveCategory] = useState('Ăn uống');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedCity = useAuthStore((state) => state.selectedCity) || 'Đà Nẵng';
  const activities = useActivityStore((state) => state.activities);
  const fetchActivities = useActivityStore((state) => state.fetchActivities);

  // AI Matchmaking candidates
  const [candidates, setCandidates] = useState<any[]>([
    {
      candidate: {
        id: 'u1',
        name: 'Minh Thư',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      },
      compatibilityScore: 96,
      distanceKm: 1.2,
      matchReason: 'Cùng mê Food & Cafe',
    },
    {
      candidate: {
        id: 'u2',
        name: 'Quang Anh',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      compatibilityScore: 92,
      distanceKm: 2.5,
      matchReason: 'Cùng mê Phượt & Hoàng hôn',
    },
    {
      candidate: {
        id: 'u3',
        name: 'Lan Anh',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      },
      compatibilityScore: 90,
      distanceKm: 3.0,
      matchReason: 'Cùng mê Cafe & Checkin',
    },
  ]);

  // Social Graph states
  const [friends, setFriends] = useState<any[]>([
    {
      id: 'u_mai_anh',
      name: 'Mai Anh',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      city: 'Đà Nẵng',
      trustScore: 96,
      bio: 'Thích cafe ngắm biển hoàng hôn, chụp ảnh film và thử các quán ăn vặt vỉa hè.',
      interests: ['Cafe', 'Chụp ảnh', 'Ẩm thực', 'Biển'],
      mutualFriendsCount: 8,
      isOnline: true,
      lastActive: 'Đang hoạt động',
      badge: 'Thành viên Tích Cực',
      verified: true,
    },
    {
      id: 'u_hoang_nam',
      name: 'Hoàng Nam',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      city: 'Đà Nẵng',
      trustScore: 92,
      bio: 'Đam mê trekking bán đảo Sơn Trà, phượt đèo Hải Vân và cắm trại cuối tuần.',
      interests: ['Phượt', 'Cắm trại', 'Trekking', 'Xe máy'],
      mutualFriendsCount: 5,
      isOnline: true,
      lastActive: 'Đang hoạt động',
      badge: 'Cạ Cứng Trekking',
      verified: true,
    },
  ]);

  const [friendRequests, setFriendRequests] = useState<any[]>([
    {
      id: 'req_1',
      sender: {
        id: 'u_thao_vy',
        name: 'Thảo Vy',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        city: 'Hà Nội',
        trustScore: 94,
        bio: 'Food tour phố cổ, lượn hồ Tây mùa sen và tìm bạn đi triển lãm nghệ thuật.',
        interests: ['Ẩm thực', 'Nghệ thuật', 'Cafe'],
        mutualFriendsCount: 3,
        isOnline: false,
        lastActive: '15 phút trước',
        verified: true,
      },
      createdAt: '10 phút trước',
      message: 'Chào bạn! Thấy bạn cũng thích khám phá ẩm thực, kết bạn cùng đi ăn nhé! ✨',
    },
  ]);

  const [searchResults, setSearchResults] = useState<any[]>([
    {
      id: 'u_quoc_bao',
      name: 'Quốc Bảo',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      city: 'TP. Hồ Chí Minh',
      trustScore: 90,
      bio: 'Board game, acoustic night phố Bùi Viện và cafe làm việc chill chill.',
      interests: ['Board game', 'Âm nhạc', 'Cafe', 'Nightlife'],
      mutualFriendsCount: 12,
      isOnline: true,
      lastActive: 'Đang hoạt động',
      verified: true,
    },
    {
      id: 'u_minh_tri',
      name: 'Minh Trí',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      city: 'Hội An',
      trustScore: 95,
      bio: 'Thổ địa Hội An, đạp xe ngắm lúa Cẩm Châu, ăn cao lầu và chụp ảnh ngõ vôi vàng.',
      interests: ['Chụp ảnh', 'Xe đạp', 'Ẩm thực', 'Di sản'],
      mutualFriendsCount: 6,
      isOnline: true,
      lastActive: 'Đang hoạt động',
      verified: true,
    },
  ]);

  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [candidatesRes, friendsRes, requestsRes] = await Promise.all([
          ApiClient.getMatchmakingCandidates(),
          ApiClient.getFriends(),
          ApiClient.getFriendRequests(),
          fetchActivities(selectedCity, activeCategory),
        ]);

        if (candidatesRes?.data && Array.isArray(candidatesRes.data) && candidatesRes.data.length > 0) {
          setCandidates(candidatesRes.data);
        }
        if (friendsRes?.data && Array.isArray(friendsRes.data) && friendsRes.data.length > 0) {
          setFriends(friendsRes.data);
        }
        if (requestsRes?.data && Array.isArray(requestsRes.data) && requestsRes.data.length > 0) {
          setFriendRequests(requestsRes.data);
        }
      } catch {}
    }
    loadData();
  }, []);

  // Handle Search
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (activeTab === 'find' && text.trim().length > 0) {
      setLoading(true);
      try {
        const res = await ApiClient.searchFriends(text);
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setSearchResults(res.data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
  };

  // Friend actions
  const handleSendRequest = async (targetUserId: string) => {
    try {
      await ApiClient.sendFriendRequest(targetUserId, 'Chào bạn, kết bạn cùng vi vu trên VIVU nhé!');
      setSentRequests((prev) => new Set(prev).add(targetUserId));
    } catch {}
  };

  const handleRespondRequest = async (requestId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      const res = await ApiClient.respondToFriendRequest(requestId, action);
      setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
      if (action === 'ACCEPT' && res?.friend) {
        setFriends((prev) => [res.friend, ...prev]);
      }
    } catch {}
  };

  const categories = [
    { name: 'Ăn uống', icon: 'restaurant-outline' },
    { name: 'Đi dạo', icon: 'walk-outline' },
    { name: 'Camping', icon: 'bonfire-outline' },
    { name: 'Cafe', icon: 'cafe-outline' },
    { name: 'Photography', icon: 'camera-outline' },
    { name: 'Chill', icon: 'sparkles-outline' },
    { name: 'Gaming', icon: 'game-controller-outline' },
    { name: 'Sport', icon: 'football-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Kết Nối Cạ Cứng</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconCircle} onPress={() => onNavigate('map')}>
              <Ionicons name="map-outline" size={20} color={COLORS.textDark} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} onPress={() => onNavigate('message_home')}>
              <Ionicons name="chatbubbles-outline" size={20} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === 'find'
                ? 'Tìm bạn bè theo tên, sở thích, thành phố...'
                : 'Tìm bạn cùng đi đâu? (Đà Nẵng, Hội An...)'
            }
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {loading && <ActivityIndicator size="small" color={COLORS.primary} />}
        </View>

        {/* Segment Tabs: Matchmaking / Friends / Find New Friends */}
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'match' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('match')}
          >
            <Ionicons
              name="sparkles"
              size={14}
              color={activeTab === 'match' ? '#FFF' : COLORS.textMedium}
            />
            <Text style={[styles.segmentBtnText, activeTab === 'match' && styles.segmentBtnTextActive]}>
              Ghép cạ AI
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'friends' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('friends')}
          >
            <Ionicons
              name="people"
              size={14}
              color={activeTab === 'friends' ? '#FFF' : COLORS.textMedium}
            />
            <Text
              style={[styles.segmentBtnText, activeTab === 'friends' && styles.segmentBtnTextActive]}
            >
              Bạn bè ({friends.length})
            </Text>
            {friendRequests.length > 0 && (
              <View style={styles.reqBadge}>
                <Text style={styles.reqBadgeText}>{friendRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'find' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('find')}
          >
            <Ionicons
              name="person-add"
              size={14}
              color={activeTab === 'find' ? '#FFF' : COLORS.textMedium}
            />
            <Text style={[styles.segmentBtnText, activeTab === 'find' && styles.segmentBtnTextActive]}>
              Tìm bạn mới
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ================= TAB 1: AI MATCHMAKING ================= */}
        {activeTab === 'match' && (
          <>
            {/* Categories Bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories.map((cat, i) => {
                const isActive = activeCategory === cat.name;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                    onPress={() => setActiveCategory(cat.name)}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={16}
                      color={isActive ? '#FFFFFF' : COLORS.textDark}
                    />
                    <Text
                      style={[styles.categoryText, isActive && styles.categoryTextActive]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* AI Matchmaking Candidate Section */}
            <View style={styles.sectionHeader}>
              <View style={styles.aiTitleRow}>
                <Ionicons name="sparkles" size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Ghép cạ AI (Matchmaking)</Text>
              </View>
              <Text style={styles.aiBadgeText}>Độ tương thích cao</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.aiCandidatesScroll}
            >
              {candidates.map((item, idx) => {
                const c = item.candidate || item;
                const score = item.compatibilityScore || item.match || 90;
                const dist = item.distanceKm ? `${item.distanceKm.toFixed(1)} km` : item.dist || '1.5 km';
                const reason = item.matchReason || item.reason || 'Sở thích & Điểm uy tín cao';

                return (
                  <TouchableOpacity
                    key={c.id || idx}
                    style={styles.candidateCard}
                    activeOpacity={0.85}
                    onPress={() => onNavigate('personal_chat')}
                  >
                    <View style={styles.candidateAvatarWrap}>
                      <Image
                        source={{
                          uri:
                            c.avatar ||
                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                        }}
                        style={styles.candidateAvatar}
                      />
                      <View style={styles.matchPill}>
                        <Text style={styles.matchPillText}>{score}%</Text>
                      </View>
                    </View>

                    <Text style={styles.candidateName}>{c.name}</Text>
                    <Text style={styles.candidateReason} numberOfLines={1}>
                      {reason}
                    </Text>
                    <Text style={styles.candidateDist}>📍 Cách {dist}</Text>

                    <TouchableOpacity
                      style={styles.chatCandidateBtn}
                      onPress={() => onNavigate('personal_chat')}
                    >
                      <Text style={styles.chatCandidateText}>Bắt chuyện</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Activities Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hoạt động & Chuyến đi</Text>
              <TouchableOpacity onPress={() => onNavigate('home_feed')}>
                <Text style={styles.seeMoreText}>Xem thêm &gt;</Text>
              </TouchableOpacity>
            </View>

            {/* Activity List */}
            {activities.length > 0 ? (
              activities.map((activity: any) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.matchCard}
                  activeOpacity={0.9}
                  onPress={() => onNavigate('activity_detail' as ScreenKey, { id: activity.id })}
                >
                  <View style={styles.cardImageWrap}>
                    <Image source={{ uri: activity.image || MOCK_ACTIVITY.image }} style={styles.cardImage} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.65)']}
                      style={styles.gradientOverlay}
                    />
                    <View style={styles.cardRatingBadge}>
                      <Text style={styles.ratingText}>⭐ {activity.host?.trustScore > 80 ? '5.0' : '4.5'} ({activity.requestsCount} y/c)</Text>
                    </View>
                    <View style={styles.locationChip}>
                      <Ionicons name="location" size={12} color="#FFF" />
                      <Text style={styles.locationChipText}>{activity.location || activity.city}</Text>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{activity.title}</Text>
                    <Text style={styles.cardTime}>
                      📅 {activity.date} • {activity.time}
                    </Text>

                    <View style={styles.cardTagsRow}>
                      {[activity.category, ...(activity.tags || [])].map((t: string, i: number) => (
                        <View key={i} style={styles.tagBadge}>
                          <Text style={styles.tagText}>{t}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.cardFooter}>
                      <TouchableOpacity
                        style={styles.participantsRow}
                        onPress={() => onNavigate('participant_list' as ScreenKey)}
                      >
                        <View style={styles.avatarStack}>
                          {/* Mocking participants avatars for now */}
                          <Image source={{ uri: activity.host?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }} style={[styles.stackAvatar, { left: 0 }]} />
                        </View>
                        <Text style={styles.participantsText}>
                          {activity.joinedCount}/{activity.maxCount} tham gia
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.joinBtn}
                        onPress={() => onNavigate('activity_detail' as ScreenKey, { id: activity.id })}
                      >
                        <Text style={styles.joinBtnText}>Xem chi tiết</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280' }}>Chưa có chuyến đi nào ở khu vực này.</Text>
              </View>
            )}
          </>
        )}

        {/* ================= TAB 2: BẠN BÈ & LỜI MỜI ================= */}
        {activeTab === 'friends' && (
          <View style={styles.friendsTabContent}>
            {/* Lời mời kết bạn */}
            {friendRequests.length > 0 && (
              <View style={styles.requestsSection}>
                <View style={styles.sectionHeaderNoPad}>
                  <Text style={styles.sectionTitle}>
                    Lời mời kết bạn ({friendRequests.length})
                  </Text>
                </View>
                {friendRequests.map((req) => (
                  <View key={req.id} style={styles.requestCard}>
                    <Image source={{ uri: req.sender.avatar }} style={styles.friendAvatar} />
                    <View style={styles.requestInfo}>
                      <View style={styles.friendNameRow}>
                        <Text style={styles.friendName}>{req.sender.name}</Text>
                        <View style={styles.trustBadge}>
                          <Text style={styles.trustBadgeText}>{req.sender.trustScore}đ</Text>
                        </View>
                      </View>
                      <Text style={styles.requestMsg} numberOfLines={2}>
                        "{req.message || 'Muốn kết bạn cùng bạn'}"
                      </Text>
                      <Text style={styles.mutualText}>
                        👥 {req.sender.mutualFriendsCount} bạn chung • {req.createdAt}
                      </Text>

                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => handleRespondRequest(req.id, 'ACCEPT')}
                        >
                          <Text style={styles.acceptBtnText}>Đồng ý</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.declineBtn}
                          onPress={() => handleRespondRequest(req.id, 'DECLINE')}
                        >
                          <Text style={styles.declineBtnText}>Bỏ qua</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Danh sách bạn bè chính thức */}
            <View style={styles.friendsSection}>
              <View style={styles.sectionHeaderNoPad}>
                <Text style={styles.sectionTitle}>Danh sách bạn bè ({friends.length})</Text>
                <Text style={styles.onlineCountText}>
                  🟢 {friends.filter((f) => f.isOnline).length} đang online
                </Text>
              </View>

              {friends.map((friend) => (
                <View key={friend.id} style={styles.friendItemCard}>
                  <View style={styles.friendAvatarWrap}>
                    <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                    {friend.isOnline && <View style={styles.onlineDot} />}
                  </View>

                  <View style={styles.friendDetails}>
                    <View style={styles.friendNameRow}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      {friend.verified && (
                        <Ionicons name="checkmark-circle" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
                      )}
                      <View style={styles.trustBadge}>
                        <Text style={styles.trustBadgeText}>{friend.trustScore}đ</Text>
                      </View>
                    </View>

                    <Text style={styles.friendBio} numberOfLines={1}>
                      {friend.bio}
                    </Text>

                    <Text style={styles.friendSubText}>
                      📍 {friend.city} • 👥 {friend.mutualFriendsCount} bạn chung
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.quickChatBtn}
                    onPress={() => onNavigate('personal_chat')}
                  >
                    <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
                    <Text style={styles.quickChatText}>Nhắn</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ================= TAB 3: TÌM BẠN MỚI ================= */}
        {activeTab === 'find' && (
          <View style={styles.findTabContent}>
            <View style={styles.sectionHeaderNoPad}>
              <Text style={styles.sectionTitle}>Gợi ý cạ đồng hành phù hợp</Text>
              <Text style={styles.aiBadgeText}>AI Match</Text>
            </View>

            {searchResults.map((user) => {
              const isSent = sentRequests.has(user.id);
              return (
                <View key={user.id} style={styles.findUserCard}>
                  <Image source={{ uri: user.avatar }} style={styles.findUserAvatar} />

                  <View style={styles.findUserInfo}>
                    <View style={styles.friendNameRow}>
                      <Text style={styles.friendName}>{user.name}</Text>
                      <View style={styles.trustBadge}>
                        <Text style={styles.trustBadgeText}>{user.trustScore}đ</Text>
                      </View>
                    </View>

                    <Text style={styles.friendBio} numberOfLines={2}>
                      {user.bio}
                    </Text>

                    <View style={styles.interestChipsRow}>
                      {user.interests.slice(0, 3).map((it: string, iIdx: number) => (
                        <View key={iIdx} style={styles.interestMiniChip}>
                          <Text style={styles.interestMiniText}>{it}</Text>
                        </View>
                      ))}
                    </View>

                    <Text style={styles.friendSubText}>
                      📍 {user.city} • 👥 {user.mutualFriendsCount} bạn chung
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.addFriendBtn, isSent && styles.addFriendBtnSent]}
                    disabled={isSent}
                    onPress={() => handleSendRequest(user.id)}
                  >
                    <Ionicons
                      name={isSent ? 'checkmark' : 'person-add'}
                      size={14}
                      color={isSent ? COLORS.textMedium : '#FFFFFF'}
                    />
                    <Text style={[styles.addFriendBtnText, isSent && styles.addFriendBtnTextSent]}>
                      {isSent ? 'Đã gửi' : 'Kết bạn'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar currentScreen="match_home" onNavigate={onNavigate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.textDark,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 5,
    position: 'relative',
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primaryDark,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
  },
  reqBadge: {
    position: 'absolute',
    top: -4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
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
    marginTop: 12,
    marginBottom: 10,
  },
  sectionHeaderNoPad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  seeMoreText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBadgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  aiCandidatesScroll: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 6,
  },
  candidateCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EEEEF2',
    ...SHADOWS.sm,
  },
  candidateAvatarWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  candidateAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  matchPill: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  matchPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  candidateReason: {
    fontSize: 11,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginBottom: 4,
    height: 28,
  },
  candidateDist: {
    fontSize: 10,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  chatCandidateBtn: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  chatCandidateText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  matchCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...SHADOWS.sm,
  },
  cardImageWrap: {
    height: 180,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...(StyleSheet.absoluteFill as any),
  },
  cardRatingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  locationChip: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationChipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginBottom: 10,
  },
  cardTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarStack: {
    width: 60,
    height: 26,
    position: 'relative',
  },
  stackAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#FFF',
    position: 'absolute',
  },
  participantsText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  joinBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  joinBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Friends tab styles
  friendsTabContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  requestsSection: {
    marginBottom: 20,
  },
  requestCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.sm,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestMsg: {
    fontSize: 12,
    color: COLORS.textMedium,
    fontStyle: 'italic',
    marginTop: 3,
    marginBottom: 4,
  },
  mutualText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  declineBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  declineBtnText: {
    color: COLORS.textMedium,
    fontSize: 12,
    fontWeight: '600',
  },
  friendsSection: {
    marginBottom: 20,
  },
  onlineCountText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  friendItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.sm,
  },
  friendAvatarWrap: {
    position: 'relative',
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  friendDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  friendNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  trustBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 6,
  },
  trustBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  friendBio: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  friendSubText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  quickChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 4,
  },
  quickChatText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Find tab styles
  findTabContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  findUserCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  findUserAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
  },
  findUserInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  interestChipsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  interestMiniChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  interestMiniText: {
    fontSize: 10,
    color: COLORS.textMedium,
  },
  addFriendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 4,
  },
  addFriendBtnSent: {
    backgroundColor: '#F3F4F6',
  },
  addFriendBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addFriendBtnTextSent: {
    color: COLORS.textMedium,
  },
});
