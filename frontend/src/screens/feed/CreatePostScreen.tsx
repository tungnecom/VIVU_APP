import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { COLORS, SHADOWS } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useActivityStore } from '../../stores/activityStore';
import { useFeedStore } from '../../stores/feedStore';
import { ApiClient } from '../../services/api';
import { ScreenKey } from '../../types';
import { KeoCard, KeoActivityItem } from '../../components/common/KeoCard';

interface CreatePostProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
  initialContext?: {
    venueName?: string;
    venueAddress?: string;
    category?: string;
  };
}

const PUBLIC_VENUES_DANANG = [
  { name: 'Cầu Rồng & Phố đi bộ Bạch Đằng', district: 'Hải Châu' },
  { name: 'Biển Mỹ Khê (Khu công viên Biển Đông)', district: 'Sơn Trà' },
  { name: 'Bán đảo Sơn Trà & Bãi Bụt', district: 'Sơn Trà' },
  { name: 'Chợ Đêm Helio & Cung Thiếu Nhi', district: 'Hải Châu' },
  { name: 'Wonderlust Cafe & Bakery (96 Trần Phú)', district: 'Hải Châu' },
  { name: 'Bãi đá Cháy & Chùa Linh Ứng', district: 'Sơn Trà' },
];

export const CreatePostScreen: React.FC<CreatePostProps> = ({
  onNavigate,
  initialContext,
}) => {
  const token = useAuthStore((s) => s.token);
  const currentUser = useAuthStore((s) => s.user);
  const selectedCity = useAuthStore((s) => s.selectedCity) || 'Đà Nẵng';
  const fetchActivities = useActivityStore((s) => s.fetchActivities);
  const fetchPosts = useFeedStore((s) => s.fetchPosts);

  // Chế độ: 'keo' (Ưu tiên P0 - Luồng B) vs 'post' (Tạo bài viết - UX-03)
  const [mode, setMode] = useState<'keo' | 'post'>('keo');

  // --- STATE TẠO KÈO (LUỒNG B) ---
  const [keoTitle, setKeoTitle] = useState(
    initialContext?.venueName ? `Đi ${initialContext.venueName} cùng mình nhé` : ''
  );
  const [keoCategory, setKeoCategory] = useState(initialContext?.category || 'Cafe');
  const [keoDate, setKeoDate] = useState('Hôm nay');
  const [keoTime, setKeoTime] = useState('18:30');
  const [keoLocation, setKeoLocation] = useState(
    initialContext?.venueName
      ? `${initialContext.venueName}, ${initialContext.venueAddress || selectedCity}`
      : 'Cầu Rồng & Phố đi bộ Bạch Đằng, Hải Châu, Đà Nẵng'
  );
  const [maxSlots, setMaxSlots] = useState<number>(4);
  const [keoBudget, setKeoBudget] = useState('Tự túc');
  const [keoDescription, setKeoDescription] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- STATE TẠO BÀI VIẾT (UX-03) ---
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postVenue, setPostVenue] = useState(initialContext?.venueName || '');

  // Chọn ảnh cho bài viết
  const handlePickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!res.canceled && res.assets[0].uri) {
        setPostImages([...postImages, res.assets[0].uri]);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể chọn ảnh lúc này.');
    }
  };

  // Validate và gửi Tạo Kèo
  const handleCreateKeo = async () => {
    if (!token) {
      Alert.alert('Cần đăng nhập', 'Vui lòng đăng nhập để đăng kèo.', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => onNavigate('login') },
      ]);
      return;
    }

    if (!keoTitle.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên hoạt động cho kèo.');
      return;
    }

    if (!keoLocation.trim()) {
      Alert.alert('Thiếu địa điểm', 'Vui lòng chọn hoặc nhập điểm hẹn công cộng.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ApiClient.createActivity(
        {
          title: keoTitle.trim(),
          category: keoCategory,
          location: keoLocation.trim(),
          city: selectedCity,
          time: keoTime,
          date: keoDate,
          maxParticipants: maxSlots,
          budget: keoBudget,
          description: keoDescription.trim() || 'Hẹn gặp mọi người tại điểm hẹn nhé!',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        },
        token
      );

      if (res.success && res.data) {
        setShowPreviewModal(false);
        await fetchActivities(selectedCity);
        Alert.alert(
          'Đăng kèo thành công! 🎉',
          'Kèo của bạn đã được mở để mọi người xin tham gia.',
          [
            {
              text: 'Xem chi tiết kèo',
              onPress: () => onNavigate('activity_detail', { id: res.data.id }),
            },
          ]
        );
      } else {
        Alert.alert('Không thể tạo kèo', res.error || 'Vui lòng thử lại sau.');
      }
    } catch {
      Alert.alert('Lỗi kết nối', 'Không thể gửi dữ liệu đến máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  // Validate và gửi Tạo Bài Viết
  const handleCreatePost = async () => {
    if (!token) {
      Alert.alert('Cần đăng nhập', 'Vui lòng đăng nhập để đăng bài viết.');
      return;
    }

    if (!postContent.trim() && postImages.length === 0) {
      Alert.alert('Thiếu nội dung', 'Vui lòng viết cảm nghĩ hoặc thêm ảnh.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ApiClient.createPost(
        {
          content: postContent.trim(),
          images: postImages,
          location: postVenue || selectedCity,
          city: selectedCity,
        },
        token
      );

      if (res.success) {
        await fetchPosts();
        Alert.alert('Đã đăng bài viết! 🎉', 'Bài viết đã xuất hiện trên Trang chủ.', [
          { text: 'Về Trang chủ', onPress: () => onNavigate('home_feed') },
        ]);
      } else {
        Alert.alert('Lỗi', res.error || 'Không thể đăng bài viết.');
      }
    } catch {
      Alert.alert('Lỗi kết nối', 'Không thể kết nối máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  // Đối tượng xem trước preview
  const previewItem: KeoActivityItem = {
    id: 'preview_id',
    title: keoTitle || 'Hoạt động xem trước',
    category: keoCategory,
    location: keoLocation,
    time: keoTime,
    date: keoDate,
    joined: 1,
    maxParticipants: maxSlots,
    budget: keoBudget,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    host: {
      name: currentUser?.name || 'Bạn (Chủ kèo)',
      avatar: currentUser?.avatar,
      trustScore: currentUser?.trustScore || 85,
      isVerified: true,
    },
    matchReason: 'Kèo do bạn vừa tạo',
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => onNavigate('home_feed')}
          accessibilityLabel="Đóng"
        >
          <Ionicons name="close" size={24} color={COLORS.textDark} />
        </TouchableOpacity>

        {/* Tab chuyển đổi chế độ: Kèo (Ưu tiên) vs Bài viết */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'keo' && styles.modeTabActive]}
            onPress={() => setMode('keo')}
          >
            <Ionicons
              name="compass"
              size={15}
              color={mode === 'keo' ? '#FFFFFF' : COLORS.textDark}
            />
            <Text
              style={[
                styles.modeTabText,
                mode === 'keo' && styles.modeTabTextActive,
              ]}
            >
              Lên kèo đi cùng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, mode === 'post' && styles.modeTabActive]}
            onPress={() => setMode('post')}
          >
            <Ionicons
              name="newspaper"
              size={15}
              color={mode === 'post' ? '#FFFFFF' : COLORS.textDark}
            />
            <Text
              style={[
                styles.modeTabText,
                mode === 'post' && styles.modeTabTextActive,
              ]}
            >
              Bài viết
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'keo' ? (
          /* ================= LUỒNG B: TẠO KÈO (ƯU TIÊN P0) ================= */
          <View>
            <View style={styles.promiseCallout}>
              <Ionicons name="sparkles" size={16} color={COLORS.secondaryPurple} />
              <Text style={styles.promiseCalloutText}>
                Tạo kèo công khai để Vivu ghép bạn cùng sở thích vào đúng giờ hẹn!
              </Text>
            </View>

            {/* 1. Tên hoạt động */}
            <Text style={styles.label}>
              1. Bạn muốn làm gì? <Text style={styles.req}>*</Text>
            </Text>
            <TextInput
              style={styles.titleInput}
              placeholder="VD: Cafe sáng ngắm sông Hàn & chia sẻ về ảnh film"
              placeholderTextColor={COLORS.textLight}
              value={keoTitle}
              onChangeText={setKeoTitle}
              maxLength={80}
            />

            {/* 2. Danh mục */}
            <Text style={styles.label}>Danh mục hoạt động</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {['Cafe', 'Ăn uống', 'Du lịch', 'Camping', 'Thể thao', 'Check-in'].map((cat) => {
                const active = keoCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, active && styles.catChipActive]}
                    onPress={() => setKeoCategory(cat)}
                  >
                    <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 3. Thời gian hẹn (Validate giờ) */}
            <Text style={styles.label}>
              2. Khi nào bắt đầu? <Text style={styles.req}>*</Text>
            </Text>
            <View style={styles.rowTwoCols}>
              {/* Ngày */}
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Ngày hẹn</Text>
                <View style={styles.rowWrap}>
                  {['Hôm nay', 'Ngày mai', 'Cuối tuần'].map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.smallChip, keoDate === d && styles.smallChipActive]}
                      onPress={() => setKeoDate(d)}
                    >
                      <Text style={[styles.smallChipText, keoDate === d && styles.smallChipTextActive]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Giờ */}
              <View style={{ width: 110 }}>
                <Text style={styles.subLabel}>Giờ hẹn</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="18:30"
                  placeholderTextColor={COLORS.textLight}
                  value={keoTime}
                  onChangeText={setKeoTime}
                />
              </View>
            </View>

            {/* 4. Địa điểm công cộng */}
            <Text style={styles.label}>
              3. Điểm hẹn công cộng an toàn <Text style={styles.req}>*</Text>
            </Text>
            <TextInput
              style={styles.locationInput}
              placeholder="VD: Cầu Rồng, Biển Mỹ Khê hoặc tên quán cafe"
              placeholderTextColor={COLORS.textLight}
              value={keoLocation}
              onChangeText={setKeoLocation}
            />

            {/* Gợi ý điểm công cộng Đà Nẵng */}
            <Text style={styles.suggestionTitle}>Gợi ý điểm hẹn phổ biến tại Đà Nẵng:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.venueSuggestions}>
              {PUBLIC_VENUES_DANANG.map((v) => (
                <TouchableOpacity
                  key={v.name}
                  style={styles.venueSuggestionChip}
                  onPress={() => setKeoLocation(`${v.name}, ${v.district}, Đà Nẵng`)}
                >
                  <Ionicons name="location" size={13} color={COLORS.secondaryPurple} />
                  <Text style={styles.venueSuggestionText}>{v.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 5. Số lượng người & Kinh phí */}
            <View style={styles.rowTwoCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Cần tìm thêm mấy người?</Text>
                <View style={styles.slotsRow}>
                  {[2, 3, 4, 5, 6].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.slotSelectBtn, maxSlots === s && styles.slotSelectBtnActive]}
                      onPress={() => setMaxSlots(s)}
                    >
                      <Text style={[styles.slotSelectText, maxSlots === s && styles.slotSelectTextActive]}>
                        {s} bạn
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.label}>Dự trù kinh phí (mỗi người)</Text>
            <View style={styles.rowWrap}>
              {['Tự túc', 'Dưới 50k', '50k - 100k', '100k - 200k', 'Miễn phí'].map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.budgetChip, keoBudget === b && styles.budgetChipActive]}
                  onPress={() => setKeoBudget(b)}
                >
                  <Text style={[styles.budgetText, keoBudget === b && styles.budgetTextActive]}>
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 6. Lời nhắn thêm */}
            <Text style={styles.label}>Lời nhắn / Lịch trình dự kiến</Text>
            <TextInput
              style={styles.descInput}
              placeholder="VD: Hẹn gặp nhau ở quán lúc 8h30, ngồi cafe tán gẫu đến 10h sau đó đi dạo chụp ảnh phố nhé!"
              placeholderTextColor={COLORS.textLight}
              value={keoDescription}
              onChangeText={setKeoDescription}
              multiline
              numberOfLines={3}
            />

            {/* Action Buttons: Xem trước & Đăng */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.previewBtn}
                onPress={() => setShowPreviewModal(true)}
              >
                <Ionicons name="eye-outline" size={18} color={COLORS.secondaryPurple} />
                <Text style={styles.previewBtnText}>Xem trước kèo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.publishBtn, submitting && { opacity: 0.6 }]}
                disabled={submitting}
                onPress={handleCreateKeo}
              >
                <LinearGradient
                  colors={COLORS.primaryGradient}
                  style={styles.publishGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.publishBtnText}>
                    {submitting ? 'Đang tạo...' : 'Đăng kèo ngay'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ================= UX-03: TẠO BÀI VIẾT ================= */
          <View>
            <Text style={styles.label}>Chia sẻ khoảnh khắc / trải nghiệm</Text>
            <TextInput
              style={styles.postInput}
              placeholder="Hôm nay bạn đã khám phá được điều gì thú vị tại Đà Nẵng?"
              placeholderTextColor={COLORS.textLight}
              value={postContent}
              onChangeText={setPostContent}
              multiline
              numberOfLines={4}
            />

            {/* Gắn thẻ địa điểm */}
            <Text style={styles.label}>Gắn thẻ địa điểm</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="VD: Wonderlust Cafe, Đỉnh Bàn Cờ..."
              placeholderTextColor={COLORS.textLight}
              value={postVenue}
              onChangeText={setPostVenue}
            />

            {/* Thêm hình ảnh */}
            <Text style={styles.label}>Hình ảnh</Text>
            <View style={styles.imagesRow}>
              <TouchableOpacity style={styles.addPhotoBox} onPress={handlePickImage}>
                <Ionicons name="camera" size={24} color={COLORS.secondaryPurple} />
                <Text style={styles.addPhotoText}>Thêm ảnh</Text>
              </TouchableOpacity>

              {postImages.map((uri, idx) => (
                <View key={idx} style={styles.previewImageBox}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setPostImages(postImages.filter((_, i) => i !== idx))}
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.publishPostBtn, submitting && { opacity: 0.6 }]}
              disabled={submitting}
              onPress={handleCreatePost}
            >
              <Text style={styles.publishPostText}>
                {submitting ? 'Đang đăng...' : 'Đăng lên Bảng tin'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Modal Preview Kèo trước khi đăng (Mục 6.2 Đặc tả) */}
      <Modal
        visible={showPreviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.previewSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Bản xem trước kèo của bạn</Text>
            <Text style={styles.modalSubtitle}>
              Đây là hình ảnh kèo của bạn sẽ xuất hiện trên trang Matching cho các thành viên khác nhìn thấy.
            </Text>

            <KeoCard activity={previewItem} onPress={() => {}} />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowPreviewModal(false)}
              >
                <Text style={styles.cancelBtnText}>Chỉnh sửa tiếp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                disabled={submitting}
                onPress={handleCreateKeo}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Đang xuất bản...' : 'Đồng ý & Đăng'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backBtn: {
    padding: 6,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F5',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  modeTabActive: {
    backgroundColor: COLORS.secondaryPurple,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  promiseCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3EEFD',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  promiseCalloutText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondaryPurple,
    flex: 1,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
    marginTop: 14,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 6,
  },
  req: {
    color: COLORS.primaryCoral,
  },
  titleInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: COLORS.secondaryPurple,
    borderColor: COLORS.secondaryPurple,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smallChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  smallChipActive: {
    backgroundColor: COLORS.secondaryPurple,
    borderColor: COLORS.secondaryPurple,
  },
  smallChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  smallChipTextActive: {
    color: '#FFFFFF',
  },
  timeInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.textDark,
  },
  locationInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textDark,
  },
  suggestionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 8,
    marginBottom: 6,
  },
  venueSuggestions: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  venueSuggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  venueSuggestionText: {
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  slotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slotSelectBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  slotSelectBtnActive: {
    backgroundColor: COLORS.primaryCoral,
    borderColor: COLORS.primaryCoral,
  },
  slotSelectText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  slotSelectTextActive: {
    color: '#FFFFFF',
  },
  budgetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  budgetChipActive: {
    backgroundColor: COLORS.accentMint,
    borderColor: COLORS.accentMint,
  },
  budgetText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  budgetTextActive: {
    color: '#FFFFFF',
  },
  descInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: COLORS.textDark,
    height: 80,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.secondaryPurple,
  },
  previewBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondaryPurple,
  },
  publishBtn: {
    flex: 1.4,
    borderRadius: 22,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  publishGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  postInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: COLORS.textDark,
    height: 110,
    textAlignVertical: 'top',
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  addPhotoBox: {
    width: 90,
    height: 90,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  addPhotoText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondaryPurple,
    marginTop: 4,
  },
  previewImageBox: {
    width: 90,
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishPostBtn: {
    backgroundColor: COLORS.secondaryPurple,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 24,
    ...SHADOWS.glow,
  },
  publishPostText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(41, 38, 51, 0.65)',
    justifyContent: 'flex-end',
  },
  previewSheet: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  submitBtn: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 20,
    backgroundColor: COLORS.primaryCoral,
    ...SHADOWS.glow,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
