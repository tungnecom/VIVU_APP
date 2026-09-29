import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export interface FilterOptions {
  timeFilter?: 'all' | 'today' | 'tomorrow' | 'weekend';
  category?: string;
}

interface FilterChipBarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedTime?: string;
  onSelectTime?: (time: any) => void;
  onResetFilters?: () => void;
}

export const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'grid-outline' },
  { id: 'food', name: 'Ăn uống', icon: 'restaurant-outline' },
  { id: 'coffee', name: 'Cafe', icon: 'cafe-outline' },
  { id: 'travel', name: 'Du lịch', icon: 'airplane-outline' },
  { id: 'camping', name: 'Camping', icon: 'bonfire-outline' },
  { id: 'sports', name: 'Thể thao', icon: 'football-outline' },
  { id: 'checkin', name: 'Check-in', icon: 'camera-outline' },
];

export const TIME_FILTERS = [
  { id: 'all', label: 'Mọi lúc' },
  { id: 'today', label: 'Hôm nay' },
  { id: 'tomorrow', label: 'Ngày mai' },
  { id: 'weekend', label: 'Cuối tuần' },
];

export const FilterChipBar: React.FC<FilterChipBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedTime,
  onSelectTime,
  onResetFilters,
}) => {
  const isFiltered =
    (selectedCategory && selectedCategory !== 'all' && selectedCategory !== 'Tất cả') ||
    (selectedTime && selectedTime !== 'all' && selectedTime !== 'Mọi lúc');

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isFiltered && onResetFilters && (
          <TouchableOpacity
            style={styles.resetChip}
            activeOpacity={0.7}
            onPress={onResetFilters}
            accessibilityLabel="Xóa bộ lọc"
          >
            <Ionicons name="close-circle" size={16} color={COLORS.primaryCoral} />
            <Text style={styles.resetText}>Xóa lọc</Text>
          </TouchableOpacity>
        )}

        {/* Danh mục */}
        {CATEGORIES.map((cat) => {
          const active =
            selectedCategory === cat.name ||
            (cat.id === 'all' && (!selectedCategory || selectedCategory === 'all' || selectedCategory === 'Tất cả'));

          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.75}
              onPress={() => onSelectCategory(cat.name)}
              accessibilityLabel={`Lọc theo ${cat.name}`}
              accessibilityRole="button"
            >
              <Ionicons
                name={cat.icon as any}
                size={15}
                color={active ? '#FFFFFF' : COLORS.textDark}
              />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Thời gian */}
        {onSelectTime &&
          TIME_FILTERS.map((t) => {
            const active = selectedTime === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.timeChip, active && styles.timeChipActive]}
                activeOpacity={0.75}
                onPress={() => onSelectTime(t.id)}
              >
                <Text
                  style={[styles.timeText, active && styles.timeTextActive]}
                >
                  🕒 {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF8F5',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.secondaryPurple,
    borderColor: COLORS.secondaryPurple,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeChipActive: {
    backgroundColor: COLORS.primaryCoral,
    borderColor: COLORS.primaryCoral,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  timeTextActive: {
    color: '#FFFFFF',
  },
  resetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  resetText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryCoral,
  },
});
