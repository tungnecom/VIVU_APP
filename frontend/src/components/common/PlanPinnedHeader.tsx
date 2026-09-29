import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';

interface PlanPinnedHeaderProps {
  title: string;
  time: string;
  location: string;
  memberCount: number;
  maxParticipants?: number;
  onViewPlanDetail?: () => void;
}

export const PlanPinnedHeader: React.FC<PlanPinnedHeaderProps> = ({
  title,
  time,
  location,
  memberCount,
  maxParticipants = 4,
  onViewPlanDetail,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerTop}>
        <View style={styles.badgeRow}>
          <View style={styles.pinTag}>
            <Ionicons name="pin" size={13} color="#FFFFFF" />
            <Text style={styles.pinTagText}>Kế hoạch đã chốt</Text>
          </View>
          <Text style={styles.membersCount}>
            👥 {memberCount}/{maxParticipants} bạn
          </Text>
        </View>

        {onViewPlanDetail && (
          <TouchableOpacity
            style={styles.detailBtn}
            activeOpacity={0.7}
            onPress={onViewPlanDetail}
          >
            <Text style={styles.detailBtnText}>Xem kèo &gt;</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time" size={13} color={COLORS.primaryCoral} />
          <Text style={styles.metaText} numberOfLines={1}>
            {time}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="location" size={13} color={COLORS.secondaryPurple} />
          <Text style={styles.metaText} numberOfLines={1}>
            {location}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondaryPurple,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pinTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  membersCount: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  detailBtn: {
    paddingVertical: 2,
  },
  detailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryPurple,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
