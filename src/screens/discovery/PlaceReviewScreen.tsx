import React, { useState } from 'react';
import {
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
import { Header } from '../../components/Header';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';

interface PlaceReviewProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const PlaceReviewScreen: React.FC<PlaceReviewProps> = ({ onNavigate }) => {
  const user = useAuthStore((s) => s.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [commentText, setCommentText] = useState('');

  const [reviews, setReviews] = useState([
    {
      id: '1',
      author: 'Mai Anh',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      time: '3 ngày trước',
      rating: 5,
      comment:
        'Thịt luộc hai đầu da giòn ngọt, mắm nêm đậm đà chuẩn vị Đà Nẵng! Không gian rộng rãi rất thích hợp cho nhóm 6-10 bạn.',
      photos: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      ],
    },
    {
      id: '2',
      author: 'Hoàng Nam',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      time: '5 ngày trước',
      rating: 5,
      comment:
        'Đã cùng nhóm bạn trong VIVU ghé ăn thử cuối tuần trước. Phục vụ nhanh nhẹn, rau sống tươi rói nhiều loại!',
      photos: [],
    },
  ]);

  const metrics = [
    { label: 'Chất lượng món ăn', score: 4.8 },
    { label: 'Độ tươi ngon', score: 4.6 },
    { label: 'Không gian & view', score: 4.5 },
    { label: 'Vị trí & bãi đỗ xe', score: 4.7 },
    { label: 'Phù hợp tụ tập nhóm', score: 4.8 },
  ];

  const handleSubmitReview = () => {
    if (!commentText.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập cảm nhận đánh giá của bạn.');
      return;
    }

    const newRev = {
      id: Date.now().toString(),
      author: user?.name || 'Tùng (Bạn)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      time: 'Vừa xong',
      rating,
      comment: commentText.trim(),
      photos: [],
    };

    setReviews([newRev, ...reviews]);
    setCommentText('');
    setModalVisible(false);

    Alert.alert(
      '🎉 Đánh giá thành công!',
      'Cảm ơn bạn đã đóng góp đánh giá xác thực cho cộng đồng VIVU! Điểm uy tín của bạn được cộng +5 điểm (Chống thông tin rác).'
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Đánh giá địa điểm"
        onBack={() => onNavigate('map')}
        rightIcon="share-outline"
        onRightPress={() => Alert.alert('Chia sẻ', 'Đã sao chép liên kết địa điểm sạch!')}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner Card */}
        <View style={styles.placeHeader}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
            }}
            style={styles.placeImage}
          />
          <View style={styles.placeOverlay}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={styles.verifiedText}>Zero-Garbage Verified 100%</Text>
            </View>
            <Text style={styles.placeName}>Quán Bánh Tráng Thịt Heo Đại Lộc</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.starText}>⭐ 4.8</Text>
              <Text style={styles.totalReviews}>({reviews.length + 115} đánh giá từ cộng đồng VIVU)</Text>
            </View>
          </View>
        </View>

        {/* Detailed Metrics */}
        <View style={styles.metricsCard}>
          <Text style={styles.cardHeading}>Chi tiết điểm đánh giá</Text>
          {metrics.map((m, idx) => (
            <View key={idx} style={styles.metricRow}>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(m.score / 5.0) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.metricScore}>{m.score}</Text>
            </View>
          ))}
        </View>

        {/* User Reviews List */}
        <View style={styles.reviewsSection}>
          <Text style={styles.cardHeading}>Đánh giá gần đây ({reviews.length})</Text>
          {reviews.map((r) => (
            <View key={r.id} style={styles.reviewItem}>
              <View style={styles.reviewAuthorRow}>
                <Image source={{ uri: r.avatar }} style={styles.avatar} />
                <View style={styles.authorMeta}>
                  <Text style={styles.authorName}>{r.author}</Text>
                  <Text style={styles.reviewTime}>{r.time}</Text>
                </View>
                <View style={styles.starsBadge}>
                  <Ionicons name="star" size={14} color="#FFB800" />
                  <Text style={styles.starsBadgeText}>{r.rating}.0</Text>
                </View>
              </View>

              <Text style={styles.reviewComment}>{r.comment}</Text>

              {r.photos && r.photos.length > 0 && (
                <View style={styles.photosRow}>
                  {r.photos.map((p, pIdx) => (
                    <Image key={pIdx} source={{ uri: p }} style={styles.reviewPhoto} />
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom Write Review Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.writeReviewBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="create-outline" size={18} color="#FFFFFF" />
          <Text style={styles.writeReviewText}>Viết review & chấm điểm</Text>
        </TouchableOpacity>
      </View>

      {/* Write Review Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Viết đánh giá thực tế</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.rateLabel}>Chấm điểm trải nghiệm:</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Ionicons
                    name={s <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color="#FFB800"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Chia sẻ cảm nhận chân thật về món ăn, không gian, giá cả..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              value={commentText}
              onChangeText={setCommentText}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitReview}
            >
              <Text style={styles.submitBtnText}>Gửi đánh giá (+5 Điểm Uy Tín)</Text>
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
    backgroundColor: '#F8F9FE',
  },
  scroll: {
    flex: 1,
  },
  placeHeader: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  placeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  verifiedText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  placeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starText: {
    color: '#FFD700',
    fontWeight: '800',
    fontSize: 14,
  },
  totalReviews: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 18,
    gap: 12,
    ...SHADOWS.sm,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricLabel: {
    fontSize: 13,
    color: COLORS.textMedium,
    width: 140,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  metricScore: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    width: 28,
    textAlign: 'right',
  },
  reviewsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 18,
    gap: 14,
    ...SHADOWS.sm,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 14,
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  reviewTime: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  starsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  starsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  reviewComment: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 19,
    marginBottom: 10,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewPhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
  },
  writeReviewBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  writeReviewText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  rateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  starRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: COLORS.textDark,
    textAlignVertical: 'top',
    height: 110,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
