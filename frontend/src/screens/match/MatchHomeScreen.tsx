import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useActivityStore } from '../../stores/activityStore';
import { useAuthStore } from '../../stores/authStore';
import { ApiClient } from '../../services/api';
import { ScreenKey } from '../../types';
import {
  FilterChipBar,
  TIME_FILTERS,
} from '../../components/common/FilterChipBar';
import { KeoCard, KeoActivityItem } from '../../components/common/KeoCard';
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from '../../components/common/StateView';

interface MatchHomeProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
  showBottomBar?: boolean;
}

export const MatchHomeScreen: React.FC<MatchHomeProps> = ({
  onNavigate,
}) => {
  const selectedCity = useAuthStore((s) => s.selectedCity) || 'Đà Nẵng';
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const activities = useActivityStore((s) => s.activities);
  const loading = useActivityStore((s) => s.loading);
  const error = useActivityStore((s) => s.error);
  const fetchActivities = useActivityStore((s) => s.fetchActivities);

  // Bộ lọc
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedTime, setSelectedTime] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Modal xin tham gia nhanh
  const [selectedActivityForJoin, setSelectedActivityForJoin] =
    useState<KeoActivityItem | null>(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedCity]);

  const loadData = async () => {
    const cat = selectedCategory === 'Tất cả' ? undefined : selectedCategory;
    await fetchActivities(selectedCity, cat);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleResetFilters = () => {
    setSelectedCategory('Tất cả');
    setSelectedTime('all');
  };

  // Gửi yêu cầu tham gia kèo
  const handleConfirmJoin = async () => {
    if (!selectedActivityForJoin) return;
    if (!token) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để gửi yêu cầu tham gia kèo.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => onNavigate('login') },
        ]
      );
      return;
    }

    setSubmittingJoin(true);
    try {
      const res = await ApiClient.joinActivity(
        selectedActivityForJoin.id,
        joinMessage.trim() || 'Chào bạn, cho mình tham gia kèo này với nhé!',
        token
      );

      if (res.success) {
        Alert.alert(
          'Đã gửi yêu cầu!',
          'Chủ kèo sẽ nhận được thông báo. Bạn sẽ được tự động tham gia nhóm chat khi được duyệt.',
          [{ text: 'Đã hiểu' }]
        );
        setSelectedActivityForJoin(null);
        setJoinMessage('');
        loadData();
      } else {
        Alert.alert('Chưa thể gửi yêu cầu', res.error || 'Vui lòng thử lại sau.');
      }
    } catch {
      Alert.alert('Lỗi kết nối', 'Không thể gửi yêu cầu lúc này. Vui lòng kiểm tra lại mạng.');
    } finally {
      setSubmittingJoin(false);
    }
  };

  // Chuyển đổi dữ liệu từ store sang KeoActivityItem chuẩn
  const mappedActivities: KeoActivityItem[] = (activities || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    category: item.category || 'Ăn uống',
    location: item.location || 'Hải Châu, Đà Nẵng',
    district: item.district,
    time: item.time || '18:00',
    date: item.date || 'Hôm nay',
    joined: item.joined || item.currentParticipants || 1,
    maxParticipants: item.maxParticipants || item.maxSlots || 4,
    image: item.image,
    host: {
      id: item.host?.id,
      name: item.host?.name || 'Thành viên Vivu',
      avatar: item.host?.avatar,
      trustScore: item.host?.trustScore || 85,
      isVerified: item.host?.isVerified !== false,
    },
    matchReason: item.matchReason || (item.category ? `Cùng mê ${item.category.toLowerCase()}` : 'Gần khu vực bạn chọn'),
    userRequestStatus: item.userRequestStatus || null,
    budget: item.budget,
  }));

  return (
    <View style={styles.container}>
      {/* Header chuẩn Vivu */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSubtitle}>VIVU MATCHING</Text>
            <Text style={styles.headerTitle}>Đi cùng</Text>
          </View>

          {/* Nút chọn thành phố & Bản đồ */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.cityChip}
              activeOpacity={0.8}
              onPress={() => onNavigate('city_select')}
              accessibilityLabel={`Thành phố hiện tại: ${selectedCity}`}
            >
              <Ionicons name="location" size={14} color={COLORS.primaryCoral} />
              <Text style={styles.cityText}>{selectedCity}</Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconCircleBtn}
              activeOpacity={0.8}
              onPress={() => onNavigate('map')}
              accessibilityLabel="Xem bản đồ kèo"
            >
              <Ionicons name="map-outline" size={18} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Thông điệp định hướng mục 1 đặc tả: Matching là đơn vị kết nối chính */}
        <View style={styles.promiseBanner}>
          <Ionicons name="sparkles" size={15} color={COLORS.secondaryPurple} />
          <Text style={styles.promiseText}>
            Muốn đi đâu, Vivu tìm cạ đi cùng vào đúng giờ hẹn!
          </Text>
        </View>
      </View>

      {/* Thanh bộ lọc Danh mục & Thời gian */}
      <FilterChipBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedTime={selectedTime}
        onSelectTime={setSelectedTime}
        onResetFilters={handleResetFilters}
      />

      {/* Nội dung danh sách kèo */}
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
        {loading && !refreshing ? (
          <LoadingSkeleton count={3} height={260} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : mappedActivities.length === 0 ? (
          <EmptyState
            icon="compass-outline"
            title="Chưa có kèo nào quanh bạn"
            message={`Hãy là người đầu tiên tạo kèo tại ${selectedCity} để rủ bạn bè cùng tham gia!`}
            actionLabel="+ Tạo kèo mới ngay"
            onAction={() => onNavigate('create_post')}
          />
        ) : (
          mappedActivities.map((activity) => (
            <KeoCard
              key={activity.id}
              activity={activity}
              onPress={(act) => onNavigate('activity_detail', { id: act.id })}
              onJoinPress={(act) => setSelectedActivityForJoin(act)}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Nút nổi Tạo Kèo góc phải */}
      <TouchableOpacity
        style={styles.floatingCreateBtn}
        activeOpacity={0.88}
        onPress={() => onNavigate('create_post')}
        accessibilityLabel="Tạo kèo mới"
      >
        <LinearGradient
          colors={COLORS.primaryGradient}
          style={styles.floatingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
          <Text style={styles.floatingBtnText}>Lên kèo</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal gửi yêu cầu tham gia nhanh */}
      <Modal
        visible={!!selectedActivityForJoin}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedActivityForJoin(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Tham gia kèo</Text>
            <Text style={styles.modalSubtitle} numberOfLines={2}>
              {selectedActivityForJoin?.title}
            </Text>

            <View style={styles.planSummaryBox}>
              <View style={styles.planSummaryItem}>
                <Ionicons name="time" size={14} color={COLORS.primaryCoral} />
                <Text style={styles.planSummaryText}>
                  {selectedActivityForJoin?.time} • {selectedActivityForJoin?.date || 'Hôm nay'}
                </Text>
              </View>
              <View style={styles.planSummaryItem}>
                <Ionicons name="location" size={14} color={COLORS.secondaryPurple} />
                <Text style={styles.planSummaryText} numberOfLines={1}>
                  {selectedActivityForJoin?.location}
                </Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Lời nhắn gửi tới chủ kèo (tùy chọn):</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Ví dụ: Chào bạn, mình cũng đang rảnh khung giờ này, cho mình tham gia cùng nhé!"
              placeholderTextColor={COLORS.textLight}
              value={joinMessage}
              onChangeText={setJoinMessage}
              multiline
              numberOfLines={3}
              maxLength={150}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSelectedActivityForJoin(null)}
              >
                <Text style={styles.cancelBtnText}>Để sau</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, submittingJoin && { opacity: 0.6 }]}
                disabled={submittingJoin}
                onPress={handleConfirmJoin}
              >
                <Text style={styles.submitBtnText}>
                  {submittingJoin ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondaryPurple,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cityText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promiseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3EEFD',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginTop: 12,
  },
  promiseText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondaryPurple,
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  floatingCreateBtn: {
    position: 'absolute',
    bottom: 20,
    right: 18,
    borderRadius: 28,
    ...SHADOWS.glow,
  },
  floatingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 28,
  },
  floatingBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(41, 38, 51, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 14,
  },
  planSummaryBox: {
    backgroundColor: '#FAF8F5',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    gap: 6,
  },
  planSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planSummaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  messageInput: {
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: 14,
    color: COLORS.textDark,
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 20,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  submitBtn: {
    flex: 2,
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
