import React, { useState } from 'react';
import {
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
import { COLORS, SHADOWS } from '../../constants/theme';
import { ProvinceData, VIETNAM_63_PROVINCES } from '../../services/locationData';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';

interface CitySelectProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const CitySelectScreen: React.FC<CitySelectProps> = ({ onNavigate }) => {
  const selectedCity = useAuthStore((state) => state.selectedCity);
  const setCity = useAuthStore((state) => state.setCity);
  const [query, setQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'All' | 'Miền Bắc' | 'Miền Trung' | 'Miền Nam'>('All');

  const filteredProvinces = VIETNAM_63_PROVINCES.filter((p) => {
    const matchName = p.name.toLowerCase().includes(query.toLowerCase());
    const matchRegion = regionFilter === 'All' || p.region === regionFilter;
    return matchName && matchRegion;
  });

  return (
    <View style={styles.container}>
      <Header onBack={() => onNavigate('otp')} transparent />
      <View style={styles.body}>
        <View style={styles.headerBlock}>
          <View style={styles.badgeRow}>
            <View style={styles.wikiBadge}>
              <Ionicons name="globe-outline" size={13} color="#2563EB" />
              <Text style={styles.wikiBadgeText}>Dữ liệu thực 63 Tỉnh Thành • Wikidata</Text>
            </View>
          </View>
          <Text style={styles.title}>Bạn đang ở đâu?</Text>
          <Text style={styles.subtitle}>
            Chọn tỉnh/thành phố để ghép cạ và nhận gợi ý địa điểm vi vu thực tế.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên tỉnh, thành phố..."
            placeholderTextColor={COLORS.textLight}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Region Filter Chips */}
        <View style={styles.regionFilterRow}>
          {(['All', 'Miền Bắc', 'Miền Trung', 'Miền Nam'] as const).map((r) => {
            const isActive = regionFilter === r;
            const label = r === 'All' ? `Tất cả (${VIETNAM_63_PROVINCES.length})` : r;
            return (
              <TouchableOpacity
                key={r}
                style={[styles.regionChip, isActive && styles.regionChipActive]}
                onPress={() => setRegionFilter(r)}
                activeOpacity={0.7}
              >
                <Text style={[styles.regionChipText, isActive && styles.regionChipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Cities List */}
        <ScrollView style={styles.cityList} showsVerticalScrollIndicator={false}>
          {filteredProvinces.map((province: ProvinceData) => {
            const isSelected = selectedCity === province.name;
            return (
              <TouchableOpacity
                key={province.id}
                style={[styles.cityCard, isSelected && styles.cityCardSelected]}
                activeOpacity={0.75}
                onPress={() => setCity(province.name)}
              >
                <Image source={{ uri: province.coverImage }} style={styles.cityThumbnail} />

                <View style={styles.cityInfo}>
                  <View style={styles.cityTopRow}>
                    <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>
                      {province.name}
                    </Text>
                    <View style={styles.venueBadge}>
                      <Ionicons name="location" size={11} color={COLORS.primary} />
                      <Text style={styles.venueBadgeText}>{province.venueCount} điểm</Text>
                    </View>
                  </View>

                  <Text style={styles.cityDesc} numberOfLines={1}>
                    {province.description}
                  </Text>

                  <View style={styles.cityMetaRow}>
                    <Text style={styles.regionTag}>{province.region}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.populationText}>
                      {(province.population / 1000000).toFixed(1)} tr dân
                    </Text>
                  </View>
                </View>

                {isSelected ? (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.uncheckCircle} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.bottomWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => onNavigate('goal_select')}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>Tiếp tục khám phá</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerBlock: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  wikiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  wikiBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
    marginLeft: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMedium,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textDark,
  },
  regionFilterRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  regionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  regionChipActive: {
    backgroundColor: COLORS.primaryDark,
  },
  regionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  regionChipTextActive: {
    color: '#FFFFFF',
  },
  cityList: {
    flex: 1,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cityCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FAF5FF',
    ...SHADOWS.sm,
  },
  cityThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  cityInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  cityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cityNameSelected: {
    color: COLORS.primaryDark,
  },
  venueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  venueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginLeft: 3,
  },
  cityDesc: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  cityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  regionTag: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  metaDot: {
    fontSize: 11,
    color: COLORS.textLight,
    marginHorizontal: 4,
  },
  populationText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  bottomWrap: {
    paddingTop: 10,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  btnGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
