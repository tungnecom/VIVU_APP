import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { CURRENT_USER } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';
import { PostItem, ScreenKey } from '../../types';
import { Video, ResizeMode } from '../../utils/safeAV';

interface CreatePostProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const CreatePostScreen: React.FC<CreatePostProps> = ({ onNavigate }) => {
  const addPost = useFeedStore((state) => state.addPost);
  const currentUser = useAuthStore((state) => state.user) || CURRENT_USER;
  const token = useAuthStore((state) => state.token);
  const selectedCity = useAuthStore((state) => state.selectedCity) || 'Đà Nẵng';

  // Mode: 'moment' (Khoảnh khắc) vs 'recruitment' (Tuyển cạ) vs 'wish' (Nguyện vọng)
  const [postMode, setPostMode] = useState<'moment' | 'recruitment' | 'wish'>('moment');

  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
  ]);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  // Recruitment specifics
  const [departureTime, setDepartureTime] = useState('Thứ 7, 18:00');
  const [slotsCount, setSlotsCount] = useState('4 người');
  const [budgetEstimate, setBudgetEstimate] = useState('150k - 200k / người');

  // Wish specifics
  const [wishDestination, setWishDestination] = useState('Đèo Hải Vân & Vịnh Lăng Cô');
  const [wishDate, setWishDate] = useState('Cuối tuần này');

  // Tagged Venue & Companions
  const [taggedVenue, setTaggedVenue] = useState<{
    id: string;
    name: string;
    address: string;
    platformSource?: string;
    latitude?: number;
    longitude?: number;
  } | null>({
    id: 'dn_sontra_marina',
    name: 'Sơn Trà Marina Cafe & Lounge',
    address: 'Đường Hồ Xanh, Bán đảo Sơn Trà, Đà Nẵng',
    platformSource: 'SHOPEEFOOD',
    latitude: 16.1158,
    longitude: 108.2536,
  });

  const [taggedFriends, setTaggedFriends] = useState<Array<{
    id: string;
    name: string;
    avatar: string;
  }>>([]);

  const [hashtags, setHashtags] = useState<string[]>(['#ViVuVietNam', '#DuLich']);
  const [tagInput, setTagInput] = useState('');

  // Modals for selecting venue & friends
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [venueSearch, setVenueSearch] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const [venuesList, setVenuesList] = useState<any[]>([]);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Load real crawled venues & friends
  useEffect(() => {
    loadRealVenues();
    loadRealFriends();
  }, [selectedCity]);

  const loadRealVenues = async () => {
    setLoadingVenues(true);
    try {
      const res = await ApiClient.getPlaces(selectedCity);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setVenuesList(res.data);
      } else {
        // Full nationwide fallback venues
        setVenuesList([
          { id: 'v1', name: 'Sơn Trà Marina Lounge', address: 'Đường Hồ Xanh, Sơn Trà', platformSource: 'SHOPEEFOOD', category: 'Cafe', latitude: 16.1158, longitude: 108.2536 },
          { id: 'v2', name: 'Bánh Tráng Thịt Heo Đại Lộc', address: '97 Trưng Nữ Vương, Hải Châu', platformSource: 'GRABFOOD', category: 'Ăn uống', latitude: 16.0633, longitude: 108.2178 },
          { id: 'v3', name: 'Đỉnh Bàn Cờ Bán Đảo Sơn Trà', address: 'Bán đảo Sơn Trà, Đà Nẵng', platformSource: 'WIKIMEDIA', category: 'Du lịch', latitude: 16.1215, longitude: 108.2750 },
          { id: 'v4', name: 'Quán Nối Cafe Hoài Cổ', address: '113/18 Nguyễn Chí Thanh', platformSource: 'TRAVELOKA', category: 'Cafe', latitude: 16.0712, longitude: 108.2231 },
          { id: 'v5', name: 'Đại Học Bách Khoa Đà Nẵng', address: '54 Nguyễn Lương Bằng, Liên Chiểu', platformSource: 'WIKIMEDIA', category: 'Trường học', latitude: 16.0754, longitude: 108.1534 },
          { id: 'v6', name: 'Khách sạn Novotel Danang Premier', address: '36 Bạch Đằng, Hải Châu', platformSource: 'TRAVELOKA', category: 'Nghỉ ngơi', latitude: 16.0772, longitude: 108.2241 },
          { id: 'v7', name: 'Chợ Đêm Helio & Phố Ẩm Thực', address: 'Đường 2 Tháng 9, Hòa Cường Nam', platformSource: 'SHOPEEFOOD', category: 'Vui chơi', latitude: 16.0352, longitude: 108.2238 },
        ]);
      }
    } catch {
      // ignore
    } finally {
      setLoadingVenues(false);
    }
  };

  const loadRealFriends = async () => {
    setLoadingFriends(true);
    try {
      const res = await ApiClient.getFriends();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setFriendsList(res.data);
      } else {
        setFriendsList([
          { id: 'f1', name: 'Minh Thư', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', trustScore: 94 },
          { id: 'f2', name: 'Quang Anh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', trustScore: 88 },
          { id: 'f3', name: 'Lan Anh', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', trustScore: 96 },
          { id: 'f4', name: 'Hoàng Nam', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', trustScore: 85 },
        ]);
      }
    } catch {
      // ignore
    } finally {
      setLoadingFriends(false);
    }
  };

  // Pick photos
  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'VIVU cần quyền truy cập thư viện ảnh để tải ảnh lên.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.85,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, 10));
    }
  };

  // Pick Video with audio
  const handlePickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'VIVU cần quyền truy cập thư viện media để tải video.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideoUri(result.assets[0].uri);
    }
  };

  // Add custom hashtag
  const handleAddHashtag = () => {
    if (!tagInput.trim()) return;
    let tag = tagInput.trim();
    if (!tag.startsWith('#')) tag = '#' + tag;
    if (!hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
    }
    setTagInput('');
  };

  // Submit Post & Immediately Exit to Home Feed!
  const handlePost = async () => {
    if (!content.trim() && images.length === 0 && !videoUri && postMode === 'moment') {
      Alert.alert('Nội dung trống', 'Vui lòng nhập nội dung, thêm ảnh hoặc video.');
      return;
    }

    const targetLocName =
      postMode === 'wish'
        ? wishDestination
        : taggedVenue
        ? taggedVenue.name
        : selectedCity;

    const newPost: PostItem = {
      id: 'post_' + Date.now(),
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        location: targetLocName,
      },
      timeAgo: 'Vừa xong',
      content:
        content.trim() ||
        (postMode === 'wish'
          ? `Nguyện vọng vi vu: Muốn đến ${wishDestination}! Cần tìm bạn đồng hành cùng gu ✨`
          : postMode === 'recruitment'
          ? `Tuyển cạ cùng vi vu: ${departureTime} tại ${targetLocName}! Ai đi cùng đăng ký ngay nhé 🛵`
          : 'Khoảnh khắc vi vu mới ✨'),
      images: images,
      videoUrl: videoUri || undefined,
      videoDuration: videoUri ? 15 : undefined,
      hashtags: postMode === 'wish' ? [...hashtags, '#NguyenVongViVu', '#TimBanMoi'] : hashtags,
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      taggedVenue: taggedVenue || undefined,
      taggedCompanions: taggedFriends.length > 0 ? taggedFriends : undefined,
      isRecruitment: postMode === 'recruitment',
      recruitmentSlots: postMode === 'recruitment' ? parseInt(slotsCount) || 4 : undefined,
      recruitmentJoined: 1,
      isWish: postMode === 'wish',
      wishDestination: postMode === 'wish' ? wishDestination : undefined,
      wishDate: postMode === 'wish' ? wishDate : undefined,
      activitySnippet:
        postMode === 'recruitment'
          ? {
              location: targetLocName,
              time: departureTime,
              slots: slotsCount,
              budget: budgetEstimate,
            }
          : postMode === 'wish'
          ? {
              location: wishDestination,
              time: wishDate,
              slots: '1-3 người',
              budget: 'Tự do chia sẻ',
            }
          : undefined,
    };

    // 1. Optimistic Update immediately in client store
    addPost(newPost);

    // 2. Synchronize to Backend asynchronously
    ApiClient.createPost(
      {
        content: newPost.content,
        images: newPost.images,
        videoUrl: newPost.videoUrl,
        videoDuration: newPost.videoDuration,
        hashtags: newPost.hashtags,
        location: newPost.author.location,
        time: departureTime,
        slots: slotsCount,
        taggedVenue: newPost.taggedVenue,
        taggedCompanions: newPost.taggedCompanions,
        isRecruitment: newPost.isRecruitment,
        recruitmentSlots: newPost.recruitmentSlots,
        recruitmentBudget: budgetEstimate,
        isWish: newPost.isWish,
        wishDestination: newPost.wishDestination,
        wishDate: newPost.wishDate,
      },
      token || undefined
    ).catch(() => {});

    // 3. Immediately exit and navigate to Home Feed (User requested instant exit without blocking alert)
    onNavigate('home_feed');
  };

  // Filter venues by search
  const filteredVenues = venuesList.filter((v) => {
    if (!venueSearch.trim()) return true;
    const q = venueSearch.toLowerCase();
    return (
      v.name?.toLowerCase().includes(q) ||
      v.address?.toLowerCase().includes(q) ||
      v.category?.toLowerCase().includes(q)
    );
  });

  // Filter friends by search
  const filteredFriends = friendsList.filter((f) => {
    if (!friendSearch.trim()) return true;
    return f.name?.toLowerCase().includes(friendSearch.toLowerCase());
  });

  return (
    <View style={styles.container}>
      <Header
        title="Tạo bài viết"
        onBack={() => onNavigate('home_feed')}
        rightIcon="close"
        onRightPress={() => onNavigate('home_feed')}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Mode Selector Tabs (3 Modes) */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, postMode === 'moment' && styles.modeTabActive]}
            onPress={() => setPostMode('moment')}
          >
            <Ionicons
              name="sparkles"
              size={14}
              color={postMode === 'moment' ? '#FFFFFF' : COLORS.textDark}
            />
            <Text
              style={[
                styles.modeTabText,
                postMode === 'moment' && styles.modeTabTextActive,
              ]}
            >
              Khoảnh khắc
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, postMode === 'recruitment' && styles.modeTabActive]}
            onPress={() => setPostMode('recruitment')}
          >
            <Ionicons
              name="people"
              size={14}
              color={postMode === 'recruitment' ? '#FFFFFF' : COLORS.textDark}
            />
            <Text
              style={[
                styles.modeTabText,
                postMode === 'recruitment' && styles.modeTabTextActive,
              ]}
            >
              Tuyển cạ 🛵
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, postMode === 'wish' && styles.modeTabActive]}
            onPress={() => setPostMode('wish')}
          >
            <Ionicons
              name="navigate"
              size={14}
              color={postMode === 'wish' ? '#FFFFFF' : COLORS.textDark}
            />
            <Text
              style={[
                styles.modeTabText,
                postMode === 'wish' && styles.modeTabTextActive,
              ]}
            >
              Nguyện vọng 📍
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Info Bar */}
        <View style={styles.userRow}>
          <Image source={{ uri: currentUser.avatar }} style={styles.userAvatar} />
          <View style={{ flex: 1 }}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#059669" />
                <Text style={styles.trustText}>{currentUser.trustScore || 94}đ</Text>
              </View>
            </View>
            <View style={styles.privacyBadge}>
              <Ionicons name="earth" size={11} color={COLORS.primary} />
              <Text style={styles.privacyText}>
                {postMode === 'wish'
                  ? 'Đồng bộ lên Bản Đồ toàn quốc'
                  : 'Công khai cho cạ cứng'}
              </Text>
            </View>
          </View>
        </View>

        {/* Wish Mode Specific Box */}
        {postMode === 'wish' && (
          <View style={styles.wishBox}>
            <View style={styles.wishHeader}>
              <Ionicons name="flame" size={18} color="#EF4444" />
              <Text style={styles.wishTitle}>Đăng Nguyện Vọng Đi Đâu Đó (Đồng bộ lên Map)</Text>
            </View>
            <Text style={styles.wishDesc}>
              Nguyện vọng của bạn sẽ được ghim trực tiếp trên Bản Đồ để bạn bè quanh khu vực thấy và ghép cạ cùng bạn!
            </Text>

            <View style={styles.recruitFieldRow}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.recruitFieldLabel}>Nơi muốn đến:</Text>
              <TextInput
                style={styles.recruitInput}
                value={wishDestination}
                onChangeText={setWishDestination}
                placeholder="VD: Đèo Hải Vân, Phố cổ Hội An, Đỉnh Bàn Cờ..."
              />
            </View>

            <View style={styles.recruitFieldRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMedium} />
              <Text style={styles.recruitFieldLabel}>Thời gian:</Text>
              <TextInput
                style={styles.recruitInput}
                value={wishDate}
                onChangeText={setWishDate}
                placeholder="VD: Chiều mai 17h, Cuối tuần này..."
              />
            </View>
          </View>
        )}

        {/* Post text input */}
        <TextInput
          style={styles.textInput}
          placeholder={
            postMode === 'wish'
              ? 'Chia sẻ thêm về nguyện vọng này: Bạn thích đi bằng xe máy hay ô tô? Muốn tìm cạ biết chụp ảnh hay sành ăn...'
              : postMode === 'recruitment'
              ? 'Mô tả chuyến đi: Lịch trình thế nào? Yêu cầu tính cách ra sao? Chi phí dự kiến...'
              : 'Bạn muốn chia sẻ điều gì? Hãy chia sẻ khoảnh khắc ảnh/video cùng bạn bè nhé...'
          }
          placeholderTextColor={COLORS.textLight}
          multiline
          value={content}
          onChangeText={setContent}
        />

        {/* Recruitment Specific Settings Block */}
        {postMode === 'recruitment' && (
          <View style={styles.recruitmentBox}>
            <View style={styles.recruitmentHeader}>
              <Ionicons name="compass" size={18} color={COLORS.primary} />
              <Text style={styles.recruitmentTitle}>Thông tin chuyến tuyển cạ</Text>
            </View>

            <View style={styles.recruitFieldRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.textMedium} />
              <Text style={styles.recruitFieldLabel}>Thời gian:</Text>
              <TextInput
                style={styles.recruitInput}
                value={departureTime}
                onChangeText={setDepartureTime}
                placeholder="VD: Thứ 7, 18:00"
              />
            </View>

            <View style={styles.recruitFieldRow}>
              <Ionicons name="people-outline" size={16} color={COLORS.textMedium} />
              <Text style={styles.recruitFieldLabel}>Số lượng:</Text>
              <TextInput
                style={styles.recruitInput}
                value={slotsCount}
                onChangeText={setSlotsCount}
                placeholder="VD: 4 người"
              />
            </View>

            <View style={styles.recruitFieldRow}>
              <Ionicons name="wallet-outline" size={16} color={COLORS.textMedium} />
              <Text style={styles.recruitFieldLabel}>Kinh phí dự kiến:</Text>
              <TextInput
                style={styles.recruitInput}
                value={budgetEstimate}
                onChangeText={setBudgetEstimate}
                placeholder="VD: 150k - 200k / người"
              />
            </View>
          </View>
        )}

        {/* Tagged Spot Badge */}
        {taggedVenue && (
          <View style={styles.taggedVenueCard}>
            <View style={styles.taggedVenueLeft}>
              <View style={styles.venuePlatformBadge}>
                <Text style={styles.platformBadgeText}>{taggedVenue.platformSource || 'VERIFIED'}</Text>
              </View>
              <Text style={styles.taggedVenueName}>{taggedVenue.name}</Text>
              <Text style={styles.taggedVenueAddr} numberOfLines={1}>{taggedVenue.address}</Text>
            </View>
            <TouchableOpacity onPress={() => setTaggedVenue(null)} style={styles.removeTagBtn}>
              <Ionicons name="close-circle" size={22} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        )}

        {/* Tagged Friends Badge */}
        {taggedFriends.length > 0 && (
          <View style={styles.taggedFriendsRow}>
            <Text style={styles.taggedFriendsTitle}>Cùng với: </Text>
            {taggedFriends.map((f, i) => (
              <View key={i} style={styles.friendChip}>
                <Image source={{ uri: f.avatar }} style={styles.friendChipAvatar} />
                <Text style={styles.friendChipName}>@{f.name}</Text>
                <TouchableOpacity onPress={() => setTaggedFriends(taggedFriends.filter((x) => x.id !== f.id))}>
                  <Ionicons name="close" size={12} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Video Player Preview (If Picked) */}
        {videoUri && (
          <View style={styles.videoPreviewWrap}>
            <Video
              source={{ uri: videoUri }}
              style={styles.videoPlayer}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay={isVideoPlaying}
              isMuted={isVideoMuted}
            />
            <View style={styles.videoOverlayControls}>
              <TouchableOpacity
                style={[styles.videoControlBtn, { backgroundColor: 'rgba(239,68,68,0.85)' }]}
                onPress={() => setVideoUri(null)}
              >
                <Ionicons name="trash-outline" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Uploaded Images Grid */}
        {images.length > 0 && (
          <View style={styles.imagePreviewGrid}>
            {images.map((img, i) => (
              <View key={i} style={styles.previewBox}>
                <Image source={{ uri: img }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setImages(images.filter((_, idx) => idx !== i))}
                >
                  <Ionicons name="close" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Hashtags Row */}
        <View style={styles.hashtagSection}>
          <View style={styles.hashtagList}>
            {hashtags.map((h, i) => (
              <View key={i} style={styles.hashtagItem}>
                <Text style={styles.hashtagText}>{h}</Text>
                <TouchableOpacity onPress={() => setHashtags(hashtags.filter((_, idx) => idx !== i))}>
                  <Ionicons name="close" size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.hashtagInputRow}>
            <TextInput
              style={styles.hashtagInput}
              placeholder="Thêm hashtag (#ViVu, #DuLich...)"
              placeholderTextColor={COLORS.textLight}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddHashtag}
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={handleAddHashtag}>
              <Ionicons name="add" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Rich Media Buttons */}
        <Text style={styles.optionsHeader}>Thêm vào bài viết</Text>
        <View style={styles.optionsGrid}>
          <TouchableOpacity style={styles.optionBtn} onPress={handlePickImages}>
            <View style={[styles.optIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="images" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.optLabel}>Ảnh ({images.length}/10)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionBtn} onPress={handlePickVideo}>
            <View style={[styles.optIconBox, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="videocam" size={20} color="#EF4444" />
            </View>
            <Text style={styles.optLabel}>{videoUri ? 'Đổi Video' : 'Video'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => setShowVenueModal(true)}
          >
            <View style={[styles.optIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="location" size={20} color="#10B981" />
            </View>
            <Text style={styles.optLabel}>Gắn địa điểm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => setShowFriendModal(true)}
          >
            <View style={[styles.optIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="people" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.optLabel}>Gắn thẻ cạ</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Post Button (Instantly posts & exits) */}
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.85}
          onPress={handlePost}
        >
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="send" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>
              {postMode === 'wish'
                ? 'Đăng nguyện vọng & đồng bộ Map'
                : postMode === 'recruitment'
                ? 'Đăng tuyển cạ vi vu'
                : 'Đăng bài viết'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal: Pick Crawled Spot with Search */}
      <Modal visible={showVenueModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gắn địa điểm thật (Zero-Garbage)</Text>
              <TouchableOpacity onPress={() => setShowVenueModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Tìm kiếm địa điểm du lịch, ẩm thực, trường học, khách sạn tại {selectedCity}</Text>

            {/* Search Input for Venues */}
            <View style={styles.modalSearchBar}>
              <Ionicons name="search" size={18} color={COLORS.textLight} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Tìm tên quán ăn, cafe, địa danh, trường học..."
                placeholderTextColor={COLORS.textLight}
                value={venueSearch}
                onChangeText={setVenueSearch}
              />
              {venueSearch.length > 0 && (
                <TouchableOpacity onPress={() => setVenueSearch('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
            </View>

            {loadingVenues ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 30 }} />
            ) : (
              <ScrollView style={{ maxHeight: 380 }}>
                {filteredVenues.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.venueItem}
                    onPress={() => {
                      setTaggedVenue({
                        id: item.id || 'v_' + idx,
                        name: item.name,
                        address: item.address || selectedCity,
                        platformSource: item.platformSource || 'VERIFIED',
                        latitude: item.latitude || 16.0544,
                        longitude: item.longitude || 108.2022,
                      });
                      setShowVenueModal(false);
                    }}
                  >
                    <View style={styles.venuePlatformBadge}>
                      <Text style={styles.platformBadgeText}>{item.platformSource || 'VERIFIED'}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.venueItemName}>{item.name}</Text>
                      <Text style={styles.venueItemAddr} numberOfLines={1}>{item.address || selectedCity}</Text>
                    </View>
                    <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal: Tag Friends with Search */}
      <Modal visible={showFriendModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gắn thẻ cạ cứng</Text>
              <TouchableOpacity onPress={() => setShowFriendModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchBar}>
              <Ionicons name="search" size={18} color={COLORS.textLight} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Tìm bạn theo tên..."
                placeholderTextColor={COLORS.textLight}
                value={friendSearch}
                onChangeText={setFriendSearch}
              />
            </View>

            {loadingFriends ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 30 }} />
            ) : (
              <ScrollView style={{ maxHeight: 380 }}>
                {filteredFriends.map((f, idx) => {
                  const isTagged = taggedFriends.some((x) => x.id === f.id);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.friendItem}
                      onPress={() => {
                        if (isTagged) {
                          setTaggedFriends(taggedFriends.filter((x) => x.id !== f.id));
                        } else {
                          setTaggedFriends([...taggedFriends, { id: f.id, name: f.name, avatar: f.avatar }]);
                        }
                      }}
                    >
                      <Image source={{ uri: f.avatar }} style={styles.friendItemAvatar} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.friendItemName}>{f.name}</Text>
                        <Text style={styles.friendItemScore}>⭐ Uy tín: {f.trustScore || 90}đ</Text>
                      </View>
                      <Ionicons
                        name={isTagged ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={isTagged ? COLORS.primary : COLORS.textLight}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setShowFriendModal(false)}
            >
              <Text style={styles.modalDoneText}>Hoàn tất ({taggedFriends.length} người)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.glow,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  privacyText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  textInput: {
    fontSize: 15,
    color: COLORS.textDark,
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 22,
    marginBottom: 12,
  },
  wishBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 14,
    marginBottom: 14,
    gap: 8,
  },
  wishHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wishTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  wishDesc: {
    fontSize: 11,
    color: COLORS.textMedium,
    lineHeight: 16,
    marginBottom: 4,
  },
  recruitmentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
    gap: 8,
  },
  recruitmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  recruitmentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  recruitFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recruitFieldLabel: {
    fontSize: 13,
    color: COLORS.textMedium,
    fontWeight: '600',
    width: 105,
  },
  recruitInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  taggedVenueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  taggedVenueLeft: {
    flex: 1,
  },
  venuePlatformBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginBottom: 2,
  },
  platformBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  taggedVenueName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  taggedVenueAddr: {
    fontSize: 11,
    color: COLORS.textMedium,
  },
  removeTagBtn: {
    padding: 4,
  },
  taggedFriendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  taggedFriendsTitle: {
    fontSize: 12,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  friendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  friendChipAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  friendChipName: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  videoPreviewWrap: {
    position: 'relative',
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 14,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoOverlayControls: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  videoControlBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  previewBox: {
    position: 'relative',
    width: 85,
    height: 85,
    borderRadius: 10,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hashtagSection: {
    marginBottom: 16,
  },
  hashtagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  hashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hashtagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  hashtagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  hashtagInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
  },
  addTagBtn: {
    padding: 6,
  },
  optionsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMedium,
    marginBottom: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  optionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  optIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  optLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginBottom: 12,
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
  },
  venueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  venueItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  venueItemAddr: {
    fontSize: 11,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  friendItemAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  friendItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  friendItemScore: {
    fontSize: 11,
    color: '#059669',
    marginTop: 2,
  },
  modalDoneBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  modalDoneText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
