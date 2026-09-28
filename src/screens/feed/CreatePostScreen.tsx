import React, { useState } from 'react';
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
import { Header } from '../../components/Header';
import { CURRENT_USER } from '../../constants/mockData';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';
import { PostItem, ScreenKey } from '../../types';

interface CreatePostProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const CreatePostScreen: React.FC<CreatePostProps> = ({ onNavigate }) => {
  const addPost = useFeedStore((state) => state.addPost);
  const currentUser = useAuthStore((state) => state.user) || CURRENT_USER;
  const token = useAuthStore((state) => state.token);

  const [content, setContent] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Hải Châu, Đà Nẵng');
  const [selectedTime, setSelectedTime] = useState('Thứ 7, 25/05/2025 - 17:00');
  const [selectedSlots, setSelectedSlots] = useState('5 người');
  const [selectedTags, setSelectedTags] = useState(['#DuLịch', '#CafeĐàNẵng']);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
  ]);

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung hoặc thêm ảnh.');
      return;
    }

    const newPost: PostItem = {
      id: 'post_' + Date.now(),
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        location: selectedLocation || 'Đà Nẵng',
      },
      timeAgo: 'Vừa xong',
      content: content.trim() || 'Chào mọi người, cùng đi trải nghiệm nhé! ✨',
      images,
      hashtags: selectedTags,
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      activitySnippet: selectedLocation
        ? {
            location: selectedLocation,
            time: selectedTime,
            slots: selectedSlots,
          }
        : undefined,
    };

    // 1. Cập nhật ngay trên mobile store (Optimistic UI)
    addPost(newPost);

    // 2. Gửi đồng bộ lên backend API
    await ApiClient.createPost(
      {
        content: newPost.content,
        images: newPost.images,
        hashtags: newPost.hashtags,
        location: selectedLocation,
        time: selectedTime,
        slots: selectedSlots,
      },
      token || undefined
    );

    Alert.alert('Thành công', 'Bài viết của bạn đã được đăng lên VIVU Feed!', [
      { text: 'Xem bài viết', onPress: () => onNavigate('home_feed') },
    ]);
  };


  return (
    <View style={styles.container}>
      <Header
        title="Tạo bài viết"
        onBack={() => onNavigate('home_feed')}
        rightIcon="close"
        onRightPress={() => onNavigate('home_feed')}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* User row */}
        <View style={styles.userRow}>
          <Image source={{ uri: CURRENT_USER.avatar }} style={styles.userAvatar} />
          <View>
            <Text style={styles.userName}>{CURRENT_USER.name}</Text>
            <View style={styles.privacyBadge}>
              <Ionicons name="earth" size={12} color={COLORS.primary} />
              <Text style={styles.privacyText}>Công khai</Text>
            </View>
          </View>
        </View>

        {/* Content input */}
        <TextInput
          style={styles.textInput}
          placeholder="Bạn muốn chia sẻ điều gì? Hãy rủ rê bạn bè cùng đi chơi nhé..."
          placeholderTextColor={COLORS.textLight}
          multiline
          value={content}
          onChangeText={setContent}
        />

        {/* Uploaded image previews */}
        {images.length > 0 && (
          <View style={styles.imagePreviewRow}>
            {images.map((img, i) => (
              <View key={i} style={styles.previewBox}>
                <Image source={{ uri: img }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setImages([])}
                >
                  <Ionicons name="close" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Meta badges if set */}
        <View style={styles.chipsWrap}>
          {selectedLocation ? (
            <View style={styles.chip}>
              <Ionicons name="location-sharp" size={14} color={COLORS.primary} />
              <Text style={styles.chipText}>{selectedLocation}</Text>
            </View>
          ) : null}
          {selectedTime ? (
            <View style={styles.chip}>
              <Ionicons name="time-outline" size={14} color={COLORS.primary} />
              <Text style={styles.chipText}>{selectedTime}</Text>
            </View>
          ) : null}
          {selectedSlots ? (
            <View style={styles.chip}>
              <Ionicons name="people-outline" size={14} color={COLORS.primary} />
              <Text style={styles.chipText}>{selectedSlots}</Text>
            </View>
          ) : null}
        </View>

        {/* Attachment Options Grid */}
        <Text style={styles.optionsHeader}>Thêm vào bài viết của bạn</Text>
        <View style={styles.optionsGrid}>
          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() =>
              setImages([
                'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
              ])
            }
          >
            <View style={[styles.optIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="image" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.optLabel}>Ảnh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionBtn}>
            <View style={[styles.optIconBox, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="videocam" size={20} color="#EF4444" />
            </View>
            <Text style={styles.optLabel}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => onNavigate('map')}
          >
            <View style={[styles.optIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="location" size={20} color="#10B981" />
            </View>
            <Text style={styles.optLabel}>Địa điểm</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionBtn}>
            <View style={[styles.optIconBox, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="time" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.optLabel}>Thời gian</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionBtn}>
            <View style={[styles.optIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="people" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.optLabel}>Số người</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionBtn}>
            <View style={[styles.optIconBox, { backgroundColor: '#FDF2F8' }]}>
              <Ionicons name="pricetag" size={20} color="#EC4899" />
            </View>
            <Text style={styles.optLabel}>Hashtag</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Post Button */}
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
            <Text style={styles.btnText}>Đăng bài</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
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
    fontSize: 16,
    color: COLORS.textDark,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  imagePreviewRow: {
    marginVertical: 14,
  },
  previewBox: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  optionsHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMedium,
    marginTop: 16,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  optionBtn: {
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FAFAFC',
    borderWidth: 1,
    borderColor: '#EEEEF2',
    gap: 8,
  },
  optIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  submitBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
